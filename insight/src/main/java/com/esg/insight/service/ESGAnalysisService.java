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
    // ESG ANALYSIS (AI CALL)
    // ===============================
    @Transactional
    public ESGResponse analyze(ESGRequest request) {

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        Map<String, Object> aiResult = aiClient.analyzeText(request.getNewsText());

        @SuppressWarnings("unchecked")
        Map<String, Object> overall =
                (Map<String, Object>) aiResult.get("overallAssessment");

        if (overall == null) {
            throw new RuntimeException("Invalid AI response: missing overallAssessment");
        }

        Number esgScoreNumber = (Number) overall.get("esgScore");
        String riskLevel = (String) overall.get("riskLevel");

        if (esgScoreNumber == null || riskLevel == null) {
            throw new RuntimeException("Invalid AI response: missing ESG score or risk level");
        }

        Integer esgScore = esgScoreNumber.intValue();
        String analystSummary = (String) aiResult.get("analystSummary");

        ESGAnalysis analysis = ESGAnalysis.builder()
                .company(company)
                .newsText(request.getNewsText())
                .esgScore(esgScore)
                .riskLevel(riskLevel)
                .analystSummary(analystSummary)
                .analysisPayload(aiResult)
                .build();

        esgAnalysisRepository.save(analysis);

        // REQUIRED for Supabase / PgBouncer
        entityManager.flush();

        return ESGResponse.builder()
                .company(company.getName())
                .overallAssessment(overall)
                .pillarAssessment((Map<String, Object>) aiResult.get("pillarAssessment"))
                .keyIncidents((List<Map<String, Object>>) aiResult.get("keyIncidents"))
                .governanceAssessment((Map<String, Object>) aiResult.get("governanceAssessment"))
                .analystSummary(analystSummary)
                .timestamp(analysis.getCreatedAt())
                .build();
    }

    // ===============================
    // ESG HISTORY (NO AI CALLS ❗)
    // ===============================
    @Transactional(readOnly = true)
    public List<ESGHistoryResponse> getHistory(Long companyId) {

        if (companyId == null) {
            throw new IllegalArgumentException("Company ID cannot be null");
        }

        return esgAnalysisRepository
                .findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream()
                .map(a -> ESGHistoryResponse.builder()
                        .analysisId(a.getId())
                        .companyName(a.getCompany().getName())
                        .esgScore(a.getEsgScore())
                        .riskLevel(a.getRiskLevel())
                        .analysisPayload(a.getAnalysisPayload())
                        .timestamp(a.getCreatedAt())
                        .build()
                )
                .toList();
    }
}
