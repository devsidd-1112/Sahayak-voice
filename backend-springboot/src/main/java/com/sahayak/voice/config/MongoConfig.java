package com.sahayak.voice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * MongoDB Configuration
 * 
 * Enables MongoDB repositories
 */
@Configuration
@EnableMongoRepositories(basePackages = "com.sahayak.voice.repository")
public class MongoConfig {
    // MongoDB configuration is handled by application.properties
}
