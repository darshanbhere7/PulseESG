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
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ===============================
    // CORS CONFIGURATION
    // ===============================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // Local + deployed frontend (safe)
        config.setAllowedOrigins(List.of(
                "http://localhost:5173"
                // add deployed frontend URL later if needed
        ));

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
