package com.sahayak.voice.model;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for User model
 */
class UserTest {
    
    @Test
    void testUserCreationWithDefaultConstructor() {
        User user = new User();
        
        assertNotNull(user);
        assertNotNull(user.getCreatedAt());
        assertNull(user.getId());
        assertNull(user.getName());
        assertNull(user.getPhoneNumber());
        assertNull(user.getHashedPassword());
    }
    
    @Test
    void testUserCreationWithParameterizedConstructor() {
        String name = "Priya Sharma";
        String phoneNumber = "9876543210";
        String hashedPassword = "$2a$10$hashedpassword";
        
        User user = new User(name, phoneNumber, hashedPassword);
        
        assertNotNull(user);
        assertEquals(name, user.getName());
        assertEquals(phoneNumber, user.getPhoneNumber());
        assertEquals(hashedPassword, user.getHashedPassword());
        assertNotNull(user.getCreatedAt());
        assertNull(user.getId()); // ID is set by MongoDB
    }
    
    @Test
    void testUserSettersAndGetters() {
        User user = new User();
        
        user.setId("123456");
        user.setName("Raj Kumar");
        user.setPhoneNumber("9123456789");
        user.setHashedPassword("$2a$10$anotherhash");
        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now);
        
        assertEquals("123456", user.getId());
        assertEquals("Raj Kumar", user.getName());
        assertEquals("9123456789", user.getPhoneNumber());
        assertEquals("$2a$10$anotherhash", user.getHashedPassword());
        assertEquals(now, user.getCreatedAt());
    }
    
    @Test
    void testUserToString() {
        User user = new User("Test User", "1234567890", "hashedpwd");
        String userString = user.toString();
        
        assertNotNull(userString);
        assertTrue(userString.contains("Test User"));
        assertTrue(userString.contains("1234567890"));
        assertFalse(userString.contains("hashedpwd")); // Password should not be in toString
    }
    
    @Test
    void testCreatedAtIsSetAutomatically() {
        LocalDateTime before = LocalDateTime.now();
        User user = new User("Test", "1234567890", "pwd");
        LocalDateTime after = LocalDateTime.now();
        
        assertNotNull(user.getCreatedAt());
        assertTrue(user.getCreatedAt().isAfter(before.minusSeconds(1)));
        assertTrue(user.getCreatedAt().isBefore(after.plusSeconds(1)));
    }
}
