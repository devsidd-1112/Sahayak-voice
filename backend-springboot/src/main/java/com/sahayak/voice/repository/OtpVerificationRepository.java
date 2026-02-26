package com.sahayak.voice.repository;

import com.sahayak.voice.model.OtpVerification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for OTP verification operations
 */
@Repository
public interface OtpVerificationRepository extends MongoRepository<OtpVerification, String> {
    
    /**
     * Find OTP verification by phone number
     */
    Optional<OtpVerification> findByPhoneNumber(String phoneNumber);
    
    /**
     * Delete OTP verification by phone number
     */
    void deleteByPhoneNumber(String phoneNumber);
}
