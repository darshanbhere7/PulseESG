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
    @Column(columnDefinition = "TEXT", nullable = false)
    private String newsText;

    // ===============================
    // QUERYABLE SUMMARY FIELDS
    // ===============================
    @Column(nullable = false)
    private Integer esgScore;

    @Column(nullable = false)
    private String riskLevel;

    // ===============================
    // ANALYST SUMMARY
    // ===============================
    @Column(columnDefinition = "TEXT")
    private String analystSummary;

    // ===============================
    // FULL ISS ESG SNAPSHOT (JSONB)
    // ===============================
    @Type(JsonType.class)
    @Column(name = "analysis_payload", columnDefinition = "jsonb", nullable = true)
    private Map<String, Object> analysisPayload;

    // ===============================
    // METADATA
    // ===============================
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
