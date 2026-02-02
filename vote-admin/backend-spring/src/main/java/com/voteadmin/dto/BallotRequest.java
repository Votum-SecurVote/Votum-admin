package com.voteadmin.dto;

import lombok.Data;

import jakarta.validation.Valid;
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
        private String name;
        private String party;
        private String description;
    }
}
