# Implementation Plan: Sahayak-Voice Mobile

## Overview

This implementation plan breaks down the Sahayak-Voice Mobile project into discrete, incremental coding tasks. The project consists of two main components: a React Native mobile application (TypeScript) and a Spring Boot backend (Java). The implementation follows an offline-first, voice-first approach, building core functionality first, then adding voice features, and finally implementing synchronization.

The plan prioritizes getting a working end-to-end flow early, with each task building on previous work. Testing tasks are marked as optional (*) to allow for faster MVP development while maintaining the option for comprehensive test coverage.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create React Native project with TypeScript configuration
  - Create Spring Boot project with Maven/Gradle
  - Set up MongoDB connection configuration
  - Configure SQLite for React Native
  - Install required libraries: react-native-voice, react-native-tts, @react-native-community/netinfo, react-native-sqlite-storage
  - Set up Spring Boot dependencies: Spring Web, Spring Security, Spring Data MongoDB, JWT library
  - Create basic folder structure for both projects
  - _Requirements: 9.1, 9.2, 9.3, 9.5, 9.6, 9.7_

- [x] 2. Implement backend authentication system
  - [x] 2.1 Create User model and MongoDB repository
    - Define User entity with fields: id, name, phoneNumber, hashedPassword, createdAt
    - Create UserRepository interface extending MongoRepository
    - Add indexes for phoneNumber field
    - _Requirements: 1.3_
  
  - [x] 2.2 Implement AuthenticationService
    - Create login method with credential validation
    - Implement password hashing using BCrypt
    - Implement JWT token generation with 7-day expiration
    - Implement token validation method
    - Create method to extract userId from token
    - _Requirements: 1.1, 1.3, 1.4_
  
  - [ ]* 2.3 Write property tests for authentication
    - **Property 1: Successful authentication provides access token**
    - **Validates: Requirements 1.1, 1.4, 1.5**
    - **Property 2: Invalid credentials are rejected**
    - **Validates: Requirements 1.2**
    - **Property 3: Password storage security**
    - **Validates: Requirements 1.3**
  
  - [x] 2.4 Create AuthController REST endpoint
    - Implement POST /api/auth/login endpoint
    - Handle LoginRequest and return AuthResponse
    - Add error handling for invalid credentials
    - _Requirements: 1.1, 1.2_
  
  - [ ]* 2.5 Write unit tests for AuthController
    - Test successful login flow
    - Test invalid credentials error handling
    - Test malformed request handling

- [x] 3. Implement backend visit data persistence
  - [x] 3.1 Create VisitRecord model and MongoDB repository
    - Define VisitRecord entity with fields: id, userId, patientName, bloodPressure, childSymptom, visitDate, createdAt
    - Create VisitRepository interface extending MongoRepository
    - Add indexes for userId and createdAt fields
    - _Requirements: 7.2, 7.3_
  
  - [x] 3.2 Implement VisitService
    - Create saveVisit method to store visit records
    - Create getVisitsByUser method to retrieve user's visits
    - Create getVisitById method for single visit retrieval
    - Add validation for required fields
    - _Requirements: 7.2, 7.5_
  
  - [ ]* 3.3 Write property tests for visit persistence
    - **Property 22: Valid record persistence**
    - **Validates: Requirements 7.2**
    - **Property 23: MongoDB storage round-trip**
    - **Validates: Requirements 7.3**
    - **Property 25: User-specific visit retrieval**
    - **Validates: Requirements 7.5**
  
  - [x] 3.4 Create VisitController REST endpoints
    - Implement POST /api/visits/sync endpoint with JWT authentication
    - Implement GET /api/visits endpoint with JWT authentication
    - Add authentication token validation middleware
    - Return appropriate HTTP status codes
    - _Requirements: 7.1, 7.4, 7.5_
  
  - [ ]* 3.5 Write unit tests for VisitController
    - Test sync endpoint with valid token
    - Test sync endpoint with invalid token
    - Test visit retrieval endpoint
    - Test authentication middleware

- [x] 4. Checkpoint - Backend API complete
  - Ensure all backend tests pass
  - Manually test authentication and visit sync endpoints using Postman or curl
  - Verify MongoDB connection and data persistence
  - Ask the user if questions arise

