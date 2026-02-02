package com.voteadmin.entity;

import lombok.*;

import java.io.Serializable;
import java.util.UUID;

/**
 * Composite PK for user_roles (ERD).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserRoleId implements Serializable {

    private UUID userId;
    private Integer roleId;
}
