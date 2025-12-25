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

    public AIClient(@Value("${ai.service.url}") String aiUrl) {
        this.aiUrl = aiUrl;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> analyzeText(String text) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> payload = Map.of("text", text);

        HttpEntity<Map<String, String>> entity =
                new HttpEntity<>(payload, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                aiUrl,
                HttpMethod.POST,
                entity,
                Map.class
        );

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("AI service unavailable or invalid response");
        }

        return response.getBody();
    }
}
