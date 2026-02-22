package com.sahayak.voice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Main application class for Sahayak Voice Backend
 * 
 * This is a Spring Boot application that provides REST APIs for:
 * - User authentication with JWT
 * - Visit record synchronization
 * - Offline-first mobile health data collection
 */
@SpringBootApplication
@EnableMongoAuditing
public class SahayakVoiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SahayakVoiceApplication.class, args);
    }
}
