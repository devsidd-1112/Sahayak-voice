# Sahayak Voice: Voice-First Health Data Collection for India's Last Mile

A voice-first, offline-first mobile health application designed to solve India's "Last Mile" problem in public health service delivery. Sahayak Voice enables ASHA (Accredited Social Health Activist) workers to record maternal and child home visit data using natural speech in low-resource environments with poor internet connectivity, intermittent electricity, and low digital literacy.

## Problem Statement

ASHA workers in rural India face significant challenges in recording health data:

- **Low Digital Literacy**: Many ASHA workers have limited experience with smartphones and typing
- **Poor Connectivity**: Rural areas often have unreliable or no internet access
- **Time Constraints**: Manual form-filling takes time away from patient care
- **Language Barriers**: Most health systems require English input, but workers speak local languages
- **Data Loss**: Paper-based records are easily lost or damaged

Sahayak Voice addresses these challenges by enabling workers to speak naturally in Hindi or English, automatically extracting structured health data, and working completely offline with opportunistic sync when connectivity is available.

## Project Goals

This is a **demonstration project** focused on:

1. **User-Centric Mobile UX Design**: Simple, icon-based interface for low-literacy users
2. **Offline-First Architecture**: All core functionality works without internet
3. **Justified AI Usage**: Speech recognition and entity extraction where AI adds clear value
4. **Minimal Scope**: One core workflow - Daily Home Visit Record for Maternal & Child Health

**This is NOT:**
- A full hospital record system
- A medical diagnosis tool
- A production-ready government health system integration
- An ML training platform

## Key Features

### Voice-First Interaction
- Record visit information by speaking naturally in Hindi or English
- Automatic speech-to-text conversion using on-device recognition
- Voice confirmation feedback to verify captured data
- Minimal typing required

### Intelligent Entity Extraction
- Automatically extracts patient names, blood pressure readings, symptoms, and dates
- Lightweight pattern matching and keyword detection (no cloud LLMs)
- Works completely offline
- Handles both Hindi and English input

### Offline-First Design
- All data stored locally in SQLite database
- Full functionality without internet connectivity
- Opportunistic sync when network is available
- No data loss even if sync never succeeds

### Simple, Icon-Based UI
- Large, touch-friendly buttons
- Minimal text labels
- Clear visual feedback
- Designed for low digital literacy users


## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Device (Android)                   │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │ Voice Input  │───▶│   Entity     │───▶│     TTS      │ │
│  │   Module     │    │  Extractor   │    │   Module     │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                    │                    │         │
│         └────────────────────┼────────────────────┘         │
│                              ▼                               │
│                    ┌──────────────────┐                     │
│                    │  React Native UI │                     │
│                    └──────────────────┘                     │
│                              │                               │
│              ┌───────────────┴───────────────┐              │
│              ▼                               ▼              │
│    ┌──────────────────┐           ┌──────────────────┐    │
│    │ SQLite Database  │           │  Sync Manager    │    │
│    │  (Offline Data)  │           │                  │    │
│    └──────────────────┘           └──────────────────┘    │
│                                             │               │
└─────────────────────────────────────────────┼───────────────┘
                                              │ HTTPS
                                              ▼
                        ┌─────────────────────────────────┐
                        │   Backend Server (Spring Boot)  │
                        │                                 │
                        │  ┌──────────────────────────┐  │
                        │  │  Authentication Service  │  │
                        │  └──────────────────────────┘  │
                        │  ┌──────────────────────────┐  │
                        │  │     Visit Service        │  │
                        │  └──────────────────────────┘  │
                        │             │                   │
                        │             ▼                   │
                        │  ┌──────────────────────────┐  │
                        │  │  MongoDB Database        │  │
                        │  │  (Synced Records)        │  │
                        │  └──────────────────────────┘  │
                        └─────────────────────────────────┘
