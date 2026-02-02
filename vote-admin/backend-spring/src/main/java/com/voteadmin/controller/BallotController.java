package com.voteadmin.controller;

import com.voteadmin.dto.BallotRequest;
import com.voteadmin.dto.BallotResponse;
import com.voteadmin.dto.RollbackRequest;
import com.voteadmin.service.BallotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BallotController {

    private final BallotService ballotService;

    @PostMapping("/elections/{electionId}/ballots")
    public ResponseEntity<?> createBallot(@PathVariable UUID electionId,
                                          @Valid @RequestBody BallotRequest req,
                                          @RequestHeader(value = "Authorization", required = false) String auth) {
        String performedBy = auth != null && auth.startsWith("Bearer ") ? "admin" : "UNKNOWN";
        BallotResponse created = ballotService.createBallot(electionId, req, performedBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", created));
    }

    @GetMapping("/elections/{electionId}/ballots")
    public ResponseEntity<?> getBallots(@PathVariable UUID electionId,
                                        @RequestHeader(value = "Authorization", required = false) String auth) {
        List<BallotResponse> list = ballotService.getBallotsByElection(electionId);
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }

    @PostMapping("/ballots/{ballotId}/publish")
    public ResponseEntity<?> publishBallot(@PathVariable UUID ballotId,
                                           @RequestHeader(value = "Authorization", required = false) String auth) {
        String performedBy = auth != null && auth.startsWith("Bearer ") ? "admin" : "UNKNOWN";
        BallotResponse updated = ballotService.publishBallot(ballotId, performedBy);
        return ResponseEntity.ok(Map.of("success", true, "data", updated));
    }

    @PostMapping("/ballots/{ballotId}/unpublish")
    public ResponseEntity<?> unpublishBallot(@PathVariable UUID ballotId,
                                            @RequestHeader(value = "Authorization", required = false) String auth) {
        String performedBy = auth != null && auth.startsWith("Bearer ") ? "admin" : "UNKNOWN";
        ballotService.unpublishBallot(ballotId, performedBy);
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of("id", ballotId)));
    }

    @PostMapping("/ballots/{ballotId}/rollback")
    public ResponseEntity<?> rollback(@PathVariable UUID ballotId,
                                      @RequestBody RollbackRequest req,
                                      @RequestHeader(value = "Authorization", required = false) String auth) {
        if (req.getTargetVersion() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "targetVersion is required"));
        }
        String performedBy = auth != null && auth.startsWith("Bearer ") ? "admin" : "UNKNOWN";
        BallotResponse updated = ballotService.rollback(ballotId, req.getTargetVersion(), performedBy);
        return ResponseEntity.ok(Map.of("success", true, "data", updated));
    }
}
