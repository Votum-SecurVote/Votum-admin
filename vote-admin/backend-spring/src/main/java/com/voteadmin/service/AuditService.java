package com.voteadmin.service;

import com.voteadmin.entity.AuditLog;
import com.voteadmin.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(String action, UUID entityId, String performedBy, String extra) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .entity("election")
                .entityId(entityId)
                .actorRole(performedBy != null ? performedBy : "UNKNOWN")
                .timestamp(Instant.now())
                .build();
        auditLogRepository.save(log);
    }
}
