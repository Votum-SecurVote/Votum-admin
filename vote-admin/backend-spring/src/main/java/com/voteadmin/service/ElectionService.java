package com.voteadmin.service;

import com.voteadmin.dto.ElectionRequest;
import com.voteadmin.dto.ElectionResponse;
import com.voteadmin.entity.Ballot;
import com.voteadmin.entity.Candidate;
import com.voteadmin.entity.Election;
import com.voteadmin.repository.BallotRepository;
import com.voteadmin.repository.CandidateRepository;
import com.voteadmin.repository.ElectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ElectionService {

    private final ElectionRepository electionRepository;
    private final BallotRepository ballotRepository;
    private final CandidateRepository candidateRepository;
    private final ElectionMapper electionMapper;
    private final AuditService auditService;

    @Transactional
    public ElectionResponse create(ElectionRequest req, String performedBy) {
        Instant start = Instant.parse(req.getStartDate());
        Instant end = Instant.parse(req.getEndDate());
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("Invalid election schedule");
        }
        if (!start.isAfter(Instant.now())) {
            throw new IllegalArgumentException("Start date must be in the future");
        }

        Election e = Election.builder()
                .title(req.getTitle().trim())
                .description(req.getDescription() != null ? req.getDescription().trim() : "")
                .startDate(start)
                .endDate(end)
                .votingRules(req.getVotingRules() != null ? req.getVotingRules() : "")
                .status("draft")
                .isPublished(false)
                .createdAt(Instant.now())
                .build();
        e = electionRepository.save(e);

        auditService.log("ELECTION_CREATED", e.getId(), performedBy, req.getTitle());

        return electionMapper.toResponse(e, List.of());
    }

    public List<ElectionResponse> getAllForAdmin() {
        List<Election> elections = electionRepository.findAllByOrderByCreatedAtDesc();
        return elections.stream()
                .map(this::toResponseWithCandidates)
                .collect(Collectors.toList());
    }

    public List<ElectionResponse> getActive() {
        List<Election> elections = electionRepository.findAllActive(Instant.now());
        return elections.stream()
                .map(this::toResponseWithCandidates)
                .collect(Collectors.toList());
    }

    public ElectionResponse getById(UUID id, boolean publishedOnly) {
        Election e = electionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Election not found"));
        if (publishedOnly && !Boolean.TRUE.equals(e.getIsPublished())) {
            throw new RuntimeException("Election not found");
        }
        return toResponseWithCandidates(e);
    }

    @Transactional
    public void publish(UUID id, String performedBy) {
        Election e = electionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Election not found"));
        List<Candidate> candidates = getPublishedBallotCandidates(e.getId());
        if (candidates.size() < 2) {
            throw new IllegalArgumentException("Ballot must have at least 2 candidates");
        }
        e.setIsPublished(true);
        e.setStatus(computeStatus(e));
        electionRepository.save(e);
        auditService.log("ELECTION_PUBLISHED", id, performedBy, null);
    }

    @Transactional
    public void unpublish(UUID id, String performedBy) {
        Election e = electionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Election not found"));
        if (!Instant.now().isBefore(e.getStartDate())) {
            throw new IllegalArgumentException("Cannot unpublish election after start time");
        }
        e.setIsPublished(false);
        e.setStatus("draft");
        electionRepository.save(e);
        List<Ballot> ballots = ballotRepository.findByElectionIdOrderByVersionAsc(id);
        ballots.forEach(b -> b.setIsPublished(false));
        ballotRepository.saveAll(ballots);
        auditService.log("ELECTION_UNPUBLISHED", id, performedBy, null);
    }

    @Transactional
    public void delete(UUID id, String performedBy) {
        List<Ballot> ballots = ballotRepository.findByElectionIdOrderByVersionAsc(id);
        ballots.forEach(b -> candidateRepository.deleteByBallotId(b.getId()));
        ballotRepository.deleteAll(ballots);
        electionRepository.deleteById(id);
        auditService.log("ELECTION_DELETED", id, performedBy, null);
    }

    private ElectionResponse toResponseWithCandidates(Election e) {
        List<Candidate> candidates = getPublishedBallotCandidates(e.getId());
        return electionMapper.toResponse(e, candidates);
    }

    private List<Candidate> getPublishedBallotCandidates(UUID electionId) {
        return ballotRepository.findPublishedByElectionId(electionId)
                .map(b -> candidateRepository.findByBallotIdOrderByCandidateNameAsc(b.getId()))
                .orElse(List.of());
    }

    private String computeStatus(Election e) {
        if (!Boolean.TRUE.equals(e.getIsPublished())) return "draft";
        Instant now = Instant.now();
        if (now.isAfter(e.getEndDate()) || now.equals(e.getEndDate())) return "ended";
        if (!now.isBefore(e.getStartDate())) return "active";
        return "published";
    }
}
