package com.voteadmin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Maps to ERD table: identity_verification
 * PK: verification_id (uuid)
 */
@Entity
@Table(name = "identity_verification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdentityVerification {

    @Id
    @Column(name = "verification_id", updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID verificationId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "encrypted_id_document")
    private String encryptedIdDocument;

    @Column(name = "verification_status")
    private String verificationStatus;

    @Column(name = "verified_at")
    private Instant verifiedAt;
}
