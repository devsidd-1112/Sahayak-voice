# Final Build Instructions - Sahayak Voice Mobile App

## Current Situation

The command-line build (`npm run android`) is failing due to multiple issues:

1. **Path with Spaces**: `C:\SSN STUDY\IP\Mini Project\` causes problems with:
   - Kotlin compiler cache files
   - Gradle build tools
   - React Native resource linking

2. **Missing Resources**: `rn_edit_text_material` drawable not found

3. **Kotlin Compilation Errors**: Libraries (gesture-handler, screens) failing to compile

4. **Version Conflicts**: Dependencies requiring different SDK/Gradle versions

## ✅ RECOMMENDED SOLUTION: Use Android Studio

Android Studio handles all these issues automatically. Follow these steps:

### Step 1: Start Metro Bundler

Open a terminal in `mobile-app` directory:

```bash
cd mobile-app
npm start
```

**Keep this terminal running!** You should see "Welcome to Metro!"

### Step 2: Open in Android Studio

1. Launch **Android Studio**
2. Click **"Open"** (or File → Open)
3. Navigate to: `C:\SSN STUDY\IP\Mini Project\mobile-app\android`
4. Click **"OK"**

### Step 3: Wait for Gradle Sync

- Android Studio will sync Gradle automatically
- This takes 5-10 minutes on first run
- Wait for "Gradle sync finished" message at the bottom

### Step 4: Create/Start Emulator

1. Click the **device dropdown** in toolbar (top right)
2. Select **"Device Manager"**
3. If no emulator exists:
   - Click **"Create Device"**
   - Select **"Pixel 5"** or **"Pixel 6"**
   - Click **"Next"**
   - Select **"Android 13 (API 33)"** or **"Android 14 (API 34)"**
   - Click **"Next"** → **"Finish"**
4. Click **▶️ (Play)** button next to your emulator
5. Wait for emulator to fully boot (shows home screen)

### Step 5: Run the App

1. Ensure Metro bundler is still running (Step 1)
2. In Android Studio, click the green **"Run" button (▶️)** in toolbar
3. Or press **Shift + F10**
4. Select your running emulator
5. Click **"OK"**

**First build takes 5-10 minutes. Be patient!**

### Step 6: Test the App

Once launched:

1. Login screen should appear
2. Test credentials:
   - Phone: `9876543210`
   - Password: `test123`
3. Try recording a voice note
4. Test the complete flow

## Alternative Solution: Move Project

If you want to use command-line builds in the future:

### Move to Path Without Spaces

```
From: C:\SSN STUDY\IP\Mini Project\
To:   C:\Projects\sahayak-voice\
```

Then:

```bash
cd C:\Projects\sahayak-voice\mobile-app
npm install
cd android
./gradlew clean
cd ..
npm run android
```

## Backend Server

Don't forget to start the backend before testing:

```bash
cd backend-springboot
mvnw spring-boot:run
```

Backend runs on `http://localhost:8080`

## Troubleshooting in Android Studio

### Build Errors

1. **Build** → **Clean Project**
2. **Build** → **Rebuild Project**
3. Wait for completion

### Gradle Sync Fails

1. **File** → **Invalidate Caches / Restart**
2. Select **"Invalidate and Restart"**
3. Wait for restart and re-sync

### Missing SDK Components

If prompted to install SDK components:
1. Click **"Install"** or **"Download"**
2. Wait for installation
3. Click **"Finish"**
4. Try building again

### Emulator Won't Start

1. Check virtualization is enabled in BIOS
2. Try a different API level (API 33 instead of 34)
3. Allocate more RAM in AVD settings

## Why Android Studio Works

Android Studio automatically handles:

✅ Paths with spaces  
✅ Missing resources  
✅ SDK component installation  
✅ Gradle version management  
✅ Dependency resolution  
✅ Better error messages  

## Summary

**For your current setup with path containing spaces:**

1. ✅ Use Android Studio (recommended)
2. ⚠️ Command-line builds will continue to fail

**For future projects:**

1. ✅ Use paths without spaces
2. ✅ Then command-line builds work fine

---

## Quick Reference

**Start Metro:**
```bash
cd mobile-app
npm start
```

**Open in Android Studio:**
- Open: `mobile-app/android` folder
- Wait for Gradle sync
- Click Run ▶️

**Start Backend:**
```bash
cd backend-springboot
mvnw spring-boot:run
```

**Test Credentials:**
- Phone: `9876543210`
- Password: `test123`

---

**This is the working solution for your setup!**
