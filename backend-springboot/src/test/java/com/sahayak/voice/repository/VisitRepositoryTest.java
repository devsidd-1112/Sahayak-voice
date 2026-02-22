package com.sahayak.voice.repository;

import com.sahayak.voice.model.VisitRecord;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for VisitRepository
 * Uses embedded MongoDB for testing
 */
@DataMongoTest
@TestPropertySource(locations = "classpath:application-test.properties")
class VisitRepositoryTest {
    
    @Autowired
    private VisitRepository visitRepository;
    
    private VisitRecord testVisit;
    private String testUserId = "user123";
    
    @BeforeEach
    void setUp() {
        // Clean up before each test
        visitRepository.deleteAll();
        
        // Create a test visit record
        testVisit = new VisitRecord(
            testUserId,
            "Sunita Devi",
            "140/90",
            "Fever",
            LocalDate.now()
        );
    }
    
    @AfterEach
    void tearDown() {
        // Clean up after each test
        visitRepository.deleteAll();
    }
    
    @Test
    void testSaveVisitRecord() {
        VisitRecord savedVisit = visitRepository.save(testVisit);
        
        assertNotNull(savedVisit);
        assertNotNull(savedVisit.getId());
        assertEquals(testVisit.getUserId(), savedVisit.getUserId());
        assertEquals(testVisit.getPatientName(), savedVisit.getPatientName());
        assertEquals(testVisit.getBloodPressure(), savedVisit.getBloodPressure());
        assertEquals(testVisit.getChildSymptom(), savedVisit.getChildSymptom());
        assertEquals(testVisit.getVisitDate(), savedVisit.getVisitDate());
        assertNotNull(savedVisit.getCreatedAt());
    }
    
    @Test
    void testFindByUserId() {
        visitRepository.save(testVisit);
        
        List<VisitRecord> visits = visitRepository.findByUserId(testUserId);
        
        assertNotNull(visits);
        assertEquals(1, visits.size());
        assertEquals(testVisit.getPatientName(), visits.get(0).getPatientName());
        assertEquals(testUserId, visits.get(0).getUserId());
    }
    
    @Test
    void testFindByUserIdMultipleRecords() {
        // Create multiple visit records for the same user
        VisitRecord visit1 = new VisitRecord(testUserId, "Patient 1", "120/80", "Cough", LocalDate.now());
        VisitRecord visit2 = new VisitRecord(testUserId, "Patient 2", "130/85", "Cold", LocalDate.now().minusDays(1));
        VisitRecord visit3 = new VisitRecord(testUserId, "Patient 3", "140/90", "Fever", LocalDate.now().minusDays(2));
        
        visitRepository.save(visit1);
        visitRepository.save(visit2);
        visitRepository.save(visit3);
        
        List<VisitRecord> visits = visitRepository.findByUserId(testUserId);
        
        assertEquals(3, visits.size());
    }
    
    @Test
    void testFindByUserIdOrderByCreatedAtDesc() {
        // Create multiple visit records with different creation times
        VisitRecord visit1 = new VisitRecord(testUserId, "Patient 1", "120/80", "Cough", LocalDate.now());
        VisitRecord visit2 = new VisitRecord(testUserId, "Patient 2", "130/85", "Cold", LocalDate.now());
        VisitRecord visit3 = new VisitRecord(testUserId, "Patient 3", "140/90", "Fever", LocalDate.now());
        
        // Save in order
        VisitRecord saved1 = visitRepository.save(visit1);
        VisitRecord saved2 = visitRepository.save(visit2);
        VisitRecord saved3 = visitRepository.save(visit3);
        
        List<VisitRecord> visits = visitRepository.findByUserIdOrderByCreatedAtDesc(testUserId);
        
        assertEquals(3, visits.size());
        // Most recent should be first
        assertTrue(visits.get(0).getCreatedAt().isAfter(visits.get(1).getCreatedAt()) ||
                   visits.get(0).getCreatedAt().isEqual(visits.get(1).getCreatedAt()));
    }
    
