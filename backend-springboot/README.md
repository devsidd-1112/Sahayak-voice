# Sahayak Voice Backend (Spring Boot)

Spring Boot backend for the Sahayak Voice mobile application - a voice-first, offline-first health data collection system for ASHA workers in India.

## Technology Stack

- **Framework**: Spring Boot 3.2.1
- **Language**: Java 17
- **Database**: MongoDB
- **Security**: Spring Security with JWT
- **Build Tool**: Maven
- **Testing**: JUnit 5, jqwik (property-based testing)

## Project Structure

```
backend-springboot/
├── src/
│   ├── main/
│   │   ├── java/com/sahayak/voice/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST API controllers
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── exception/       # Custom exceptions
│   │   │   ├── model/           # Domain models (entities)
│   │   │   ├── repository/      # MongoDB repositories
│   │   │   ├── security/        # Security components (JWT)
│   │   │   ├── service/         # Business logic services
│   │   │   └── SahayakVoiceApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── application-test.properties
│   └── test/
│       └── java/com/sahayak/voice/
│           └── (test files)
└── pom.xml
```

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MongoDB 6.x+ (running locally or remote)

## Setup Instructions

### 1. Install MongoDB

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Windows:**
Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

### 2. Configure Application

Edit `src/main/resources/application.properties`:

```properties
# MongoDB connection string
spring.data.mongodb.uri=mongodb://localhost:27017/sahayak_voice

# JWT secret (change in production!)
jwt.secret=your-secret-key-change-this-in-production-min-256-bits-long
jwt.expiration=604800000

# Server port
server.port=8080
```

### 3. Build the Project

```bash
cd backend-springboot
mvn clean install
```

### 4. Run the Application

```bash
mvn spring-boot:run
```

The server will start on `http://localhost:8080`

### 5. Verify Installation

Check the health endpoint:
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{"status":"UP"}
```

## API Endpoints

### Authentication

- **POST** `/api/auth/login` - User login
  - Request: `{ "phoneNumber": "9876543210", "password": "password123" }`
  - Response: `{ "token": "jwt-token", "userId": "user-id", "name": "User Name" }`

### Visit Records

- **POST** `/api/visits/sync` - Sync visit record (requires JWT token)
  - Headers: `Authorization: Bearer <token>`
  - Request: Visit record JSON
  - Response: Saved visit record

- **GET** `/api/visits` - Get all visits for authenticated user
  - Headers: `Authorization: Bearer <token>`
  - Response: Array of visit records

## Running Tests

```bash
# Run all tests
mvn test

# Run tests with coverage
mvn test jacoco:report

# Run only unit tests
mvn test -Dtest=*Test

# Run only property-based tests
mvn test -Dtest=*PropertyTest
```

## Development

### Hot Reload

Spring Boot DevTools is included for automatic restart during development:

```bash
mvn spring-boot:run
```

Any changes to Java files will trigger an automatic restart.

### Database Management

**Seed test data:**

The project includes seed scripts to populate the database with test users and sample visit records.

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

**Manual seeding (using Maven):**
```bash
cd backend-springboot
mvn spring-boot:run -Dspring-boot.run.main-class=com.sahayak.voice.util.DatabaseSeeder
```

**Test credentials after seeding:**
- Phone: `9876543210` | Password: `test123` | Name: Priya Sharma
- Phone: `9876543211` | Password: `test123` | Name: Sunita Devi
- Phone: `9876543212` | Password: `test123` | Name: Radha Kumari

The seed script creates 3 test users and 5 sample visit records for the first user.

**View MongoDB data:**
```bash
mongosh
use sahayak_voice
db.users.find()
db.visits.find()
```

**Clear test data:**
```bash
mongosh
use sahayak_voice
db.users.deleteMany({})
db.visits.deleteMany({})
```

## Deployment

### Build for Production

```bash
mvn clean package -DskipTests
```

This creates a JAR file in `target/sahayak-voice-backend-1.0.0.jar`

### Run Production Build

```bash
java -jar target/sahayak-voice-backend-1.0.0.jar
```

### Environment Variables

Set these environment variables in production:

```bash
export SPRING_DATA_MONGODB_URI=mongodb://your-mongo-host:27017/sahayak_voice
export JWT_SECRET=your-production-secret-key-min-256-bits
export SERVER_PORT=8080
```

## Security Notes

⚠️ **Important**: Change the JWT secret in production!

The default JWT secret in `application.properties` is for development only. In production:

1. Generate a strong secret key (minimum 256 bits)
2. Store it securely (environment variable or secrets manager)
3. Never commit secrets to version control

## Troubleshooting

### MongoDB Connection Issues

**Error**: `MongoTimeoutException: Timed out after 30000 ms`

**Solution**: Ensure MongoDB is running:
```bash
# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod

# Start if not running
brew services start mongodb-community@6.0  # macOS
sudo systemctl start mongod                 # Linux
```

### Port Already in Use

**Error**: `Port 8080 is already in use`

**Solution**: Change the port in `application.properties`:
```properties
server.port=8081
```

Or kill the process using port 8080:
```bash
# Find process
lsof -i :8080

# Kill process
kill -9 <PID>
```

## Next Steps

This is Task 1 setup. Subsequent tasks will implement:

- Task 2: User authentication with JWT
- Task 3: Visit record persistence
- Task 4-20: Mobile app features and integration

## License

MIT License - See LICENSE file for details
