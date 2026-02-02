package com.voteadmin.controller;

import com.voteadmin.service.AuthService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (!"admin".equals(req.getUsername()) || !"admin123".equals(req.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
        String token = authService.generateToken("admin-001", "ADMIN");
        return ResponseEntity.ok(Map.of(
                "success", true,
                "token", token,
                "role", "ADMIN"
        ));
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }
}
