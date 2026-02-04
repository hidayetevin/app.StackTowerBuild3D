# Stack Tower 3D - Android Build Instructions

Since the automated build environment has restrictions, you can generate the APK on your local machine by following these steps.

## Prerequisites
- **Node.js** installed.
- **Android Studio** installed (with Android SDK and Java JDK).

## Steps to Generate APK

1.  **Install Dependencies** (if not already done):
    ```bash
    npm install
    ```

2.  **Build the Web Project**:
    This compiles your game into the `dist` folder.
    ```bash
    npm run build
    ```

3.  **Initialize Android Project**:
    If you haven't done this yet, add the Android platform:
    ```bash
    npx cap add android
    ```

4.  **Sync Changes**:
    This copies the latest `dist` build to the Android project.
    ```bash
    npx cap sync
    ```

5.  **Build the APK**:
    
    **Option A: Using Android Studio (Recommended)**
    *   Open the `android` folder in Android Studio:
        ```bash
        npx cap open android
        ```
    *   Wait for Gradle to sync.
    *   Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
    *   Once done, it will show a notification. Click "locate" to find your `.apk` file.

    **Option B: Using Command Line**
    *   Navigate to the android directory:
        ```bash
        cd android
        ```
    *   Run the build command (Windows):
        ```bash
        ./gradlew assembleDebug
        ```
    *   The APK will be located at:
        `android/app/build/outputs/apk/debug/app-debug.apk`

## Troubleshooting
- If you see `EACCES` errors on Mac/Linux, run `chmod +x android/gradlew`.
- If `npx cap` commands fail, try installing the CLI globally: `npm install -g @capacitor/cli`.
