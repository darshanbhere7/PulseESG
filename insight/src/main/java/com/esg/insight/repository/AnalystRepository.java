package com.esg.insight.repository;

import com.esg.insight.entity.Analyst;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnalystRepository extends JpaRepository<Analyst, Long> {

    Optional<Analyst> findByEmail(String email);

    boolean existsByEmail(String email); // 🔴 REQUIRED
}
