# design.md

# ClassDesk — Design & Architecture

## 1. Project Overview

ClassDesk is a cross-platform education/classroom management application.

### Target platforms

- Android
- Web

### Technology

- **Frontend:** Expo + React Native
- **Web:** Expo Web
- **Backend:** Supabase
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **File storage:** Supabase Storage
- **Android distribution:** APK through GitHub Releases

iOS is intentionally out of scope for the initial version.

The architecture should remain compatible with future iOS builds without requiring a rewrite.

---

## 2. Reference Design

`@ClassDesk (2).jsx` is a **design reference only**.

It should be used to understand:

- Layout
- Visual hierarchy
- Navigation
- Components
- Colors
- Spacing
- Typography
- Interaction patterns
- Overall UX

Do **not** blindly copy its implementation.

Do not preserve unnecessary code, dependencies, components, or architectural decisions from the reference.

Rebuild the application using the project's actual architecture.

---

## 3. Design Principles

### Modern

The interface should feel current, clean, and professional.

### Simple

Avoid unnecessary screens, buttons, settings, animations, and configuration.

### Consistent

Use consistent:

- Spacing
- Typography
- Buttons
- Cards
- Inputs
- Icons
- Navigation
- Error states
- Loading states

### Responsive

The same application should work properly on:

- Android phones
- Android tablets
- Desktop browsers
- Laptop browsers

Do not simply stretch the mobile UI onto desktop.

Use responsive layouts where appropriate.

---

## 4. Component Philosophy

Build reusable components when reuse is actually useful.

Examples:

- Button
- Input
- Modal
- Card
- File picker
- File attachment
- Empty state
- Loading indicator
- Error message

Do not create a component abstraction for something that is only used once and does not improve maintainability.

Avoid over-engineering.

---

## 5. Code Philosophy

Follow the principle:

> Do not write 50 lines of code for something that can be correctly implemented in 5 lines.

Prioritize:

- Readability
- Simplicity
- Maintainability
- Correctness
- Security

Avoid:

- Unnecessary wrappers
- Duplicate functions
- Unused utilities
- Excessive abstraction
- Unnecessary dependencies
- Overly complex state management
- Premature optimization

Use the smallest reasonable solution.

---

# 6. Security

Security is a **first-class requirement**.

Never treat security as something to add later.

### Authentication

Use Supabase Auth.

Never implement custom password storage.

Never store:

- Passwords
- Authentication tokens
- Service-role keys
- Secrets

in the frontend source code.

### Supabase

The frontend may use the Supabase anon/public key.

The Supabase service-role key must **never** be included in:

- React Native code
- Expo code
- Web bundles
- APK
- GitHub repository
- Environment variables exposed to the client

Use Row Level Security (RLS) for database access.

### Database

Every important table must have appropriate RLS policies.

Users should only be able to access data they are authorized to access.

Do not rely on frontend checks for authorization.

Frontend checks are for UX.

Supabase policies are for security.

### Storage

Files are stored in Supabase Storage.

Storage buckets must have appropriate access policies.

Do not create publicly accessible files unless the specific feature requires public access.

Prefer authenticated/signed access for private files.

### Input validation

Validate important user input.

Do not trust:

- User-provided IDs
- File names
- File types
- File sizes
- URLs
- Form data

### File uploads

File uploads must have:

- Reasonable file-size limits
- Allowed file types
- Secure storage paths
- Authorization checks
- Appropriate Storage policies

Never allow a user to upload arbitrary files into another user's storage area.

---

# 7. File Storage

Supabase Storage is the application's file storage system.

Users should be able to upload files where the feature requires it.

Potential files include:

- PDFs
- Documents
- Images
- Assignments
- Study materials
- Class resources

Files should not be stored directly inside PostgreSQL.

The database should store file metadata such as:

- File ID
- File name
- Storage path
- File type
- File size
- Owner/user ID
- Related class/course ID
- Created timestamp

The actual file belongs in Supabase Storage.

---

# 8. File Naming and Storage

Use predictable storage paths.

Example:

`user_id/class_id/file_id.ext`

Do not use user-controlled filenames directly as storage paths.

Generate unique identifiers for stored files.

The original filename can be stored as metadata.

---

# 9. Environment Variables

Use environment variables for configuration.

Example:

- Supabase URL
- Supabase anon key

Never commit secrets.

`.env` files containing secrets must be ignored by Git.

Only variables intended for the client may be exposed to Expo.

---

# 10. Error Handling

Errors should be:

- Clear
- User-friendly
- Non-technical where possible

Do not expose:

- Database errors
- Internal SQL information
- Tokens
- API keys
- Stack traces
- Internal implementation details

to normal users.

Log useful technical information during development without exposing sensitive data.

---

# 11. Performance

Do not optimize prematurely.

First make the application:

1. Correct
2. Secure
3. Simple
4. Maintainable

Then optimize actual bottlenecks.

Avoid unnecessary:

- API requests
- Database queries
- Re-renders
- File downloads
- Large assets
- Dependencies

Use pagination for potentially large datasets.

Do not load an entire database table when only a small portion is required.

---

# 12. Dependencies

Keep dependencies minimal.

Before adding a package, ask:

1. Is it actually necessary?
2. Can Expo/React Native already do this?
3. Can the feature be implemented simply without it?
4. Is the package maintained?
5. Does it increase security or maintenance risk?

Do not install packages simply because they are popular.

---

# 13. Navigation

Navigation should remain simple and predictable.

Use a clear hierarchy.

Avoid deeply nested navigation unless required.

The user should always understand:

- Where they are
- How they got there
- How to go back

---

# 14. UI States

Every important screen should consider:

### Loading

Show a lightweight loading state.

### Empty

Explain what the user can do next.

### Error

Explain what went wrong and provide a recovery action.

### Success

Confirm important actions.

### Offline/network failure

Handle failed requests gracefully.

---

# 15. Responsive Web Design

Desktop web should make effective use of available space.

Mobile should prioritize:

- Touch targets
- Vertical layouts
- Simple navigation

Desktop can use:

- Side navigation
- Multi-column layouts
- Wider tables
- Larger content areas

Avoid creating two completely separate applications.

Reuse the same business logic and components wherever practical.

---

# 16. Android Distribution

Android builds will initially be distributed through GitHub Releases.

The application should produce a release APK suitable for installation.

Release builds must not contain:

- Debug credentials
- Service-role keys
- Development-only endpoints
- Debug logging containing sensitive data

---

# 17. Future iOS

iOS is not part of the current development scope.

However, avoid Android-specific architecture where unnecessary.

Use Expo/React Native APIs and cross-platform components whenever practical.

The goal is:

**Android + Web now → iOS later without rewriting the application.**

---

# 18. Design Quality

The final UI should feel:

- Modern
- Premium
- Clean
- Trustworthy
- Fast
- Easy to understand

Prioritize:

- Strong typography
- Good spacing
- Clear hierarchy
- Soft borders
- Consistent cards
- Polished states
- Good empty states
- Good responsive behavior

Do not add visual effects just for decoration.

Every visual element should serve a purpose.