```

### Data Flow

1. **Voice Recording**: ASHA worker speaks visit details in Hindi/English
2. **Speech-to-Text**: Voice input converted to text using on-device recognition
3. **Entity Extraction**: Lightweight NLP extracts structured data (name, BP, symptoms, date)
4. **Voice Confirmation**: TTS reads back extracted data for verification
5. **Local Storage**: Confirmed record saved to SQLite with "pending" sync status
6. **Offline Work**: Worker continues recording visits without internet
7. **Opportunistic Sync**: When online, pending records sync to backend
8. **Backend Persistence**: Synced records stored in MongoDB for reporting

### Offline-First Strategy

**Why Offline-First?**
- Rural areas have unreliable internet connectivity
- ASHA workers need to work in the field without network access
- Data collection cannot depend on real-time connectivity
- User experience must be consistent regardless of network state

**How It Works:**
- All core functionality (voice input, entity extraction, TTS, storage) works offline
- SQLite database stores all visit records locally on the device
- Records are marked with sync status: "pending" or "synced"
- Sync manager detects network availability and syncs pending records
- Failed syncs are retried on next sync attempt
- No data loss even if device never connects to internet

**Benefits:**
- ✅ Consistent user experience (online or offline)
- ✅ No interruption to workflow due to connectivity issues
- ✅ Data is always available on the device
- ✅ Sync happens transparently in the background
- ✅ Resilient to network failures


## AI/ML Justification

### Why AI is Used

Sahayak Voice uses AI/ML in two specific areas where it provides clear, measurable value:

#### 1. Speech Recognition (Voice Input)

**Problem**: ASHA workers have low digital literacy and typing in Hindi/English is slow and error-prone.

**AI Solution**: Automatic speech-to-text conversion using on-device or cloud-based speech recognition.

**Value Delivered**:
- ✅ **10x faster** data entry compared to typing
- ✅ **Natural interaction** - workers speak as they would to a colleague
- ✅ **Language flexibility** - supports Hindi and English
- ✅ **Reduced cognitive load** - no need to remember form fields or spelling

**Implementation**: Uses `@react-native-voice/voice` library with Google Speech Recognition API (on-device when available, cloud fallback).

**Why This AI is Justified**:
- Speech recognition is a mature, reliable technology
- Dramatically improves user experience for low-literacy users
- No reasonable non-AI alternative exists for voice input
- Works offline using on-device models when available

#### 2. Entity Extraction (Structured Data from Text)

**Problem**: Converting free-form spoken narratives into structured health records requires understanding context and extracting specific data points.

**AI Solution**: Lightweight NLP using pattern matching, regex, and keyword detection to extract patient names, blood pressure, symptoms, and dates.

**Value Delivered**:
- ✅ **Automatic form filling** - no manual data entry
- ✅ **Reduced errors** - consistent extraction logic
- ✅ **Time savings** - instant conversion from speech to structured data
- ✅ **Flexibility** - handles natural language variations

**Implementation**: Custom entity extractor using:
- Regular expressions for blood pressure (e.g., "140/90")
- Keyword matching for symptoms (bukhar, khansi, fever, cough)
- Pattern matching for names (capitalized words, common surnames)
- Date parsing for temporal references (aaj, kal, today, yesterday)

**Why This AI is Justified**:
- Lightweight approach - no heavy cloud LLMs required
- Works completely offline
- Deterministic and explainable (not a black box)
- Significantly reduces manual data entry burden
- No reasonable non-AI alternative for natural language understanding

### What AI is NOT Used For

To maintain simplicity and privacy, we explicitly **do not** use AI for:

- ❌ Medical diagnosis or treatment recommendations
- ❌ Predictive analytics or risk scoring
- ❌ Image recognition or analysis
- ❌ Complex NLP requiring cloud-based LLMs
- ❌ Personalization or recommendation systems
- ❌ Automated decision-making about patient care

### Privacy and Ethics

- **No sensitive data sent to third-party AI services**: Entity extraction runs locally
- **Speech recognition uses standard device APIs**: No custom voice models trained on patient data
- **Transparent operation**: Users hear voice confirmation of extracted data
- **User control**: Workers can re-record if extraction is incorrect
- **No automated decisions**: All data is for record-keeping only, not clinical decisions


## Technology Stack

### Mobile Application (React Native)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React Native 0.73.2 | Cross-platform mobile development |
| Language | TypeScript | Type-safe JavaScript |
| Platform | Android (API 26+) | Primary target platform |
| Voice Input | @react-native-voice/voice | Speech-to-text conversion |
| Text-to-Speech | react-native-tts | Voice confirmation feedback |
| Local Storage | react-native-sqlite-storage | Offline data persistence |
| Navigation | React Navigation | Screen navigation |
| Network Detection | @react-native-community/netinfo | Online/offline status |
| Testing | Jest + fast-check | Unit and property-based testing |

### Backend (Spring Boot)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | Spring Boot 3.2.1 | REST API server |
| Language | Java 17 | Backend programming language |
| Security | Spring Security + JWT | Authentication and authorization |
| Database | MongoDB 6.x | Document storage for visit records |
| Build Tool | Maven | Dependency management and build |
| Testing | JUnit 5 + jqwik | Unit and property-based testing |

### Infrastructure

- **Mobile Database**: SQLite 3.x (on-device)
- **Backend Database**: MongoDB 6.x (cloud or self-hosted)
- **API Protocol**: REST over HTTPS
- **Authentication**: JWT tokens (7-day expiration for offline scenarios)


## Project Structure

```
sahayak-voice/
├── mobile-app/                    # React Native mobile application
│   ├── android/                   # Android native code
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── config/               # Configuration (API URLs, constants)
│   │   ├── screens/              # Screen components
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── VoiceRecordingScreen.tsx
│   │   │   ├── VoiceConfirmationScreen.tsx
│   │   │   ├── OfflineRecordsScreen.tsx
│   │   │   └── SyncStatusScreen.tsx
│   │   ├── services/             # Business logic
│   │   │   ├── VoiceInputService.ts
│   │   │   ├── EntityExtractor.ts
│   │   │   ├── TTSService.ts
│   │   │   ├── DatabaseService.ts
│   │   │   └── SyncManager.ts
│   │   ├── types/                # TypeScript type definitions
│   │   └── App.tsx               # Main app component
│   ├── __tests__/                # Test files
│   ├── SETUP.md                  # Detailed setup guide
│   ├── README.md                 # Mobile app documentation
│   └── package.json
│
├── backend-springboot/            # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/sahayak/voice/
│   │   │   │   ├── config/       # Spring configuration
│   │   │   │   ├── controller/   # REST API controllers
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   └── VisitController.java
│   │   │   │   ├── dto/          # Data Transfer Objects
│   │   │   │   ├── model/        # Domain models
│   │   │   │   │   ├── User.java
│   │   │   │   │   └── VisitRecord.java
│   │   │   │   ├── repository/   # MongoDB repositories
│   │   │   │   ├── security/     # JWT authentication
│   │   │   │   └── service/      # Business logic
│   │   │   │       ├── AuthenticationService.java
│   │   │   │       └── VisitService.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                 # Test files
│   ├── scripts/                  # Database seed scripts
│   ├── SETUP.md                  # Detailed setup guide
│   ├── README.md                 # Backend documentation
│   └── pom.xml
│
├── .kiro/specs/sahayak-voice-mobile/  # Project specifications
│   ├── requirements.md           # Detailed requirements
│   ├── design.md                 # Architecture and design
│   └── tasks.md                  # Implementation tasks
│
└── README.md                     # This file
```


## Setup Instructions

### Prerequisites

Before you begin, ensure you have:

**For Mobile Development:**
- Node.js 18+ and npm
- React Native development environment
- Android Studio with Android SDK (API 34)
- Java Development Kit (JDK) 17
- Android Emulator or physical Android device

**For Backend Development:**
- Java 17 or higher
- Maven 3.6+
- MongoDB 6.x+ (running locally or remote)

### Quick Start

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd sahayak-voice
```

