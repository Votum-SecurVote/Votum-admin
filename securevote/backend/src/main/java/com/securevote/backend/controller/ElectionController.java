package com.securevote.backend.controller;

import com.securevote.backend.entity.Election;
import com.securevote.backend.repository.ElectionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/elections")
@CrossOrigin(origins = "*")
public class ElectionController {

    private final ElectionRepository electionRepository;

    public ElectionController(ElectionRepository electionRepository) {
        this.electionRepository = electionRepository;
    }

    @GetMapping("/live")
    public ResponseEntity<List<Election>> getLiveElections() {
        return ResponseEntity.ok(electionRepository.findByStatus("active"));
    }
}
