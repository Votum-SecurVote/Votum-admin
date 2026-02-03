package com.securevote.backend.repository;

import com.securevote.backend.entity.IdentityVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface IdentityVerificationRepository
        extends JpaRepository<IdentityVerification, UUID> {
}