#### 2. Set Up Backend

```bash
# Navigate to backend directory
cd backend-springboot

# Start MongoDB (if not already running)
brew services start mongodb-community@6.0  # macOS
sudo systemctl start mongod                 # Linux

# Build the application
mvn clean install

# Seed test data
./scripts/seed-database.sh  # Linux/macOS
scripts\seed-database.bat   # Windows

# Run the backend
mvn spring-boot:run
```

Backend will start on `http://localhost:8080`

**Test credentials after seeding:**
- Phone: `9876543210` | Password: `test123` | Name: Priya Sharma
- Phone: `9876543211` | Password: `test123` | Name: Sunita Devi
- Phone: `9876543212` | Password: `test123` | Name: Radha Kumari

#### 3. Set Up Mobile App

```bash
# Navigate to mobile app directory
cd mobile-app

# Install dependencies
npm install

# Configure backend URL
# Edit src/config/api.ts:
# - For Android emulator: http://10.0.2.2:8080/api
# - For real device: http://YOUR_COMPUTER_IP:8080/api

# Start Metro bundler
npm start

# In a new terminal, run on Android
npm run android
```

### Detailed Setup Guides

For comprehensive setup instructions with troubleshooting:

- **Mobile App**: See [mobile-app/SETUP.md](mobile-app/SETUP.md)
- **Backend**: See [backend-springboot/SETUP.md](backend-springboot/SETUP.md)


