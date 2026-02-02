package com.evoting.repository;

import com.evoting.entity.Voter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface VoterRepository extends JpaRepository<Voter, UUID> {
    Optional<Voter> findByUserId(String userId);
    Optional<Voter> findByIdentityHash(String identityHash);
    List<Voter> findByStatus(Voter.Status status);
}
