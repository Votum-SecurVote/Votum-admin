package com.securevote.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
public class IdentityVerification {

    @Id
    @GeneratedValue
    private UUID verificationId;

    private UUID userId;

    private String aadhaarHash;
    private String aadhaarPdfPath;

    private String verificationStatus;
}