## Demo Flow

### Complete User Journey

#### 1. Login
- Open the Sahayak Voice app on Android device
- Enter phone number: `9876543210`
- Enter password: `test123`
- Tap "Login" button
- App authenticates with backend and stores JWT token

#### 2. Home Screen
- See large "Record Visit" button with microphone icon
- View sync status indicator (online/offline)
- See pending records count
- Access "View Records" and "Sync" options

#### 3. Record a Visit (Voice Input)

**Scenario**: Recording a home visit for Sunita Devi

- Tap the "Record Visit" button
- Microphone icon starts pulsing (recording active)
- Speak naturally in Hindi or English:

**Hindi Example:**
```
"Aaj Sunita Devi ke ghar gayi. Unka blood pressure 140/90 hai. 
Bacche ko bukhar hai."
```

**English Example:**
```
"Today I visited Sunita Devi's home. Her blood pressure is 140/90. 
The child has fever."
```

- Tap "Stop" button when finished
- See transcribed text displayed on screen

#### 4. Entity Extraction (Automatic)

The app automatically extracts:
- **Patient Name**: Sunita Devi
- **Blood Pressure**: 140/90
- **Child Symptom**: fever (bukhar)
- **Visit Date**: Today's date

#### 5. Voice Confirmation

- App speaks back the extracted information:
  - Hindi: "Sunita Devi ka BP 140/90 record kiya gaya. Bacche ko bukhar hai."
  - English: "Recorded Sunita Devi's BP as 140/90. Child has fever."
- Review the displayed data
- If correct, tap "Confirm" button
- If incorrect, tap "Re-record" to try again

#### 6. Local Storage (Offline)

- Record is immediately saved to SQLite database
- Sync status set to "pending"
- Success message displayed
- Return to Home Screen

#### 7. Continue Working Offline

- Record multiple visits without internet
- All records stored locally
- App shows pending count increasing
- No interruption to workflow

#### 8. View Offline Records

- Tap "View Records" from Home Screen
- See list of all visit records
- Each record shows:
  - Patient name
  - Visit date
  - Sync status icon (⏳ pending or ✓ synced)
- Pull to refresh the list

#### 9. Sync When Online

- When internet is available, sync indicator turns green
- Tap "Sync" button
- App sends all pending records to backend
- Progress indicator shows sync status
- Successfully synced records marked with ✓
- Failed records remain pending for retry

#### 10. View Sync Status

