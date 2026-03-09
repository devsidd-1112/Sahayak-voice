package com.sahayak.voice.controller;

import com.sahayak.voice.dto.AuthResponse;
import com.sahayak.voice.dto.LoginRequest;
import com.sahayak.voice.dto.SignupRequest;
import com.sahayak.voice.dto.OtpVerificationRequest;
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
 * Handles user authentication endpoints including login, signup, and OTP verification.
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
        System.out.println("===========================================");
        System.out.println("LOGIN REQUEST RECEIVED");
        System.out.println("Phone: " + request.getPhoneNumber());
        System.out.println("===========================================");
        
        try {
            AuthResponse response = authenticationService.login(request);
            System.out.println("Login successful for: " + request.getPhoneNumber());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.out.println("Login failed for: " + request.getPhoneNumber());
            System.out.println("Error: " + e.getMessage());
            // Handle invalid credentials
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid credentials");
            errorResponse.put("message", "Phone number or password is incorrect");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }
    
    /**
     * Signup endpoint - initiates registration and sends OTP
     * 
     * @param request the signup request containing name, phone number, and password
     * @return ResponseEntity with success message
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        System.out.println("===========================================");
        System.out.println("SIGNUP REQUEST RECEIVED");
        System.out.println("Name: " + request.getName());
        System.out.println("Phone: " + request.getPhoneNumber());
        System.out.println("===========================================");
        
        try {
            authenticationService.initiateSignup(request);
            Map<String, String> response = new HashMap<>();
            response.put("message", "OTP sent successfully");
            response.put("phoneNumber", request.getPhoneNumber());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.out.println("Signup failed: " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Signup failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    /**
     * Verify OTP and complete registration
     * 
     * @param request the OTP verification request
     * @return ResponseEntity with AuthResponse containing token and user info
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        try {
            AuthResponse response = authenticationService.verifyOtpAndCompleteSignup(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Verification failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    /**
     * Resend OTP for phone number verification
     * 
     * @param phoneNumber the phone number to resend OTP to
     * @return ResponseEntity with success message
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestParam String phoneNumber) {
        try {
            authenticationService.resendOtp(phoneNumber);
            Map<String, String> response = new HashMap<>();
            response.put("message", "OTP resent successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Resend failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