    @Test
    void testFindByUserIdNotFound() {
        visitRepository.save(testVisit);
        
        List<VisitRecord> visits = visitRepository.findByUserId("nonexistent-user");
        
        assertNotNull(visits);
        assertTrue(visits.isEmpty());
    }
    
    @Test
    void testCountByUserId() {
        // Create multiple visit records for the same user
        VisitRecord visit1 = new VisitRecord(testUserId, "Patient 1", "120/80", "Cough", LocalDate.now());
        VisitRecord visit2 = new VisitRecord(testUserId, "Patient 2", "130/85", "Cold", LocalDate.now());
        
        visitRepository.save(visit1);
        visitRepository.save(visit2);
        
        long count = visitRepository.countByUserId(testUserId);
        
        assertEquals(2, count);
    }
    
    @Test
    void testCountByUserIdZero() {
        long count = visitRepository.countByUserId("nonexistent-user");
        
        assertEquals(0, count);
    }
    
    @Test
    void testFindById() {
        VisitRecord savedVisit = visitRepository.save(testVisit);
        
        Optional<VisitRecord> foundVisit = visitRepository.findById(savedVisit.getId());
        
        assertTrue(foundVisit.isPresent());
        assertEquals(savedVisit.getId(), foundVisit.get().getId());
        assertEquals(savedVisit.getPatientName(), foundVisit.get().getPatientName());
    }
    
    @Test
    void testDeleteVisitRecord() {
        VisitRecord savedVisit = visitRepository.save(testVisit);
        String visitId = savedVisit.getId();
        
        visitRepository.deleteById(visitId);
        
        Optional<VisitRecord> deletedVisit = visitRepository.findById(visitId);
        assertFalse(deletedVisit.isPresent());
    }
    
    @Test
    void testUpdateVisitRecord() {
        VisitRecord savedVisit = visitRepository.save(testVisit);
        
        // Update the visit record
        savedVisit.setBloodPressure("150/95");
        savedVisit.setChildSymptom("High Fever");
        VisitRecord updatedVisit = visitRepository.save(savedVisit);
        
        assertEquals("150/95", updatedVisit.getBloodPressure());
        assertEquals("High Fever", updatedVisit.getChildSymptom());
        assertEquals(savedVisit.getId(), updatedVisit.getId());
    }
    
    @Test
    void testVisitRecordWithNullFields() {
        // Test that visit records can be saved with null optional fields
        VisitRecord visitWithNulls = new VisitRecord();
        visitWithNulls.setUserId(testUserId);
        visitWithNulls.setVisitDate(LocalDate.now());
        // patientName, bloodPressure, childSymptom are null
        
        VisitRecord savedVisit = visitRepository.save(visitWithNulls);
        
        assertNotNull(savedVisit);
        assertNotNull(savedVisit.getId());
        assertEquals(testUserId, savedVisit.getUserId());
        assertNull(savedVisit.getPatientName());
        assertNull(savedVisit.getBloodPressure());
        assertNull(savedVisit.getChildSymptom());
    }
    
    @Test
    void testMultipleUsersVisits() {
        // Create visits for different users
        String user1 = "user1";
        String user2 = "user2";
        
        VisitRecord visit1 = new VisitRecord(user1, "Patient A", "120/80", "Cough", LocalDate.now());
        VisitRecord visit2 = new VisitRecord(user1, "Patient B", "130/85", "Cold", LocalDate.now());
        VisitRecord visit3 = new VisitRecord(user2, "Patient C", "140/90", "Fever", LocalDate.now());
        
        visitRepository.save(visit1);
        visitRepository.save(visit2);
        visitRepository.save(visit3);
        
        List<VisitRecord> user1Visits = visitRepository.findByUserId(user1);
        List<VisitRecord> user2Visits = visitRepository.findByUserId(user2);
        
        assertEquals(2, user1Visits.size());
        assertEquals(1, user2Visits.size());
    }
}
