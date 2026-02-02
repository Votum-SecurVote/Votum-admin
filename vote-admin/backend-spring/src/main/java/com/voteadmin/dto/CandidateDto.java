package com.voteadmin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Single candidate in API response (frontend expects id, name, party, description).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateDto {

    private String id;
    private String name;
    private String party;
    private String description;
    private Integer order;
}
