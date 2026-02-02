package com.voteadmin.repository;

import com.voteadmin.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface CandidateRepository extends JpaRepository<Candidate, UUID> {

    List<Candidate> findByBallotIdOrderByCandidateNameAsc(UUID ballotId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Candidate c WHERE c.ballotId = :ballotId")
    void deleteByBallotId(UUID ballotId);
}
