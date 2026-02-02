package com.voteadmin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Maps to ERD table: audit_logs
 * PK: log_id (uuid)
 */
@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @Column(name = "log_id", updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID logId;

    @Column(name = "actor_role")
    private String actorRole;

    @Column(name = "action", columnDefinition = "text")
    private String action;

    @Column(name = "entity")
    private String entity;

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(name = "timestamp")
    private Instant timestamp;

    @Column(name = "hash", columnDefinition = "text")
    private String hash;

    @Column(name = "previous_hash", columnDefinition = "text")
    private String previousHash;
}
