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

        // 🔴 STRICT FIELD EXTRACTION
        Integer esgScore = (Integer) aiResult.get("esgScore");
        String riskLevel = (String) aiResult.get("riskLevel");
        String explanation = (String) aiResult.get("explanation");

        if (esgScore == null || riskLevel == null || explanation == null) {
            throw new RuntimeException("Invalid AI response structure");
        }

        // Store full AI signals for auditability
        Map<String, Object> signals =
                (Map<String, Object>) aiResult.getOrDefault("signals", Map.of());

        ESGAnalysis analysis = ESGAnalysis.builder()
                .company(company)
                .newsText(request.getNewsText())
                .esgScore(esgScore)
                .riskLevel(riskLevel)
                .explanation(explanation)
                .signals(signals) // 🔴 NEW FIELD (JSON)
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

        return esgAnalysisRepository
                .findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream()
                .map(a -> ESGHistoryResponse.builder()
                        .analysisId(a.getId())
                        .companyName(a.getCompany().getName())
                        .esgScore(a.getEsgScore())
                        .riskLevel(a.getRiskLevel())
                        .explanation(a.getExplanation())
                        .signals(a.getSignals())
                        .timestamp(a.getCreatedAt())
                        .build())
                .toList();
    }
}
