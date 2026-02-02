package com.voteadmin.dto;

import lombok.Data;

/**
 * Request body for POST /api/ballots/:ballotId/rollback
 */
@Data
public class RollbackRequest {

    private Integer targetVersion;
}
