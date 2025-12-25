package com.esg.insight.service;

import org.springframework.stereotype.Component;

@Component
public class ESGScoreEngine {

    public String calculateRiskLevel(int esgScore) {

        if (esgScore >= 70) {
            return "HIGH";
        } else if (esgScore >= 40) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }
}
