package com.esg.insight.controller;

import com.esg.insight.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ===============================
    // REGISTER (DEFAULT ROLE = ANALYST)
    // ===============================
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> request) {

        Map<String, Object> result = authService.register(
                request.get("email"),
                request.get("password")
        );

        return Map.of(
                "token", result.get("token"),
                "role", result.get("role")
        );
    }

    // ===============================
    // LOGIN
    // ===============================
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> request) {

        Map<String, Object> result = authService.login(
                request.get("email"),
                request.get("password")
        );

        return Map.of(
                "token", result.get("token"),
                "role", result.get("role")
        );
    }
}
