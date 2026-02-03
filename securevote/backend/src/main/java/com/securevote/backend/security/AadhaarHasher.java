package com.securevote.backend.security;

import org.springframework.stereotype.Component;
import org.springframework.security.crypto.bcrypt.BCrypt;

@Component
public class AadhaarHasher {

    private final String pepper;

    public AadhaarHasher() {
        String envPepper = System.getenv("AADHAAR_PEPPER");
        this.pepper = (envPepper != null) ? envPepper : "DEFAULT_PEPPER_FOR_DEV";
    }

    public String hash(String aadhaar) {
        return BCrypt.hashpw(aadhaar + pepper, BCrypt.gensalt());
    }
}
