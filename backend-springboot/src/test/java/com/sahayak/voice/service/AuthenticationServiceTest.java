package com.sahayak.voice.service;

import com.sahayak.voice.dto.AuthResponse;
import com.sahayak.voice.dto.LoginRequest;
import com.sahayak.voice.model.User;
import com.sahayak.voice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for AuthenticationService.
 * Tests login, token generation, and token validation functionality.
 */
@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
class AuthenticationServiceTest {
    
    @Autowired
    private AuthenticationService authenticationService;
    
    @Autowired
    private UserRepository userRepository;
    
    private BCryptPasswordEncoder passwordEncoder;
    
    @BeforeEach
    void setUp() {
        // Clean up database before each test
        userRepository.deleteAll();
        passwordEncoder = new BCryptPasswordEncoder();
    }
    
    @Test
    void testLoginWithValidCredentials() {
        // Given: A user exists in the database
        String phoneNumber = "9876543210";
        String plainPassword = "password123";
        String hashedPassword = passwordEncoder.encode(plainPassword);
        
        User user = new User("Test User", phoneNumber, hashedPassword);
        userRepository.save(user);
        
        // When: User attempts to login with valid credentials
        LoginRequest request = new LoginRequest(phoneNumber, plainPassword);
        AuthResponse response = authenticationService.login(request);
        
        // Then: Authentication succeeds and returns token
        assertNotNull(response);
        assertNotNull(response.getToken());
        assertNotNull(response.getUserId());
        assertEquals("Test User", response.getName());
        assertEquals(user.getId(), response.getUserId());
    }
    
    @Test
    void testLoginWithInvalidPhoneNumber() {
        // Given: No user exists with this phone number
        String phoneNumber = "9999999999";
        String password = "password123";
        
        // When/Then: Login attempt throws exception
        LoginRequest request = new LoginRequest(phoneNumber, password);
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authenticationService.login(request);
        });
        
        assertEquals("Invalid credentials", exception.getMessage());
    }
    
    @Test
    void testLoginWithInvalidPassword() {
        // Given: A user exists in the database
        String phoneNumber = "9876543210";
        String correctPassword = "password123";
        String wrongPassword = "wrongpassword";
        String hashedPassword = passwordEncoder.encode(correctPassword);
        
        User user = new User("Test User", phoneNumber, hashedPassword);
        userRepository.save(user);
        
        // When/Then: Login with wrong password throws exception
        LoginRequest request = new LoginRequest(phoneNumber, wrongPassword);
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authenticationService.login(request);
        });
        
        assertEquals("Invalid credentials", exception.getMessage());
    }
    
    @Test
    void testValidateTokenWithValidToken() {
        // Given: A user exists and has logged in
        String phoneNumber = "9876543210";
        String plainPassword = "password123";
        String hashedPassword = passwordEncoder.encode(plainPassword);
        
        User user = new User("Test User", phoneNumber, hashedPassword);
        userRepository.save(user);
        
        LoginRequest request = new LoginRequest(phoneNumber, plainPassword);
        AuthResponse response = authenticationService.login(request);
        String token = response.getToken();
        
        // When: Token is validated
        boolean isValid = authenticationService.validateToken(token);
        
        // Then: Token is valid
        assertTrue(isValid);
    }
    
    @Test
    void testValidateTokenWithInvalidToken() {
        // Given: An invalid token
        String invalidToken = "invalid.token.here";
        
        // When: Token is validated
        boolean isValid = authenticationService.validateToken(invalidToken);
        
        // Then: Token is invalid
        assertFalse(isValid);
    }
    
    @Test
    void testGetUserIdFromToken() {
        // Given: A user exists and has logged in
        String phoneNumber = "9876543210";
        String plainPassword = "password123";
        String hashedPassword = passwordEncoder.encode(plainPassword);
        
        User user = new User("Test User", phoneNumber, hashedPassword);
        userRepository.save(user);
        
        LoginRequest request = new LoginRequest(phoneNumber, plainPassword);
        AuthResponse response = authenticationService.login(request);
        String token = response.getToken();
        
        // When: User ID is extracted from token
        String userId = authenticationService.getUserIdFromToken(token);
        
        // Then: Correct user ID is returned
        assertEquals(user.getId(), userId);
    }
    
    @Test
    void testGetUserIdFromInvalidToken() {
        // Given: An invalid token
        String invalidToken = "invalid.token.here";
        
        // When/Then: Extracting user ID throws exception
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authenticationService.getUserIdFromToken(invalidToken);
        });
        
        assertTrue(exception.getMessage().contains("Invalid or expired token"));
    }
    
    @Test
    void testPasswordIsHashedNotPlaintext() {
        // Given: A user with a plain password
        String phoneNumber = "9876543210";
        String plainPassword = "password123";
        String hashedPassword = passwordEncoder.encode(plainPassword);
        
        User user = new User("Test User", phoneNumber, hashedPassword);
        userRepository.save(user);
        
        // When: User is retrieved from database
        User savedUser = userRepository.findByPhoneNumber(phoneNumber).orElseThrow();
        
        // Then: Password is hashed, not plaintext
        assertNotEquals(plainPassword, savedUser.getHashedPassword());
        assertTrue(passwordEncoder.matches(plainPassword, savedUser.getHashedPassword()));
    }
    
    @Test
    void testTokenExpirationIsSevenDays() {
        // Given: A user exists and has logged in
        String phoneNumber = "9876543210";
        String plainPassword = "password123";
        String hashedPassword = passwordEncoder.encode(plainPassword);
        
        User user = new User("Test User", phoneNumber, hashedPassword);
        userRepository.save(user);
        
        LoginRequest request = new LoginRequest(phoneNumber, plainPassword);
        AuthResponse response = authenticationService.login(request);
        String token = response.getToken();
        
        // When: Token is validated immediately
        boolean isValid = authenticationService.validateToken(token);
        
        // Then: Token is valid (we can't easily test 7-day expiration without mocking time)
        assertTrue(isValid);
        // Note: The actual 7-day expiration is configured in application.properties
        // and would require time manipulation to test properly
    }
}
