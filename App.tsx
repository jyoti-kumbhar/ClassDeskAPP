import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  StatusBar,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {
  UserRole,
  ScreenName,
  ClassTabKey,
  Profile,
  Notice,
  Resource,
  Assignment,
  AttendanceRecord,
  Exam,
  ToastMessage,
  AssignmentSubmission,
  ExamAttempt,
} from './src/types';
import { lightColors, darkColors } from './src/theme';
import { createInitialSeed, AppDatabase, uid, genCode } from './src/services/dataStore';
import {
  signUpWithSupabase,
  signInWithSupabase,
  signOutWithSupabase,
  resetPasswordWithSupabase,
} from './src/services/auth';
import { Sidebar } from './src/components/layout/Sidebar';
import { Topbar } from './src/components/layout/Topbar';
import { Toast } from './src/components/common/Toast';

// Auth Screens
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { SignupScreen } from './src/screens/auth/SignupScreen';
import { VerifyScreen } from './src/screens/auth/VerifyScreen';
import { ForgotScreen } from './src/screens/auth/ForgotScreen';

// Admin Screens
import { AdminDashboardScreen } from './src/screens/admin/AdminDashboardScreen';
import { AdminClassesScreen } from './src/screens/admin/AdminClassesScreen';
import { AdminPeopleScreen } from './src/screens/admin/AdminPeopleScreen';
import { AdminReportsScreen } from './src/screens/admin/AdminReportsScreen';

// Teacher / Student Screens
import { TeacherClassesScreen } from './src/screens/teacher/TeacherClassesScreen';
import { StudentClassesScreen } from './src/screens/student/StudentClassesScreen';
import { ClassDetailScreen } from './src/screens/class/ClassDetailScreen';
import { ProfileScreen } from './src/screens/profile/ProfileScreen';

