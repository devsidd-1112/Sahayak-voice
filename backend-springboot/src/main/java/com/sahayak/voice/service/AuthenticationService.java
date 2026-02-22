package com.sahayak.voice.service;

import com.sahayak.voice.dto.AuthResponse;
import com.sahayak.voice.dto.LoginRequest;

/**
 * Service interface for authentication operations.
 * Handles user login, token generation, and token validation.
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
