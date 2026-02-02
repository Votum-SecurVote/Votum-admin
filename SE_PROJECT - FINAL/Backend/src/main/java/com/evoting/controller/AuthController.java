package com.evoting.controller;

import com.evoting.dto.AuthResponse;
import com.evoting.security.CryptoService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final CryptoService cryptoService;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    public AuthController(CryptoService cryptoService) {
        this.cryptoService = cryptoService;
    }

    @GetMapping("/public-key")
    public ResponseEntity<Map<String, String>> getPublicKey() {
        Map<String, String> response = new HashMap<>();
        response.put("publicKey", cryptoService.getPublicKeyBase64());
        return ResponseEntity.ok(response);
    }

    // Dev endpoint to generate token
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody @jakarta.validation.Valid com.evoting.dto.LoginRequest request) {
        String userId = request.getUserId();
        String role = request.getRole();

        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        String token = Jwts.builder()
                .setSubject(userId)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        AuthResponse res = new AuthResponse();
        res.setToken(token);
        return ResponseEntity.ok(res);
    }
}
