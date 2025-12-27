package com.esg.insight.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class ESGResponse {

    private String company;

    // ===============================
    // ISS-STYLE OVERALL ASSESSMENT
    // ===============================
    private Map<String, Object> overallAssessment;
    // { esgScore: int, riskLevel: String }

    // ===============================
    // PILLAR-LEVEL ASSESSMENT (E / S / G)
    // ===============================
    private Map<String, Object> pillarAssessment;
    /*
      E: { score, risk, drivers[] }
      S: { score, risk, drivers[] }
      G: { score, risk, drivers[] }
    */

    // ===============================
    // KEY ESG INCIDENTS
    // ===============================
    private List<Map<String, Object>> keyIncidents;
    /*
      [
        { pillar, incident, severity, evidence[] }
      ]
    */

    // ===============================
    // GOVERNANCE ASSESSMENT
    // ===============================
    private Map<String, Object> governanceAssessment;
    /*
      { overallRisk, concerns[] }
    */

    // ===============================
    // ANALYST SUMMARY
    // ===============================
    private String analystSummary;

    // ===============================
    // METADATA
    // ===============================
    private LocalDateTime timestamp;
}
