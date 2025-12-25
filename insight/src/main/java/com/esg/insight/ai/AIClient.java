package com.esg.insight.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class AIClient {

    private final String aiUrl;
    private final RestTemplate restTemplate = new RestTemplate();

    public AIClient(@Value("${AI_SERVICE_URL:http://localhost:8000/analyze}") String aiUrl) {
        this.aiUrl = aiUrl;
        if (this.aiUrl == null || this.aiUrl.isEmpty()) {
            throw new IllegalStateException("AI_SERVICE_URL environment variable is not set");
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> analyzeText(String text) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> payload = Map.of("text", text);

        HttpEntity<Map<String, String>> entity =
                new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    aiUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException(
                    String.format("AI service unavailable or invalid response. Status: %s, URL: %s", 
                        response.getStatusCode(), aiUrl)
                );
            }

            return response.getBody();
        } catch (org.springframework.web.client.RestClientException e) {
            throw new RuntimeException(
                String.format("Failed to connect to AI service at %s. Error: %s", aiUrl, e.getMessage()), 
                e
            );
        }
    }
}
