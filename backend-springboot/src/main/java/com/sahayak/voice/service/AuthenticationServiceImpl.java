package com.sahayak.voice.service;

import com.sahayak.voice.dto.AuthResponse;
import com.sahayak.voice.dto.LoginRequest;
import com.sahayak.voice.dto.SignupRequest;
import com.sahayak.voice.dto.OtpVerificationRequest;
import com.sahayak.voice.model.User;
import com.sahayak.voice.model.OtpVerification;
import com.sahayak.voice.repository.UserRepository;
import com.sahayak.voice.repository.OtpVerificationRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;
import java.util.Random;

/**
 * Implementation of AuthenticationService.
 * Handles user authentication, signup, OTP verification, JWT token generation, and validation.
 */
@Service
public class AuthenticationServiceImpl implements AuthenticationService {
    
    private final UserRepository userRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final SecretKey jwtSecretKey;
    private final long jwtExpirationMs;
    private final Random random;
    
    /**
     * Constructor with dependency injection.
     * 
     * @param userRepository the user repository
     * @param otpVerificationRepository the OTP verification repository
     * @param jwtSecret the JWT secret key from configuration
     * @param jwtExpirationMs the JWT expiration time in milliseconds
     */
    public AuthenticationServiceImpl(
            UserRepository userRepository,
            OtpVerificationRepository otpVerificationRepository,
            @Value("${jwt.secret}") String jwtSecret,
            @Value("${jwt.expiration-ms:604800000}") long jwtExpirationMs) {
        this.userRepository = userRepository;
        this.otpVerificationRepository = otpVerificationRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
        // Create a secure key from the secret string
        this.jwtSecretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.jwtExpirationMs = jwtExpirationMs; // Default: 7 days (604800000 ms)
        this.random = new Random();
    }
    
    /**
     * Initiate signup process by generating and sending OTP
     */
    @Override
    @Transactional
    public void initiateSignup(SignupRequest request) {
        // Check if phone number already exists
        if (userRepository.findByPhoneNumber(request.getPhoneNumber()).isPresent()) {
            throw new RuntimeException("Phone number already registered");
        }
        
        // Generate 6-digit OTP
        String otp = String.format("%06d", random.nextInt(1000000));
        
        // Hash the password
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        
        // Delete any existing OTP verification for this phone number
        otpVerificationRepository.deleteByPhoneNumber(request.getPhoneNumber());
        
        // Create new OTP verification record
        OtpVerification otpVerification = new OtpVerification(
            request.getPhoneNumber(),
            otp,
            request.getName(),
            hashedPassword
        );
        
        otpVerificationRepository.save(otpVerification);
        
        // In production, send OTP via SMS service (Twilio, AWS SNS, etc.)
        // For demo purposes, log the OTP
        System.out.println("===========================================");
        System.out.println("OTP for " + request.getPhoneNumber() + ": " + otp);
        System.out.println("===========================================");
    }
    
    /**
     * Verify OTP and complete user registration
     */
    @Override
    @Transactional
    public AuthResponse verifyOtpAndCompleteSignup(OtpVerificationRequest request) {
        // Find OTP verification record
        Optional<OtpVerification> otpOptional = otpVerificationRepository.findByPhoneNumber(request.getPhoneNumber());
        
        if (otpOptional.isEmpty()) {
            throw new RuntimeException("No pending verification found for this phone number");
        }
        
        OtpVerification otpVerification = otpOptional.get();
        
        // Check if OTP has expired
        if (otpVerification.isExpired()) {
            otpVerificationRepository.delete(otpVerification);
            throw new RuntimeException("OTP has expired. Please request a new one");
        }
        
        // Verify OTP
        if (!otpVerification.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }
        
        // Create new user
        User newUser = new User();
        newUser.setName(otpVerification.getPendingUserName());
        newUser.setPhoneNumber(otpVerification.getPhoneNumber());
        newUser.setHashedPassword(otpVerification.getPendingUserPassword());
        
        User savedUser = userRepository.save(newUser);
        
        // Delete OTP verification record
        otpVerificationRepository.delete(otpVerification);
        
        // Generate JWT token
        String token = generateToken(savedUser.getId());
        
        // Return authentication response
        return new AuthResponse(token, savedUser.getId(), savedUser.getName());
    }
    
    /**
     * Resend OTP for phone number verification
     */
    @Override
    @Transactional
    public void resendOtp(String phoneNumber) {
        // Find existing OTP verification
        Optional<OtpVerification> otpOptional = otpVerificationRepository.findByPhoneNumber(phoneNumber);
        
        if (otpOptional.isEmpty()) {
            throw new RuntimeException("No pending verification found for this phone number");
        }
        
        OtpVerification otpVerification = otpOptional.get();
        
        // Generate new OTP
        String newOtp = String.format("%06d", random.nextInt(1000000));
        otpVerification.setOtp(newOtp);
        
        // Reset expiration time
        otpVerification.setExpiresAt(java.time.LocalDateTime.now().plusMinutes(10));
        
        otpVerificationRepository.save(otpVerification);
        
        // In production, send OTP via SMS service
        // For demo purposes, log the OTP
        System.out.println("===========================================");
        System.out.println("New OTP for " + phoneNumber + ": " + newOtp);
        System.out.println("===========================================");
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
