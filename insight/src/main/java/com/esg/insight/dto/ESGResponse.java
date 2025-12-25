package com.esg.insight.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class ESGResponse {

    private String company;

    private int esgScore;          // 0–100
    private String riskLevel;      // LOW / MEDIUM / HIGH

    private String explanation;    // Human-readable reasoning

    // 🔴 CORE FIX: structured ESG intelligence
    private Map<String, Object> signals;

    private LocalDateTime timestamp;
}
