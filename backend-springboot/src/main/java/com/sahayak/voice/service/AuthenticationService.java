package com.sahayak.voice.service;

import com.sahayak.voice.dto.AuthResponse;
import com.sahayak.voice.dto.LoginRequest;
import com.sahayak.voice.dto.SignupRequest;
import com.sahayak.voice.dto.OtpVerificationRequest;

/**
 * Service interface for authentication operations.
 * Handles user login, signup, OTP verification, token generation, and token validation.
 */
public interface AuthenticationService {
    
    /**
     * Authenticate a user with their credentials and generate a JWT token.
     * 
     * @param request the login request containing phone number and password
     * @return AuthResponse containing the JWT token and user information
     * @throws RuntimeException if credentials are invalid
     */
    AuthResponse login(LoginRequest request);
    
    /**
     * Initiate signup process by generating and sending OTP
     * 
     * @param request the signup request containing user details
     * @throws RuntimeException if phone number already exists or OTP sending fails
     */
    void initiateSignup(SignupRequest request);
    
    /**
     * Verify OTP and complete user registration
     * 
     * @param request the OTP verification request
     * @return AuthResponse containing the JWT token and user information
     * @throws RuntimeException if OTP is invalid or expired
     */
    AuthResponse verifyOtpAndCompleteSignup(OtpVerificationRequest request);
    
    /**
     * Resend OTP for phone number verification
     * 
     * @param phoneNumber the phone number to resend OTP to
     * @throws RuntimeException if no pending verification found
     */
    void resendOtp(String phoneNumber);
    
    /**
     * Validate a JWT token.
     * 
     * @param token the JWT token to validate
     * @return true if the token is valid, false otherwise
     */
    boolean validateToken(String token);
    
    /**
     * Extract the user ID from a JWT token.
     * 
     * @param token the JWT token
     * @return the user ID contained in the token
     * @throws RuntimeException if the token is invalid or expired
     */
    String getUserIdFromToken(String token);
}
