# agents.md

# ClassDesk — AI Agent Instructions

## 1. Role

You are an AI development agent working on ClassDesk.

Your responsibility is to build, improve, debug, and maintain the application while preserving:

- Simplicity
- Security
- Maintainability
- Cross-platform compatibility
- Good UI/UX

---

# 2. Technology

The project uses:

- Expo
- React Native
- Expo Web
- Supabase
- PostgreSQL through Supabase
- Supabase Auth
- Supabase Storage
- Android APK
- GitHub Releases

Target platforms:

- Android
- Web

Do not spend development effort on iOS unless explicitly requested.

---

# 3. Reference File

`@ClassDesk (2).jsx` is a **reference only**.

Use it to understand the intended design.

Do not:

- Copy unnecessary code
- Copy its architecture blindly
- Copy unnecessary dependencies
- Assume its implementation is correct
- Preserve bad patterns just because they exist there

Reimplement the design cleanly using the current project architecture.

---

# 4. Core Development Rule

## Keep it simple.

Do not write 50 lines of code for something that can correctly be implemented in 5 lines.

However:

**Do not sacrifice security, readability, or maintainability just to reduce line count.**

Prefer:

- Simple functions
- Clear names
- Small components
- Direct logic
- Reusable code only where useful

Avoid:

- Over-engineering
- Premature abstraction
- Generic frameworks inside the project
- Unnecessary design patterns
- Unnecessary dependencies
- Duplicate logic

---

# 5. Security Rules

Security is mandatory.

Always assume frontend code can be inspected and modified by a malicious user.

Never rely on frontend authorization.

Use Supabase RLS and Storage policies to enforce authorization.

### Never expose

- Supabase service-role key
- Private API keys
- Passwords
- Server secrets
- Internal credentials

The service-role key must never reach:

- Android APK
- Web bundle
- GitHub
- Client-side environment variables

---

# 6. Supabase Rules

Before creating a database table, determine:

- Who owns the data?
- Who can read it?
- Who can create it?
- Who can modify it?
- Who can delete it?

Create RLS policies accordingly.

Do not disable RLS simply to make a feature work.

If RLS is causing a problem, fix the policy.

Do not bypass security.

---

# 7. Storage Rules

Files are stored in Supabase Storage.

When implementing file uploads:

1. Validate the file
2. Generate a safe storage path
3. Verify the user is authorized
4. Upload the file
5. Store metadata
6. Use secure access

Never trust a filename or path supplied directly by the user.

Never allow users to manipulate another user's storage path.

---

# 8. Database Rules

Do not create unnecessary tables.

Do not duplicate data unless there is a real reason.

Use relationships instead of repeatedly storing the same information.

Add indexes when queries actually require them.

Avoid fetching unnecessary columns.

Avoid downloading entire tables when pagination or filtering is appropriate.

---

# 9. Frontend Rules

The frontend should:

- Be responsive
- Handle loading
- Handle errors
- Handle empty states
- Validate obvious user input
- Give useful feedback

But frontend validation is **not** a security boundary.

Backend authorization remains mandatory.

---

# 10. Dependencies

Before installing a dependency, ask:

> Can this be done cleanly with Expo, React Native, or existing project code?

If yes, do not install another dependency.

Every dependency adds:

- Maintenance
- Bundle size
- Security surface
- Upgrade complexity

Keep the dependency count low.

---

# 11. File Uploads

The application must support file uploads through Supabase Storage.

Do not implement a fake local-only file system.

Do not store large files directly inside database rows.

Store:

**File → Supabase Storage**

**Metadata → Supabase PostgreSQL**

Example metadata:

- `id`
- `owner_id`
- `file_name`
- `storage_path`
- `file_type`
- `file_size`
- `created_at`

Only add fields that the application actually needs.

---

# 12. Cross-Platform Rules

Code should work on:

- Android
- Web

Avoid platform-specific implementations unless necessary.

If platform-specific code is unavoidable, isolate it cleanly.

Do not create two independent applications.

Reuse:

- Business logic
- Supabase queries
- Data models
- Components
- Validation
- State logic

where practical.

---

# 13. UI Rules

The UI should feel:

- Modern
- Premium
- Clean
- Simple
- Professional

Prioritize:

- Good spacing
- Clear typography
- Strong hierarchy
- Consistent components
- Soft borders
- Good hover/pressed states
- Responsive layouts

Do not add animations or effects unless they improve UX.

---

# 14. Before Changing Existing Code

Before modifying code:

1. Understand what it currently does.
2. Check whether the functionality is actually required.
3. Check for existing reusable code.
4. Make the smallest appropriate change.
5. Avoid unrelated refactoring.

Do not rewrite entire files to change one small feature.

---

# 15. Debugging

When something fails:

1. Find the actual cause.
2. Read the error.
3. Check the relevant code.
4. Fix the root problem.
5. Test the affected functionality.
6. Avoid adding hacks.

Do not hide errors with:

- Empty catch blocks
- Random retries
- Arbitrary delays
- Disabled validation
- Suppressed warnings

unless there is a legitimate reason.

---

# 16. Changes

For every requested change:

### First

Understand the requirement.

### Then

Find the smallest set of files that need modification.

### Then

Implement the change.

### Finally

Check:

- Android
- Web
- Authentication
- Database
- Storage
- Security

where relevant.

Do not modify unrelated parts of the application.

---

# 17. New Features

Before building a new feature, determine:

- Is it actually required?
- What data does it need?
- Does it require a new table?
- Does it require a new Storage bucket?
- What permissions are required?
- What happens when there is no data?
- What happens when the request fails?

Do not build speculative functionality.

---

# 18. Security Before Convenience

If the easiest implementation is insecure, do not use it.

Examples:

### Bad

"Make the Storage bucket public because downloads are easier."

### Good

"Keep files private and provide authorized access."

### Bad

"Check ownership in React only."

### Good

"Check ownership through Supabase RLS/Storage policies."

### Bad

"Put the service-role key in the Expo app."

### Good

"Keep privileged credentials server-side."

---

# 19. Code Quality

Code should be:

- Short where possible
- Explicit where useful
- Easy to understand
- Easy to debug
- Easy to modify

Avoid clever code that saves a few lines but makes the project harder to understand.

---

# 20. Git

Never commit:

- `.env`
- Secrets
- Passwords
- Private keys
- Service-role credentials
- Temporary credentials
- Sensitive production data

Keep commits focused.

Do not commit generated junk or unnecessary build artifacts.

---

# 21. Production

Before release:

- Remove development credentials
- Verify environment variables
- Verify RLS
- Verify Storage policies
- Test authentication
- Test file uploads
- Test unauthorized access
- Remove sensitive logs
- Build production APK
- Test APK on a physical Android device
- Test production Web

---

# 22. Agent Decision Rule

When multiple solutions are possible, prefer the solution that is:

1. Secure
2. Simple
3. Maintainable
4. Cross-platform
5. Minimal
6. Performant enough

Do not choose complexity just because it looks more sophisticated.

---

# 23. Final Principle

Build ClassDesk like a real production application, but **do not overbuild it**.

Every line of code, dependency, database table, API call, component, and feature should have a reason to exist.

**Strong security. Minimal complexity. Clean UX. Android + Web first. iOS later.**