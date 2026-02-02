package com.evoting.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Role is required")
    private String role;
}
