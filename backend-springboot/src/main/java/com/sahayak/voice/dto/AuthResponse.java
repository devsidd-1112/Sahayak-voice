package com.sahayak.voice.dto;

/**
 * Data Transfer Object for authentication responses.
 * Contains the JWT token and user information after successful login.
 */
public class AuthResponse {
    
    private String token;
    private String userId;
    private String name;
    
    // Constructors
    public AuthResponse() {
    }
    
    public AuthResponse(String token, String userId, String name) {
        this.token = token;
        this.userId = userId;
        this.name = name;
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    @Override
    public String toString() {
        return "AuthResponse{" +
                "token='[PROTECTED]'" +
                ", userId='" + userId + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