- [x] 5. Implement mobile app local database
  - [x] 5.1 Create SQLite database schema and initialization
    - Define visits table schema with all required fields
    - Define user_session table schema
    - Create database initialization function
    - Create indexes for sync_status, user_id, and visit_date
    - _Requirements: 5.1, 5.2_
  
  - [x] 5.2 Implement LocalDatabase interface
    - Create saveVisit method to insert visit records
    - Create getPendingVisits method to query records with sync_status='pending'
    - Create getAllVisits method to retrieve all records
    - Create updateSyncStatus method to update sync status
    - Create deleteVisit method for record deletion
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [ ]* 5.3 Write property tests for local database
    - **Property 12: Immediate persistence**
    - **Validates: Requirements 5.1**
    - **Property 13: Local storage round-trip**
    - **Validates: Requirements 5.2**
    - **Property 14: Initial sync status**
    - **Validates: Requirements 5.3**
    - **Property 15: Complete record retrieval**
    - **Validates: Requirements 5.5**
  
  - [ ]* 5.4 Write unit tests for database operations
    - Test CRUD operations
    - Test query filtering by sync status
    - Test database initialization
    - Test error handling for database failures

- [x] 6. Implement entity extraction module
  - [x] 6.1 Create EntityExtractor class with pattern matching logic
    - Define regex patterns for patient names (Hindi and English)
    - Define regex patterns for blood pressure readings
    - Define keyword lists for child symptoms (Hindi and English)
    - Define date parsing logic for "aaj", "kal", "today", "yesterday"
    - Implement extractEntities method that returns VisitRecord
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ]* 6.2 Write property tests for entity extraction
    - **Property 4: Patient name extraction**
    - **Validates: Requirements 3.1**
    - **Property 5: Blood pressure extraction**
    - **Validates: Requirements 3.2**
    - **Property 6: Child symptom extraction**
    - **Validates: Requirements 3.3**
    - **Property 7: Visit date extraction**
    - **Validates: Requirements 3.4**
    - **Property 8: Structured output generation**
    - **Validates: Requirements 3.6**
  
  - [ ]* 6.3 Write unit tests for entity extraction
    - Test specific Hindi extraction examples
    - Test specific English extraction examples
    - Test edge cases (no entities found, multiple entities)
    - Test malformed input handling
    - Test each regex pattern independently

- [x] 7. Implement TTS confirmation module
  - [x] 7.1 Create TTSModule class with confirmation generation
    - Implement speakConfirmation method using react-native-tts
    - Create confirmation text templates for Hindi and English
    - Implement speakPrompt method for missing fields
    - Create missing field prompt templates
    - Implement stop method to cancel TTS
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 7.2 Write property tests for TTS module
    - **Property 9: TTS confirmation includes all extracted fields**
    - **Validates: Requirements 4.2**
    - **Property 10: Missing field prompts**
    - **Validates: Requirements 4.3**
  
  - [ ]* 7.3 Write unit tests for TTS module
    - Test confirmation text generation with complete data
    - Test confirmation text generation with partial data
    - Test missing field prompt generation
    - Test language switching
    - Mock react-native-tts library

- [x] 8. Implement voice input module
  - [x] 8.1 Create VoiceInputModule class with recording functionality
    - Implement startRecording method using react-native-voice
    - Implement stopRecording method that returns transcribed text
    - Implement cancelRecording method
    - Configure for Hindi ('hi-IN') and English ('en-IN') locales
    - Handle microphone permissions
    - Add recording state management
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 8.2 Write unit tests for voice input module
    - Test recording state transitions
    - Test permission handling
    - Test error scenarios (no microphone, permission denied)
    - Mock react-native-voice library

- [x] 9. Implement mobile authentication UI and logic
  - [x] 9.1 Create Login Screen component
    - Create UI with phone number and password input fields
    - Create login button
    - Add error message display area
    - Implement form validation
    - _Requirements: 1.1, 1.2, 8.1_
  
  - [x] 9.2 Implement authentication API client
    - Create API service for POST /api/auth/login
    - Handle network requests and responses
    - Store authentication token in AsyncStorage
    - Handle authentication errors
    - _Requirements: 1.1, 1.4, 1.5_
  
  - [ ]* 9.3 Write property tests for mobile authentication
    - **Property 1: Successful authentication provides access token**
    - **Validates: Requirements 1.1, 1.4, 1.5**
  
  - [ ]* 9.4 Write unit tests for Login Screen
    - Test form validation
    - Test successful login navigation
    - Test error message display
    - Test input field interactions

