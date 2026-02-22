# Requirements Document

## Introduction

Sahayak-Voice Mobile is a voice-first, offline-first mobile application designed to address India's "Last Mile" problem in public health service delivery. The system enables ASHA (Accredited Social Health Activist) workers to record maternal and child home visit data using natural speech in low-resource environments with poor internet connectivity, intermittent electricity, and low digital literacy. The application automatically converts spoken narratives into structured health records, works offline by default, and syncs data only when internet is available.

This is a mini project focused on demonstrating user-centric mobile UX design, offline-first architecture, and justified use of AI for speech recognition and entity extraction, strictly limited to one core workflow: Daily Home Visit Record for Maternal & Child Health.

## Glossary

- **ASHA_Worker**: Accredited Social Health Activist, a frontline community health worker in India
- **Mobile_App**: React Native mobile application running on Android devices
- **Backend_System**: Spring Boot REST API server handling authentication and data persistence
- **Voice_Input_Module**: Component that captures and converts speech to text using react-native-voice
- **Entity_Extractor**: Lightweight NLP component that extracts structured data from transcribed text
- **TTS_Module**: Text-to-Speech module that provides voice confirmation feedback
- **Local_Database**: SQLite database storing visit records on the mobile device
- **Sync_Manager**: Component managing data synchronization between mobile and backend
- **Visit_Record**: Structured health record containing patient information and visit details
- **MongoDB_Database**: NoSQL database storing synced visit records on the backend
- **Offline_Mode**: Application state where no internet connectivity is available
- **Sync_Status**: Flag indicating whether a visit record has been synchronized with the backend

## Requirements

### Requirement 1: User Authentication

**User Story:** As an ASHA worker, I want to securely log into the mobile application, so that my visit records are associated with my identity.

#### Acceptance Criteria

1. WHEN an ASHA worker enters valid credentials and submits the login form, THE Mobile_App SHALL authenticate with the Backend_System and grant access
2. WHEN an ASHA worker enters invalid credentials, THE Mobile_App SHALL display an error message and prevent access
3. THE Backend_System SHALL store user credentials securely using password hashing
4. WHEN authentication succeeds, THE Backend_System SHALL return an authentication token to the Mobile_App
5. THE Mobile_App SHALL store the authentication token locally for subsequent API requests

### Requirement 2: Voice Input Capture

**User Story:** As an ASHA worker, I want to record home visit information by speaking naturally in Hindi or English, so that I can capture data without typing.

#### Acceptance Criteria

1. WHEN an ASHA worker presses the voice recording button, THE Voice_Input_Module SHALL begin capturing audio input
2. WHEN an ASHA worker speaks during recording, THE Voice_Input_Module SHALL convert speech to text in real-time or near real-time
3. WHEN the recording is complete, THE Voice_Input_Module SHALL provide the transcribed text to the Entity_Extractor
4. THE Voice_Input_Module SHALL support both Hindi and English language input
5. WHILE in Offline_Mode, THE Voice_Input_Module SHALL continue to function using on-device speech recognition capabilities

### Requirement 3: Entity Extraction from Spoken Input

**User Story:** As an ASHA worker, I want the system to automatically extract patient information from my spoken narrative, so that I don't have to manually fill forms.

#### Acceptance Criteria

1. WHEN transcribed text is received, THE Entity_Extractor SHALL identify and extract patient name from the text
2. WHEN transcribed text is received, THE Entity_Extractor SHALL identify and extract blood pressure readings in the format "X/Y"
3. WHEN transcribed text is received, THE Entity_Extractor SHALL identify and extract child symptoms mentioned in the narrative
4. WHEN transcribed text is received, THE Entity_Extractor SHALL identify and extract visit date references (e.g., "today", "aaj")
5. THE Entity_Extractor SHALL use lightweight pattern matching, regex, and keyword-based logic without requiring cloud-based LLM APIs
6. WHEN entity extraction is complete, THE Entity_Extractor SHALL create a structured Visit_Record with extracted fields

### Requirement 4: Voice Confirmation Feedback

**User Story:** As an ASHA worker, I want to hear a voice confirmation of the recorded information, so that I can verify the data was captured correctly before saving.

#### Acceptance Criteria

1. WHEN a Visit_Record is created, THE TTS_Module SHALL generate a spoken summary of the extracted information
2. THE TTS_Module SHALL speak the patient name, blood pressure, and child symptoms in the language of input
3. WHEN required fields are missing from the Visit_Record, THE TTS_Module SHALL prompt the ASHA worker with specific questions
4. WHEN the ASHA worker confirms the information is correct, THE Mobile_App SHALL save the Visit_Record to the Local_Database
5. WHEN the ASHA worker indicates the information is incorrect, THE Mobile_App SHALL allow re-recording

### Requirement 5: Offline Data Storage

**User Story:** As an ASHA worker, I want all visit records to be saved locally on my device, so that I can continue working without internet connectivity.

