package com.sahayak.voice.repository;

import com.sahayak.voice.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for User entity.
 * Provides CRUD operations and custom query methods for User data.
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {
    
    /**
     * Find a user by their phone number.
     * The phoneNumber field has a unique index in MongoDB.
     * 
     * @param phoneNumber the phone number to search for
     * @return Optional containing the user if found, empty otherwise
     */
    Optional<User> findByPhoneNumber(String phoneNumber);
    
    /**
     * Check if a user exists with the given phone number.
     * 
     * @param phoneNumber the phone number to check
     * @return true if a user exists with this phone number, false otherwise
     */
    boolean existsByPhoneNumber(String phoneNumber);
}
