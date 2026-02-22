# Sahayak Voice Backend - Setup and Seed Data Guide

This guide provides detailed instructions for setting up the backend and seeding test data.

## Prerequisites

Before you begin, ensure you have:

- ✅ Java 17 or higher installed
- ✅ Maven 3.6+ installed
- ✅ MongoDB 6.x+ running (locally or remote)

## Quick Start

### 1. Start MongoDB

Make sure MongoDB is running on your system:

**Check if MongoDB is running:**
```bash
# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod

# Windows
net start MongoDB
```

**Start MongoDB if not running:**
```bash
# macOS
brew services start mongodb-community@6.0

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 2. Configure Application

The default configuration in `src/main/resources/application.properties` should work for local development:

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/sahayak_voice
jwt.secret=sahayak-voice-secret-key-change-in-production-must-be-256-bits
jwt.expiration=604800000
server.port=8080
```

### 3. Build the Application

```bash
cd backend-springboot
mvn clean install
```

### 4. Seed Test Data

Choose one of the following methods to seed the database:

## Seeding Methods

### Method 1: Shell Script (Recommended)

**Linux/macOS:**
```bash
cd backend-springboot
chmod +x scripts/seed-database.sh
./scripts/seed-database.sh
```

**Windows:**
```bash
cd backend-springboot
scripts\seed-database.bat
```

This method:
- ✅ Automatically builds the application
- ✅ Runs the Java-based seeder
- ✅ Uses BCrypt for password hashing (consistent with the application)
- ✅ Idempotent (safe to run multiple times)

### Method 2: Maven Command

```bash
cd backend-springboot
mvn spring-boot:run -Dspring-boot.run.main-class=com.sahayak.voice.util.DatabaseSeeder
```

This runs the `DatabaseSeeder` utility class directly.

### Method 3: MongoDB Shell Script

If you prefer using MongoDB shell directly:

```bash
cd backend-springboot
mongosh sahayak_voice scripts/seed-data.js
```

Or from within MongoDB shell:
```javascript
use sahayak_voice
load('scripts/seed-data.js')
```

**Note:** This method uses a pre-hashed password. The hash is for "test123" and is compatible with BCrypt.

## Test Data Created

After seeding, the database will contain:

### Test Users (3)

| Name | Phone Number | Password | User ID |
|------|--------------|----------|---------|
| Priya Sharma | 9876543210 | test123 | (auto-generated) |
| Sunita Devi | 9876543211 | test123 | (auto-generated) |
| Radha Kumari | 9876543212 | test123 | (auto-generated) |

### Sample Visit Records (5)

All visit records are associated with the first user (Priya Sharma):

1. **Sunita Devi** - BP: 140/90, Symptom: fever, Date: 4 days ago
2. **Priya Sharma** - BP: 120/80, Symptom: cough, Date: 3 days ago
3. **Radha Kumari** - BP: 130/85, Symptom: fever, cough, Date: 2 days ago
4. **Meera Patel** - BP: 125/82, Symptom: diarrhea, Date: yesterday
5. **Anjali Singh** - BP: 135/88, Symptom: none, Date: today

## Verifying Seed Data

### Using MongoDB Shell

```bash
mongosh sahayak_voice
```

```javascript
// View all users
db.users.find().pretty()

// View all visits
db.visits.find().pretty()

// Count documents
db.users.countDocuments()
db.visits.countDocuments()

// View visits for a specific user
db.visits.find({ userId: "USER_ID_HERE" }).pretty()
```

### Using the API

**1. Login with test user:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210",
    "password": "test123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "name": "Priya Sharma"
}
```

**2. Get visit records:**
```bash
curl -X GET http://localhost:8080/api/visits \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Clearing Test Data

If you need to clear the database and start fresh:

### Using MongoDB Shell

```bash
mongosh sahayak_voice
```

```javascript
db.users.deleteMany({})
db.visits.deleteMany({})
```

### Using the Seed Script

The seed scripts automatically clear existing data before inserting new data, so you can simply run them again:

```bash
./scripts/seed-database.sh  # Linux/macOS
scripts\seed-database.bat   # Windows
```

## Troubleshooting

### Issue: "MongoDB connection refused"

**Solution:** Ensure MongoDB is running:
```bash
# Check status
brew services list | grep mongodb  # macOS
sudo systemctl status mongod       # Linux

# Start MongoDB
brew services start mongodb-community@6.0  # macOS
sudo systemctl start mongod                # Linux
```

### Issue: "Port 8080 already in use"

**Solution:** Either:
1. Stop the process using port 8080
2. Change the port in `application.properties`:
   ```properties
   server.port=8081
   ```

### Issue: "Build failed" when running seed script

**Solution:** 
1. Ensure Java 17+ is installed: `java -version`
2. Ensure Maven is installed: `mvn -version`
3. Try building manually: `mvn clean compile`

### Issue: "Invalid credentials" when testing login

**Solution:** 
1. Verify the database was seeded: `mongosh sahayak_voice` → `db.users.find()`
2. Ensure you're using the correct credentials:
   - Phone: `9876543210`
   - Password: `test123`
3. Re-run the seed script to reset data

### Issue: MongoDB shell script shows "load() is not defined"

**Solution:** Use `mongosh` (MongoDB Shell) instead of the legacy `mongo` client:
```bash
mongosh sahayak_voice scripts/seed-data.js
```

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId("..."),
  name: "Priya Sharma",
  phoneNumber: "9876543210",
  hashedPassword: "$2a$10$...",
  createdAt: ISODate("2024-01-15T10:30:00Z")
}
```

**Indexes:**
- `phoneNumber` (unique)

### Visits Collection

```javascript
{
  _id: ObjectId("..."),
  userId: "user_id_reference",
  patientName: "Sunita Devi",
  bloodPressure: "140/90",
  childSymptom: "fever",
  visitDate: "2024-01-20",
  createdAt: ISODate("2024-01-20T14:30:00Z")
}
```

**Indexes:**
- `userId`
- `createdAt`

## Next Steps

After seeding the database:

1. ✅ Start the backend server: `mvn spring-boot:run`
2. ✅ Test the login endpoint with test credentials
3. ✅ Test the visits endpoint to retrieve sample data
4. ✅ Configure the mobile app to connect to the backend
5. ✅ Test the complete flow: login → record visit → sync

## Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Project README](README.md)
- [API Documentation](API.md) (if available)

## Support

If you encounter issues not covered in this guide:

1. Check the application logs for detailed error messages
2. Verify all prerequisites are installed and running
3. Ensure MongoDB is accessible and the database name matches the configuration
4. Review the [Troubleshooting](#troubleshooting) section above
