package com.securevote.backend.controller;

import com.securevote.backend.dto.VoterRegistrationRequest;
import com.securevote.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.securevote.backend.dto.VoterLoginRequest;
import com.securevote.backend.entity.User;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final com.securevote.backend.service.FileStorageService fileStorageService;

    public AuthController(AuthService authService, com.securevote.backend.service.FileStorageService fileStorageService) {
        this.authService = authService;
        this.fileStorageService = fileStorageService;
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody VoterLoginRequest request) {
        try {
            User user = authService.login(request);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @ModelAttribute VoterRegistrationRequest request,
            @RequestParam("aadhaarPdf") org.springframework.web.multipart.MultipartFile aadhaarPdf,
            @RequestParam(value = "profileImage", required = false) org.springframework.web.multipart.MultipartFile profileImage
    ) {
        String aadhaarPath = fileStorageService.saveFile(aadhaarPdf, "aadhaar_docs");
        String profileImagePath = null;
        if (profileImage != null && !profileImage.isEmpty()) {
            profileImagePath = fileStorageService.saveFile(profileImage, "profile_images");
        }

        authService.register(request, aadhaarPath, profileImagePath);
        return ResponseEntity.ok("Registration successful");
    }
}