- [x] 10. Implement Home Screen and navigation
  - [x] 10.1 Create Home Screen component
    - Create large circular "Record Visit" button with microphone icon
    - Add sync status indicator (online/offline, pending count)
    - Add navigation button to "View Records" screen
    - Add logout button
    - _Requirements: 8.2_
  
  - [x] 10.2 Set up React Navigation
    - Configure navigation stack
    - Define routes for all screens
    - Implement authentication flow (login → home)
    - Add navigation guards for authenticated routes
    - _Requirements: 8.2, 8.3_
  
  - [ ]* 10.3 Write unit tests for Home Screen
    - Test button rendering
    - Test navigation to recording screen
    - Test sync status display
    - Test logout functionality

- [x] 11. Implement Voice Recording Screen
  - [x] 11.1 Create Voice Recording Screen component
    - Create animated microphone icon (pulsing during recording)
    - Add "Recording..." text indicator
    - Add stop button
    - Add cancel button
    - Display transcribed text after recording stops
    - Integrate VoiceInputModule
    - _Requirements: 2.1, 2.2, 2.3, 8.3_
  
  - [x] 11.2 Connect recording to entity extraction
    - Pass transcribed text to EntityExtractor
    - Navigate to confirmation screen with extracted data
    - Handle extraction errors
    - _Requirements: 2.3, 3.6_
  
  - [ ]* 11.3 Write unit tests for Voice Recording Screen
    - Test recording state UI updates
    - Test stop button functionality
    - Test cancel button functionality
    - Test navigation to confirmation screen

- [x] 12. Implement Voice Confirmation Screen
  - [x] 12.1 Create Voice Confirmation Screen component
    - Display extracted patient name
    - Display extracted blood pressure
    - Display extracted child symptom
    - Display visit date
    - Add play confirmation button (triggers TTS)
    - Add confirm button (saves record)
    - Add re-record button (goes back)
    - _Requirements: 4.1, 4.4, 4.5, 8.4_
  
  - [x] 12.2 Integrate TTS playback
    - Connect play button to TTSModule.speakConfirmation
    - Handle missing fields with TTSModule.speakPrompt
    - Add visual feedback during TTS playback
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 12.3 Implement save functionality
    - On confirm, save VisitRecord to LocalDatabase
    - Set syncStatus to 'pending'
    - Navigate back to Home Screen
    - Show success message
    - _Requirements: 4.4, 5.1, 5.3_
  
  - [ ]* 12.4 Write property tests for confirmation flow
    - **Property 11: Confirmation saves to local database**
    - **Validates: Requirements 4.4**
  
  - [ ]* 12.5 Write unit tests for Voice Confirmation Screen
    - Test data display
    - Test TTS playback trigger
    - Test confirm button saves to database
    - Test re-record navigation

- [x] 13. Checkpoint - Core offline flow complete
  - Ensure all tests pass
  - Manually test complete flow: login → record → extract → confirm → save
  - Verify data is stored in SQLite
  - Test offline functionality (airplane mode)
  - Ask the user if questions arise

- [x] 14. Implement Offline Records List Screen
  - [x] 14.1 Create Offline Records List Screen component
    - Display list of all visit records from LocalDatabase
    - Show patient name, visit date, and sync status icon for each record
    - Implement pull-to-refresh functionality
    - Add manual sync button (enabled when online)
    - Add empty state message when no records exist
    - _Requirements: 5.5, 6.6, 8.5_
  
  - [ ]* 14.2 Write property tests for records list
    - **Property 15: Complete record retrieval**
    - **Validates: Requirements 5.5**
    - **Property 20: Sync status visibility**
    - **Validates: Requirements 6.6**
  
  - [ ]* 14.3 Write unit tests for Offline Records List Screen
    - Test record list rendering
    - Test empty state display
    - Test pull-to-refresh
    - Test sync button state (enabled/disabled)

- [x] 15. Implement Sync Manager
  - [x] 15.1 Create SyncManager class with connectivity detection
    - Implement checkConnectivity method using @react-native-community/netinfo
    - Implement getSyncStatus method
    - Track last sync time
    - Track pending record count
    - _Requirements: 6.1_
  
  - [x] 15.2 Implement sync logic
    - Implement syncPendingRecords method
    - Get all pending records from LocalDatabase
    - Send each record to POST /api/visits/sync with authentication token
    - Update local sync_status to 'synced' on success
    - Keep sync_status as 'pending' on failure
    - Return SyncResult with success/failure counts
    - _Requirements: 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 15.3 Write property tests for sync manager
    - **Property 16: Pending records selection**
    - **Validates: Requirements 6.2**
    - **Property 17: Sync transmission**
    - **Validates: Requirements 6.3**
    - **Property 18: Successful sync status update**
    - **Validates: Requirements 6.4**
    - **Property 19: Failed sync status preservation**
    - **Validates: Requirements 6.5**
  
  - [ ]* 15.4 Write unit tests for sync manager
    - Test connectivity detection
    - Test batch sync logic
    - Test retry mechanism
    - Test status updates
    - Mock network requests

