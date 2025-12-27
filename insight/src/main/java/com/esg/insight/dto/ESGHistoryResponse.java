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

    // ===============================
    // QUICK SUMMARY (LIST / TABLE VIEW)
    // ===============================
    private int esgScore;
    private String riskLevel;

    // ===============================
    // FULL ISS ESG SNAPSHOT (AUDIT SAFE)
    // ===============================
    /*
      Contains:
      - overallAssessment
      - pillarAssessment
      - keyIncidents
      - governanceAssessment
      - analystSummary
    */
    private Map<String, Object> analysisPayload;

    // ===============================
    // METADATA
    // ===============================
    private LocalDateTime timestamp;
}
