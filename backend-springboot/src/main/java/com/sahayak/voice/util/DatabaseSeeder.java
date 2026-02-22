package com.sahayak.voice.util;

import com.sahayak.voice.model.User;
import com.sahayak.voice.model.VisitRecord;
import com.sahayak.voice.repository.UserRepository;
import com.sahayak.voice.repository.VisitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class DatabaseSeeder {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    @Bean
    public CommandLineRunner seedDatabase(
            UserRepository userRepository,
            VisitRepository visitRepository
    ) {
        return args -> {
            logger.info("Starting database seeding...");

            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

            // Clear existing data (idempotent for demo)
            if (userRepository.count() > 0) {
                logger.warn("Existing data found. Clearing database...");
                visitRepository.deleteAll();
                userRepository.deleteAll();
            }

            // Create test users
            List<User> users = new ArrayList<>();

            User user1 = new User();
            user1.setName("Priya Sharma");
            user1.setPhoneNumber("9876543210");
            user1.setHashedPassword(passwordEncoder.encode("test123"));
            user1.setCreatedAt(LocalDateTime.now());
            users.add(userRepository.save(user1));

            User user2 = new User();
            user2.setName("Sunita Devi");
            user2.setPhoneNumber("9876543211");
            user2.setHashedPassword(passwordEncoder.encode("test123"));
            user2.setCreatedAt(LocalDateTime.now());
            users.add(userRepository.save(user2));

            User user3 = new User();
            user3.setName("Radha Kumari");
            user3.setPhoneNumber("9876543212");
            user3.setHashedPassword(passwordEncoder.encode("test123"));
            user3.setCreatedAt(LocalDateTime.now());
            users.add(userRepository.save(user3));

            // Create visit records for first user
            User firstUser = users.get(0);

            VisitRecord visit1 = new VisitRecord();
            visit1.setUserId(firstUser.getId());
            visit1.setPatientName("Sunita Devi");
            visit1.setBloodPressure("140/90");
            visit1.setChildSymptom("fever");
            visit1.setVisitDate(LocalDate.now().minusDays(2));
            visit1.setCreatedAt(LocalDateTime.now().minusDays(2));
            visitRepository.save(visit1);

            VisitRecord visit2 = new VisitRecord();
            visit2.setUserId(firstUser.getId());
            visit2.setPatientName("Radha Kumari");
            visit2.setBloodPressure("130/85");
            visit2.setChildSymptom("cough");
            visit2.setVisitDate(LocalDate.now().minusDays(1));
            visit2.setCreatedAt(LocalDateTime.now().minusDays(1));
            visitRepository.save(visit2);

            VisitRecord visit3 = new VisitRecord();
            visit3.setUserId(firstUser.getId());
            visit3.setPatientName("Anjali Singh");
            visit3.setBloodPressure("120/80");
            visit3.setChildSymptom(null);
            visit3.setVisitDate(LocalDate.now());
            visit3.setCreatedAt(LocalDateTime.now());
            visitRepository.save(visit3);

            logger.info("✅ Database seeding completed successfully!");
            logger.info("🔐 Test Login Credentials:");
            logger.info("   Phone: 9876543210 | Password: test123");
            logger.info("   Phone: 9876543211 | Password: test123");
            logger.info("   Phone: 9876543212 | Password: test123");
        };
    }
}