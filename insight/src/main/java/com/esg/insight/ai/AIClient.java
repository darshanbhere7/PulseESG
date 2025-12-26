package com.esg.insight.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.net.URI;
import java.util.Map;

@Component
public class AIClient {

    private static final Logger log = LoggerFactory.getLogger(AIClient.class);
    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_RETRY_DELAY_MS = 1000; // 1 second
    private static final int CONNECT_TIMEOUT_MS = 30000; // 30 seconds
    private static final int READ_TIMEOUT_MS = 600000; // 600 seconds (10 minutes) to allow AI processing on Render

    private final String aiUrl;
    private final RestTemplate restTemplate;

    public AIClient(
            @Value("${AI_SERVICE_URL:http://localhost:8000/analyze}") String aiUrl) {
        if (aiUrl == null || aiUrl.isEmpty()) {
            throw new IllegalStateException("AI_SERVICE_URL environment variable is not set");
        }

        // Normalize URL: ensure the path ends with /analyze
        String normalized = aiUrl.trim();
        try {
            URI uri = new URI(normalized);
            String path = uri.getPath() == null ? "" : uri.getPath();
            if (!path.endsWith("/analyze")) {
                // append analyze path while preserving any query
                String newPath = (path.endsWith("/") ? path.substring(0, path.length() - 1) : path) + "/analyze";
                uri = new URI(uri.getScheme(), uri.getUserInfo(), uri.getHost(), uri.getPort(), newPath, uri.getQuery(), uri.getFragment());
            }
            normalized = uri.toString();
        } catch (Exception e) {
            // fallback to simple string append
            if (!normalized.endsWith("/analyze")) {
                if (normalized.endsWith("/")) normalized = normalized + "analyze";
                else normalized = normalized + "/analyze";
            }
        }

        this.aiUrl = normalized;

        // configure RestTemplate with increased timeouts to allow AI service to process
        SimpleClientHttpRequestFactory rf = new SimpleClientHttpRequestFactory();
        rf.setConnectTimeout(CONNECT_TIMEOUT_MS);
        rf.setReadTimeout(READ_TIMEOUT_MS);
        this.restTemplate = new RestTemplate(rf);

        log.info("AIClient configured to use URL: {} with connect timeout: {}ms, read timeout: {}ms", 
                this.aiUrl, CONNECT_TIMEOUT_MS, READ_TIMEOUT_MS);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> analyzeText(String text) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> payload = Map.of("text", text == null ? "" : text);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(payload, headers);

        int attempt = 0;
        RuntimeException lastException = null;

        while (attempt < MAX_RETRIES) {
            try {
                log.debug("Posting to AI service {} (attempt {}/{}) payload length={}", 
                        aiUrl, attempt + 1, MAX_RETRIES, payload.get("text").length());

                ResponseEntity<Map> response = restTemplate.exchange(
                        aiUrl,
                        HttpMethod.POST,
                        entity,
                        Map.class
                );

                if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                    String errorMsg = String.format("AI service returned invalid response. Status: %s", response.getStatusCode());
                    log.warn(errorMsg);
                    throw new RuntimeException(errorMsg);
                }

                log.debug("AI service responded successfully");
                return response.getBody();

            } catch (HttpStatusCodeException e) {
                // Handle HTTP error responses (502, 503, 504, etc.)
                HttpStatus status = HttpStatus.resolve(e.getStatusCode().value());
                String responseBody = e.getResponseBodyAsString();
                
                // Check if response is HTML (error page)
                boolean isHtmlResponse = responseBody != null && 
                        (responseBody.trim().startsWith("<!DOCTYPE") || 
                         responseBody.trim().startsWith("<html") ||
                         responseBody.contains("<html"));

                String userFriendlyError = extractUserFriendlyError(e.getStatusCode().value(), isHtmlResponse);
                
                log.error("AI service HTTP error (attempt {}/{}): Status={}, IsHTML={}, Message={}", 
                        attempt + 1, MAX_RETRIES, e.getStatusCode(), isHtmlResponse, userFriendlyError);

                lastException = new RuntimeException(userFriendlyError, e);

                // Retry on 502, 503, 504 (gateway/bad gateway/service unavailable)
                if (status != null && (status == HttpStatus.BAD_GATEWAY || 
                                       status == HttpStatus.SERVICE_UNAVAILABLE || 
                                       status == HttpStatus.GATEWAY_TIMEOUT)) {
                    if (attempt < MAX_RETRIES - 1) {
                        long delay = INITIAL_RETRY_DELAY_MS * (long) Math.pow(2, attempt); // Exponential backoff
                        log.info("Retrying after {}ms...", delay);
                        try {
                            Thread.sleep(delay);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new RuntimeException("Interrupted while waiting to retry", ie);
                        }
                        attempt++;
                        continue;
                    }
                }
                
                // Don't retry for other HTTP errors or if max retries reached
                throw lastException;

            } catch (RestClientException e) {
                // Handle connection/timeout errors
                String errorMsg = extractUserFriendlyError(e);
                log.error("AI service connection error (attempt {}/{}): {}", attempt + 1, MAX_RETRIES, errorMsg);

                lastException = new RuntimeException(errorMsg, e);

                // Retry on connection/timeout errors
                if (attempt < MAX_RETRIES - 1) {
                    long delay = INITIAL_RETRY_DELAY_MS * (long) Math.pow(2, attempt); // Exponential backoff
                    log.info("Retrying after {}ms...", delay);
                    try {
                        Thread.sleep(delay);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Interrupted while waiting to retry", ie);
                    }
                    attempt++;
                    continue;
                }

                throw lastException;
            }
        }

        // Should not reach here, but just in case
        throw new RuntimeException("Failed to connect to AI service after " + MAX_RETRIES + " attempts", lastException);
    }

    /**
     * Extract user-friendly error message from HTTP status code
     */
    private String extractUserFriendlyError(int statusCode, boolean isHtmlResponse) {
        if (isHtmlResponse) {
            // If we got HTML, provide a generic user-friendly message
            switch (statusCode) {
                case 502:
                    return "AI service is temporarily unavailable. Please try again in a moment.";
                case 503:
                    return "AI service is currently busy processing requests. Please try again shortly.";
                case 504:
                    return "AI service took too long to respond. The analysis may require more time. Please try again.";
                default:
                    return "AI service encountered an error. Please try again later.";
            }
        }

        // For non-HTML responses, use status code specific messages
        switch (statusCode) {
            case 502:
                return "AI service is temporarily unavailable. Please try again in a moment.";
            case 503:
                return "AI service is currently busy. Please try again shortly.";
            case 504:
                return "AI service took too long to respond. Please try again.";
            case 500:
                return "AI service encountered an internal error. Please try again later.";
            default:
                return "AI service returned an error. Please try again later.";
        }
    }

    /**
     * Extract user-friendly error message from RestClientException
     */
    private String extractUserFriendlyError(RestClientException e) {
        String message = e.getMessage();
        if (message == null) {
            return "Unable to connect to AI service. Please check your connection and try again.";
        }

        // Check for timeout errors
        if (message.contains("timeout") || message.contains("Read timed out") || message.contains("Connect timed out")) {
            return "AI service is taking longer than expected to process your request. This may happen with complex analyses. Please try again.";
        }

        // Check for connection errors
        if (message.contains("Connection refused") || message.contains("Unable to connect")) {
            return "Unable to connect to AI service. The service may be temporarily unavailable. Please try again later.";
        }

        // Generic error message
        return "Failed to communicate with AI service. Please try again later.";
    }
}
