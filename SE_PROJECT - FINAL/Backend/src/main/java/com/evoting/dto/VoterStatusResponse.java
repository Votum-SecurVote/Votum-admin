package com.evoting.dto;

import com.evoting.entity.Voter;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class VoterStatusResponse {
    private UUID voterId;
    private Voter.Status status;
    private String identityType;
}
