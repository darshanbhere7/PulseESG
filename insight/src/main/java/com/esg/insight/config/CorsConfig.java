package com.esg.insight.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                String frontendUrl = System.getenv("FRONTEND_URL");
                if (frontendUrl != null && !frontendUrl.isEmpty()) {
                    // Normalize: strip trailing slashes to match origin format
                    frontendUrl = frontendUrl.replaceAll("/+$", "");
                    registry.addMapping("/api/**")
                        .allowedOrigins(
                            "http://localhost:3000",
                            "http://localhost:5173",
                            "https://pulse-esg.vercel.app",
                            frontendUrl
                        )
                            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                            .allowedHeaders("*")
                            .allowCredentials(true)
                            .maxAge(3600);
                } else {
                    registry.addMapping("/api/**")
                        .allowedOrigins(
                            "http://localhost:3000",
                            "http://localhost:5173",
                            "https://pulse-esg.vercel.app"
                        )
                            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                            .allowedHeaders("*")
                            .allowCredentials(true)
                            .maxAge(3600);
                }
            }
        };
    }
}
