package com.voteadmin.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

/**
 * Request body for POST /api/elections (frontend sends camelCase).
 */
@Data
public class ElectionRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private String startDate;  // ISO-8601 UTC string

    @NotNull
    private String endDate;   // ISO-8601 UTC string

    private String votingRules;
}