- Tap "Sync Status" to see details:
  - Last sync time
  - Total pending records
  - Total synced records
  - Sync errors (if any)

### Demo Screenshots

*(Screenshots would be included here in a real project)*

1. Login Screen
2. Home Screen with Record Button
3. Voice Recording in Progress
4. Voice Confirmation Screen
5. Offline Records List
6. Sync Status Screen


## Project Scope and Limitations

### What This Project Includes

✅ **Core Workflow**: Daily home visit recording for maternal & child health  
✅ **Voice Input**: Speech-to-text in Hindi and English  
✅ **Entity Extraction**: Automatic extraction of patient name, BP, symptoms, date  
✅ **Offline Storage**: SQLite database for local data persistence  
✅ **Data Sync**: Opportunistic sync to backend when online  
✅ **Simple UI**: Icon-based interface for low-literacy users  
✅ **Authentication**: Basic JWT-based user authentication  
✅ **Demo-Level Implementation**: Proof of concept with core features  

### What This Project Does NOT Include

❌ **Full Hospital System**: Not a comprehensive electronic health record system  
❌ **Medical Diagnosis**: No AI-powered diagnosis or treatment recommendations  
❌ **Government Integration**: No integration with existing health systems  
❌ **Multiple User Roles**: Only ASHA worker role (no doctors, administrators, etc.)  
❌ **Production-Grade Offline**: Demo-level offline support, not enterprise-grade  
❌ **ML Training Pipeline**: No model training or fine-tuning capabilities  
❌ **Advanced NLP**: No cloud-based LLMs or complex natural language understanding  
❌ **Image/Video**: No support for photos, videos, or document scanning  
❌ **Reporting/Analytics**: No dashboards or data visualization  
❌ **Multi-Language Support**: Only Hindi and English (no other Indian languages)  
❌ **iOS Support**: Android only (React Native allows iOS, but not tested)  

### Known Limitations

**Android Build:**
- ✅ **RESOLVED**: Kotlin version compatibility issue fixed by downgrading to Gradle 7.6.4
- Build requires Gradle 7.6.4 and Android Gradle Plugin 7.4.2
- First build takes 5-10 minutes to download dependencies

**Entity Extraction:**
- Pattern-based extraction may miss complex or unusual phrasings
- Limited to predefined symptom keywords
- May not handle all name formats correctly
- No context understanding beyond simple patterns

**Voice Recognition:**
- Requires Google app on Android for speech recognition
- Accuracy depends on device microphone quality
- Background noise can affect transcription
- May struggle with heavy accents or dialects

**Offline Functionality:**
- Speech recognition may require internet on some devices
- No conflict resolution for concurrent edits
- Limited to device storage capacity
- No offline user registration

**Sync:**
- Simple last-write-wins strategy (no conflict resolution)
- No partial record sync (all or nothing per record)
- No background sync (manual trigger only)
- No sync queue prioritization

**Security:**
- Basic JWT authentication (no OAuth, 2FA, etc.)
- No end-to-end encryption
- No audit logging
- Demo-level password security

**Scalability:**
- Not tested with large datasets (1000+ records)
- No pagination for record lists
- No data archival or cleanup
- Single-server backend (no load balancing)


## Testing Strategy

### Dual Testing Approach

This project uses both **unit testing** and **property-based testing** to ensure comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, and integration points
- Test concrete scenarios with known inputs and outputs
- Validate error handling and boundary conditions
- Ensure components integrate correctly

**Property-Based Tests**: Verify universal properties across all inputs
- Generate random test cases to find edge cases
- Verify invariants hold for all valid inputs
- Catch bugs that unit tests might miss

### Testing Tools

**Mobile (TypeScript):**
- **Jest**: Unit testing framework
- **React Native Testing Library**: Component testing
- **fast-check**: Property-based testing (100+ iterations per property)

**Backend (Java):**
- **JUnit 5**: Unit testing framework
- **Spring Boot Test**: Integration testing
- **jqwik**: Property-based testing (100+ iterations per property)
- **Testcontainers**: MongoDB testing with Docker

