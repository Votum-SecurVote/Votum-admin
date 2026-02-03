package com.securevote.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue
    private UUID userId;

    private String fullName;
    private String gender;
    private String dateOfBirth;

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String phone;

    @Column(length = 500)
    private String address;

    private String passwordHash;
    private String status;

    private String profileImagePath;

    private Instant createdAt = Instant.now();
}
