package com.esg.insight.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class ESGHistoryResponse {

    private Long analysisId;

    private String companyName;

    private int esgScore;
    private String riskLevel;

    private String explanation;

    // 🔴 ESG signals snapshot at analysis time
    private Map<String, Object> signals;

    private LocalDateTime timestamp;
}
