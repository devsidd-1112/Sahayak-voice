package com.sahayak.voice.service;

import com.sahayak.voice.model.VisitRecord;

import java.util.List;

/**
 * Service interface for visit record operations.
 * Handles business logic for storing and retrieving visit records.
 */
public interface VisitService {
    
    /**
     * Save a visit record to the database.
     * Sets the userId from the authenticated user context.
     * 
     * @param record the visit record to save
     * @param userId the ID of the user creating the visit
     * @return the saved visit record with generated ID
     */
    VisitRecord saveVisit(VisitRecord record, String userId);
    
    /**
     * Retrieve all visit records for a specific user.
     * Returns visits ordered by creation date (most recent first).
     * 
     * @param userId the user ID to retrieve visits for
     * @return List of visit records for the specified user
     */
    List<VisitRecord> getVisitsByUser(String userId);
    
    /**
     * Retrieve a single visit record by its ID.
     * 
     * @param visitId the ID of the visit record
     * @return the visit record if found
     * @throws RuntimeException if visit not found
     */
    VisitRecord getVisitById(String visitId);
}
