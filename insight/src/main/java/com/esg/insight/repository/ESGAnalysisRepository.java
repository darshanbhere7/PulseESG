package com.esg.insight.repository;

import com.esg.insight.entity.ESGAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ESGAnalysisRepository extends JpaRepository<ESGAnalysis, Long> {

    List<ESGAnalysis> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
}
