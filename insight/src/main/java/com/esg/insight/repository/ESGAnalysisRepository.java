package com.esg.insight.repository;

import com.esg.insight.entity.ESGAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ESGAnalysisRepository extends JpaRepository<ESGAnalysis, Long> {

    /**
     * ✅ FIX: JOIN FETCH company to avoid LazyInitializationException
     * Required for PgBouncer / Render
     */
    @Query("""
        SELECT a
        FROM ESGAnalysis a
        JOIN FETCH a.company
        WHERE a.company.id = :companyId
        ORDER BY a.createdAt DESC
    """)
    List<ESGAnalysis> findHistoryWithCompany(@Param("companyId") Long companyId);
}