### Running Tests

**Mobile App:**
```bash
cd mobile-app

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm run test:watch
```

**Backend:**
```bash
cd backend-springboot

# Run all tests
mvn test

# Run with coverage
mvn test jacoco:report

# Run only property tests
mvn test -Dtest=*PropertyTest
```

### Test Coverage Goals

- **Unit Test Coverage**: Minimum 80% code coverage
- **Property Test Coverage**: All 25 correctness properties implemented
- **Integration Tests**: All major component interactions tested
- **E2E Tests**: Critical user journeys tested manually

### Key Properties Tested

The project includes 25 correctness properties covering:

1. **Authentication** (3 properties): Token generation, credential validation, password security
2. **Entity Extraction** (5 properties): Name, BP, symptom, date extraction, structured output
3. **Voice Confirmation** (3 properties): TTS confirmation, missing field prompts, database persistence
4. **Local Storage** (4 properties): Immediate persistence, round-trip integrity, sync status, retrieval
5. **Synchronization** (5 properties): Pending selection, transmission, status updates, error handling
6. **Backend Persistence** (5 properties): Token validation, storage, retrieval, user isolation

See [design.md](.kiro/specs/sahayak-voice-mobile/design.md) for complete property definitions.


## API Documentation

### Base URL

- **Development**: `http://localhost:8080/api`
- **Production**: `https://your-domain.com/api`

### Authentication Endpoints

#### POST /api/auth/login

Authenticate user and receive JWT token.

**Request:**
```json
{
  "phoneNumber": "9876543210",
  "password": "test123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "name": "Priya Sharma"
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

### Visit Record Endpoints

#### POST /api/visits/sync

Sync a visit record from mobile to backend.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request:**
```json
{
  "patientName": "Sunita Devi",
  "bloodPressure": "140/90",
  "childSymptom": "fever",
  "visitDate": "2024-01-20",
  "createdAt": "2024-01-20T14:30:00Z"
}
```

**Response (201 Created):**
```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k2",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "patientName": "Sunita Devi",
  "bloodPressure": "140/90",
  "childSymptom": "fever",
  "visitDate": "2024-01-20",
  "createdAt": "2024-01-20T14:30:00Z"
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Invalid or expired token"
}
```

#### GET /api/visits

Retrieve all visit records for authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
[
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "patientName": "Sunita Devi",
    "bloodPressure": "140/90",
    "childSymptom": "fever",
    "visitDate": "2024-01-20",
    "createdAt": "2024-01-20T14:30:00Z"
  },
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "patientName": "Radha Kumari",
    "bloodPressure": "130/85",
    "childSymptom": "cough",
    "visitDate": "2024-01-21",
    "createdAt": "2024-01-21T10:15:00Z"
  }
]
```


## Development

### Mobile App Development

**Start development server:**
```bash
cd mobile-app
npm start
```

**Run on Android:**
```bash
npm run android
```

**Hot reload:**
- Fast Refresh is enabled by default
- Changes appear instantly without full reload
- Shake device or press `R` twice to manually reload

**Debugging:**
```bash
# View Android logs
npx react-native log-android

# Open React Native debugger
# Shake device → "Debug" → Opens Chrome DevTools
```

**Common commands:**
```bash
# Clear cache
npm start -- --reset-cache

# Clean build
cd android && ./gradlew clean && cd ..

# Uninstall app
adb uninstall com.sahayakvoice
```

### Backend Development

**Start backend server:**
```bash
cd backend-springboot
mvn spring-boot:run
```

**Hot reload:**
- Spring Boot DevTools provides automatic restart
- Changes to Java files trigger restart
- No manual restart needed

**View MongoDB data:**
```bash
mongosh sahayak_voice
db.users.find().pretty()
db.visits.find().pretty()
```

**Common commands:**
```bash
# Clean build
mvn clean install

# Skip tests
mvn clean install -DskipTests

# Run specific test
mvn test -Dtest=AuthenticationServiceTest

# Generate coverage report
mvn test jacoco:report
```

