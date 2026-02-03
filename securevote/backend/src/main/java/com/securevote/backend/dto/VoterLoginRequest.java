package com.securevote.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoterLoginRequest {
    private String email;
    private String password;
}
