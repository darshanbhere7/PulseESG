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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String newsText;

    @Column(nullable = false)
    private Integer esgScore;

    @Column(nullable = false)
    private String riskLevel;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    // ✅ FIX: JSONB STORAGE
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> signals;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
