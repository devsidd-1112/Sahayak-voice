package com.sahayak.voice.repository;

import com.sahayak.voice.model.User;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.test.context.TestPropertySource;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for UserRepository
 * Uses embedded MongoDB for testing
 */
@DataMongoTest
@TestPropertySource(locations = "classpath:application-test.properties")
class UserRepositoryTest {
    
    @Autowired
    private UserRepository userRepository;
    
    private User testUser;
    
    @BeforeEach
    void setUp() {
        // Clean up before each test
        userRepository.deleteAll();
        
        // Create a test user
        testUser = new User("Priya Sharma", "9876543210", "$2a$10$hashedpassword");
    }
    
    @AfterEach
    void tearDown() {
        // Clean up after each test
        userRepository.deleteAll();
    }
    
    @Test
    void testSaveUser() {
        User savedUser = userRepository.save(testUser);
        
        assertNotNull(savedUser);
        assertNotNull(savedUser.getId());
        assertEquals(testUser.getName(), savedUser.getName());
        assertEquals(testUser.getPhoneNumber(), savedUser.getPhoneNumber());
        assertEquals(testUser.getHashedPassword(), savedUser.getHashedPassword());
        assertNotNull(savedUser.getCreatedAt());
    }
    
    @Test
    void testFindByPhoneNumber() {
        userRepository.save(testUser);
        
        Optional<User> foundUser = userRepository.findByPhoneNumber("9876543210");
        
        assertTrue(foundUser.isPresent());
        assertEquals(testUser.getName(), foundUser.get().getName());
        assertEquals(testUser.getPhoneNumber(), foundUser.get().getPhoneNumber());
    }
    
    @Test
    void testFindByPhoneNumberNotFound() {
        userRepository.save(testUser);
        
        Optional<User> foundUser = userRepository.findByPhoneNumber("0000000000");
        
        assertFalse(foundUser.isPresent());
    }
    
    @Test
    void testExistsByPhoneNumber() {
        userRepository.save(testUser);
        
        boolean exists = userRepository.existsByPhoneNumber("9876543210");
        boolean notExists = userRepository.existsByPhoneNumber("0000000000");
        
        assertTrue(exists);
        assertFalse(notExists);
    }
    
    @Test
    void testUniquePhoneNumberConstraint() {
        // Save first user
        userRepository.save(testUser);
        
        // Try to save another user with the same phone number
        User duplicateUser = new User("Another User", "9876543210", "$2a$10$differenthash");
        
        // This should throw an exception due to unique index
        assertThrows(Exception.class, () -> {
            userRepository.save(duplicateUser);
            // Force the operation to execute
            userRepository.findAll();
        });
    }
    
    @Test
    void testFindById() {
        User savedUser = userRepository.save(testUser);
        
        Optional<User> foundUser = userRepository.findById(savedUser.getId());
        
        assertTrue(foundUser.isPresent());
        assertEquals(savedUser.getId(), foundUser.get().getId());
        assertEquals(savedUser.getName(), foundUser.get().getName());
    }
    
    @Test
    void testDeleteUser() {
        User savedUser = userRepository.save(testUser);
        String userId = savedUser.getId();
        
        userRepository.deleteById(userId);
        
        Optional<User> deletedUser = userRepository.findById(userId);
        assertFalse(deletedUser.isPresent());
    }
    
    @Test
    void testUpdateUser() {
        User savedUser = userRepository.save(testUser);
        
        // Update the user's name
        savedUser.setName("Updated Name");
        User updatedUser = userRepository.save(savedUser);
        
        assertEquals("Updated Name", updatedUser.getName());
        assertEquals(savedUser.getId(), updatedUser.getId());
    }
    
    @Test
    void testFindAllUsers() {
        User user1 = new User("User 1", "1111111111", "hash1");
        User user2 = new User("User 2", "2222222222", "hash2");
        User user3 = new User("User 3", "3333333333", "hash3");
        
        userRepository.save(user1);
        userRepository.save(user2);
        userRepository.save(user3);
        
        long count = userRepository.count();
        
        assertEquals(3, count);
    }
}
