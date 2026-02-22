# Quick Start: Running Sahayak Voice in Android Studio

This is a quick reference guide to get the app running in Android Studio. For detailed troubleshooting, see `mobile-app/SETUP.md`.

## Prerequisites Checklist

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ JDK 17 installed (`java -version`)
- ✅ Android Studio installed
- ✅ Android SDK API Level 34 installed

## Quick Setup Steps

### 1. Install Dependencies

Open terminal in the project root:

```bash
cd mobile-app
npm install
```

Wait for installation to complete (5-10 minutes).

### 2. Configure Environment Variables (Windows)

Add these to your System Environment Variables:

```
ANDROID_HOME = C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Java\jdk-17
```

Add to Path:
```
%ANDROID_HOME%\platform-tools
%JAVA_HOME%\bin
```

**Restart your terminal** after setting environment variables.

### 3. Verify Setup

```bash
adb --version
java -version
node --version
```

All should return version numbers.

### 4. Start Backend Server

Open a new terminal and start the Spring Boot backend:

```bash
cd backend-springboot
mvnw spring-boot:run
```

Keep this running. Backend should start on `http://localhost:8080`

### 5. Create Android Emulator (First Time Only)

1. Open Android Studio
2. Click **More Actions** → **Virtual Device Manager**
3. Click **Create Device**
4. Select **Pixel 5** or **Pixel 6**
5. Click **Next**
6. Select **Android 14.0 (API 34)** system image
7. Click **Download** if needed, then **Next**
8. Click **Finish**

### 6. Start the Emulator

**Option A: From Android Studio**
- Open Device Manager
- Click ▶️ (Play button) next to your emulator

**Option B: From Command Line**
```bash
emulator -list-avds
emulator -avd YOUR_AVD_NAME
```

Wait for emulator to fully boot (shows home screen).

### 7. Start Metro Bundler

Open a new terminal in `mobile-app` directory:

```bash
npm start
```

Keep this running. You should see "Welcome to Metro!"

### 8. Run the App

Open another new terminal in `mobile-app` directory:

```bash
npm run android
```

First build takes 5-10 minutes. The app will automatically install and launch on the emulator.

## Running on Real Android Device

### Quick Steps:

1. **Enable Developer Mode** on your phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging**:
   - Settings → System → Developer Options
   - Turn on "USB Debugging"

3. **Connect via USB** and allow debugging prompt on phone

4. **Verify connection**:
   ```bash
   adb devices
   ```
   Should show your device.

5. **Update API URL** in `mobile-app/src/config/api.ts`:
   ```typescript
   // Find your computer's IP address first
   // Windows: ipconfig
   // Look for IPv4 Address (e.g., 192.168.1.100)
   
   export const API_BASE_URL = __DEV__
     ? 'http://192.168.1.100:8080/api'  // Replace with YOUR IP
     : 'https://your-production-api.com/api';
   ```

6. **Ensure phone and computer are on same Wi-Fi network**

7. **Run the app**:
   ```bash
   npm run android
   ```

## Common Issues & Quick Fixes

### "SDK location not found"
Create `mobile-app/android/local.properties`:
```properties
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

### "Port 8081 already in use"
```bash
# Kill Metro bundler
taskkill /F /IM node.exe
# Or close the terminal running npm start
```

### "Unable to connect to backend"
- For emulator: Use `http://10.0.2.2:8080/api` (not localhost)
- For real device: Use your computer's IP address
- Verify backend is running: Open browser to `http://localhost:8080`

### Build fails or app crashes
```bash
cd mobile-app
rm -rf node_modules
npm install
cd android
gradlew clean
cd ..
npm start -- --reset-cache
```

Then in a new terminal:
```bash
npm run android
```

### Emulator is very slow
- Ensure virtualization is enabled in BIOS
- Allocate more RAM to emulator (edit in Android Studio)
- Use x86 system image (not ARM)

## Testing the App

### Default Login Credentials
```
Phone: 9876543210
Password: test123
```

### Test Flow
1. Login with credentials above
2. Tap the microphone button
3. Speak: "Aaj Sunita Devi ke ghar gayi. Blood pressure 140/90 hai. Bacche ko bukhar hai."
4. Review extracted data
5. Confirm to save

## Useful Commands

```bash
# View logs
npx react-native log-android

# Reload app (in emulator)
Press 'R' twice quickly

# Open developer menu (in emulator)
Ctrl + M (Windows) or Cmd + M (Mac)

# Uninstall app
adb uninstall com.sahayakvoice

# Clear app data
adb shell pm clear com.sahayakvoice

# Restart adb
adb kill-server
adb start-server
```

## Project Structure

```
mobile-app/
├── src/
│   ├── screens/        # UI screens (Login, Home, Recording, etc.)
│   ├── services/       # Business logic (Voice, TTS, Database, Sync)
│   ├── navigation/     # React Navigation setup
│   └── config/         # Configuration (API URLs)
├── android/            # Android native code
├── __tests__/          # Test files
└── package.json        # Dependencies
```

## Running Tests

```bash
cd mobile-app
npm test
```

All 140 tests should pass.

## Need More Help?

See detailed documentation:
- `mobile-app/SETUP.md` - Complete setup guide with troubleshooting
- `README.md` - Project overview and architecture
- `FINAL_TEST_VERIFICATION.md` - Test results and verification

---

**Quick Start Complete! 🎉**

The app should now be running on your emulator or device. Try recording a voice note!
