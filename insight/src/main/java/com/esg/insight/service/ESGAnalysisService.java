package com.esg.insight.service;

import com.esg.insight.ai.AIClient;
import com.esg.insight.dto.ESGHistoryResponse;
import com.esg.insight.dto.ESGRequest;
import com.esg.insight.dto.ESGResponse;
import com.esg.insight.entity.Company;
import com.esg.insight.entity.ESGAnalysis;
import com.esg.insight.repository.CompanyRepository;
import com.esg.insight.repository.ESGAnalysisRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ESGAnalysisService {

    private final CompanyRepository companyRepository;
    private final ESGAnalysisRepository esgAnalysisRepository;
    private final AIClient aiClient;
    private final EntityManager entityManager;

    // ===============================
    // ESG ANALYSIS (ISS / MSCI STYLE)
    // ===============================
    @Transactional
    public ESGResponse analyze(ESGRequest request) {

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        Map<String, Object> aiResult = aiClient.analyzeText(request.getNewsText());

        // ✅ SAFE FIELD EXTRACTION (FIXED)
        Number esgScoreNumber = (Number) aiResult.get("esgScore");
        Integer esgScore = esgScoreNumber != null ? esgScoreNumber.intValue() : null;

        String riskLevel = (String) aiResult.get("riskLevel");
        String explanation = (String) aiResult.get("explanation");

        if (esgScore == null || riskLevel == null || explanation == null) {
            throw new RuntimeException("Invalid AI response structure: " + aiResult);
        }

        // Store full AI signals for auditability
        @SuppressWarnings("unchecked")
        Map<String, Object> signals =
                (Map<String, Object>) aiResult.getOrDefault("signals", Map.of());

        ESGAnalysis analysis = ESGAnalysis.builder()
                .company(company)
                .newsText(request.getNewsText())
                .esgScore(esgScore)
                .riskLevel(riskLevel)
                .explanation(explanation)
                .signals(signals)
                .build();

        esgAnalysisRepository.save(analysis);

        // 🔴 REQUIRED for Supabase pooler
        entityManager.flush();

        return ESGResponse.builder()
                .company(company.getName())
                .esgScore(esgScore)
                .riskLevel(riskLevel)
                .explanation(explanation)
                .timestamp(analysis.getCreatedAt())
                .build();
    }

    // ===============================
    // ESG HISTORY (AUDIT SAFE)
    // ===============================
    @Transactional(readOnly = true)
    public List<ESGHistoryResponse> getHistory(Long companyId) {

        if (companyId == null) {
            throw new IllegalArgumentException("Company ID cannot be null");
        }

        return esgAnalysisRepository
                .findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream()
                .map(a -> {
                    if (a == null || a.getCompany() == null) {
                        return null;
                    }

                    return ESGHistoryResponse.builder()
                            .analysisId(a.getId())
                            .companyName(a.getCompany().getName())
                            .esgScore(a.getEsgScore() != null ? a.getEsgScore() : 0)
                            .riskLevel(a.getRiskLevel() != null ? a.getRiskLevel() : "UNKNOWN")
                            .explanation(a.getExplanation())
                            .signals(a.getSignals())
                            .timestamp(a.getCreatedAt())
                            .build();
                })
                .filter(response -> response != null)
                .toList();
    }
}
