package com.securevote.backend.service;

import com.securevote.backend.dto.VoterRegistrationRequest;
import com.securevote.backend.entity.IdentityVerification;
import com.securevote.backend.entity.User;
import com.securevote.backend.repository.IdentityVerificationRepository;
import com.securevote.backend.repository.UserRepository;
import com.securevote.backend.security.AadhaarHasher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.securevote.backend.dto.VoterLoginRequest;
import java.util.Optional;

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

    public User login(VoterLoginRequest req) {
        Optional<User> userOpt = userRepository.findByEmail(req.getEmail());
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return user;
    }


    public User getUser(java.util.UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
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