- [x] 16. Implement Sync Status Screen
  - [x] 16.1 Create Sync Status Screen component
    - Display last sync time
    - Display pending records count
    - Display synced records count
    - Add sync progress indicator
    - Add manual sync trigger button
    - Show sync errors if any
    - _Requirements: 8.6_
  
  - [x] 16.2 Integrate SyncManager with UI
    - Connect sync button to SyncManager.syncPendingRecords
    - Update UI with sync progress
    - Display sync results (success/failure counts)
    - Handle sync errors gracefully
    - _Requirements: 6.1, 6.5_
  
  - [ ]* 16.3 Write unit tests for Sync Status Screen
    - Test sync status display
    - Test sync button trigger
    - Test progress indicator updates
    - Test error message display

- [x] 17. Implement backend authentication validation for sync endpoint
  - [x] 17.1 Add JWT authentication middleware
    - Create JWT filter to validate tokens on protected endpoints
    - Extract userId from token and add to request context
    - Return 401 for invalid/expired tokens
    - _Requirements: 7.1_
  
  - [ ]* 17.2 Write property tests for token validation
    - **Property 21: Authentication token validation**
    - **Validates: Requirements 7.1**
  
  - [ ]* 17.3 Write unit tests for authentication middleware
    - Test valid token acceptance
    - Test invalid token rejection
    - Test expired token rejection
    - Test missing token rejection

- [x] 18. Wire all components together and polish UI
  - [x] 18.1 Connect all screens with navigation
    - Ensure smooth navigation flow between all screens
    - Add back button handling
    - Add navigation guards for authentication
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [x] 18.2 Implement icon-based UI elements
    - Add icons for all buttons (microphone, sync, logout, etc.)
    - Use large, touch-friendly button sizes
    - Minimize text labels, use icons where possible
    - _Requirements: 8.7, 8.8_
  
  - [x] 18.3 Add error handling and user feedback
    - Implement error boundaries for React components
    - Add loading indicators for async operations
    - Add success/error toast messages
    - Implement graceful error recovery
    - _Requirements: Error Handling section_
  
  - [ ]* 18.4 Write integration tests
    - Test complete voice recording → extraction → confirmation → storage flow
    - Test sync flow with mocked backend
    - Test offline → online transition
    - Test authentication → home screen flow

- [x] 19. Create seed data and setup scripts
  - [x] 19.1 Create backend seed data script
    - Create script to seed test users in MongoDB
    - Create script to seed sample visit records
    - Add instructions for running seed scripts
    - _Requirements: 1.1_
  
  - [x] 19.2 Create mobile app setup documentation
    - Document Android Studio setup steps
    - Document how to run the app on emulator
    - Document how to run the app on real device
    - Document environment configuration (backend URL)
    - _Requirements: 9.2_

- [x] 20. Final checkpoint and documentation
  - [x] 20.1 Create comprehensive README
    - Document problem statement and project goals
    - Document architecture design with diagrams
    - Document offline-first strategy
    - Document AI justification (speech recognition + entity extraction)
    - Document project limitations and scope
    - Add setup instructions for both mobile and backend
    - Add demo flow instructions
    - _Requirements: All requirements_
  
  - [x] 20.2 Final testing and verification
    - Run all unit tests and property tests
    - Perform manual end-to-end testing
    - Test on Android emulator
    - Test offline functionality thoroughly
    - Test sync functionality with real backend
    - Verify all requirements are met
  
  - [x] 20.3 Final checkpoint
    - Ensure all tests pass
    - Verify complete demo flow works
    - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP development
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across randomized inputs
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation prioritizes offline-first functionality, building the complete offline flow before adding sync capabilities
- Backend is built first to provide API endpoints for mobile development
- Mobile app is built incrementally: database → extraction → TTS → voice → UI → sync
- All core functionality works offline; sync is opportunistic and non-blocking

