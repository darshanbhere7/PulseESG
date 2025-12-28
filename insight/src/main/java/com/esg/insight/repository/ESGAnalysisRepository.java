package com.esg.insight.repository;

import com.esg.insight.entity.ESGAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ESGAnalysisRepository extends JpaRepository<ESGAnalysis, Long> {

    // ✅ REQUIRED FOR HISTORY PAGE
    List<ESGAnalysis> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    // OPTIONAL (keep only if you want native fallback)
    @Query(
            value = """
            SELECT *
            FROM esg_analyses e
            WHERE e.company_id = :companyId
            ORDER BY e.created_at DESC
        """,
            nativeQuery = true
    )
    List<ESGAnalysis> findHistoryNative(@Param("companyId") Long companyId);
}
