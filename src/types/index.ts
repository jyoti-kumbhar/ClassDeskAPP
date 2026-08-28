// ============================================================================
// CLASSDESK - SHARED TYPE DEFINITIONS
// ============================================================================

export type UserRole = 'admin' | 'teacher' | 'student';
export type UserStatus = 'active' | 'inactive';

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  instituteId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Institute {
  id: string;
  name: string;
  code: string;
  createdAt?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  subject: string;
  joinCode: string;
  teacherId: string;
  instituteId?: string;
  studentIds: string[];
  createdAt?: string;
}

export interface Notice {
  id: string;
  classId: string;
  authorId: string;
  title: string;
  body: string;
  date: string;
  scheduledFor?: string | null;
}

export type ResourceLabelType = 'Notes' | 'Google Drive' | 'YouTube' | 'PDF' | 'Website' | string;

export interface ResourceLink {
  id: string;
  label: string;
  type: ResourceLabelType;
  url: string;
}

export interface Resource {
  id: string;
  classId: string;
  authorId: string;
  title: string;
  description?: string;
  date: string;
  scheduledFor?: string | null;
  links: ResourceLink[];
}

export type SubmissionStatus = 'Pending' | 'Reviewed' | 'Needs Revision';

export interface AssignmentSubmission {
  id?: string;
  studentId: string;
  link?: string;
  fileUrl?: string;
  storagePath?: string;
  status: SubmissionStatus;
  feedback?: string;
  marks?: number | null;
  submittedAt: string;
}

export interface AssignmentResource {
  id: string;
  label: string;
  url: string;
}

export interface Assignment {
  id: string;
  classId: string;
  authorId: string;
  title: string;
  description: string;
  deadline: string;
  maxMarks?: number | null;
  scheduledFor?: string | null;
  resources: AssignmentResource[];
  submissions: AssignmentSubmission[];
}

export type AttendanceStatus = 'P' | 'A' | 'L'; // Present, Absent, Late

export interface AttendanceRecord {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  subject: string;
  time: string; // HH:MM
  records: Record<string, AttendanceStatus>; // studentId -> 'P' | 'A' | 'L'
}

export interface ExamQuestion {
  id: string;
  q: string;
  options: string[];
  correct: number;
}

export interface ExamViolation {
  reason: string;
  time: string;
}

export interface ExamAttempt {
  studentId: string;
  answers: number[];
  score: number;
  warnings: number;
  cheatFlag: boolean;
  violations: ExamViolation[];
  submittedAt: string;
  timeTakenSec: number;
}

export interface Exam {
  id: string;
  classId: string;
  authorId: string;
  title: string;
  duration: number; // in minutes
  startTime: string;
  endTime: string;
  resultsReleased: boolean;
  questions: ExamQuestion[];
  attempts: ExamAttempt[];
}

export interface FileUploadMetadata {
  id: string;
  ownerId: string;
  classId?: string | null;
  fileName: string;
  storagePath: string;
  fileType: string;
  fileSize: number;
  url?: string;
  createdAt: string;
}

export type ScreenName = 'dashboard' | 'classes' | 'teachers' | 'students' | 'reports' | 'profile';
export type ClassTabKey = 'notices' | 'resources' | 'assignments' | 'attendance' | 'exams' | 'members';

export interface ToastMessage {
  id: string;
  msg: string;
  type: 'success' | 'danger' | 'info';
}
