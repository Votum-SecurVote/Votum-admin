package com.voteadmin.service;

import com.voteadmin.dto.CandidateDto;
import com.voteadmin.dto.ElectionResponse;
import com.voteadmin.entity.Candidate;
import com.voteadmin.entity.Election;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Maps Election entity to API response (camelCase, _id, startDate/endDate as ISO strings).
 * Computes status from current UTC time.
 */
@Component
public class ElectionMapper {

    public ElectionResponse toResponse(Election e, List<Candidate> candidates) {
        String status = computeStatus(e);
        List<CandidateDto> candidateDtos = candidates == null ? List.of() : candidates.stream()
                .map(this::toCandidateDto)
                .collect(Collectors.toList());

        return ElectionResponse.builder()
                ._id(e.getId() != null ? e.getId().toString() : null)
                .title(e.getTitle())
                .description(e.getDescription() != null ? e.getDescription() : "")
                .startDate(e.getStartDate() != null ? e.getStartDate().toString() : null)
                .endDate(e.getEndDate() != null ? e.getEndDate().toString() : null)
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .isPublished(Boolean.TRUE.equals(e.getIsPublished()))
                .status(status)
                .votingRules(e.getVotingRules() != null ? e.getVotingRules() : "")
                .candidates(candidateDtos)
                .build();
    }

    public CandidateDto toCandidateDto(Candidate c) {
        return CandidateDto.builder()
                .id(c.getCandidateId() != null ? c.getCandidateId().toString() : null)
                .name(c.getCandidateName())
                .party(c.getParty() != null ? c.getParty() : "")
                .description(c.getDescription() != null ? c.getDescription() : "")
                .order(null)
                .build();
    }

    private String computeStatus(Election e) {
        if (!Boolean.TRUE.equals(e.getIsPublished())) return "draft";
        Instant now = Instant.now();
        if (e.getEndDate() != null && (now.isAfter(e.getEndDate()) || now.equals(e.getEndDate()))) return "ended";
        if (e.getStartDate() != null && !now.isBefore(e.getStartDate())) return "active";
        return "published";
    }
}
