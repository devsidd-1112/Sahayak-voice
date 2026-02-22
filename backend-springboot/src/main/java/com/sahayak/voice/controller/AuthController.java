package com.sahayak.voice.controller;

import com.sahayak.voice.dto.AuthResponse;
import com.sahayak.voice.dto.LoginRequest;
import com.sahayak.voice.service.AuthenticationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Authentication Controller
 * 
 * Handles user authentication endpoints including login.
 * Provides JWT token generation for authenticated users.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AuthenticationService authenticationService;
    
    /**
     * Constructor with dependency injection.
     * 
     * @param authenticationService the authentication service
     */
    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }
    
    /**
     * Login endpoint for ASHA workers.
     * Validates credentials and returns JWT token on success.
     * 
     * @param request the login request containing phone number and password
     * @return ResponseEntity with AuthResponse containing token and user info
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authenticationService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Handle invalid credentials
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid credentials");
            errorResponse.put("message", "Phone number or password is incorrect");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }
}
