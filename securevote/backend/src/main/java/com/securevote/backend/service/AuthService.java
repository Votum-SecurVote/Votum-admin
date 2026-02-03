package com.securevote.backend.service;

import com.securevote.backend.dto.VoterRegistrationRequest;
import com.securevote.backend.entity.IdentityVerification;
import com.securevote.backend.entity.User;
import com.securevote.backend.repository.IdentityVerificationRepository;
import com.securevote.backend.repository.UserRepository;
import com.securevote.backend.security.AadhaarHasher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final IdentityVerificationRepository identityRepository;
    private final PasswordEncoder passwordEncoder;
    private final AadhaarHasher aadhaarHasher;

    public AuthService(
            UserRepository userRepository,
            IdentityVerificationRepository identityRepository,
            PasswordEncoder passwordEncoder,
            AadhaarHasher aadhaarHasher
    ) {
        this.userRepository = userRepository;
        this.identityRepository = identityRepository;
        this.passwordEncoder = passwordEncoder;
        this.aadhaarHasher = aadhaarHasher;
    }

    public void register(VoterRegistrationRequest req, String aadhaarPdfPath, String profileImagePath) {

        if (req.getPassword() == null || req.getConfirmPassword() == null) {
            throw new IllegalArgumentException("Password is required");
        }

        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setGender(req.getGender());
        user.setDateOfBirth(req.getDateOfBirth());
        user.setAddress(req.getAddress());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setProfileImagePath(profileImagePath);
        user.setStatus("PENDING");

        user = userRepository.save(user);

        IdentityVerification iv = new IdentityVerification();
        iv.setUserId(user.getUserId());
        iv.setAadhaarHash(aadhaarHasher.hash(req.getAadhaarNumber()));
        iv.setAadhaarPdfPath(aadhaarPdfPath);
        iv.setVerificationStatus("PENDING");

        identityRepository.save(iv);
    }
}
