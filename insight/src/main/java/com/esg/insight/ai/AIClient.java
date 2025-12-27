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
    private static final int MAX_RETRIES = 5;
    private static final long INITIAL_RETRY_DELAY_MS = 300000;
    private static final int CONNECT_TIMEOUT_MS = 600000;
    private static final int READ_TIMEOUT_MS = 600000;

    private final String aiUrl;
    private final RestTemplate restTemplate;

    public AIClient(
            @Value("${AI_SERVICE_URL:http://localhost:8000/analyze}") String aiUrl) {

        if (aiUrl == null || aiUrl.isEmpty()) {
            throw new IllegalStateException("AI_SERVICE_URL environment variable is not set");
        }

        String normalized = aiUrl.trim();
        try {
            URI uri = new URI(normalized);
            String path = uri.getPath() == null ? "" : uri.getPath();
            if (!path.endsWith("/analyze")) {
                String newPath =
                        (path.endsWith("/") ? path.substring(0, path.length() - 1) : path)
                                + "/analyze";
                uri = new URI(
                        uri.getScheme(),
                        uri.getUserInfo(),
                        uri.getHost(),
                        uri.getPort(),
                        newPath,
                        uri.getQuery(),
                        uri.getFragment()
                );
            }
            normalized = uri.toString();
        } catch (Exception e) {
            if (!normalized.endsWith("/analyze")) {
                normalized = normalized.endsWith("/")
                        ? normalized + "analyze"
                        : normalized + "/analyze";
            }
        }

        this.aiUrl = normalized;

        SimpleClientHttpRequestFactory rf = new SimpleClientHttpRequestFactory();
        rf.setConnectTimeout(CONNECT_TIMEOUT_MS);
        rf.setReadTimeout(READ_TIMEOUT_MS);
        this.restTemplate = new RestTemplate(rf);

        log.info(
                "AIClient configured with URL={} (connectTimeout={}ms, readTimeout={}ms)",
                this.aiUrl, CONNECT_TIMEOUT_MS, READ_TIMEOUT_MS
        );
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> analyzeText(String text) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> payload = Map.of(
                "text", text == null ? "" : text
        );

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(payload, headers);

        int attempt = 0;
        RuntimeException lastException = null;

        while (attempt < MAX_RETRIES) {
            try {
                ResponseEntity<Map> response = restTemplate.exchange(
                        aiUrl,
                        HttpMethod.POST,
                        entity,
                        Map.class
                );

                if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                    throw new RuntimeException(
                            "Invalid response from AI service: " + response.getStatusCode()
                    );
                }

                return response.getBody();

            } catch (HttpStatusCodeException e) {
                lastException = new RuntimeException(
                        "AI service HTTP error: " + e.getStatusCode(), e
                );
            } catch (RestClientException e) {
                lastException = new RuntimeException(
                        "AI service connection error", e
                );
            }

            attempt++;
        }

        throw new RuntimeException(
                "Failed to connect to AI service after " + MAX_RETRIES + " attempts",
                lastException
        );
    }
}
