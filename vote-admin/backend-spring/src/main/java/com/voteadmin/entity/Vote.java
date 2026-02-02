package com.voteadmin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Maps to ERD table: votes
 * PK: vote_id (uuid), FK: election_id
 */
@Entity
@Table(name = "votes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vote {

    @Id
    @Column(name = "vote_id", updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID voteId;

    @Column(name = "election_id", nullable = false)
    private UUID electionId;

    @Column(name = "encrypted_vote", columnDefinition = "text")
    private String encryptedVote;

    @Column(name = "nullifier_hash")
    private String nullifierHash;

    @Column(name = "cast_at")
    private Instant castAt;
}