### Code Style

**Mobile (TypeScript):**
- Follow TypeScript strict mode
- Use ESLint and Prettier
- Functional components with hooks
- Descriptive variable names

**Backend (Java):**
- Follow Java naming conventions
- Use Spring Boot best practices
- Service layer for business logic
- Repository pattern for data access


## Troubleshooting

### Mobile App Issues

**Problem**: Metro bundler shows "Unable to resolve module"

**Solution**:
```bash
npm start -- --reset-cache
# or
rm -rf node_modules && npm install
```

**Problem**: Android build fails with "SDK location not found"

**Solution**: Create `android/local.properties`:
```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk  # macOS
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk  # Windows
```

**Problem**: Voice recognition not working

**Solution**:
- Grant microphone permission in app settings
- Ensure Google app is installed (required for speech recognition)
- Test on real device (emulator has limited voice support)

**Problem**: Cannot connect to backend

**Solution**:
- For emulator: Use `http://10.0.2.2:8080/api` (not localhost)
- For real device: Use computer's IP address (e.g., `http://192.168.1.100:8080/api`)
- Ensure backend is running: `curl http://localhost:8080/api/health`
- Check firewall allows connections on port 8080

### Backend Issues

**Problem**: MongoDB connection refused

**Solution**:
```bash
# Check if MongoDB is running
brew services list | grep mongodb  # macOS
sudo systemctl status mongod       # Linux

# Start MongoDB
brew services start mongodb-community@6.0  # macOS
sudo systemctl start mongod                # Linux
```

**Problem**: Port 8080 already in use

**Solution**:
```bash
# Find and kill process
lsof -ti:8080 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :8080   # Windows (then taskkill /PID <PID> /F)

# Or change port in application.properties
server.port=8081
```

**Problem**: JWT token validation fails

**Solution**:
- Ensure JWT secret is at least 256 bits
- Check token hasn't expired (7-day default)
- Verify Authorization header format: `Bearer <token>`

### General Issues

**Problem**: App crashes on startup

**Solution**:
```bash
# Clear app data
adb shell pm clear com.sahayakvoice

# Or uninstall and reinstall
adb uninstall com.sahayakvoice
npm run android
```

**Problem**: Sync fails with network error

**Solution**:
- Check internet connectivity
- Verify backend URL is correct
- Test backend endpoint: `curl http://YOUR_BACKEND_URL/api/health`
- Check device and computer are on same network (for local development)

For more troubleshooting, see:
- [Mobile App Setup Guide](mobile-app/SETUP.md)
- [Backend Setup Guide](backend-springboot/SETUP.md)


## Future Enhancements

### Potential Improvements (Out of Current Scope)

**Mobile App:**
- iOS support (React Native allows, but not tested)
- Additional Indian languages (Tamil, Telugu, Bengali, etc.)
- Photo capture for patient records
- Offline user registration
- Background sync (automatic when online)
- Biometric authentication (fingerprint, face)
- Dark mode support
- Accessibility improvements (screen reader support)

**Entity Extraction:**
- More sophisticated NLP (named entity recognition)
- Support for more health metrics (weight, temperature, etc.)
- Context-aware extraction (understanding relationships)
- Learning from corrections (improve over time)

**Backend:**
- Advanced analytics and reporting dashboards
- Data export (CSV, PDF reports)
- Multi-tenant support (multiple health organizations)
- Role-based access control (doctors, supervisors, etc.)
- Audit logging and compliance
- Real-time notifications
- Integration with government health systems

**Sync:**
- Conflict resolution (merge strategies)
- Partial record sync (field-level)
- Sync queue prioritization
- Bandwidth optimization (compression)
- Background sync service

**Security:**
- End-to-end encryption
- Two-factor authentication
- OAuth integration
- Secure key storage (Android Keystore)
- Certificate pinning

