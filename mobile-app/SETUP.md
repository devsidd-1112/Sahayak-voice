# Sahayak Voice Mobile App - Setup Guide

Complete setup guide for developers to get the React Native mobile app running on Android.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Android Studio Setup](#android-studio-setup)
- [Project Installation](#project-installation)
- [Environment Configuration](#environment-configuration)
- [Running on Emulator](#running-on-emulator)
- [Running on Real Device](#running-on-real-device)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software

1. **Node.js 18 or higher**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` (should show v18.x or higher)
   - npm comes bundled with Node.js

2. **Java Development Kit (JDK) 17**
   - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or use OpenJDK
   - Verify installation: `java -version` (should show version 17.x)
   - Set `JAVA_HOME` environment variable

3. **Android Studio**
   - Download from [developer.android.com/studio](https://developer.android.com/studio)
   - Latest stable version recommended

4. **Git** (for cloning the repository)
   - Download from [git-scm.com](https://git-scm.com/)

### System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux
- **RAM**: Minimum 8GB (16GB recommended for emulator)
- **Disk Space**: At least 10GB free space
- **Internet Connection**: Required for initial setup and dependencies

---

## Android Studio Setup

### Step 1: Install Android Studio

1. Download and install Android Studio from [developer.android.com/studio](https://developer.android.com/studio)
2. Launch Android Studio
3. Follow the setup wizard to install:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)

### Step 2: Install Android SDK

1. Open Android Studio
2. Go to **Settings/Preferences** → **Appearance & Behavior** → **System Settings** → **Android SDK**
3. Select the **SDK Platforms** tab
4. Check the box for **Android 14.0 (UpsideDownCake)** or **API Level 34**
5. Select the **SDK Tools** tab and ensure these are installed:
   - Android SDK Build-Tools 34.0.0
   - Android Emulator
   - Android SDK Platform-Tools
   - Intel x86 Emulator Accelerator (HAXM installer) - for Intel processors
6. Click **Apply** to install

### Step 3: Configure Environment Variables

#### Windows

1. Open **System Properties** → **Advanced** → **Environment Variables**
2. Add new system variables:
   ```
   ANDROID_HOME = C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
   JAVA_HOME = C:\Program Files\Java\jdk-17
   ```
3. Add to **Path** variable:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   %JAVA_HOME%\bin
   ```

#### macOS/Linux

Add to your `~/.bash_profile`, `~/.zshrc`, or `~/.bashrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$JAVA_HOME/bin
```

Reload your shell configuration:
```bash
source ~/.zshrc  # or ~/.bash_profile
```

### Step 4: Verify Installation

Open a new terminal and run:

```bash
# Check Android SDK
adb --version

# Check Java
java -version

# Check Node.js
node --version
```

All commands should return version information without errors.

---

## Project Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd sahayak-voice-mobile
```

### Step 2: Install Dependencies

Navigate to the mobile app directory and install Node.js dependencies:

```bash
cd mobile-app
npm install
```

This will install all required packages including:
- React Native framework
- Voice recognition library (@react-native-voice/voice)
- Text-to-speech library (react-native-tts)
- SQLite database (react-native-sqlite-storage)
- Navigation libraries
- Testing frameworks

**Note**: Installation may take 5-10 minutes depending on your internet speed.

### Step 3: Install iOS Dependencies (macOS only)

If you're on macOS and want to run on iOS:

```bash
cd ios
pod install
cd ..
```

---

## Environment Configuration

### Backend URL Configuration

The app needs to connect to the backend API. Configure the backend URL based on your environment:

1. Open `src/config/api.ts`
2. Update the `API_BASE_URL` constant:

```typescript
export const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8080/api'  // For Android emulator
  : 'https://your-production-api.com/api';
```

### Configuration Options

**For Android Emulator:**
```typescript
'http://10.0.2.2:8080/api'
```
- `10.0.2.2` is a special alias to your host machine's localhost
- Port `8080` is the default Spring Boot port

**For Real Android Device (same network):**
```typescript
'http://192.168.1.100:8080/api'
```
- Replace `192.168.1.100` with your computer's local IP address
- Find your IP:
  - Windows: `ipconfig` (look for IPv4 Address)
  - macOS/Linux: `ifconfig` or `ip addr` (look for inet address)

**For Production:**
```typescript
'https://api.sahayak-voice.com/api'
```
- Use your actual production API URL

### Finding Your Local IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

**macOS:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Linux:**
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

---

## Running on Emulator

### Step 1: Create an Android Virtual Device (AVD)

1. Open Android Studio
2. Click **More Actions** → **Virtual Device Manager** (or **Tools** → **Device Manager**)
3. Click **Create Device**
4. Select a device definition (recommended: **Pixel 5** or **Pixel 6**)
5. Click **Next**
6. Select a system image:
   - Recommended: **Android 14.0 (API 34)** with Google APIs
   - Click **Download** if not already installed
7. Click **Next**, then **Finish**

### Step 2: Start the Emulator

**Option A: From Android Studio**
1. Open Device Manager
2. Click the **Play** button next to your AVD

**Option B: From Command Line**
```bash
emulator -avd YOUR_AVD_NAME
```

List available AVDs:
```bash
emulator -list-avds
```

### Step 3: Start Metro Bundler

Open a terminal in the `mobile-app` directory:

```bash
npm start
```

Keep this terminal running. You should see:
```
Welcome to Metro!
Fast - Scalable - Integrated

To reload the app press "r"
To open developer menu press "d"
```

### Step 4: Run the App

Open a **new terminal** in the `mobile-app` directory:

```bash
npm run android
```

This will:
1. Build the Android app
2. Install it on the running emulator
3. Launch the app

**First build may take 5-10 minutes.** Subsequent builds are much faster.

### Step 5: Verify the App is Running

You should see the Sahayak Voice app launch on the emulator with the login screen.

---

## Running on Real Device

### Step 1: Enable Developer Options

1. On your Android device, go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times
3. You'll see a message: "You are now a developer!"

### Step 2: Enable USB Debugging

1. Go to **Settings** → **System** → **Developer Options**
2. Enable **USB Debugging**
3. Enable **Install via USB** (if available)

### Step 3: Connect Device

1. Connect your Android device to your computer via USB cable
2. On your device, you'll see a prompt: "Allow USB debugging?"
3. Check "Always allow from this computer" and tap **OK**

### Step 4: Verify Device Connection

```bash
adb devices
```

You should see your device listed:
```
List of devices attached
ABC123XYZ    device
```

If you see "unauthorized", check your device for the USB debugging prompt.

### Step 5: Configure Backend URL for Real Device

1. Find your computer's local IP address (see [Environment Configuration](#environment-configuration))
2. Update `src/config/api.ts`:

```typescript
export const API_BASE_URL = __DEV__
  ? 'http://192.168.1.100:8080/api'  // Replace with your IP
  : 'https://your-production-api.com/api';
```

3. Ensure your device and computer are on the **same Wi-Fi network**

### Step 6: Start Metro Bundler

```bash
npm start
```

### Step 7: Run the App

In a new terminal:

```bash
npm run android
```

The app will be installed and launched on your connected device.

### Step 8: Test Voice Features

Real devices work better for voice recognition than emulators:
- Test microphone input
- Test speech-to-text conversion
- Test text-to-speech playback

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Metro Bundler Issues

**Problem**: `Unable to resolve module` or `Module not found`

**Solution**:
```bash
# Clear Metro cache
npm start -- --reset-cache

# Or clear everything
rm -rf node_modules
npm install
npm start -- --reset-cache
```

#### 2. Android Build Failures

**Problem**: `SDK location not found`

**Solution**: Create `android/local.properties` file:

```properties
# macOS/Linux
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk

# Windows
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

**Problem**: `Execution failed for task ':app:installDebug'`

**Solution**:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

**Problem**: `Could not find or load main class org.gradle.wrapper.GradleWrapperMain`

**Solution**:
```bash
cd android
./gradlew wrapper
cd ..
npm run android
```

#### 3. Emulator Issues

**Problem**: Emulator won't start or is very slow

**Solution**:
- Ensure virtualization is enabled in BIOS (Intel VT-x or AMD-V)
- Install Intel HAXM (for Intel processors):
  ```bash
  # macOS
  brew install intel-haxm
  ```
- Allocate more RAM to AVD (edit AVD settings in Android Studio)
- Use an x86 system image instead of ARM

**Problem**: `emulator: ERROR: x86 emulation currently requires hardware acceleration!`

**Solution**:
- Windows: Install Intel HAXM from Android SDK Manager
- macOS: Install HAXM via Homebrew or SDK Manager
- Linux: Ensure KVM is installed and your user is in the `kvm` group

#### 4. Device Connection Issues

**Problem**: `adb devices` shows no devices

**Solution**:
```bash
# Restart adb server
adb kill-server
adb start-server
adb devices
```

**Problem**: Device shows as "unauthorized"

**Solution**:
- Check device for USB debugging prompt
- Revoke USB debugging authorizations on device and reconnect
- Try a different USB cable (some cables are charge-only)

#### 5. Voice Recognition Issues

**Problem**: Voice input not working

**Solution**:
- Grant microphone permission in app settings
- Ensure Google app is installed on device (required for speech recognition)
- Test on real device (emulator has limited voice support)
- Check device has internet connection (for cloud-based speech recognition)

**Problem**: `Voice recognition not available`

**Solution**:
```bash
# Reinstall the app
adb uninstall com.sahayakvoice
npm run android
```

#### 6. Network/Backend Connection Issues

**Problem**: Cannot connect to backend API

**Solution**:
- Verify backend is running: `curl http://localhost:8080/api/health`
- For emulator: Use `10.0.2.2` instead of `localhost`
- For real device: 
  - Ensure device and computer are on same Wi-Fi network
  - Use computer's local IP address (not localhost)
  - Check firewall settings allow connections on port 8080
- Test connection from device browser: `http://YOUR_IP:8080/api/health`

#### 7. SQLite Database Issues

**Problem**: Database errors or data not persisting

**Solution**:
```bash
# Clear app data
adb shell pm clear com.sahayakvoice

# Or uninstall and reinstall
adb uninstall com.sahayakvoice
npm run android
```

#### 8. Build Performance Issues

**Problem**: Builds are very slow

**Solution**:
- Enable Gradle daemon: Add to `android/gradle.properties`:
  ```properties
  org.gradle.daemon=true
  org.gradle.parallel=true
  org.gradle.configureondemand=true
  ```
- Increase Gradle memory: Add to `android/gradle.properties`:
  ```properties
  org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
  ```

#### 9. Port Already in Use

**Problem**: `Port 8081 already in use`

**Solution**:
```bash
# Kill process using port 8081
# macOS/Linux
lsof -ti:8081 | xargs kill -9

# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

#### 10. React Native Version Mismatch

**Problem**: Version conflicts or compatibility issues

**Solution**:
```bash
# Clear all caches
rm -rf node_modules
rm -rf android/build
rm -rf android/app/build
npm install
cd android
./gradlew clean
cd ..
npm start -- --reset-cache
```

### Getting Help

If you encounter issues not covered here:

1. Check the [React Native documentation](https://reactnative.dev/docs/troubleshooting)
2. Search [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)
3. Check the project's GitHub issues
4. Ask the development team

### Useful Commands

```bash
# Check React Native environment
npx react-native doctor

# View Android logs
npx react-native log-android

# List connected devices
adb devices

# Uninstall app
adb uninstall com.sahayakvoice

# Clear app data
adb shell pm clear com.sahayakvoice

# Reverse port (for localhost on device)
adb reverse tcp:8080 tcp:8080

# Check Metro bundler status
curl http://localhost:8081/status
```

---

## Next Steps

After successful setup:

1. **Test the app**: Try logging in and recording a voice note
2. **Review the code**: Explore `src/` directory to understand the architecture
3. **Run tests**: Execute `npm test` to run the test suite
4. **Read the documentation**: Check `README.md` for feature details
5. **Start developing**: Pick a task from the project board

## Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Android Developer Guide](https://developer.android.com/guide)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Happy Coding! 🚀**
