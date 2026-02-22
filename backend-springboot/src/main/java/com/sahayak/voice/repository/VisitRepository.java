package com.sahayak.voice.repository;

import com.sahayak.voice.model.VisitRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for VisitRecord entity.
 * Provides CRUD operations and custom query methods for visit data.
 */
@Repository
public interface VisitRepository extends MongoRepository<VisitRecord, String> {
    
    /**
     * Find all visit records for a specific user.
     * The userId field has an index in MongoDB for efficient querying.
     * 
     * @param userId the user ID to search for
     * @return List of visit records for the specified user
     */
    List<VisitRecord> findByUserId(String userId);
    
    /**
     * Find all visit records for a specific user, ordered by creation date descending.
     * This returns the most recent visits first.
     * 
     * @param userId the user ID to search for
     * @return List of visit records ordered by createdAt descending
     */
    List<VisitRecord> findByUserIdOrderByCreatedAtDesc(String userId);
    
    /**
     * Count the number of visit records for a specific user.
     * 
     * @param userId the user ID to count visits for
     * @return the number of visits for the specified user
     */
    long countByUserId(String userId);
}
