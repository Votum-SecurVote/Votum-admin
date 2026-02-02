package com.evoting.controller;

import com.evoting.entity.Voter;
import com.evoting.service.VoterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/voters")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final VoterService voterService;

    public AdminController(VoterService voterService) {
        this.voterService = voterService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Voter>> getPendingVoters() {
        return ResponseEntity.ok(voterService.getPendingVoters());
    }

    @PutMapping("/{voterId}/approve")
    public ResponseEntity<?> approveVoter(@PathVariable String voterId) {
        voterService.approveVoter(voterId);
        return ResponseEntity.ok(Map.of("message", "Voter approved successfully"));
    }

    @PutMapping("/{voterId}/reject")
    public ResponseEntity<?> rejectVoter(@PathVariable String voterId) {
        voterService.rejectVoter(voterId);
        return ResponseEntity.ok(Map.of("message", "Voter rejected successfully"));
    }
}
