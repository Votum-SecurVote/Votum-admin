package com.voteadmin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Maps to actual DB table: elections
 * PK: id (uuid) - matches your existing database
 */
@Entity
@Table(name = "elections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Election {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "start_date", nullable = false)
    private Instant startDate;

    @Column(name = "end_date", nullable = false)
    private Instant endDate;

    @Column(name = "status")
    private String status;

    @Column(name = "is_published")
    private Boolean isPublished;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "voting_rules", columnDefinition = "text")
    private String votingRules;

    @OneToMany(mappedBy = "election", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("version ASC")
    @Builder.Default
    private List<Ballot> ballots = new ArrayList<>();
}
