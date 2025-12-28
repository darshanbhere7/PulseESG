package com.esg.insight.entity;

import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "esg_analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ESGAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ===============================
    // COMPANY REFERENCE
    // ===============================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    // ===============================
    // SOURCE TEXT (AUDITABILITY)
    // ===============================
    @Column(name = "news_text", columnDefinition = "TEXT", nullable = false)
    private String newsText;

    // ===============================
    // QUERYABLE SUMMARY FIELDS
    // ===============================
    @Column(name = "esg_score", nullable = false)
    private Integer esgScore;

    @Column(name = "risk_level", nullable = false)
    private String riskLevel;

    // ===============================
    // ANALYST SUMMARY (NOW EXISTS IN DB ✅)
    // ===============================
    @Column(name = "analyst_summary", columnDefinition = "TEXT")
    private String analystSummary;

    // ===============================
    // FULL AI SNAPSHOT (JSONB)
    // ===============================
    @Type(JsonType.class)
    @Column(name = "analysis_payload", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> analysisPayload;

    // ===============================
    // METADATA
    // ===============================
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
