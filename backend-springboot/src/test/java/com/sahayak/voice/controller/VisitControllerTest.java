package com.sahayak.voice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sahayak.voice.model.User;
import com.sahayak.voice.model.VisitRecord;
import com.sahayak.voice.repository.UserRepository;
import com.sahayak.voice.repository.VisitRepository;
import com.sahayak.voice.service.AuthenticationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for VisitController.
 * Tests the REST endpoints for visit record operations.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.properties")
class VisitControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private VisitRepository visitRepository;
    
    @Autowired
    private AuthenticationService authenticationService;
    
    private String testUserId;
    private String authToken;
    
    @BeforeEach
    void setUp() {
        // Clean up database
        visitRepository.deleteAll();
        userRepository.deleteAll();
        
        // Create a test user
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        User testUser = new User();
        testUser.setName("Test ASHA Worker");
        testUser.setPhoneNumber("9876543210");
        testUser.setHashedPassword(encoder.encode("password123"));
        testUser.setCreatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(testUser);
        testUserId = savedUser.getId();
        
        // Generate auth token for the test user
        authToken = generateTestToken(testUserId);
    }
    
    /**
     * Test POST /api/visits/sync with valid token and data.
     */
    @Test
    void testSyncVisit_WithValidToken_ReturnsCreated() throws Exception {
        // Arrange
        VisitRecord visitRecord = new VisitRecord();
        visitRecord.setPatientName("Sunita Devi");
        visitRecord.setBloodPressure("140/90");
        visitRecord.setChildSymptom("Fever");
        visitRecord.setVisitDate(LocalDate.now());
        
        // Act & Assert
        mockMvc.perform(post("/api/visits/sync")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(visitRecord)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.userId").value(testUserId))
                .andExpect(jsonPath("$.patientName").value("Sunita Devi"))
                .andExpect(jsonPath("$.bloodPressure").value("140/90"))
                .andExpect(jsonPath("$.childSymptom").value("Fever"))
                .andExpect(jsonPath("$.visitDate").exists())
                .andExpect(jsonPath("$.createdAt").exists());
    }
    
    /**
     * Test POST /api/visits/sync without authentication token.
     */
    @Test
    void testSyncVisit_WithoutToken_ReturnsUnauthorized() throws Exception {
        // Arrange
        VisitRecord visitRecord = new VisitRecord();
        visitRecord.setPatientName("Sunita Devi");
        visitRecord.setBloodPressure("140/90");
        visitRecord.setChildSymptom("Fever");
        visitRecord.setVisitDate(LocalDate.now());
        
        // Act & Assert - Spring Security returns 403 Forbidden for unauthenticated requests
        mockMvc.perform(post("/api/visits/sync")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(visitRecord)))
                .andExpect(status().isForbidden());
    }
    
    /**
     * Test POST /api/visits/sync with invalid token.
     */
    @Test
    void testSyncVisit_WithInvalidToken_ReturnsUnauthorized() throws Exception {
        // Arrange
        VisitRecord visitRecord = new VisitRecord();
        visitRecord.setPatientName("Sunita Devi");
        visitRecord.setBloodPressure("140/90");
        visitRecord.setChildSymptom("Fever");
        visitRecord.setVisitDate(LocalDate.now());
        
        // Act & Assert - Spring Security returns 403 Forbidden for invalid tokens
        mockMvc.perform(post("/api/visits/sync")
                .header("Authorization", "Bearer invalid-token-12345")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(visitRecord)))
                .andExpect(status().isForbidden());
    }
    
    /**
     * Test POST /api/visits/sync with missing required field (visitDate).
     */
    @Test
    void testSyncVisit_WithMissingVisitDate_ReturnsBadRequest() throws Exception {
        // Arrange
        VisitRecord visitRecord = new VisitRecord();
        visitRecord.setPatientName("Sunita Devi");
        visitRecord.setBloodPressure("140/90");
        visitRecord.setChildSymptom("Fever");
        // visitDate is not set
        
        // Act & Assert
        mockMvc.perform(post("/api/visits/sync")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(visitRecord)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation error"));
    }
    
    /**
     * Test GET /api/visits with valid token.
     */
    @Test
    void testGetVisits_WithValidToken_ReturnsVisitList() throws Exception {
        // Arrange - Create some test visits
        VisitRecord visit1 = new VisitRecord(testUserId, "Sunita Devi", "140/90", "Fever", LocalDate.now());
        VisitRecord visit2 = new VisitRecord(testUserId, "Priya Sharma", "120/80", "Cough", LocalDate.now().minusDays(1));
        visitRepository.save(visit1);
        visitRepository.save(visit2);
        
        // Act & Assert
        mockMvc.perform(get("/api/visits")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].patientName").exists())
                .andExpect(jsonPath("$[1].patientName").exists());
    }
    
    /**
     * Test GET /api/visits without authentication token.
     */
    @Test
    void testGetVisits_WithoutToken_ReturnsUnauthorized() throws Exception {
        // Act & Assert - Spring Security returns 403 Forbidden for unauthenticated requests
        mockMvc.perform(get("/api/visits"))
                .andExpect(status().isForbidden());
    }
    
    /**
     * Test GET /api/visits with invalid token.
     */
    @Test
    void testGetVisits_WithInvalidToken_ReturnsUnauthorized() throws Exception {
        // Act & Assert - Spring Security returns 403 Forbidden for invalid tokens
        mockMvc.perform(get("/api/visits")
                .header("Authorization", "Bearer invalid-token-12345"))
                .andExpect(status().isForbidden());
    }
    
    /**
     * Test GET /api/visits returns only user's own visits.
     */
    @Test
    void testGetVisits_ReturnsOnlyUserVisits() throws Exception {
        // Arrange - Create another user and their visits
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        User otherUser = new User();
        otherUser.setName("Other ASHA Worker");
        otherUser.setPhoneNumber("9876543211");
        otherUser.setHashedPassword(encoder.encode("password123"));
        otherUser.setCreatedAt(LocalDateTime.now());
        User savedOtherUser = userRepository.save(otherUser);
        
        // Create visits for both users
        VisitRecord visit1 = new VisitRecord(testUserId, "Sunita Devi", "140/90", "Fever", LocalDate.now());
        VisitRecord visit2 = new VisitRecord(savedOtherUser.getId(), "Priya Sharma", "120/80", "Cough", LocalDate.now());
        visitRepository.save(visit1);
        visitRepository.save(visit2);
        
        // Act & Assert - Should only return visit1 for testUser
        mockMvc.perform(get("/api/visits")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].patientName").value("Sunita Devi"));
    }
    
    /**
     * Helper method to generate a test JWT token.
     */
    private String generateTestToken(String userId) {
        // Use reflection to call the private generateToken method
        // For testing purposes, we'll use the AuthenticationService to generate a real token
        try {
            // Create a login request and get a token
            // Since we can't directly call generateToken, we'll use the service's login method
            // But for this test, we'll use a simpler approach: just use the service's token generation
            
            // Alternative: Use the AuthenticationServiceImpl's generateToken via reflection
            // For now, let's create a token by logging in
            var loginRequest = new com.sahayak.voice.dto.LoginRequest("9876543210", "password123");
            var authResponse = authenticationService.login(loginRequest);
            return authResponse.getToken();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate test token", e);
        }
    }
}
