# Android Studio Build Fix - Path with Spaces Issue

## Problem

The project is located in a path with spaces: `C:\SSN STUDY\IP\Mini Project\`

This causes issues with:
1. Kotlin compiler cache files
2. Gradle build process
3. React Native build tools

## Solution: Move Project to Path Without Spaces

### Step 1: Move the Project

**Option A: Move to a simple path (Recommended)**
```
Move from: C:\SSN STUDY\IP\Mini Project\
Move to:   C:\Projects\sahayak-voice\
```

**Option B: Use your user directory**
```
Move from: C:\SSN STUDY\IP\Mini Project\
Move to:   C:\Users\sidda\sahayak-voice\
```

### Step 2: After Moving

1. Open the new location in your terminal
2. Reinstall dependencies:
   ```bash
   cd mobile-app
   npm install
   ```

3. Clean Gradle cache:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

4. Run the app:
   ```bash
   npm run android
   ```

## Alternative: Use Android Studio Directly

If you don't want to move the project, you can build directly from Android Studio:

### Step 1: Open Project in Android Studio

1. Open Android Studio
2. Click "Open an Existing Project"
3. Navigate to: `C:\SSN STUDY\IP\Mini Project\mobile-app\android`
4. Click "OK"

### Step 2: Wait for Gradle Sync

- Android Studio will automatically sync Gradle
- This may take 5-10 minutes on first run
- It will download NDK and other dependencies

### Step 3: Create/Start Emulator

1. Click the device dropdown in the toolbar
2. Select "Device Manager"
3. Create a new device or start an existing one

### Step 4: Run the App

1. Make sure Metro bundler is running:
   - Open terminal in `mobile-app` directory
   - Run: `npm start`

2. In Android Studio:
   - Click the green "Run" button (▶️)
   - Or press Shift + F10

The app will build and install on the emulator.

## Why This Happens

The Kotlin compiler creates cache files with paths that include the project directory. When the path contains spaces, it causes issues with:

- File path parsing
- Cache file creation
- Build tool execution

This is a known limitation of several build tools on Windows.

## Current Build Status

The build was progressing and downloading:
- ✅ Gradle wrapper installed
- ✅ Gradle 8.3 downloaded
- ✅ Android SDK configured
- ⏳ NDK (Native Development Kit) downloading (this takes time)
- ⏳ Dependencies resolving

The build will eventually complete, but the path with spaces may cause intermittent issues.

## Recommended Next Steps

1. **Best Option**: Move project to `C:\Projects\sahayak-voice\`
2. **Alternative**: Use Android Studio to build (it handles paths better)
3. **Last Resort**: Wait for command-line build to complete (may take 10-15 minutes)

## Quick Commands After Moving

```bash
# Navigate to new location
cd C:\Projects\sahayak-voice

# Install mobile app dependencies
cd mobile-app
npm install

# Clean and build
cd android
./gradlew clean
cd ..

# Start Metro bundler
npm start

# In a new terminal, run the app
npm run android
```

## Additional Notes

- First build always takes longer (10-15 minutes)
- Subsequent builds are much faster (1-2 minutes)
- The NDK download is a one-time operation
- Once built, the app will hot-reload on code changes

---

**Recommendation**: Move the project to avoid future issues with spaces in the path.
