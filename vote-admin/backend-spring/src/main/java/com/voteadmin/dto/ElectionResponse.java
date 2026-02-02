package com.voteadmin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Election in API response (camelCase, _id for frontend).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ElectionResponse {

    private String _id;           // election_id as string
    private String title;
    private String description;
    private String startDate;      // ISO-8601 UTC
    private String endDate;       // ISO-8601 UTC
    private String createdAt;     // ISO-8601 UTC
    private Boolean isPublished;
    private String status;
    private String votingRules;
    private List<CandidateDto> candidates;
}
