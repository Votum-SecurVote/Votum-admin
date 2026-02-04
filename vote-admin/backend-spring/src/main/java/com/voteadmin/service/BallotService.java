package com.voteadmin.service;

import com.voteadmin.dto.BallotRequest;
import com.voteadmin.dto.BallotResponse;
import com.voteadmin.dto.CandidateDto;
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
public class BallotService {

    private final BallotRepository ballotRepository;
    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;
    private final ElectionMapper electionMapper;
    private final AuditService auditService;

    @Transactional
    public BallotResponse createBallot(UUID electionId, BallotRequest req, String performedBy) {
        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new RuntimeException("Election not found"));
        if (!"draft".equals(election.getStatus())) {
            throw new IllegalArgumentException("Cannot edit ballot after election is published");
        }

        if (req.getOptions() == null || req.getOptions().size() < 2) {
            throw new IllegalArgumentException("At least 2 candidates required");
        }

        // Ensure no duplicate candidates with same name + party (case-insensitive)
        var seen = new java.util.HashSet<String>();
        for (BallotRequest.OptionDto opt : req.getOptions()) {
            String name = opt.getName() != null ? opt.getName().trim() : "";
            String party = opt.getParty() != null ? opt.getParty().trim() : "";
            if (name.isEmpty() || party.isEmpty()) {
                throw new IllegalArgumentException("Candidate name and party are required");
            }
            String key = (name.toLowerCase()) + "::" + (party.toLowerCase());
            if (!seen.add(key)) {
                throw new IllegalArgumentException("Duplicate candidate with same name and party is not allowed");
            }
        }

        int nextVersion = ballotRepository.findFirstByElectionIdOrderByVersionDesc(electionId)
                .map(b -> b.getVersion() + 1)
                .orElse(1);

        Ballot ballot = Ballot.builder()
                .electionId(electionId)
                .version(nextVersion)
                .title(req.getTitle() != null ? req.getTitle() : "Ballot")
                .description(req.getDescription() != null ? req.getDescription() : "")
                .maxSelections(req.getMaxSelections() != null ? req.getMaxSelections() : 1)
                .isPublished(false)
                .createdAt(Instant.now())
                .build();
        ballot = ballotRepository.save(ballot);

        for (int i = 0; i < req.getOptions().size(); i++) {
            BallotRequest.OptionDto opt = req.getOptions().get(i);
            String name = opt.getName() != null ? opt.getName().trim() : "";
            String party = opt.getParty() != null ? opt.getParty().trim() : "";
            Candidate c = Candidate.builder()
                    .ballotId(ballot.getId())
                    .candidateName(name)
                    .party(party)
                    .description(opt.getDescription() != null ? opt.getDescription() : "")
                    .build();
            candidateRepository.save(c);
        }

