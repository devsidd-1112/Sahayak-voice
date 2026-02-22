package com.sahayak.voice.service;

import com.sahayak.voice.dto.AuthResponse;
import com.sahayak.voice.dto.LoginRequest;
import com.sahayak.voice.model.User;
import com.sahayak.voice.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

/**
 * Implementation of AuthenticationService.
 * Handles user authentication, JWT token generation, and validation.
 */
@Service
public class AuthenticationServiceImpl implements AuthenticationService {
    
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final SecretKey jwtSecretKey;
    private final long jwtExpirationMs;
    
    /**
     * Constructor with dependency injection.
     * 
     * @param userRepository the user repository
     * @param jwtSecret the JWT secret key from configuration
     * @param jwtExpirationMs the JWT expiration time in milliseconds
     */
    public AuthenticationServiceImpl(
            UserRepository userRepository,
            @Value("${jwt.secret}") String jwtSecret,
            @Value("${jwt.expiration-ms:604800000}") long jwtExpirationMs) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        // Create a secure key from the secret string
        this.jwtSecretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.jwtExpirationMs = jwtExpirationMs; // Default: 7 days (604800000 ms)
    }
    
    /**
     * Authenticate user and generate JWT token.
     * 
     * @param request the login request containing credentials
     * @return AuthResponse with token and user info
     * @throws RuntimeException if credentials are invalid
     */
    @Override
    public AuthResponse login(LoginRequest request) {
        // Find user by phone number
        Optional<User> userOptional = userRepository.findByPhoneNumber(request.getPhoneNumber());
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid credentials");
        }
        
        User user = userOptional.get();
        
        // Validate password using BCrypt
        if (!passwordEncoder.matches(request.getPassword(), user.getHashedPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        // Generate JWT token
        String token = generateToken(user.getId());
        
        // Return authentication response
        return new AuthResponse(token, user.getId(), user.getName());
    }
    
    /**
     * Validate a JWT token.
     * 
     * @param token the JWT token to validate
     * @return true if valid, false otherwise
     */
    @Override
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(jwtSecretKey)
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Extract user ID from JWT token.
     * 
     * @param token the JWT token
     * @return the user ID
     * @throws RuntimeException if token is invalid
     */
    @Override
    public String getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(jwtSecretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
            
            return claims.getSubject();
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired token", e);
        }
    }
    
    /**
     * Generate a JWT token for a user.
     * 
     * @param userId the user ID to include in the token
     * @return the generated JWT token
     */
    private String generateToken(String userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);
        
        return Jwts.builder()
            .subject(userId)
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(jwtSecretKey, Jwts.SIG.HS256)
            .compact();
    }
    
    /**
     * Hash a password using BCrypt.
     * This method is provided for convenience when creating test users.
     * 
     * @param plainPassword the plain text password
     * @return the hashed password
     */
    public String hashPassword(String plainPassword) {
        return passwordEncoder.encode(plainPassword);
    }
}
