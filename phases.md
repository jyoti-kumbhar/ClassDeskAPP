# phases.md

# ClassDesk — Development Phases

## Phase 0 — Project Foundation

### Goal

Create a clean, minimal Expo project.

### Tasks

- Create Expo project
- Configure Android
- Configure Expo Web
- Configure TypeScript if selected
- Configure environment variables
- Install only required dependencies
- Configure Git
- Create `.gitignore`
- Establish basic folder structure
- Connect Supabase

### Requirements

The project must run on:

- Android
- Web

Do not work on iOS during this phase.

### Completion

- Expo starts successfully
- Android runs
- Web runs
- Supabase connection works
- No secrets are committed

---

# Phase 1 — Design System

### Goal

Create the visual foundation.

### Tasks

- Colors
- Typography
- Spacing
- Border radius
- Shadows
- Buttons
- Inputs
- Cards
- Modals
- Loading states
- Empty states
- Error states

Use the existing `@ClassDesk (2).jsx` only as a design reference.

Do not copy its implementation.

### Completion

Core UI components are consistent across Android and Web.

---

# Phase 2 — Authentication

### Goal

Implement secure authentication using Supabase Auth.

### Tasks

- Sign up
- Login
- Logout
- Session persistence
- Password reset
- (Future) Google OAuth Sign-in / Sign-up (100% Free)
- Authenticated navigation
- Protected screens

### Security

Never implement custom password handling.

Never store passwords locally.

Never expose Supabase service-role credentials.

### Completion

A user can securely:

- Create an account
- Log in
- Stay authenticated
- Log out
- Reset password

---

# Phase 3 — Database Architecture

### Goal

Create the minimum required database structure.

### Tasks

- Define entities
- Create tables
- Add relationships
- Add indexes where necessary
- Add timestamps
- Add user ownership
- Enable RLS
- Create RLS policies

### Rule

Do not create tables or columns "just in case."

Only create what the application actually needs.

### Security

Every table must be reviewed for:

- SELECT permissions
- INSERT permissions
- UPDATE permissions
- DELETE permissions

A user must never gain access to another user's private data simply by changing an ID in the frontend.

---

# Phase 4 — Core Application

### Goal

Build the main ClassDesk functionality.

Implement the features defined by the actual product requirements.

For each feature:

1. Design UI
2. Create required database structure
3. Create secure queries
4. Build UI
5. Handle loading
6. Handle empty state
7. Handle errors
8. Test Android
9. Test Web

Avoid building future features before they are needed.

---

# Phase 5 — File Upload System

### Goal

Allow users to upload files to Supabase Storage.

### Tasks

- Create Storage bucket(s)
- Configure Storage policies
- Implement file picker
- Validate file type
- Validate file size
- Generate safe storage path
- Upload file
- Save metadata
- Display uploaded files
- Download/open files
- Delete files where authorized

### Security

Users must not be able to:

- Access another user's private files
- Upload into another user's directory
- Delete another user's files
- Bypass file ownership checks

Do not make private files publicly accessible unnecessarily.

### Database

Store metadata in PostgreSQL.

Store actual files in Supabase Storage.

---

# Phase 6 — Main UI/UX

### Goal

Build the complete user experience.

### Tasks

- Dashboard
- Navigation
- Main feature screens
- Forms
- Lists
- Details screens
- File attachments
- Search/filter where actually required
- Responsive desktop layouts
- Mobile layouts

### Quality requirements

Every screen should have:

- Loading state
- Empty state
- Error state
- Success feedback where appropriate

---

# Phase 7 — Security Review

### Goal

Perform a dedicated security pass.

### Check

- RLS enabled
- RLS policies tested
- Storage policies tested
- No service-role key in client
- No passwords stored
- No secrets in Git
- Environment variables configured correctly
- Input validation
- File validation
- Authorization checks
- Secure file access
- Safe database queries
- Error messages do not leak sensitive information

### Important

Never assume that hiding a button makes an operation secure.

Authorization must be enforced by the backend.

---

# Phase 8 — Performance & Cleanup

### Goal

Remove unnecessary complexity.

### Review

- Unused dependencies
- Unused components
- Duplicate functions
- Duplicate styles
- Unnecessary API calls
- Unnecessary database queries
- Large assets
- Excessive re-renders
- Dead code
- Debug logging

Simplify wherever possible.

### Rule

If a feature can be implemented correctly with 10 lines instead of 50, prefer the simpler implementation.

Do not sacrifice readability for fewer lines.

---

# Phase 9 — Testing

### Android

Test:

- Login
- Navigation
- Forms
- File upload
- File access
- File deletion
- Network failures
- Invalid input
- Logout
- Session persistence

### Web

Test:

- Desktop
- Different viewport sizes
- Authentication
- Navigation
- File upload
- File access
- File deletion
- Forms
- Error handling

### Security testing

Attempt to access resources belonging to another user.

Attempt unauthorized database operations.

Attempt unauthorized file operations.

The application must reject them.

---

# Phase 10 — Production Preparation

### Tasks

- Production Supabase project
- Production environment variables
- Database migration
- RLS verification
- Storage policy verification
- Remove development data
- Remove debug logs
- Verify build configuration
- Test production environment

---

# Phase 11 — Android Release

### Goal

Create production Android APK.

### Tasks

- Build release APK
- Install on physical Android device
- Test production build
- Verify Supabase connection
- Verify file uploads
- Verify authentication
- Verify permissions
- Create GitHub Release
- Attach APK

### Distribution

GitHub Releases will be the initial APK distribution method.

---

# Phase 12 — Web Deployment

### Goal

Deploy the production web application.

### Requirements

- Production Supabase
- Correct environment variables
- HTTPS
- Responsive UI
- Authentication
- File uploads
- Production error handling

The web application and Android application should use the same backend and core application logic.

---

# Phase 13 — Final Review

Before declaring ClassDesk production-ready:

- [ ] Android works
- [ ] Web works
- [ ] Authentication works
- [ ] Database works
- [ ] RLS works
- [ ] File uploads work
- [ ] Storage security works
- [ ] Unauthorized access is blocked
- [ ] Production environment is configured
- [ ] APK is tested
- [ ] Web deployment is tested
- [ ] No unnecessary dependencies
- [ ] No unnecessary code
- [ ] No secrets committed
- [ ] No debug-only functionality remains

---

# Future Phase — iOS

iOS is intentionally postponed.

When iOS development begins, the existing Expo/React Native architecture should be reused.

Do not rewrite the application unless a genuine platform-specific limitation requires it.

---

# Future Phase — Social Authentication (Google OAuth)

### Goal

Provide free 1-click Google Sign-in / Sign-up for Web and Android using Supabase Auth.

### Tasks

- Setup free OAuth 2.0 Client ID in Google Cloud Console
- Add authorized redirect URI in Google Console (`https://<project-ref>.supabase.co/auth/v1/callback`)
- Enable and configure Google Provider in Supabase Dashboard
- Add "Continue with Google" button to Login & Signup screens
- Configure seamless OAuth redirect handling across Web and Android