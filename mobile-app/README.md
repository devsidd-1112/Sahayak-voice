# Sahayak Voice Mobile App (React Native)

React Native mobile application for voice-first, offline-first health data collection by ASHA workers in India.

## Technology Stack

- **Framework**: React Native 0.73.2
- **Language**: TypeScript
- **Platform**: Android (primary target)
- **Voice Input**: @react-native-voice/voice
- **Text-to-Speech**: react-native-tts
- **Local Storage**: react-native-sqlite-storage
- **Navigation**: React Navigation
- **Network Detection**: @react-native-community/netinfo
- **Testing**: Jest, fast-check (property-based testing)

## Project Structure

```
mobile-app/
├── android/                 # Android native code
├── src/
│   ├── components/         # Reusable UI components
│   ├── config/            # Configuration files
│   ├── screens/           # Screen components
│   ├── services/          # Business logic services
│   ├── types/             # TypeScript type definitions
│   └── App.tsx            # Main app component
├── index.js               # Entry point
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js 18+ and npm/yarn
- React Native development environment
- Android Studio (for Android development)
- Java Development Kit (JDK) 17

## Setup Instructions

### 1. Install Node.js Dependencies

```bash
cd mobile-app
npm install
```

### 2. Set Up Android Development Environment

Follow the [React Native Environment Setup](https://reactnative.dev/docs/environment-setup) guide for Android.

**Key requirements:**
- Android Studio
- Android SDK (API 34)
- Android SDK Build-Tools
- Android Emulator or physical device

### 3. Configure Backend URL

Edit `src/config/api.ts` to point to your backend:

```typescript
export const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8080/api'  // Android emulator
  : 'https://your-production-api.com/api';
```

**Note**: 
- For Android emulator: use `10.0.2.2` instead of `localhost`
- For real device: use your computer's IP address (e.g., `http://192.168.1.100:8080/api`)

### 4. Start Metro Bundler

```bash
npm start
```

### 5. Run on Android

**Option A: Android Emulator**
```bash
# Start an Android emulator from Android Studio, then:
npm run android
```

**Option B: Physical Device**
```bash
# Enable USB debugging on your Android device
# Connect via USB
# Run:
npm run android
```

## Development

### Running the App

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

### Hot Reload

- **Fast Refresh**: Enabled by default - changes appear instantly
- **Reload**: Shake device or press `R` twice in terminal
- **Dev Menu**: Shake device or press `Cmd+M` (macOS) / `Ctrl+M` (Windows/Linux)

### Debugging

**React Native Debugger:**
```bash
# Install React Native Debugger
brew install --cask react-native-debugger  # macOS

# Open dev menu and select "Debug"
```

**Chrome DevTools:**
- Open dev menu
- Select "Debug"
- Open `chrome://inspect` in Chrome

**Logs:**
```bash
# Android logs
npx react-native log-android

# iOS logs
npx react-native log-ios
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## Building for Production

### Android APK

```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

### Android App Bundle (for Play Store)

```bash
cd android
./gradlew bundleRelease
```

Bundle location: `android/app/build/outputs/bundle/release/app-release.aab`

## Permissions

The app requires the following Android permissions:

- **RECORD_AUDIO**: For voice input capture
- **INTERNET**: For backend API communication
- **ACCESS_NETWORK_STATE**: For offline/online detection

These are configured in `android/app/src/main/AndroidManifest.xml`

## Features (To Be Implemented)

### Core Features
- ✅ Project structure and dependencies (Task 1)
- ⏳ Voice input capture (Task 8)
- ⏳ Entity extraction from speech (Task 6)
- ⏳ Text-to-speech confirmation (Task 7)
- ⏳ Offline SQLite storage (Task 5)
- ⏳ Data synchronization (Task 15)

### UI Screens
- ⏳ Login Screen (Task 9)
- ⏳ Home Screen (Task 10)
- ⏳ Voice Recording Screen (Task 11)
- ⏳ Voice Confirmation Screen (Task 12)
- ⏳ Offline Records List (Task 14)
- ⏳ Sync Status Screen (Task 16)

## Troubleshooting

### Metro Bundler Issues

**Error**: `Unable to resolve module`

**Solution**:
```bash
# Clear cache
npm start -- --reset-cache

# Or
rm -rf node_modules
npm install
```

### Android Build Issues

**Error**: `SDK location not found`

**Solution**: Create `android/local.properties`:
```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk  # macOS
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk  # Windows
```

**Error**: `Execution failed for task ':app:installDebug'`

**Solution**:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Voice Recognition Issues

**Error**: Voice recognition not working

**Solution**:
- Ensure microphone permission is granted
- Check device has Google app installed (for speech recognition)
- Test on real device (emulator may have limited voice support)

### SQLite Issues

**Error**: Database not opening

**Solution**:
```bash
# Uninstall and reinstall app
adb uninstall com.sahayakvoice
npm run android
```

## Device Testing

### Recommended Test Devices

- Android 8.0+ (API 26+)
- Minimum 2GB RAM
- Microphone support
- Internet connectivity (for sync)

### Testing Offline Mode

1. Enable airplane mode on device
2. Test voice recording and data entry
3. Verify data saves locally
4. Disable airplane mode
5. Test sync functionality

## Performance Optimization

### Bundle Size

```bash
# Analyze bundle size
npx react-native-bundle-visualizer
```

### Memory Profiling

Use Android Studio Profiler:
1. Run app in debug mode
2. Open Android Studio
3. View > Tool Windows > Profiler
4. Select your app process

## Contributing

1. Follow TypeScript strict mode
2. Write tests for new features
3. Use ESLint and Prettier
4. Test on real Android devices

## Next Steps

This is Task 1 setup. Subsequent tasks will implement:

- Task 5: Local SQLite database
- Task 6: Entity extraction
- Task 7: TTS module
- Task 8: Voice input
- Task 9-12: UI screens
- Task 14-16: Sync functionality

## License

MIT License - See LICENSE file for details
