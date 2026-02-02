package com.evoting.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterVoterRequest {
    @NotBlank(message = "Identity proof is required")
    private String identityProof; // Encrypted identity proof from client

    @NotBlank(message = "Identity type is required")
    private String identityType;

    @AssertTrue(message = "Declaration must be accepted")
    private boolean declarationAccepted;
}
