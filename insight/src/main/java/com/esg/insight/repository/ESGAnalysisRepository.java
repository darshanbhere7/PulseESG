package com.esg.insight.repository;

import com.esg.insight.entity.ESGAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ESGAnalysisRepository extends JpaRepository<ESGAnalysis, Long> {

    List<ESGAnalysis> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
    
    // Custom query that selects only columns that definitely exist
    // This is used as a fallback when analysis_payload column doesn't exist yet
    @Query(value = "SELECT a.id, a.company_id, a.esg_score, a.risk_level, a.created_at " +
           "FROM esg_analyses a " +
           "WHERE a.company_id = :companyId " +
           "ORDER BY a.created_at DESC", nativeQuery = true)
    List<Object[]> findHistoryByCompanyIdNative(@Param("companyId") Long companyId);
}
