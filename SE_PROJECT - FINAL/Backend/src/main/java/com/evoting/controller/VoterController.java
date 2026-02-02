package com.evoting.controller;

import com.evoting.dto.RegisterVoterRequest;
import com.evoting.entity.Voter;
import com.evoting.service.VoterService;
import com.evoting.repository.VoterRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/voters")
public class VoterController {

    private final VoterService voterService;
    private final VoterRepository voterRepository; // Making it public or adding getter would be cleaner, but injecting
                                                   // for fix

    public VoterController(VoterService voterService, VoterRepository voterRepository) {
        this.voterService = voterService;
        this.voterRepository = voterRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerVoter(@RequestBody @jakarta.validation.Valid RegisterVoterRequest request) {
        Voter voter = voterService.registerVoter(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Registration successful. Waiting for admin approval.",
                "voterId", voter.getId(),
                "status", voter.getStatus()));
    }

    @GetMapping("/me")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VOTER')")
    public ResponseEntity<?> getMyVoterStatus() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<Voter> voter = voterRepository.findByUserId(userId);

        if (voter.isEmpty()) {
            // Return 200 OK with specific status to avoid browser console 404 errors
            return ResponseEntity.ok(Map.of("status", "UNREGISTERED", "message", "Not registered"));
        }

        Voter v = voter.get();
        return ResponseEntity
                .ok(new com.evoting.dto.VoterStatusResponse(v.getId(), v.getStatus(), v.getIdentityType()));
    }
}
