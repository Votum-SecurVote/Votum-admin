package com.voteadmin.controller;

import com.voteadmin.dto.ElectionRequest;
import com.voteadmin.dto.ElectionResponse;
import com.voteadmin.service.ElectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/elections")
@RequiredArgsConstructor
public class ElectionController {

    private final ElectionService electionService;

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ElectionRequest req,
                                    @RequestHeader(value = "Authorization", required = false) String auth) {
        String performedBy = extractUserId(auth);
        ElectionResponse created = electionService.create(req, performedBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", created));
    }

    @GetMapping("/admin")
    public ResponseEntity<?> getAdminElections(@RequestHeader(value = "Authorization", required = false) String auth) {
        List<ElectionResponse> list = electionService.getAllForAdmin();
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActiveElections() {
        List<ElectionResponse> list = electionService.getActive();
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable UUID id) {
        ElectionResponse e = electionService.getById(id, true);
        return ResponseEntity.ok(Map.of("success", true, "data", e));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publish(@PathVariable UUID id,
                                    @RequestHeader(value = "Authorization", required = false) String auth) {
        String performedBy = extractUserId(auth);
        electionService.publish(id, performedBy);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/{id}/unpublish")
    public ResponseEntity<?> unpublish(@PathVariable UUID id,
                                      @RequestHeader(value = "Authorization", required = false) String auth) {
        String performedBy = extractUserId(auth);
        electionService.unpublish(id, performedBy);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id,
                                    @RequestHeader(value = "Authorization", required = false) String auth) {
        String performedBy = extractUserId(auth);
        electionService.delete(id, performedBy);
        return ResponseEntity.ok(Map.of("success", true, "message", "Election deleted successfully"));
    }

    private String extractUserId(String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) return "UNKNOWN";
        return "admin"; // or parse JWT and get subject
    }
}
