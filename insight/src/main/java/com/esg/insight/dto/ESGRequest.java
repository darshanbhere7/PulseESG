package com.esg.insight.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ESGRequest {
    @NotNull(message = "Company ID is required")
    private Long companyId;
    
    @NotBlank(message = "Text content is required")
    @JsonAlias("text")
    private String newsText;
    
    // Getter that returns the text value (from either 'text' or 'newsText' field)
    @JsonIgnore
    public String getText() {
        return newsText;
    }
}
