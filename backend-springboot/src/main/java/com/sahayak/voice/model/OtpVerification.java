package com.sahayak.voice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

/**
 * OTP Verification Model
 * Stores OTP codes for phone number verification during signup
 */
@Document(collection = "otp_verifications")
public class OtpVerification {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String phoneNumber;
    
    private String otp;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime expiresAt;
    
    private boolean verified;
    
    private String pendingUserName;
    
    private String pendingUserPassword;
    
    // Constructors
    public OtpVerification() {
        this.createdAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusMinutes(10); // OTP valid for 10 minutes
        this.verified = false;
    }
    
    public OtpVerification(String phoneNumber, String otp, String pendingUserName, String pendingUserPassword) {
        this();
        this.phoneNumber = phoneNumber;
        this.otp = otp;
        this.pendingUserName = pendingUserName;
        this.pendingUserPassword = pendingUserPassword;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getOtp() {
        return otp;
    }
    
    public void setOtp(String otp) {
        this.otp = otp;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public boolean isVerified() {
        return verified;
    }
    
    public void setVerified(boolean verified) {
        this.verified = verified;
    }
    
    public String getPendingUserName() {
        return pendingUserName;
    }
    
    public void setPendingUserName(String pendingUserName) {
        this.pendingUserName = pendingUserName;
    }
    
    public String getPendingUserPassword() {
        return pendingUserPassword;
    }
    
    public void setPendingUserPassword(String pendingUserPassword) {
        this.pendingUserPassword = pendingUserPassword;
    }
    
    /**
     * Check if OTP has expired
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
