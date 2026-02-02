package com.evoting.security;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class JwtConfigValidator {

    @Value("${jwt.secret:}")
    private String jwtSecret;

    private final Environment environment;

    public JwtConfigValidator(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void validate() {
        boolean isProd = Arrays.asList(environment.getActiveProfiles()).contains("prod");
        
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
             throw new IllegalStateException("JWT_SECRET environment variable is missing!");
        }

        // If in prod, ensure it is not the default placeholder (if one was accidentally set in properties)
        // Note: My application.properties has a default value for dev convenience. 
        // We need to ensure that in PROD, we are NOT using that default value if possible, 
        // OR we just enforce that a strong secret is provided.
        // The Prompt says: "Code must fail fast in PROD profile if secret is missing"
        
        if (isProd) {
            if ("verysecretkeythatislongenoughforhmacsha256algorithm".equals(jwtSecret)) {
                throw new IllegalStateException("FATAL: Detected default JWT secret in PRODUCTION profile. Set JWT_SECRET environment variable.");
            }
        }
    }
}
