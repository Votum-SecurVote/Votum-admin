package com.voteadmin.repository;

import com.voteadmin.entity.Ballot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BallotRepository extends JpaRepository<Ballot, UUID> {

    List<Ballot> findByElectionIdOrderByVersionAsc(UUID electionId);

    Optional<Ballot> findFirstByElectionIdOrderByVersionDesc(UUID electionId);

    Optional<Ballot> findByElectionIdAndVersion(UUID electionId, Integer version);

    @Query("SELECT b FROM Ballot b WHERE b.electionId = :electionId AND b.isPublished = true")
    Optional<Ballot> findPublishedByElectionId(UUID electionId);

    int countByElectionIdAndIsPublishedTrue(UUID electionId);
}
