package com.esg.insight.controller;

import com.esg.insight.dto.ESGHistoryResponse;
import com.esg.insight.dto.ESGRequest;
import com.esg.insight.dto.ESGResponse;
import com.esg.insight.service.ESGAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/esg")
@RequiredArgsConstructor
public class ESGController {

    private final ESGAnalysisService esgAnalysisService;

    @PostMapping("/analyze")
    public ESGResponse analyze(@RequestBody ESGRequest request) {
        return esgAnalysisService.analyze(request);
    }

    @GetMapping("/history/{companyId}")
    public List<ESGHistoryResponse> history(@PathVariable Long companyId) {
        return esgAnalysisService.getHistory(companyId);
    }
}
