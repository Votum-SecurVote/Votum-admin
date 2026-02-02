package com.evoting.service;

import com.evoting.entity.AuditLog;
import com.evoting.entity.Voter;
import com.evoting.repository.AuditLogRepository;
import com.evoting.repository.VoterRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AdminService {

    private final VoterRepository voterRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminService(VoterRepository voterRepository, AuditLogRepository auditLogRepository) {
        this.voterRepository = voterRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public List<Voter> getPendingVoters() {
        return voterRepository.findByStatus(Voter.Status.PENDING);
    }

    @Transactional
    public void approveVoter(UUID voterId) {
        String adminId = SecurityContextHolder.getContext().getAuthentication().getName();

        Voter voter = voterRepository.findById(voterId)
                .orElseThrow(() -> new RuntimeException("VOTER_NOT_FOUND"));

        if (voter.getStatus() != Voter.Status.PENDING) {
            throw new RuntimeException("INVALID_STATUS: Voter is not PENDING (Current: " + voter.getStatus() + ")");
        }

        voter.setStatus(Voter.Status.APPROVED);
        voterRepository.save(voter);

        logAction("APPROVE", adminId, voterId);
    }

    @Transactional
    public void rejectVoter(UUID voterId) {
        String adminId = SecurityContextHolder.getContext().getAuthentication().getName();

        Voter voter = voterRepository.findById(voterId)
                .orElseThrow(() -> new RuntimeException("VOTER_NOT_FOUND"));

        if (voter.getStatus() != Voter.Status.PENDING) {
            throw new RuntimeException("INVALID_STATUS: Voter is not PENDING (Current: " + voter.getStatus() + ")");
        }

        voter.setStatus(Voter.Status.REJECTED);
        voterRepository.save(voter);

        logAction("REJECT", adminId, voterId);
    }

    private void logAction(String action, String actorId, UUID targetId) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setActorId(actorId);
        log.setTargetVoterId(targetId);
        log.setRole("ADMIN");
        auditLogRepository.save(log);
    }
}
