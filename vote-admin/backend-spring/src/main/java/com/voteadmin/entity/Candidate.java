package com.voteadmin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Maps to actual DB table: candidates
 * PK: candidate_id (uuid), FK: ballot_id references ballots(id)
 */
@Entity
@Table(name = "candidates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidate {

    @Id
    @Column(name = "candidate_id", updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID candidateId;

    @Column(name = "ballot_id", nullable = false)
    private UUID ballotId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ballot_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Ballot ballot;

    @Column(name = "candidate_name", nullable = false)
    private String candidateName;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "party")
    private String party;
}