export default function App() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Global Theme & DB State
  const [isDark, setIsDark] = useState(false);
  const [db, setDb] = useState<AppDatabase>(createInitialSeed);
  const colors = isDark ? darkColors : lightColors;

  // Auth State
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [pendingUser, setPendingUser] = useState<Profile | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup' | 'verify' | 'forgot'>('login');
  const [authLoading, setAuthLoading] = useState(false);

  // Navigation State
  const [screen, setScreen] = useState<ScreenName>('classes');
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [classTab, setClassTab] = useState<ClassTabKey>('notices');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (msg: string, type: 'success' | 'danger' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToast({ id, msg, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3000);
  };

  // Auth Handlers
  const handleLogin = async (email: string, pass: string, role: UserRole) => {
    setAuthLoading(true);
    // Find matching profile in local store or Supabase
    const user = db.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );

    if (user) {
      if (user.status === 'inactive') {
        showToast('Your account has been deactivated by the institute admin.', 'danger');
        setAuthLoading(false);
        return;
      }
      setCurrentUser(user);
      setScreen(user.role === 'admin' ? 'dashboard' : 'classes');
      setActiveClassId(null);
      showToast(`Welcome back, ${user.name}!`, 'success');
    } else {
      // Try Supabase auth
      const { user: supUser, error } = await signInWithSupabase(email, pass);
      if (supUser) {
        setCurrentUser(supUser);
        setScreen(supUser.role === 'admin' ? 'dashboard' : 'classes');
        setActiveClassId(null);
        showToast(`Welcome back, ${supUser.name}!`, 'success');
      } else {
        showToast(error || 'No registered account found with those credentials.', 'danger');
      }
    }
    setAuthLoading(false);
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    const demoUser = db.users.find((u) => u.role === role);
    if (demoUser) {
      setCurrentUser(demoUser);
      setScreen(role === 'admin' ? 'dashboard' : 'classes');
      setActiveClassId(null);
      showToast(`Logged in as ${demoUser.name} (${role})`, 'success');
    }
  };

  const handleSignup = async (name: string, email: string, pass: string, role: UserRole) => {
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      showToast('An account with this email already exists.', 'danger');
      return;
    }

    setAuthLoading(true);
    const { user: newUser } = await signUpWithSupabase(email, pass, name, role);
    if (newUser) {
      setDb((prev) => ({
        ...prev,
        users: [...prev.users, newUser],
      }));
      setPendingUser(newUser);
      setAuthView('verify');
      showToast('Account created. Please verify your email.', 'info');
    }
    setAuthLoading(false);
  };

  const handleVerifyEmail = () => {
    if (pendingUser) {
      setCurrentUser(pendingUser);
      setPendingUser(null);
      setScreen(pendingUser.role === 'admin' ? 'dashboard' : 'classes');
      showToast('Email verified! You are now logged in.', 'success');
    }
  };

  const handleResetPassword = async (email: string) => {
    await resetPasswordWithSupabase(email);
    showToast(`Password reset link sent to ${email}.`, 'info');
  };

  const handleLogout = async () => {
    await signOutWithSupabase();
    setCurrentUser(null);
    setActiveClassId(null);
    setAuthView('login');
    setMobileDrawerOpen(false);
    showToast('You have been logged out.', 'info');
  };

  // Profile Handlers
  const handleUpdateName = (newName: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, name: newName };
    setCurrentUser(updated);
    setDb((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === currentUser.id ? updated : u)),
    }));
    showToast('Display name updated successfully.', 'success');
  };

  const handleJoinInstitute = (code: string) => {
    if (code === db.institute.code) {
      showToast(`Successfully connected to ${db.institute.name}!`, 'success');
    } else {
      showToast('Invalid institute code. Please verify with your admin.', 'danger');
    }
  };

  const handleDeleteAccount = () => {
    if (!currentUser) return;
    setDb((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== currentUser.id),
      classes: prev.classes.map((c) => ({
        ...c,
        teacherId: c.teacherId === currentUser.id ? '' : c.teacherId,
        studentIds: c.studentIds.filter((sid) => sid !== currentUser.id),
      })),
    }));
    handleLogout();
  };

  // Class Management Handlers
  const handleCreateClass = (name: string, subject: string) => {
    if (!currentUser) return;
    const newClass = {
      id: uid('c'),
      name,
      subject,
      joinCode: genCode(6),
      teacherId: currentUser.id,
      studentIds: [],
      createdAt: new Date().toISOString(),
    };
    setDb((prev) => ({
      ...prev,
      classes: [newClass, ...prev.classes],
      classSubjects: {
        ...prev.classSubjects,
        [newClass.id]: [subject],
      },
    }));
    showToast(`Class "${name}" created! Share join code: ${newClass.joinCode}`, 'success');
  };

  const handleJoinClass = (code: string) => {
    if (!currentUser) return;
    const targetClass = db.classes.find((c) => c.joinCode.toLowerCase() === code.toLowerCase());
    if (!targetClass) {
      showToast('No class found with that 6-digit join code.', 'danger');
      return;
    }
    if (targetClass.studentIds.includes(currentUser.id)) {
      showToast("You're already enrolled in this class.", 'info');
      return;
    }

    setDb((prev) => ({
      ...prev,
      classes: prev.classes.map((c) =>
        c.id === targetClass.id ? { ...c, studentIds: [...c.studentIds, currentUser.id] } : c
      ),
    }));
    showToast(`Successfully enrolled in ${targetClass.name}!`, 'success');
  };

  // Notice Handlers
  const handleAddNotice = (n: Omit<Notice, 'id' | 'classId' | 'date'>) => {
    if (!activeClassId) return;
    const newNotice: Notice = {
      id: uid('n'),
      classId: activeClassId,
      date: new Date().toISOString(),
      ...n,
    };
    setDb((prev) => ({
      ...prev,
      notices: [newNotice, ...prev.notices],
    }));
    showToast(n.scheduledFor ? 'Notice scheduled for future release.' : 'Notice posted.', 'success');
  };

  const handleUpdateNotice = (id: string, patch: Partial<Notice>) => {
    setDb((prev) => ({
      ...prev,
      notices: prev.notices.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }));
    showToast('Notice updated.', 'success');
  };

  const handleDeleteNotice = (id: string) => {
    setDb((prev) => ({
      ...prev,
      notices: prev.notices.filter((n) => n.id !== id),
    }));
    showToast('Notice deleted.', 'info');
  };

  // Resource Handlers
  const handleAddResource = (r: Omit<Resource, 'id' | 'classId' | 'date'>) => {
    if (!activeClassId) return;
    const newRes: Resource = {
      id: uid('r'),
      classId: activeClassId,
      date: new Date().toISOString(),
      ...r,
    };
    setDb((prev) => ({
      ...prev,
      resources: [newRes, ...prev.resources],
    }));
    showToast(r.scheduledFor ? 'Resource scheduled.' : 'Resource shared with class.', 'success');
  };

  const handleUpdateResource = (id: string, patch: Partial<Resource>) => {
    setDb((prev) => ({
      ...prev,
      resources: prev.resources.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
    showToast('Resource updated.', 'success');
  };

  const handleDeleteResource = (id: string) => {
    setDb((prev) => ({
      ...prev,
      resources: prev.resources.filter((r) => r.id !== id),
    }));
    showToast('Resource deleted.', 'info');
  };

  const handleAddLabel = (lbl: string) => {
    if (db.resourceLabels.includes(lbl)) return;
    setDb((prev) => ({
      ...prev,
      resourceLabels: [...prev.resourceLabels, lbl],
    }));
    showToast(`Label "${lbl}" created.`, 'success');
  };

  const handleRemoveLabel = (lbl: string) => {
    setDb((prev) => ({
      ...prev,
      resourceLabels: prev.resourceLabels.filter((l) => l !== lbl),
    }));
  };

  // Assignment Handlers
  const handleAddAssignment = (a: Omit<Assignment, 'id' | 'classId' | 'submissions'>) => {
    if (!activeClassId) return;
    const newAssignment: Assignment = {
      id: uid('a'),
      classId: activeClassId,
      submissions: [],
      ...a,
    };
    setDb((prev) => ({
      ...prev,
      assignments: [newAssignment, ...prev.assignments],
    }));
    showToast('Assignment published to class.', 'success');
  };

  const handleUpdateAssignment = (id: string, patch: Partial<Assignment>) => {
    setDb((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
    showToast('Assignment updated.', 'success');
  };

  const handleDeleteAssignment = (id: string) => {
    setDb((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.id !== id),
    }));
    showToast('Assignment deleted.', 'info');
  };

  const handleSubmitAssignment = (
    assignmentId: string,
    sub: Omit<AssignmentSubmission, 'submittedAt'>
  ) => {
    const fullSub: AssignmentSubmission = {
      ...sub,
      submittedAt: new Date().toISOString(),
    };
    setDb((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) => {
        if (a.id !== assignmentId) return a;
        const otherSubs = a.submissions.filter((s) => s.studentId !== sub.studentId);
        return { ...a, submissions: [...otherSubs, fullSub] };
      }),
    }));
    showToast('Assignment submitted successfully!', 'success');
  };

  const handleReviewSubmission = (
    assignmentId: string,
    studentId: string,
    patch: Partial<AssignmentSubmission>
  ) => {
    setDb((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) => {
        if (a.id !== assignmentId) return a;
        return {
          ...a,
          submissions: a.submissions.map((s) =>
            s.studentId === studentId ? { ...s, ...patch } : s
          ),
        };
      }),
    }));
  };

  // Attendance Handlers
  const handleSaveAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    setDb((prev) => {
      const existsIndex = prev.attendance.findIndex(
        (a) => a.classId === record.classId && a.date === record.date && a.subject === record.subject
      );
      if (existsIndex >= 0) {
        const updated = [...prev.attendance];
        updated[existsIndex] = { ...updated[existsIndex], ...record };
        return { ...prev, attendance: updated };
      }
      const newRec: AttendanceRecord = {
        id: uid('att'),
        ...record,
      };
      return { ...prev, attendance: [newRec, ...prev.attendance] };
    });
    showToast(`Attendance saved for ${record.subject}.`, 'success');
  };

  const handleAddClassSubject = (newSubj: string) => {
    if (!activeClassId) return;
    setDb((prev) => ({
      ...prev,
      classSubjects: {
        ...prev.classSubjects,
        [activeClassId]: [...(prev.classSubjects[activeClassId] || []), newSubj],
      },
    }));
    showToast(`Subject "${newSubj}" added to class periods.`, 'success');
  };

  // Exam Handlers
  const handleAddExam = (
    exam: Omit<Exam, 'id' | 'classId' | 'attempts' | 'resultsReleased'>
  ) => {
    if (!activeClassId) return;
    const newExam: Exam = {
      id: uid('e'),
      classId: activeClassId,
      attempts: [],
      resultsReleased: false,
      ...exam,
    };
    setDb((prev) => ({
      ...prev,
      exams: [newExam, ...prev.exams],
    }));
    showToast('MCQ Exam created and scheduled.', 'success');
  };

  const handleUpdateExam = (id: string, patch: Partial<Exam>) => {
    setDb((prev) => ({
      ...prev,
      exams: prev.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
    showToast('Exam updated.', 'success');
  };

  const handleDeleteExam = (id: string) => {
    setDb((prev) => ({
      ...prev,
      exams: prev.exams.filter((e) => e.id !== id),
    }));
    showToast('Exam deleted.', 'info');
  };

  const handleSubmitAttempt = (examId: string, attempt: ExamAttempt) => {
    setDb((prev) => ({
      ...prev,
      exams: prev.exams.map((e) => {
        if (e.id !== examId) return e;
        const otherAttempts = e.attempts.filter((a) => a.studentId !== attempt.studentId);
        return { ...e, attempts: [...otherAttempts, attempt] };
      }),
    }));
    showToast(
      attempt.cheatFlag
        ? 'Exam auto-submitted after repeated violations.'
        : 'Exam submitted successfully!',
      attempt.cheatFlag ? 'danger' : 'success'
    );
  };

  const handleToggleReleaseResults = (examId: string) => {
    setDb((prev) => ({
      ...prev,
      exams: prev.exams.map((e) =>
        e.id === examId ? { ...e, resultsReleased: !e.resultsReleased } : e
      ),
    }));
  };

  const handleRemoveStudent = (studentId: string) => {
    if (!activeClassId) return;
    setDb((prev) => ({
      ...prev,
      classes: prev.classes.map((c) =>
        c.id === activeClassId
          ? { ...c, studentIds: c.studentIds.filter((sid) => sid !== studentId) }
          : c
      ),
    }));
    showToast('Student removed from class.', 'info');
  };

  // Filter user classes
  const myClasses = db.classes.filter((c) =>
    currentUser?.role === 'teacher'
      ? c.teacherId === currentUser.id
      : currentUser?.role === 'student'
      ? c.studentIds.includes(currentUser.id)
      : true
  );

  const activeClass = db.classes.find((c) => c.id === activeClassId) || null;

  // Title generator
  const getHeaderTitle = () => {
    if (activeClass) return `${activeClass.name}`;
    switch (screen) {
      case 'dashboard':
        return 'Admin Dashboard';
      case 'classes':
        return currentUser?.role === 'admin' ? 'Institute Classes' : 'My Classes';
      case 'teachers':
        return 'Teacher Directory';
      case 'students':
        return 'Student Directory';
      case 'reports':
        return 'Institute Reports';
      case 'profile':
        return 'User Profile';
      default:
        return 'ClassDesk';
    }
  };

  // RENDER: Unauthenticated Flow
  if (!currentUser) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        {authView === 'login' && (
          <LoginScreen
            onLogin={handleLogin}
            onQuickDemoLogin={handleQuickDemoLogin}
            onGoSignup={() => setAuthView('signup')}
            onGoForgot={() => setAuthView('forgot')}
            isDark={isDark}
            isLoading={authLoading}
          />
        )}
        {authView === 'signup' && (
          <SignupScreen
            onSignup={handleSignup}
            onGoLogin={() => setAuthView('login')}
            isDark={isDark}
            isLoading={authLoading}
          />
        )}
        {authView === 'verify' && (
          <VerifyScreen
            pendingUser={pendingUser}
            onVerify={handleVerifyEmail}
            onResend={() => showToast('Verification email resent.', 'info')}
            isDark={isDark}
          />
        )}
        {authView === 'forgot' && (
          <ForgotScreen
            onResetPassword={handleResetPassword}
            onGoLogin={() => setAuthView('login')}
            isDark={isDark}
            isLoading={authLoading}
          />
        )}
        <Toast toast={toast} isDark={isDark} />
      </SafeAreaView>
    );
  }

  // RENDER: Authenticated App Flow
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.appShell}>
        {/* Sidebar (Permanent on Desktop, Drawer on Mobile) */}
        <Sidebar
          role={currentUser.role}
          screen={screen}
          setScreen={(s) => {
            setScreen(s);
            setActiveClassId(null);
          }}
          activeClass={activeClass}
          classTab={classTab}
          setClassTab={setClassTab}
          onBackToClasses={() => {
            setActiveClassId(null);
            setScreen('classes');
          }}
          instituteName={db.institute.name}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          isMobile={isMobile}
          mobileOpen={mobileDrawerOpen}
          onCloseMobile={() => setMobileDrawerOpen(false)}
        />

        {/* Main Content Area */}
        <View style={styles.mainContent}>
          <Topbar
            user={currentUser}
            title={getHeaderTitle()}
            isDark={isDark}
            isMobile={isMobile}
            onToggleSidebar={() => {
              if (isMobile) {
                setMobileDrawerOpen(true);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
            onToggleTheme={() => setIsDark(!isDark)}
          />

          <View style={[styles.bodyContainer, { padding: isMobile ? 14 : 24 }]}>
            {/* ADMIN SCREENS */}
            {currentUser.role === 'admin' && !activeClass && (
              <>
                {screen === 'dashboard' && <AdminDashboardScreen db={db} isDark={isDark} />}
                {screen === 'classes' && (
                  <AdminClassesScreen
                    db={db}
                    onRemoveTeacher={(cId) => {
                      setDb((prev) => ({
                        ...prev,
                        classes: prev.classes.map((c) => (c.id === cId ? { ...c, teacherId: '' } : c)),
                      }));
                      showToast('Teacher unassigned from class.', 'info');
                    }}
                    isDark={isDark}
                  />
                )}
                {screen === 'teachers' && (
                  <AdminPeopleScreen
                    db={db}
                    role="teacher"
                    onToggleStatus={(uId) => {
                      setDb((prev) => ({
                        ...prev,
                        users: prev.users.map((u) =>
                          u.id === uId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
                        ),
                      }));
                    }}
                    onRemoveUser={(uId) => {
                      setDb((prev) => ({
                        ...prev,
                        users: prev.users.filter((u) => u.id !== uId),
                        classes: prev.classes.map((c) => ({
                          ...c,
                          teacherId: c.teacherId === uId ? '' : c.teacherId,
                        })),
                      }));
                      showToast('Teacher removed from institute.', 'info');
                    }}
                    isDark={isDark}
                  />
                )}
                {screen === 'students' && (
                  <AdminPeopleScreen
                    db={db}
                    role="student"
                    onToggleStatus={(uId) => {
                      setDb((prev) => ({
                        ...prev,
                        users: prev.users.map((u) =>
                          u.id === uId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
                        ),
                      }));
                    }}
                    onRemoveUser={(uId) => {
                      setDb((prev) => ({
                        ...prev,
                        users: prev.users.filter((u) => u.id !== uId),
                        classes: prev.classes.map((c) => ({
                          ...c,
                          studentIds: c.studentIds.filter((sid) => sid !== uId),
                        })),
                      }));
                      showToast('Student removed from institute.', 'info');
                    }}
                    isDark={isDark}
                  />
                )}
                {screen === 'reports' && <AdminReportsScreen db={db} isDark={isDark} />}
              </>
            )}

            {/* TEACHER CLASSES LIST */}
            {currentUser.role === 'teacher' && screen === 'classes' && !activeClass && (
              <TeacherClassesScreen
                classes={myClasses}
                user={currentUser}
                onOpenClass={(cId) => {
                  setActiveClassId(cId);
                  setClassTab('notices');
                }}
                onCreateClass={handleCreateClass}
                isDark={isDark}
              />
            )}

            {/* STUDENT CLASSES LIST */}
            {currentUser.role === 'student' && screen === 'classes' && !activeClass && (
              <StudentClassesScreen
                classes={myClasses}
                user={currentUser}
                teacherProfiles={db.users.filter((u) => u.role === 'teacher')}
                onOpenClass={(cId) => {
                  setActiveClassId(cId);
                  setClassTab('notices');
                }}
                onJoinClass={handleJoinClass}
                isDark={isDark}
              />
            )}

            {/* CLASS DETAIL VIEW */}
            {activeClass && (
              <ClassDetailScreen
                cls={activeClass}
                tab={classTab}
                setTab={setClassTab}
                user={currentUser}
                teacherProfiles={db.users.filter((u) => u.role === 'teacher')}
                users={db.users}
                notices={db.notices}
                resources={db.resources}
                resourceLabels={db.resourceLabels}
                assignments={db.assignments}
                attendance={db.attendance}
                classSubjects={db.classSubjects[activeClass.id] || [activeClass.subject]}
                exams={db.exams}
                onAddNotice={handleAddNotice}
                onUpdateNotice={handleUpdateNotice}
                onDeleteNotice={handleDeleteNotice}
                onAddResource={handleAddResource}
                onUpdateResource={handleUpdateResource}
                onDeleteResource={handleDeleteResource}
                onAddLabel={handleAddLabel}
                onRemoveLabel={handleRemoveLabel}
                onAddAssignment={handleAddAssignment}
                onUpdateAssignment={handleUpdateAssignment}
                onDeleteAssignment={handleDeleteAssignment}
                onSubmitAssignment={handleSubmitAssignment}
                onReviewSubmission={handleReviewSubmission}
                onSaveAttendance={handleSaveAttendance}
                onAddSubject={handleAddClassSubject}
                onAddExam={handleAddExam}
                onUpdateExam={handleUpdateExam}
                onDeleteExam={handleDeleteExam}
                onSubmitAttempt={handleSubmitAttempt}
                onToggleReleaseResults={handleToggleReleaseResults}
                onRemoveStudent={handleRemoveStudent}
                isDark={isDark}
              />
            )}

            {/* USER PROFILE */}
            {screen === 'profile' && !activeClass && (
              <ProfileScreen
                user={currentUser}
                institute={db.institute}
                classes={myClasses}
                onUpdateName={handleUpdateName}
                onJoinInstitute={handleJoinInstitute}
                onDeleteAccount={handleDeleteAccount}
                isDark={isDark}
              />
            )}
          </View>
        </View>
      </View>

      <Toast toast={toast} isDark={isDark} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    height: '100%',
  },
  appShell: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
    minWidth: 0,
  },
  bodyContainer: {
    flex: 1,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
});