        auditService.log("BALLOT_CREATED", electionId, performedBy, ballot.getId().toString());
        return toResponse(ballot);
    }

    public List<BallotResponse> getBallotsByElection(UUID electionId) {
        electionRepository.findById(electionId)
                .orElseThrow(() -> new RuntimeException("Election not found"));
        List<Ballot> ballots = ballotRepository.findByElectionIdOrderByVersionAsc(electionId);
        return ballots.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public BallotResponse publishBallot(UUID ballotId, String performedBy) {
        Ballot ballot = ballotRepository.findById(ballotId)
                .orElseThrow(() -> new RuntimeException("Ballot not found"));
        Election election = electionRepository.findById(ballot.getElectionId())
                .orElseThrow(() -> new RuntimeException("Election not found"));
        if (Instant.now().isAfter(election.getEndDate())) {
            throw new IllegalArgumentException("Cannot publish ballot for an ended election");
        }
        List<Candidate> candidates = candidateRepository.findByBallotIdOrderByCandidateNameAsc(ballotId);
        if (candidates.size() < 2) {
            throw new IllegalArgumentException("Ballot must have at least 2 candidates");
        }

        List<Ballot> allBallots = ballotRepository.findByElectionIdOrderByVersionAsc(ballot.getElectionId());
        allBallots.forEach(b -> b.setIsPublished(false));
        ballotRepository.saveAll(allBallots);
        ballot.setIsPublished(true);
        ballotRepository.save(ballot);

        election.setIsPublished(true);
        election.setStatus(computeElectionStatus(election));
        electionRepository.save(election);

        auditService.log("BALLOT_PUBLISHED", ballot.getElectionId(), performedBy, ballotId.toString());
        return toResponse(ballot);
    }

    @Transactional
    public void unpublishBallot(UUID ballotId, String performedBy) {
        Ballot ballot = ballotRepository.findById(ballotId)
                .orElseThrow(() -> new RuntimeException("Ballot not found"));
        Election election = electionRepository.findById(ballot.getElectionId())
                .orElseThrow(() -> new RuntimeException("Election not found"));
        if (!Instant.now().isBefore(election.getStartDate())) {
            throw new IllegalArgumentException("Cannot unpublish ballot after election has started");
        }

        List<Ballot> allBallots = ballotRepository.findByElectionIdOrderByVersionAsc(ballot.getElectionId());
        allBallots.forEach(b -> b.setIsPublished(false));
        ballotRepository.saveAll(allBallots);

        if (ballotRepository.countByElectionIdAndIsPublishedTrue(ballot.getElectionId()) == 0) {
            election.setIsPublished(false);
            election.setStatus("draft");
            electionRepository.save(election);
        }
        auditService.log("BALLOT_UNPUBLISHED", ballot.getElectionId(), performedBy, ballotId.toString());
    }

    @Transactional
    public BallotResponse rollback(UUID ballotId, Integer targetVersion, String performedBy) {
        Ballot current = ballotRepository.findById(ballotId)
                .orElseThrow(() -> new RuntimeException("Ballot not found"));
        Election election = electionRepository.findById(current.getElectionId())
                .orElseThrow(() -> new RuntimeException("Election not found"));
        if (Instant.now().isAfter(election.getEndDate())) {
            throw new IllegalArgumentException("Cannot rollback after election has ended");
        }
        Ballot target = ballotRepository.findByElectionIdAndVersion(current.getElectionId(), targetVersion)
                .orElseThrow(() -> new RuntimeException("Ballot version " + targetVersion + " not found"));

        List<Ballot> allBallots = ballotRepository.findByElectionIdOrderByVersionAsc(current.getElectionId());
        allBallots.forEach(b -> b.setIsPublished(false));
        ballotRepository.saveAll(allBallots);
        target.setIsPublished(true);
        ballotRepository.save(target);

        election.setIsPublished(true);
        electionRepository.save(election);

        auditService.log("BALLOT_ROLLBACK", election.getId(), performedBy, target.getId().toString());
        return toResponse(target);
    }

    private BallotResponse toResponse(Ballot b) {
        List<Candidate> candidates = candidateRepository.findByBallotIdOrderByCandidateNameAsc(b.getId());
        List<CandidateDto> options = candidates.stream()
                .map(electionMapper::toCandidateDto)
                .collect(Collectors.toList());
        return BallotResponse.builder()
                .id(b.getId().toString())
                .electionId(b.getElectionId().toString())
                .version(b.getVersion())
                .title(b.getTitle())
                .description(b.getDescription())
                .options(options)
                .maxSelections(b.getMaxSelections())
                .isPublished(b.getIsPublished())
                .createdAt(b.getCreatedAt() != null ? b.getCreatedAt().toString() : null)
                .build();
    }

    private String computeElectionStatus(Election e) {
        Instant now = Instant.now();
        if (now.isAfter(e.getEndDate()) || now.equals(e.getEndDate())) return "ended";
        if (!now.isBefore(e.getStartDate())) return "active";
        return "published";
    }
}
