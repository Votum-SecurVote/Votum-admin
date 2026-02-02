package com.voteadmin.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Maps to ERD table: roles
 * PK: role_id (int)
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Integer roleId;

    @Column(name = "role_name")
    private String roleName;
}
