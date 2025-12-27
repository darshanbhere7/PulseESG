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
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ESGAnalysisService {

    private final CompanyRepository companyRepository;
    private final ESGAnalysisRepository esgAnalysisRepository;
    private final AIClient aiClient;
    private final EntityManager entityManager;

    // ===============================
    // ESG ANALYSIS (ISS STOXX STYLE)
    // ===============================
    @Transactional(noRollbackFor = {jakarta.persistence.PersistenceException.class})
    public ESGResponse analyze(ESGRequest request) {

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // 🔹 Call AI service
        Map<String, Object> aiResult = aiClient.analyzeText(request.getNewsText());

        // ===============================
        // SAFE EXTRACTION (ISS OUTPUT)
        // ===============================
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

        // ===============================
        // PERSIST SNAPSHOT (AUDIT SAFE)
        // ===============================
        ESGAnalysis analysis = ESGAnalysis.builder()
                .company(company)
                .newsText(request.getNewsText())
                .esgScore(esgScore)
                .riskLevel(riskLevel)
                .analystSummary(analystSummary)
                .analysisPayload(aiResult)
                .build();

        LocalDateTime timestamp = LocalDateTime.now();
        
        // Try to save in a separate transaction to avoid rollback issues
        timestamp = saveAnalysisSafely(analysis, timestamp);

        // ===============================
        // RETURN ISS-STYLE RESPONSE
        // Always return the analysis result even if saving failed
        // ===============================
        return ESGResponse.builder()
                .company(company.getName())
                .overallAssessment(overall)
                .pillarAssessment((Map<String, Object>) aiResult.get("pillarAssessment"))
                .keyIncidents((List<Map<String, Object>>) aiResult.get("keyIncidents"))
                .governanceAssessment((Map<String, Object>) aiResult.get("governanceAssessment"))
                .analystSummary(analystSummary)
                .timestamp(timestamp)
                .build();
    }

    /**
     * Save analysis in a separate transaction to prevent rollback from affecting main transaction
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, noRollbackFor = {jakarta.persistence.PersistenceException.class, Exception.class})
    private LocalDateTime saveAnalysisSafely(ESGAnalysis analysis, LocalDateTime defaultTimestamp) {
        try {
            esgAnalysisRepository.save(analysis);
            // Required for Supabase / PgBouncer
            entityManager.flush();
            return analysis.getCreatedAt();
        } catch (jakarta.persistence.PersistenceException e) {
            // If analysis_payload column doesn't exist, try saving without it
            if (e.getMessage() != null && e.getMessage().contains("analysis_payload")) {
                try {
                    // Try saving with null payload
                    analysis.setAnalysisPayload(null);
                    esgAnalysisRepository.save(analysis);
                    entityManager.flush();
                    return analysis.getCreatedAt();
                } catch (Exception ex) {
                    // If that also fails, just log and continue without saving
                    // The analysis result is still valid and will be returned
                    System.err.println("Warning: Could not save analysis to database: " + ex.getMessage());
                    return defaultTimestamp;
                }
            } else {
                // Other database errors - log but continue
                System.err.println("Warning: Database error while saving analysis: " + e.getMessage());
                return defaultTimestamp;
            }
        } catch (Exception e) {
            // Any other error - log but don't fail the request
            System.err.println("Warning: Error saving analysis: " + e.getMessage());
            return defaultTimestamp;
        }
    }

    // ===============================
    // ESG HISTORY (ISS AUDIT VIEW)
    // ===============================
    @Transactional(readOnly = true, noRollbackFor = {jakarta.persistence.PersistenceException.class})
    public List<ESGHistoryResponse> getHistory(Long companyId) {

        if (companyId == null) {
            throw new IllegalArgumentException("Company ID cannot be null");
        }

        try {
            return esgAnalysisRepository
                    .findByCompanyIdOrderByCreatedAtDesc(companyId)
                    .stream()
                    .map(a -> ESGHistoryResponse.builder()
                            .analysisId(a.getId())
                            .companyName(a.getCompany().getName())
                            .esgScore(a.getEsgScore())
                            .riskLevel(a.getRiskLevel())
                            .analysisPayload(a.getAnalysisPayload() != null ? a.getAnalysisPayload() : Map.of())
                            .timestamp(a.getCreatedAt())
                            .build())
                    .collect(Collectors.toList());
        } catch (jakarta.persistence.PersistenceException e) {
            // Handle case where analysis_payload column doesn't exist yet
            // Use native query that only selects columns that definitely exist
            // Use a separate non-transactional method to avoid rollback issues
            return getHistoryWithNativeQuery(companyId);
        } catch (Exception e) {
            // For any other exception, try native query as fallback
            return getHistoryWithNativeQuery(companyId);
        }
    }

    /**
     * Fallback method to get history using native query when analysis_payload column doesn't exist
     * This is non-transactional to avoid rollback issues
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    private List<ESGHistoryResponse> getHistoryWithNativeQuery(Long companyId) {
        try {
            List<Object[]> results = esgAnalysisRepository.findHistoryByCompanyIdNative(companyId);
            return results.stream()
                    .<ESGHistoryResponse>map(row -> {
                        Long id = ((Number) row[0]).longValue();
                        Long compId = ((Number) row[1]).longValue();
                        Integer esgScore = ((Number) row[2]).intValue();
                        String riskLevel = (String) row[3];
                        java.sql.Timestamp timestamp = (java.sql.Timestamp) row[4];
                        
                        Company company = companyRepository.findById(compId)
                                .orElseThrow(() -> new RuntimeException("Company not found"));
                        
                        // analysis_payload column doesn't exist, use empty map
                        return ESGHistoryResponse.builder()
                                .analysisId(id)
                                .companyName(company.getName())
                                .esgScore(esgScore)
                                .riskLevel(riskLevel)
                                .analysisPayload(Map.of())
                                .timestamp(timestamp != null ? timestamp.toLocalDateTime() : null)
                                .build();
                    })
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            // If even the native query fails, return empty list
            System.err.println("Warning: Could not retrieve history: " + ex.getMessage());
            return List.of();
        }
    }
}
