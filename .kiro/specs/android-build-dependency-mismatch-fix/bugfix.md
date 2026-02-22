# Bugfix Requirements Document

## Introduction

The Sahayak-Voice mobile app (React Native) fails to build for Android when running `npm run android` due to version mismatches between React Native core and native module dependencies (react-native-screens, react-native-gesture-handler, react-native-reanimated). This prevents the app from being installed and tested on Android emulators or devices, blocking development and deployment.

The build process fails with three categories of errors:
1. Kotlin compilation errors in native modules (unresolved reference to `BaseReactPackage`)
2. Override errors in native module classes
3. Missing drawable resources (`rn_edit_text_material`)

These errors indicate that the installed native modules expect a different React Native architecture version than what is currently installed.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the project has mismatched versions between React Native core and native modules (react-native-screens, react-native-gesture-handler, react-native-reanimated) THEN the Android build fails with "Unresolved reference: BaseReactPackage" errors during Kotlin compilation

1.2 WHEN running `npm run android` with incompatible dependency versions THEN the build process fails at `:react-native-screens:compileDebugKotlin` and `:react-native-gesture-handler:compileDebugKotlin` tasks

1.3 WHEN the Android Gradle build attempts to link resources with mismatched library versions THEN the build fails with "error: resource drawable/rn_edit_text_material (aka com.sahayakvoice:drawable/rn_edit_text_material) not found"

1.4 WHEN native modules are compiled against an incompatible React Native version THEN multiple override errors occur ('createViewManagers', 'getModule', 'getReactModuleInfoProvider' override nothing)

### Expected Behavior (Correct)

2.1 WHEN React Native core version is aligned with compatible native module versions THEN the Android build SHALL complete successfully without "Unresolved reference: BaseReactPackage" errors

2.2 WHEN running `npm run android` with compatible dependency versions (React Native 0.72.7 with react-native-screens 3.29.0, react-native-gesture-handler 2.12.0, react-native-reanimated 3.6.0) THEN the build process SHALL complete all Kotlin compilation tasks successfully

2.3 WHEN the Android Gradle build links resources with compatible library versions THEN all drawable resources SHALL be found and linked without errors

2.4 WHEN native modules are compiled against a compatible React Native version THEN all class overrides SHALL resolve correctly without compilation errors

2.5 WHEN the build completes successfully THEN the app SHALL install on the Android emulator or device and launch automatically

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the iOS build is executed THEN the system SHALL CONTINUE TO build successfully without being affected by Android dependency changes

3.2 WHEN Metro bundler is started THEN the system SHALL CONTINUE TO bundle JavaScript code correctly regardless of native dependency versions

3.3 WHEN the app runs after successful build THEN all existing features (voice input, offline storage, navigation, backend sync) SHALL CONTINUE TO function as before

3.4 WHEN npm scripts other than `npm run android` are executed (e.g., `npm start`, `npm test`) THEN they SHALL CONTINUE TO work without modification

3.5 WHEN the backend Spring Boot service is running THEN it SHALL CONTINUE TO operate independently and accept API requests from the mobile app
