package com.sahayak.voice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sahayak.voice.dto.LoginRequest;
import com.sahayak.voice.model.User;
import com.sahayak.voice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AuthController.
 * Tests the REST API endpoints for authentication.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
class AuthControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private BCryptPasswordEncoder passwordEncoder;
    
    @BeforeEach
    void setUp() {
        // Clean up database before each test
        userRepository.deleteAll();
        passwordEncoder = new BCryptPasswordEncoder();
    }
    
    @Test
    void testLoginWithValidCredentials() throws Exception {
        // Given: A user exists in the database
        String phoneNumber = "9876543210";
        String plainPassword = "password123";
        String hashedPassword = passwordEncoder.encode(plainPassword);
        
        User user = new User("Test User", phoneNumber, hashedPassword);
        userRepository.save(user);
        
        // When: POST request to /api/auth/login with valid credentials
        LoginRequest request = new LoginRequest(phoneNumber, plainPassword);
        
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                // Then: Returns 200 OK with token and user info
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.userId").value(user.getId()))
                .andExpect(jsonPath("$.name").value("Test User"));
    }
    
    @Test
    void testLoginWithInvalidPhoneNumber() throws Exception {
        // Given: No user exists with this phone number
        String phoneNumber = "9999999999";
        String password = "password123";
        
        // When: POST request to /api/auth/login with invalid phone number
        LoginRequest request = new LoginRequest(phoneNumber, password);
        
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                // Then: Returns 401 Unauthorized with error message
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid credentials"))
                .andExpect(jsonPath("$.message").value("Phone number or password is incorrect"));
    }
    
    @Test
    void testLoginWithInvalidPassword() throws Exception {
        // Given: A user exists in the database
        String phoneNumber = "9876543210";
        String correctPassword = "password123";
        String wrongPassword = "wrongpassword";
        String hashedPassword = passwordEncoder.encode(correctPassword);
        
        User user = new User("Test User", phoneNumber, hashedPassword);
        userRepository.save(user);
        
        // When: POST request to /api/auth/login with wrong password
        LoginRequest request = new LoginRequest(phoneNumber, wrongPassword);
        
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                // Then: Returns 401 Unauthorized with error message
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid credentials"))
                .andExpect(jsonPath("$.message").value("Phone number or password is incorrect"));
    }
    
    @Test
    void testLoginWithMissingPhoneNumber() throws Exception {
        // Given: A request with missing phone number
        String requestBody = "{\"password\":\"password123\"}";
        
        // When: POST request to /api/auth/login with missing phone number
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                // Then: Returns 400 Bad Request
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void testLoginWithMissingPassword() throws Exception {
        // Given: A request with missing password
        String requestBody = "{\"phoneNumber\":\"9876543210\"}";
        
        // When: POST request to /api/auth/login with missing password
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                // Then: Returns 400 Bad Request
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void testLoginWithEmptyPhoneNumber() throws Exception {
        // Given: A request with empty phone number
        LoginRequest request = new LoginRequest("", "password123");
        
        // When: POST request to /api/auth/login with empty phone number
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                // Then: Returns 400 Bad Request
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void testLoginWithEmptyPassword() throws Exception {
        // Given: A request with empty password
        LoginRequest request = new LoginRequest("9876543210", "");
        
        // When: POST request to /api/auth/login with empty password
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                // Then: Returns 400 Bad Request
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void testLoginWithMalformedJson() throws Exception {
        // Given: A malformed JSON request
        String malformedJson = "{phoneNumber:9876543210,password:password123}";
        
        // When: POST request to /api/auth/login with malformed JSON
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(malformedJson))
                // Then: Returns 400 Bad Request
                .andExpect(status().isBadRequest());
    }
}
