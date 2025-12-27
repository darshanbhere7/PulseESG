package com.esg.insight.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);
    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Check Authorization header
        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            String token = authHeader.substring(7);

            try {
                if (jwtUtil.validateToken(token)) {

                    String email = jwtUtil.extractEmail(token);
                    String role = jwtUtil.extractRole(token); // 🔴 IMPORTANT

                    // Ensure both email and role are present
                    if (email != null && role != null && !role.isEmpty()) {
                        // Spring Security expects ROLE_ prefix
                        SimpleGrantedAuthority authority =
                                new SimpleGrantedAuthority("ROLE_" + role.toUpperCase());

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        email,
                                        null,
                                        List.of(authority)
                                );

                        authentication.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request)
                        );

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        log.debug("Authentication successful for user: {} with role: {}", email, role);
                    } else {
                        // Log warning if email or role is missing
                        log.warn("Token validation passed but email or role is missing. Email: {}, Role: {}", email, role);
                    }
                } else {
                    // Log warning if token validation failed
                    log.warn("Token validation failed for request: {}", request.getRequestURI());
                }
            } catch (Exception e) {
                // Log error but continue - Spring Security will handle unauthorized requests
                // This prevents exceptions from breaking the filter chain
                // If token is invalid, authentication won't be set and Spring Security will return 401
                log.error("Error processing JWT token for request {}: {}", request.getRequestURI(), e.getMessage(), e);
            }
        } else {
            log.debug("No Authorization header found for request: {}", request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }
}
