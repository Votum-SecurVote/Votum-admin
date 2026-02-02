package com.voteadmin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Ballot in API response (frontend expects id, election_id, version, options, etc.).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BallotResponse {

    private String id;            // ballot_id
    private String electionId;
    private Integer version;
    private String title;
    private String description;
    private List<CandidateDto> options;  // frontend uses "options" for ballot candidates
    private Integer maxSelections;
    private Boolean isPublished;
    private String createdAt;
}
