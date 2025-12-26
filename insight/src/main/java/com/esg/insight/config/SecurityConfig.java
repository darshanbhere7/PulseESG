package com.esg.insight.config;

import com.esg.insight.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity   // REQUIRED for @PreAuthorize
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // ===============================
                // CORS
                // ===============================
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ===============================
                // CSRF DISABLED (JWT)
                // ===============================
                .csrf(csrf -> csrf.disable())

                // ===============================
                // STATELESS SESSION
                // ===============================
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // ===============================
                // URL-LEVEL SECURITY
                // ===============================
                .authorizeHttpRequests(auth -> auth

                        // 🔴 REQUIRED FOR RENDER HEALTH CHECK
                        .requestMatchers(
                                "/",
                                "/health",
                                "/actuator/health"
                        ).permitAll()

                        // Auth APIs
                        .requestMatchers("/api/auth/**").permitAll()

                        // Everything else requires JWT
                        .anyRequest().authenticated()
                )

                // ===============================
                // JWT FILTER
                // ===============================
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                
                // ===============================
                // EXCEPTION HANDLING
                // ===============================
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Authentication required\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Access denied\"}");
                        })
                );

        return http.build();
    }

    // ===============================
    // CORS CONFIGURATION
    // ===============================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // Local + deployed frontend
        String frontendUrl = System.getenv("FRONTEND_URL");
        if (frontendUrl != null && !frontendUrl.isEmpty()) {
            config.setAllowedOrigins(List.of(
                    "http://localhost:5173",
                    "http://localhost:3000",
                    "https://pulse-esg.vercel.app",
                    frontendUrl
            ));
        } else {
            // Default: allow localhost for development
            config.setAllowedOrigins(List.of(
                    "http://localhost:5173",
                    "http://localhost:3000",
                    "https://pulse-esg.vercel.app"
            ));
        }

        config.setAllowedMethods(
                List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")
        );

        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
