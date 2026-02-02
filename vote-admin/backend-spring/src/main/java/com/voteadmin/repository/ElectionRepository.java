package com.voteadmin.repository;

import com.voteadmin.entity.Election;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ElectionRepository extends JpaRepository<Election, UUID> {

    List<Election> findAllByOrderByCreatedAtDesc();

    @Query("SELECT e FROM Election e WHERE e.isPublished = true ORDER BY e.startDate ASC")
    List<Election> findAllPublished();

    @Query("SELECT e FROM Election e WHERE e.isPublished = true AND e.startDate <= :now AND e.endDate > :now ORDER BY e.startDate ASC")
    List<Election> findAllActive(Instant now);
}
