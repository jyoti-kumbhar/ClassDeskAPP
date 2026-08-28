# ClassDesk

ClassDesk is a modern, cross-platform classroom management and education application built with **Expo**, **React Native**, and **Supabase**.

Targeted primarily for **Android** and **Web**.

---

## Features

- **Multi-Role Authentication**: Secure login, signup, password reset, and session persistence for Admins, Teachers, and Students.
- **Admin Dashboard & Management**: Institute statistics, class directory, teacher/student roster controls, and attendance analytics with CSV export.
- **Classroom Hub**:
  - **Notices**: Class announcements and scheduled posts.
  - **Resources**: Study materials, handouts, YouTube links, and file attachments.
  - **Assignments**: Problem sets with deadlines, grading feedback, score tracking, and file uploads.
  - **Attendance**: Daily roll call (Present, Late, Absent), subject/period tracking, monthly statistics, and 75% threshold alerts.
  - **MCQ Exams**: Timed online quizzes with auto-grading, leaderboard ranking, question paper preview, and anti-cheat event monitoring.
  - **Members**: Enrolled student rosters with join codes.
- **Cross-Platform Responsive UI**: Seamless desktop side-navigation and mobile drawer navigation with complete Dark/Light mode support.
- **Supabase Storage**: Secure file uploads with metadata tracking and safe path sanitization.

---

## Tech Stack

- **Framework**: [Expo](https://expo.dev) / [React Native](https://reactnative.dev)
- **Web**: Expo Web
- **Backend & Database**: [Supabase](https://supabase.com) (PostgreSQL, Supabase Auth, Supabase Storage)
- **Icons**: [lucide-react-native](https://lucide.dev)
- **Language**: TypeScript

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/jyoti-kumbhar/ClassDeskAPP.git

# Navigate to project directory
cd ClassDeskAPP

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the root directory (refer to `.env.example`):

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

*Note: If no Supabase credentials are provided, ClassDesk automatically runs in local offline demo mode with seed data.*

### Running the App

```bash
# Start development server
npm start

# Run on Web browser
npm run web

# Run on Android emulator/device
npm run android
```

---

## License

Private / Proprietary.