#### Acceptance Criteria

1. WHEN a Visit_Record is confirmed, THE Mobile_App SHALL store it in the Local_Database immediately
2. THE Local_Database SHALL persist all Visit_Record fields including patientName, bloodPressure, childSymptom, visitDate, and createdAt timestamp
3. WHEN a Visit_Record is stored, THE Mobile_App SHALL set its Sync_Status to "pending"
4. THE Mobile_App SHALL function fully in Offline_Mode without requiring internet connectivity
5. WHEN the ASHA worker views the offline records list, THE Mobile_App SHALL display all Visit_Records from the Local_Database

### Requirement 6: Data Synchronization

**User Story:** As an ASHA worker, I want to sync my locally stored visit records to the backend when internet is available, so that the data is backed up and accessible to the health system.

#### Acceptance Criteria

1. WHEN internet connectivity is detected, THE Sync_Manager SHALL enable the manual sync button
2. WHEN the ASHA worker triggers sync, THE Sync_Manager SHALL retrieve all Visit_Records with Sync_Status "pending" from the Local_Database
3. WHEN syncing records, THE Sync_Manager SHALL send each Visit_Record to the Backend_System via POST /api/visits/sync endpoint
4. WHEN the Backend_System confirms successful storage, THE Sync_Manager SHALL update the Visit_Record Sync_Status to "synced"
5. WHEN sync fails for a record, THE Sync_Manager SHALL maintain its Sync_Status as "pending" and display an error message
6. THE Mobile_App SHALL display sync status for each Visit_Record in the offline records list

### Requirement 7: Backend Data Persistence

**User Story:** As a health system administrator, I want synced visit records to be stored in a central database, so that the data is preserved and can be accessed for reporting.

#### Acceptance Criteria

1. WHEN the Backend_System receives a Visit_Record via POST /api/visits/sync, THE Backend_System SHALL validate the authentication token
2. WHEN a valid Visit_Record is received, THE Backend_System SHALL store it in the MongoDB_Database
3. THE MongoDB_Database SHALL persist all Visit_Record fields in the visits collection
4. WHEN storage is successful, THE Backend_System SHALL return a success response to the Mobile_App
5. WHEN an ASHA worker requests visit history via GET /api/visits, THE Backend_System SHALL retrieve and return all Visit_Records for that user from the MongoDB_Database

### Requirement 8: User Interface Design

**User Story:** As an ASHA worker with low digital literacy, I want a simple, icon-based interface with minimal text, so that I can easily navigate the application.

#### Acceptance Criteria

1. THE Mobile_App SHALL display a Login Screen as the initial screen
2. WHEN login succeeds, THE Mobile_App SHALL display a Home Screen with a prominent voice recording button
3. WHEN the voice recording button is pressed, THE Mobile_App SHALL navigate to the Voice Recording Screen
4. THE Mobile_App SHALL provide a Voice Confirmation Screen displaying extracted data and TTS playback controls
5. THE Mobile_App SHALL provide an Offline Records List Screen showing all locally stored Visit_Records
6. THE Mobile_App SHALL provide a Sync Status Screen showing synchronization progress and status
7. THE Mobile_App SHALL use icon-based navigation with minimal text labels
8. THE Mobile_App SHALL use large, touch-friendly UI elements suitable for low-literacy users

### Requirement 9: Platform and Technology Constraints

**User Story:** As a developer, I want clear technology constraints, so that I can build the system with appropriate tools and frameworks.

#### Acceptance Criteria

1. THE Mobile_App SHALL be built using React Native framework
2. THE Mobile_App SHALL target Android platform and be runnable via Android Studio Emulator or real device
3. THE Backend_System SHALL be built using Spring Boot framework with Java
4. THE Backend_System SHALL expose REST APIs for authentication and data operations
5. THE Backend_System SHALL use MongoDB as the primary database
6. THE Mobile_App SHALL use SQLite or equivalent React Native local database for offline storage
7. THE Voice_Input_Module SHALL use react-native-voice or equivalent library
8. THE Entity_Extractor SHALL NOT use heavy cloud-based LLM APIs

### Requirement 10: System Scope Limitations

**User Story:** As a project stakeholder, I want clear boundaries on what the system will NOT include, so that scope is controlled and the project remains feasible.

#### Acceptance Criteria

1. THE Mobile_App SHALL support ONLY the Daily Home Visit Record workflow for Maternal & Child Health
2. THE Mobile_App SHALL NOT include full hospital record system features
3. THE Mobile_App SHALL NOT include medical diagnosis capabilities
4. THE Mobile_App SHALL NOT integrate with government health systems
5. THE Backend_System SHALL support ONLY a single user role (ASHA Worker)
6. THE Entity_Extractor SHALL NOT include ML training pipelines or production-grade Whisper deployment
7. THE Mobile_App SHALL provide demo-level offline support, not production-grade offline capabilities

