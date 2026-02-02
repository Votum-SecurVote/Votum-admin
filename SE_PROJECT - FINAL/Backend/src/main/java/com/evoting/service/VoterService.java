package com.evoting.service;

import com.evoting.dto.RegisterVoterRequest;
import com.evoting.entity.AuditLog;
import com.evoting.entity.Voter;
import com.evoting.repository.AuditLogRepository;
import com.evoting.repository.VoterRepository;
import com.evoting.security.CryptoService;
import com.evoting.security.JwtAuthenticationFilter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;

@Service
public class VoterService {

    private final VoterRepository voterRepository;
    private final AuditLogRepository auditLogRepository;
    private final CryptoService cryptoService;

    public VoterService(VoterRepository voterRepository, AuditLogRepository auditLogRepository,
            CryptoService cryptoService) {
        this.voterRepository = voterRepository;
        this.auditLogRepository = auditLogRepository;
        this.cryptoService = cryptoService;
    }

    @Transactional
    public Voter registerVoter(RegisterVoterRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        // 1. Check if user already registered
        if (voterRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("ALREADY_REGISTERED: User already has a registration application.");
        }

        // 2. Decrypt Identity Proof
        String decryptedIdentity;
        try {
            decryptedIdentity = cryptoService.decrypt(request.getIdentityProof());
        } catch (Exception e) {
            throw new RuntimeException("INVALID_ENCRYPTION: Could not decrypt identity proof.");
        }

        // 3. Hash Identity for Uniqueness Check
        String identityHash = hashIdentity(decryptedIdentity);

        if (voterRepository.findByIdentityHash(identityHash).isPresent()) {
            throw new RuntimeException("DUPLICATE_IDENTITY: This identity is already registered.");
        }

        // 4. Create Voter (Store Encrypted Identity - Re-encrypting if needed, OR
        // storing the payload if it's securely encrypted.
        // The Prompt says: "Backend must: Decrypt data securely, NEVER store plaintext
        // identity".
        // It also says: "Decrypt incoming payload".
        // The incoming payload is encrypted with Sever Public Key. We decrypted it to
        // `decryptedIdentity` to validate/hash.
        // We cannot store `decryptedIdentity`.
        // We could store `request.getIdentityProof()` (the encrypted blob) directly?
        // YES, because only the server Private Key can decrypt it, so it is encrypted
        // at rest.

        Voter voter = new Voter();
        voter.setUserId(userId);
        voter.setIdentityHash(identityHash);
        voter.setEncryptedIdentity(request.getIdentityProof()); // Storing the RSA encrypted blob
        voter.setIdentityType(request.getIdentityType());
        voter.setStatus(Voter.Status.PENDING);

        voterRepository.save(voter);

        // 5. Audit Log
        AuditLog log = new AuditLog();
        log.setAction("REGISTER");
        log.setActorId(userId);
        log.setTargetVoterId(voter.getId());
        log.setRole("VOTER");
        auditLogRepository.save(log);

        return voter;
    }

    public java.util.List<Voter> getPendingVoters() {
        return voterRepository.findByStatus(Voter.Status.PENDING);
    }

    @Transactional
    public void approveVoter(String voterId) {
        String adminId = SecurityContextHolder.getContext().getAuthentication().getName();
        Voter voter = voterRepository.findById(java.util.UUID.fromString(voterId))
                .orElseThrow(() -> new RuntimeException("Voter not found"));

        if (voter.getStatus() != Voter.Status.PENDING) {
            throw new RuntimeException("Voter is not in PENDING state");
        }

        voter.setStatus(Voter.Status.APPROVED);
        voterRepository.save(voter);

        AuditLog log = new AuditLog();
        log.setAction("APPROVE");
        log.setActorId(adminId);
        log.setTargetVoterId(voter.getId());
        log.setRole("ADMIN");
        auditLogRepository.save(log);
    }

    @Transactional
    public void rejectVoter(String voterId) {
        String adminId = SecurityContextHolder.getContext().getAuthentication().getName();
        Voter voter = voterRepository.findById(java.util.UUID.fromString(voterId))
                .orElseThrow(() -> new RuntimeException("Voter not found"));

        if (voter.getStatus() != Voter.Status.PENDING) {
            throw new RuntimeException("Voter is not in PENDING state");
        }

        voter.setStatus(Voter.Status.REJECTED);
        voterRepository.save(voter);

        AuditLog log = new AuditLog();
        log.setAction("REJECT");
        log.setActorId(adminId);
        log.setTargetVoterId(voter.getId());
        log.setRole("ADMIN");
        auditLogRepository.save(log);
    }

    private String hashIdentity(String identity) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(identity.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error hashing identity", e);
        }
    }

    private static String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (int i = 0; i < hash.length; i++) {
            String hex = Integer.toHexString(0xff & hash[i]);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
