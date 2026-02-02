package com.voteadmin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Maps to ERD table: vote_receipts
 * PK: receipt_hash (varchar), FK: election_id
 */
@Entity
@Table(name = "vote_receipts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteReceipt {

    @Id
    @Column(name = "receipt_hash", nullable = false)
    private String receiptHash;

    @Column(name = "election_id", nullable = false)
    private UUID electionId;

    @Column(name = "created_at")
    private Instant createdAt;
}
