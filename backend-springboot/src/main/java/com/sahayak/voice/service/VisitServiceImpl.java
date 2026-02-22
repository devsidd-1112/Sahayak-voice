package com.sahayak.voice.service;

import com.sahayak.voice.model.VisitRecord;
import com.sahayak.voice.repository.VisitRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Implementation of VisitService.
 * Handles business logic for visit record operations.
 */
@Service
public class VisitServiceImpl implements VisitService {
    
    private final VisitRepository visitRepository;
    
    /**
     * Constructor with dependency injection.
     * 
     * @param visitRepository the visit repository
     */
    public VisitServiceImpl(VisitRepository visitRepository) {
        this.visitRepository = visitRepository;
    }
    
    /**
     * Save a visit record to the database.
     * Validates required fields and sets the userId.
     * 
     * @param record the visit record to save
     * @param userId the ID of the user creating the visit
     * @return the saved visit record with generated ID
     * @throws IllegalArgumentException if required fields are missing
     */
    @Override
    public VisitRecord saveVisit(VisitRecord record, String userId) {
        // Validate required fields
        if (record.getVisitDate() == null) {
            throw new IllegalArgumentException("Visit date is required");
        }
        
        // Set the userId from authenticated context
        record.setUserId(userId);
        
        // Ensure createdAt is set
        if (record.getCreatedAt() == null) {
            record.setCreatedAt(LocalDateTime.now());
        }
        
        // Save to database
        return visitRepository.save(record);
    }
    
    /**
     * Retrieve all visit records for a specific user.
     * Returns visits ordered by creation date (most recent first).
     * 
     * @param userId the user ID to retrieve visits for
     * @return List of visit records for the specified user
     */
    @Override
    public List<VisitRecord> getVisitsByUser(String userId) {
        return visitRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Retrieve a single visit record by its ID.
     * 
     * @param visitId the ID of the visit record
     * @return the visit record if found
     * @throws RuntimeException if visit not found
     */
    @Override
    public VisitRecord getVisitById(String visitId) {
        return visitRepository.findById(visitId)
            .orElseThrow(() -> new RuntimeException("Visit record not found with id: " + visitId));
    }
}
