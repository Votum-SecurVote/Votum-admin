package com.evoting.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
             // 1. Check for JWT
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                // Fallback for legacy "x-user-id" / "x-user-role" handling during migration phase?
                // No, prompt says "Update API endpoints if required", implying we can fix auth.
                // However, the frontend might not be sending Bearer tokens yet.
                // For MVP, if frontend only sends x-user-id/role, we must REJECT it or Adapt it.
                // Prompt: "Security Requirements: Spring Security + JWT".
                // Migration rules: "No dummy or TODO logic".
                // So I will implement purely JWT. The frontend MUST be updated to send JWTs.
                // BUT, where does the JWT come from? There is no Login API in the prompt requirements.
                // Prompt says: "Reuse existing React UI", "Update API bindings".
                // "JWT for role propagation".
                // If there's no auth service, I might need to mock a token generator or accept a "dev" header that creates a JWT.
                // Waiting: The prompt says "Reject unauthorized access by default".
                // I will add a temporary DEV header check to create a context if JWT is missing, ONLY FOR DEV/MIGRATION, 
                // OR I will assume the frontend has a way to get a token.
                // Actually, let's look at `VoterController.js` legacy: `req.user = { id: ... role: ... }` set by middleware reading `x-user-id`.
                // I should probably support this `x-user-id` header but wrap it in a secure context SOON via a proper Login.
                // BUT, "JWT for role propagation" is a requirement.
                // I'll implement a Mock-Login endpoint OR support the raw headers for now but mapped to Spring Security,
                // BUT the requirement "JWT for role propagation" implies we use JWTs.
                // Let's implement standard JWT check. If null, checking for legacy headers for migration compatibility 
                // might be "Insecure". 
                // Better approach: Create a `PreAuthFilter` that takes `x-user-id` and converts it to a Principal for now?
                // No, "Spring Security + JWT" is a hard requirement. 
                // I will implement a "Dev Login" endpoint that returns a JWT for a given UserID/Role to allow testing.
                
                // For now, simple JWT logic.
                filterChain.doFilter(request, response);
                return;
            }

            String token = authHeader.substring(7);
            Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String userId = claims.getSubject();
            String role = claims.get("role", String.class);

            if (userId != null && role != null) {
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userId, null, Collections.singletonList(authority));
                
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }

        } catch (Exception e) {
            // Invalid token
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
