package com.esg.insight.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.net.URI;
import java.util.Map;

@Component
public class AIClient {

    private static final Logger log = LoggerFactory.getLogger(AIClient.class);

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

        // configure RestTemplate with reasonable timeouts
        SimpleClientHttpRequestFactory rf = new SimpleClientHttpRequestFactory();
        rf.setConnectTimeout(5000);
        rf.setReadTimeout(20000);
        this.restTemplate = new RestTemplate(rf);

        log.info("AIClient configured to use URL: {}", this.aiUrl);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> analyzeText(String text) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> payload = Map.of("text", text == null ? "" : text);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(payload, headers);

        try {
            log.debug("Posting to AI service {} payload length={}", aiUrl, payload.get("text").length());

            ResponseEntity<Map> response = restTemplate.exchange(
                    aiUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException(String.format("AI service unavailable or invalid response. Status: %s, URL: %s", response.getStatusCode(), aiUrl));
            }

            return response.getBody();
        } catch (org.springframework.web.client.RestClientException e) {
            log.error("Error calling AI service at {}: {}", aiUrl, e.getMessage());
            throw new RuntimeException(String.format("Failed to connect to AI service at %s. Error: %s", aiUrl, e.getMessage()), e);
        }
    }
}
