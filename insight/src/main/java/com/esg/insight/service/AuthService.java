package com.esg.insight.service;

import com.esg.insight.entity.Analyst;
import com.esg.insight.entity.Role;
import com.esg.insight.repository.AnalystRepository;
import com.esg.insight.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AnalystRepository analystRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // ===============================
    // REGISTER (DEFAULT ROLE = ANALYST)
    // ===============================
    public Map<String, Object> register(String email, String password) {

        // ✅ SAFE CHECK (works with your repository)
        analystRepository.findByEmail(email).ifPresent(a -> {
            throw new RuntimeException("Email already registered");
        });

        Analyst analyst = Analyst.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(Role.ANALYST) // DEFAULT ROLE
                .build();

        analystRepository.save(analyst);

        String token = jwtUtil.generateToken(
                analyst.getEmail(),
                analyst.getRole().name()
        );

        return Map.of(
                "token", token,
                "role", analyst.getRole().name()
        );
    }

    // ===============================
    // LOGIN (ADMIN / ANALYST)
    // ===============================
    public Map<String, Object> login(String email, String password) {

        Analyst analyst = analystRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(password, analyst.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(
                analyst.getEmail(),
                analyst.getRole().name()
        );

        return Map.of(
                "token", token,
                "role", analyst.getRole().name()
        );
    }
}
