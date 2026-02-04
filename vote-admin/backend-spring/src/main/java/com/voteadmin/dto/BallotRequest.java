package com.voteadmin.dto;

import lombok.Data;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * Request body for POST /api/elections/:electionId/ballots (frontend sends options array).
 */
@Data
public class BallotRequest {

    private String title;
    private String description;

    @Valid
    @Size(min = 2, message = "At least 2 candidates required")
    private List<OptionDto> options;

    private Integer maxSelections;

    @Data
    public static class OptionDto {
        @NotBlank(message = "Candidate name is required")
        private String name;

        @NotBlank(message = "Candidate party is required")
        private String party;
        private String description;
    }
}
