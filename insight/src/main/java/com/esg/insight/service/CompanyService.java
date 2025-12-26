package com.esg.insight.service;

import com.esg.insight.entity.Company;
import com.esg.insight.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;

    // ===============================
    // ADMIN ONLY — CREATE COMPANY
    // ===============================
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public Company createCompany(Company company) {
        return companyRepository.save(company);
    }

    // ===============================
    // ADMIN + ANALYST — VIEW COMPANIES
    // ===============================
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
    @Transactional(readOnly = true)
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    // ===============================
    // ADMIN ONLY — DELETE COMPANY
    // ===============================
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteCompany(Long id) {
        if (!companyRepository.existsById(id)) {
            throw new IllegalArgumentException("Company not found");
        }
        companyRepository.deleteById(id);
    }
}
