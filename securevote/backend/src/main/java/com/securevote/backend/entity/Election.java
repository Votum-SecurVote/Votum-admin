package com.securevote.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "elections")
@Getter
@Setter
public class Election {

    @Id
    @GeneratedValue
    private UUID electionId;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    private Instant startTime;
    private Instant endTime;

    private String status;
    private Boolean isPublished = false;

    private Instant createdAt = Instant.now();
    
    @Column(columnDefinition = "TEXT")
    private String votingRules;
}
