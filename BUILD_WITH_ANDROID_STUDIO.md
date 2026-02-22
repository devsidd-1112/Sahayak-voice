# Build with Android Studio - Recommended Approach

Due to the path with spaces issue and missing resources, the best way to build and run this app is using Android Studio directly.

## Step-by-Step Instructions

### 1. Start Metro Bundler First

Open a terminal in the `mobile-app` directory and start Metro:

```bash
cd mobile-app
npm start
```

Keep this terminal running. You should see "Welcome to Metro!"

### 2. Open Project in Android Studio

1. Launch Android Studio
2. Click "Open" (or File → Open)
3. Navigate to: `C:\SSN STUDY\IP\Mini Project\mobile-app\android`
4. Click "OK"

### 3. Wait for Gradle Sync

- Android Studio will automatically sync Gradle
- This may take 5-10 minutes on first run
- You'll see a progress bar at the bottom
- Wait until it says "Gradle sync finished"

### 4. Create/Start Android Emulator

1. Click the device dropdown in the toolbar (top right)
2. Select "Device Manager"
3. If you don't have an emulator:
   - Click "Create Device"
   - Select "Pixel 5" or "Pixel 6"
   - Click "Next"
   - Select "Android 14 (API 34)" or "Android 13 (API 33)"
   - Click "Next" then "Finish"
4. Click the ▶️ (Play) button next to your emulator to start it
5. Wait for the emulator to fully boot (shows home screen)

### 5. Run the App

1. Make sure Metro bundler is still running (from Step 1)
2. In Android Studio, click the green "Run" button (▶️) in the toolbar
3. Or press `Shift + F10`
4. Select your running emulator from the list
5. Click "OK"

The app will build and install on the emulator. First build takes 5-10 minutes.

### 6. Test the App

Once the app launches:

1. You should see the login screen
2. Test credentials:
   - Phone: `9876543210`
   - Password: `test123`
3. Try the voice recording feature
4. Test offline functionality

## Troubleshooting in Android Studio

### Build Errors

If you see build errors in Android Studio:

1. Click "Build" → "Clean Project"
2. Click "Build" → "Rebuild Project"
3. Wait for the build to complete

### Gradle Sync Issues

If Gradle sync fails:

1. Click "File" → "Invalidate Caches / Restart"
2. Select "Invalidate and Restart"
3. Wait for Android Studio to restart and re-sync

### Missing SDK Components

If Android Studio prompts to install SDK components:

1. Click "Install" or "Download"
2. Wait for installation to complete
3. Click "Finish"
4. Try building again

### Emulator Won't Start

If the emulator won't start:

1. Check that virtualization is enabled in BIOS
2. Try creating a new emulator with a different API level
3. Allocate more RAM to the emulator (edit AVD settings)

## Why Android Studio Works Better

Android Studio handles several issues automatically:

1. **Path with Spaces**: Android Studio's build system handles paths with spaces better than command-line Gradle
2. **Missing Resources**: Android Studio can auto-generate missing resources
3. **SDK Management**: Automatically downloads and installs required SDK components
4. **Better Error Messages**: Provides clearer error messages and quick fixes
5. **Gradle Wrapper**: Manages Gradle versions automatically

## Alternative: Move Project

If you want to use command-line builds in the future, move the project to a path without spaces:

```
From: C:\SSN STUDY\IP\Mini Project\
To:   C:\Projects\sahayak-voice\
```

Then you can use `npm run android` successfully.

## Backend Server

Don't forget to start the backend server before testing:

```bash
cd backend-springboot
mvnw spring-boot:run
```

The backend should be running on `http://localhost:8080`

## Summary

1. ✅ Start Metro: `npm start` in `mobile-app` directory
2. ✅ Open Android Studio: Open `mobile-app/android` folder
3. ✅ Wait for Gradle sync
4. ✅ Start emulator from Device Manager
5. ✅ Click Run ▶️ button
6. ✅ Wait for app to build and launch

---

**This is the recommended approach for your current setup!**