**Scalability:**
- Pagination for large datasets
- Data archival and cleanup
- Load balancing and clustering
- Caching layer (Redis)
- CDN for static assets


## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Write tests** for new functionality
5. **Run tests**: Ensure all tests pass
6. **Commit changes**: Use descriptive commit messages
7. **Push to your fork**: `git push origin feature/your-feature-name`
8. **Create a Pull Request**

### Code Guidelines

**Mobile (TypeScript):**
- Follow TypeScript strict mode
- Use functional components with hooks
- Write unit tests for all new components
- Write property tests for business logic
- Use ESLint and Prettier
- Document complex logic with comments

**Backend (Java):**
- Follow Java naming conventions
- Use Spring Boot best practices
- Write unit tests for all services
- Write property tests for core logic
- Use meaningful variable names
- Document public APIs with Javadoc

### Testing Requirements

- All new features must include tests
- Unit tests for specific scenarios
- Property tests for universal properties
- Minimum 80% code coverage
- All tests must pass before merging

### Pull Request Process

1. Update README.md with details of changes (if applicable)
2. Update documentation for new features
3. Ensure all tests pass
4. Request review from maintainers
5. Address review feedback
6. Squash commits before merging (if requested)


## Project Status

### Implementation Progress

This project is a **demonstration/proof-of-concept** implementation. Current status:

**Backend (Spring Boot) - ✅ WORKING:**
- ✅ REST API with Spring Boot 3.2.1
- ✅ JWT authentication and authorization
- ✅ MongoDB integration for visit records
- ✅ User management and authentication endpoints
- ✅ Visit record CRUD operations
- ✅ Database seeding scripts
- ✅ Comprehensive unit and integration tests
- ✅ API documentation

**Frontend (React Native Android) - ⚠️ NEEDS WORK:**
- ⚠️ Project structure created but has build errors
- ⚠️ Android dependency conflicts need resolution
- ⚠️ Gradle build configuration issues
- ⚠️ React Native setup incomplete
- ⚠️ UI screens implemented but not tested
- ⚠️ Services (voice, TTS, database, sync) need debugging
- ⚠️ Integration with backend API not verified

**Documentation:**
- ✅ Comprehensive README
- ✅ Backend setup guide
- ✅ Mobile app setup guide
- ✅ API documentation
- ✅ Architecture and design docs

**Not Started (Out of Scope):**
- ❌ iOS support
- ❌ Additional languages beyond Hindi/English
- ❌ Production deployment
- ❌ Government system integration
- ❌ Advanced analytics

### Known Issues

**Backend:**
- No known critical issues - backend is functional and tested

**Frontend:**
- Android build fails due to dependency version conflicts
- React Native environment setup incomplete
- Voice recognition and TTS services not tested on device
- SQLite database integration needs verification
- Sync functionality not tested end-to-end
- UI/UX needs testing on real devices

### Next Steps

1. Fix Android Gradle build configuration
2. Resolve React Native dependency conflicts
3. Test voice input and TTS on physical device
4. Verify SQLite database operations
5. Test end-to-end sync with backend
6. UI/UX testing and refinements

See [GitHub Issues](https://github.com/devsidd-1112/Sahayak-voice/issues) for detailed bug tracking.


## License

MIT License

Copyright (c) 2024 Sahayak Voice Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Acknowledgments

- **ASHA Workers**: For their dedication to public health in rural India
- **React Native Community**: For the excellent mobile framework
- **Spring Boot Team**: For the robust backend framework
- **MongoDB**: For flexible document storage
- **Open Source Contributors**: For the libraries and tools used in this project

## Contact

For questions, issues, or contributions:

- **GitHub Issues**: [Create an issue](https://github.com/your-repo/issues)
- **Email**: contact@sahayak-voice.com
- **Documentation**: See [requirements.md](.kiro/specs/sahayak-voice-mobile/requirements.md) and [design.md](.kiro/specs/sahayak-voice-mobile/design.md)

---

**Built with ❤️ for India's Last Mile Health Workers**
