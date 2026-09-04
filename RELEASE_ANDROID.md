# ClassDesk — Android Release & Installation Guide (Phase 11)

This guide documents the procedures for building the production Android APK, distributing it via GitHub Releases, and installing/testing it on physical Android devices.

---

## 1. Release Architecture & Distribution Method

As outlined in `phases.md` and `design.md`:
- **Target Distribution**: GitHub Releases (Standalone `.apk` download).
- **Target OS**: Android 8.0 (Oreo) and above.
- **Application ID**: `com.classdesk.app`
- **Build Tool**: Expo Application Services (EAS) configured via `eas.json`.

---

## 2. Building the Production APK

### Option A: Automated Build via GitHub Actions (Recommended)

1. Push a release tag to your GitHub repository:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
2. The GitHub Actions workflow (`.github/workflows/android-release.yml`) will automatically:
   - Run type checks and test suites (`npm test`).
   - Build the standalone release APK (`ClassDesk.apk`).
   - Publish a new GitHub Release and attach the APK asset.

---

### Option B: Cloud Build using EAS CLI

1. Ensure EAS CLI is installed and you are logged into your Expo account:
   ```bash
   npx eas-cli login
   ```
2. Run the Android preview build (configured for `.apk` output in `eas.json`):
   ```bash
   npm run build:apk
   # or: npx eas build --platform android --profile preview
   ```
3. Once completed, EAS will provide a direct download link for the `.apk` file.

---

### Option C: Local APK Build (Offline / Local Machine)

To compile the APK locally on a machine with Android SDK and Gradle:
```bash
npx eas build --platform android --profile preview --local --output=./ClassDesk.apk
```

---

## 3. Physical Android Device Installation

1. **Download APK**: Download `ClassDesk.apk` from the GitHub Release or EAS download URL directly on your Android phone.
2. **Enable Unknown Sources**: When prompted, enable *Allow installation from this source* in your browser/file manager settings.
3. **Install**: Tap *Install* to complete installation.
4. **Launch**: Tap *Open* to launch ClassDesk.

---

## 4. Production Physical Device Verification Checklist

Perform the following verification steps on the installed APK:

| Test Item | Verification Criteria | Status |
| :--- | :--- | :--- |
| **1. Splash & Brand Icons** | App launches with `#386AEB` branded splash and adaptive icon | [x] |
| **2. Auth - Sign In / Sign Up** | Secure authentication works cleanly with Supabase Auth | [x] |
| **3. Session Persistence** | Closing and reopening the app keeps the user logged in (`AsyncStorage`) | [x] |
| **4. File Upload & Picker** | Native document picker opens; allows selecting and uploading files up to 25MB | [x] |
| **5. Class Management** | Create class, generate 6-digit join code, enroll students | [x] |
| **6. Attendance System** | Teachers mark attendance; students see accurate attendance percentages | [x] |
| **7. Exams & Anti-Cheat** | Taking MCQ exams tracks time, warns on tab/window blur, auto-submits on 3 violations | [x] |
| **8. Responsive Layout & Theme** | Clean responsive layout on mobile screens; smooth Light/Dark theme switching | [x] |
