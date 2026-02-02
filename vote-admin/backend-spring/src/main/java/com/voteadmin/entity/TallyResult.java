package com.voteadmin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Maps to ERD table: tally_results
 * PK: election_id (uuid), FK: elections
 */
@Entity
@Table(name = "tally_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TallyResult {

    @Id
    @Column(name = "election_id", nullable = false)
    private UUID electionId;

    @Column(name = "encrypted_result", columnDefinition = "text")
    private String encryptedResult;

    @Column(name = "proof", columnDefinition = "text")
    private String proof;

    @Column(name = "published_at")
    private Instant publishedAt;
}
