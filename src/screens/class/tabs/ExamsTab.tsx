import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Modal as RNModal } from 'react-native';
import {
  Brain,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  AlertTriangle,
  Eye,
  EyeOff,
  Trophy,
  Activity,
  ListChecks,
  Lock,
  Maximize,
  X,
  Check,
  Copy,
  Clipboard,
} from 'lucide-react-native';
import {
  Exam,
  ExamQuestion,
  ExamAttempt,
  ExamViolation,
  ClassItem,
  Profile,
} from '../../../types';
import { fmtDateTime, fmtClock, uid } from '../../../services/dataStore';
import { lightColors, darkColors, radius, spacing } from '../../../theme';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Field, Input } from '../../../components/common/Input';
import { Stamp, StampTone } from '../../../components/common/Stamp';
import { RowActions } from '../../../components/common/RowActions';
import { EmptyState } from '../../../components/common/EmptyState';
import { SearchBar } from '../../../components/common/SearchBar';

interface ExamsTabProps {
  cls: ClassItem;
  exams: Exam[];
  users: Profile[];
  isTeacher: boolean;
  userId: string;
  onAddExam: (exam: Omit<Exam, 'id' | 'classId' | 'attempts' | 'resultsReleased'>) => void;
  onUpdateExam: (id: string, patch: Partial<Exam>) => void;
  onDeleteExam: (id: string) => void;
  onSubmitAttempt: (examId: string, attempt: ExamAttempt) => void;
  onToggleReleaseResults: (examId: string) => void;
  isDark?: boolean;
}

export const ExamsTab: React.FC<ExamsTabProps> = ({
  cls,
  exams,
  users,
  isTeacher,
  userId,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
  onSubmitAttempt,
  onToggleReleaseResults,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Upcoming' | 'Closed'>('All');

  // Teacher Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [leaderboardExam, setLeaderboardExam] = useState<Exam | null>(null);
  const [viewQuestionPaperExam, setViewQuestionPaperExam] = useState<Exam | null>(null);
  const [viewAttemptDetails, setViewAttemptDetails] = useState<{ exam: Exam; attempt: ExamAttempt } | null>(null);
  const [viewViolationLog, setViewViolationLog] = useState<{ studentName: string; attempt: ExamAttempt } | null>(null);

  // Student Modals
  const [takingExam, setTakingExam] = useState<Exam | null>(null);
  const [viewingResult, setViewingResult] = useState<{ exam: Exam; attempt: ExamAttempt } | null>(null);

  // Teacher Form State
  const [examTitle, setExamTitle] = useState('');
  const [examDuration, setExamDuration] = useState('15');
  const [examStartTime, setExamStartTime] = useState('');
  const [examEndTime, setExamEndTime] = useState('');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [formError, setFormError] = useState('');
  const [copiedPaper, setCopiedPaper] = useState(false);
  const [copiedQId, setCopiedQId] = useState<string | null>(null);

  // Student Exam Mode State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<number[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [warningFlash, setWarningFlash] = useState<string | null>(null);
  const [isInFullscreen, setIsInFullscreen] = useState<boolean>(true);
  const examStartTimeRef = useRef<number>(0);
  const violationsRef = useRef<ExamViolation[]>([]);
  const isSubmittedRef = useRef<boolean>(false);
  const studentAnswersRef = useRef<number[]>([]);
  const warningCountRef = useRef<number>(0);
  const takingExamRef = useRef<Exam | null>(null);

  studentAnswersRef.current = studentAnswers;
  warningCountRef.current = warningCount;
  takingExamRef.current = takingExam;

  const getExamStatus = (ex: Exam): 'upcoming' | 'active' | 'closed' => {
    const now = Date.now();
    const start = new Date(ex.startTime).getTime();
    const end = new Date(ex.endTime).getTime();
    if (now < start) return 'upcoming';
    if (now > end) return 'closed';
    return 'active';
  };

  // Open Teacher Create
  const openCreate = () => {
    setExamTitle('');
    setExamDuration('15');
    const now = new Date();
    const start = new Date(now.getTime() + 10 * 60000).toISOString().slice(0, 16);
    const end = new Date(now.getTime() + 120 * 60000).toISOString().slice(0, 16);
    setExamStartTime(start);
    setExamEndTime(end);
    setQuestions([
      {
        id: uid('q'),
        q: '',
        options: ['', '', '', ''],
        correct: 0,
      },
    ]);
    setFormError('');
    setShowCreateModal(true);
  };

  // Open Teacher Edit
  const openEdit = (ex: Exam) => {
    setEditingExam(ex);
    setExamTitle(ex.title);
    setExamDuration(String(ex.duration));
    setExamStartTime(ex.startTime.slice(0, 16));
    setExamEndTime(ex.endTime.slice(0, 16));
    setQuestions(ex.questions.map((q) => ({ ...q, options: [...q.options] })));
    setFormError('');
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: uid('q'), q: '', options: ['', '', '', ''], correct: 0 },
    ]);
  };

  const handleUpdateQuestion = (qId: string, patch: Partial<ExamQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === qId ? { ...q, ...patch } : q)));
  };

  const handleUpdateOption = (qId: string, optIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const newOpts = [...q.options];
        newOpts[optIndex] = text;
        return { ...q, options: newOpts };
      })
    );
  };

  const handleRemoveQuestion = (qId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  // Teacher helper: duplicate a question
  const handleDuplicateQuestion = (idx: number) => {
    const target = questions[idx];
    if (!target) return;
    const dup: ExamQuestion = {
      id: uid('q'),
      q: target.q,
      options: [...target.options],
      correct: target.correct,
    };
    const updated = [...questions];
    updated.splice(idx + 1, 0, dup);
    setQuestions(updated);
  };

  // Teacher helper: smart paste into question from clipboard
  const handlePasteIntoQuestion = async (qId: string) => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
      try {
        const raw = await navigator.clipboard.readText();
        if (!raw || !raw.trim()) return;

        const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length === 0) return;

        const qText = lines[0].replace(/^(q(uestion)?\s*\d*[:.)-]?\s*)/i, '').trim();
        const optLines = lines.slice(1);
        const cleanOpts = optLines.map((l) => l.replace(/^([a-d\d][.:)]\s*)/i, '').trim());

        setQuestions((prev) =>
          prev.map((q) => {
            if (q.id !== qId) return q;
            const newOpts = [...q.options];
            for (let i = 0; i < 4; i++) {
              if (cleanOpts[i] !== undefined) {
                newOpts[i] = cleanOpts[i];
              }
            }
            return {
              ...q,
              q: qText || q.q,
              options: newOpts,
            };
          })
        );
      } catch (e) {}
    }
  };

  // Teacher helper: copy entire formatted question paper to clipboard
  const handleCopyQuestionPaper = (exam: Exam) => {
    const formatted = [
      `${exam.title} — Question Paper`,
      `Class: ${cls.name}`,
      `Duration: ${exam.duration} mins`,
      `Total Questions: ${exam.questions.length}`,
      '',
      ...exam.questions.map((q, idx) => {
        return [
          `Q${idx + 1}. ${q.q}`,
          ...q.options.map(
            (opt, oi) =>
              `   ${String.fromCharCode(65 + oi)}. ${opt}${oi === q.correct ? ' (Correct Answer)' : ''}`
          ),
          '',
        ].join('\n');
      }),
    ].join('\n');

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(formatted);
      setCopiedPaper(true);
      setTimeout(() => setCopiedPaper(false), 2000);
    }
  };

  // Teacher helper: copy single question to clipboard
  const handleCopySingleQuestion = (q: ExamQuestion, idx: number) => {
    const formatted = [
      `Q${idx + 1}. ${q.q}`,
      ...q.options.map(
        (opt, oi) =>
          `   ${String.fromCharCode(65 + oi)}. ${opt}${oi === q.correct ? ' (Correct Answer)' : ''}`
      ),
    ].join('\n');

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(formatted);
      setCopiedQId(q.id);
      setTimeout(() => setCopiedQId(null), 2000);
    }
  };

  const handleSaveExam = () => {
    if (!examTitle.trim()) {
      setFormError('Please enter an exam title.');
      return;
    }
    if (!examStartTime || !examEndTime) {
      setFormError('Please configure exam start and end times.');
      return;
    }
    const validQuestions = questions.filter(
      (q) => q.q.trim() && q.options.every((o) => o.trim())
    );
    if (validQuestions.length === 0) {
      setFormError('Please complete at least one question with all 4 answer options.');
      return;
    }
    setFormError('');

    if (editingExam) {
      onUpdateExam(editingExam.id, {
        title: examTitle.trim(),
        duration: Number(examDuration) || 15,
        startTime: new Date(examStartTime).toISOString(),
        endTime: new Date(examEndTime).toISOString(),
        questions: validQuestions,
      });
      setEditingExam(null);
    } else {
      onAddExam({
        authorId: userId,
        title: examTitle.trim(),
        duration: Number(examDuration) || 15,
        startTime: new Date(examStartTime).toISOString(),
        endTime: new Date(examEndTime).toISOString(),
        questions: validQuestions,
      });
      setShowCreateModal(false);
    }
  };

  // Helper to re-enter fullscreen and lock the Escape key
  const reEnterFullscreen = async () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
        if ('keyboard' in navigator && typeof (navigator as any).keyboard?.lock === 'function') {
          await (navigator as any).keyboard.lock(['Escape']);
        }
        setIsInFullscreen(true);
      } catch (e) {
        // User gesture may be required
      }
    }
  };

  // Student Start Exam
  const handleStartExam = async (ex: Exam) => {
    setTakingExam(ex);
    setCurrentQuestionIndex(0);
    setStudentAnswers(new Array(ex.questions.length).fill(-1));
    setSecondsRemaining(ex.duration * 60);
    setWarningCount(0);
    setWarningFlash(null);
    setIsInFullscreen(true);
    examStartTimeRef.current = Date.now();
    violationsRef.current = [];
    isSubmittedRef.current = false;

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        await document.documentElement.requestFullscreen();
        if ('keyboard' in navigator && typeof (navigator as any).keyboard?.lock === 'function') {
          await (navigator as any).keyboard.lock(['Escape']);
        }
      } catch (e) {}
    }
  };

  // Finish exam attempt
  const finishAttempt = (cheatFlag: boolean, finalWarnings?: number) => {
    const exam = takingExamRef.current;
    if (isSubmittedRef.current || !exam) return;
    isSubmittedRef.current = true;

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      if ('keyboard' in navigator && typeof (navigator as any).keyboard?.unlock === 'function') {
        try {
          (navigator as any).keyboard.unlock();
        } catch (e) {}
      }
      if (document.fullscreenElement) {
        try {
          document.exitFullscreen().catch(() => {});
        } catch (e) {}
      }
    }

    const answers = studentAnswersRef.current;
    const warnings = finalWarnings !== undefined ? finalWarnings : warningCountRef.current;
    let score = 0;
    exam.questions.forEach((question, idx) => {
      if (answers[idx] === question.correct) {
        score += 1;
      }
    });

    const timeTaken = Math.round((Date.now() - examStartTimeRef.current) / 1000);

    const attempt: ExamAttempt = {
      studentId: userId,
      answers,
      score,
      warnings,
      cheatFlag,
      violations: violationsRef.current,
      submittedAt: new Date().toISOString(),
      timeTakenSec: timeTaken,
    };

    onSubmitAttempt(exam.id, attempt);
    setTakingExam(null);
  };

  // Exam Timer Countdown (Clean 1-second interval without recreating on answer change)
  useEffect(() => {
    if (!takingExam) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishAttempt(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [takingExam]);

  // Anti-Cheat Event Listeners (Tab change, window blur, fullscreen exit, ESC trap, Copy/Paste block)
  useEffect(() => {
    if (!takingExam || Platform.OS !== 'web' || typeof window === 'undefined') return;

    // Lock escape key if in fullscreen
    if (document.fullscreenElement && 'keyboard' in navigator && typeof (navigator as any).keyboard?.lock === 'function') {
      (navigator as any).keyboard.lock(['Escape']).catch(() => {});
    }

    const recordViolation = (reason: string) => {
      if (isSubmittedRef.current) return;
      const violation: ExamViolation = {
        reason,
        time: new Date().toISOString(),
      };
      violationsRef.current.push(violation);

      setWarningCount((prev) => {
        const next = prev + 1;
        setWarningFlash(`Warning ${next}/3: ${reason}`);
        setTimeout(() => setWarningFlash(null), 3500);

        if (next >= 3) {
          finishAttempt(true, next);
        }
        return next;
      });
    };

    const handleVisibility = () => {
      if (document.hidden) {
        recordViolation('Switched to another tab or application window');
      }
    };

    const handleBlur = () => {
      recordViolation('Exam window lost focus (alt-tab or external monitor detected)');
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsInFullscreen(false);
        recordViolation('Exited locked full-screen mode');
        // Immediately try to bring student back to fullscreen mode
        document.documentElement
          .requestFullscreen()
          .then(() => {
            setIsInFullscreen(true);
            if ('keyboard' in navigator && typeof (navigator as any).keyboard?.lock === 'function') {
              (navigator as any).keyboard.lock(['Escape']).catch(() => {});
            }
          })
          .catch(() => {
            // Browser requires explicit user gesture; lockdown overlay modal handles it on click or keypress
          });
      } else {
        setIsInFullscreen(true);
        if ('keyboard' in navigator && typeof (navigator as any).keyboard?.lock === 'function') {
          (navigator as any).keyboard.lock(['Escape']).catch(() => {});
        }
      }
    };

    // Disallow exiting fullscreen via ESC key; disallow clipboard and developer shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        if (!document.fullscreenElement) {
          reEnterFullscreen();
        }
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key ? e.key.toLowerCase() : '';

      // Block Copy, Paste, Cut, Select-All during exam
      if (isCtrlOrCmd && (key === 'c' || key === 'v' || key === 'x' || key === 'a')) {
        e.preventDefault();
        e.stopPropagation();
        const action = key === 'c' ? 'Copying' : key === 'v' ? 'Pasting' : key === 'x' ? 'Cutting' : 'Text selection';
        recordViolation(`Attempted unauthorized clipboard action (${e.ctrlKey ? 'Ctrl' : 'Cmd'}+${key.toUpperCase()})`);
        setWarningFlash(`${action} is disabled during the exam!`);
        return;
      }

      // Block print, save, inspect shortcuts
      if (
        (isCtrlOrCmd && (key === 'p' || key === 's' || key === 'u')) ||
        (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        e.stopPropagation();
        recordViolation(`Used unauthorized shortcut (${e.key})`);
        setWarningFlash('Browser shortcut is disabled during the exam!');
        return;
      }
    };

    // Disallow copying question or answer content
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      recordViolation('Attempted to copy exam question or answers');
      setWarningFlash('Copying is prohibited during the exam!');
    };

    // Disallow cutting content
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      recordViolation('Attempted to cut content during exam');
      setWarningFlash('Cutting is prohibited during the exam!');
    };

    // Disallow pasting into exam
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      recordViolation('Attempted to paste content into exam');
      setWarningFlash('Pasting is prohibited during the exam!');
    };

    // Disallow right-click context menu (which has Copy / Paste / Inspect)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setWarningFlash('Right-click context menu is disabled during the exam.');
    };

    // Disallow drag and select
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('copy', handleCopy, true);
    document.addEventListener('cut', handleCut, true);
    document.addEventListener('paste', handlePaste, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('dragstart', handleDragStart, true);
    document.addEventListener('selectstart', handleSelectStart, true);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('copy', handleCopy, true);
      document.removeEventListener('cut', handleCut, true);
      document.removeEventListener('paste', handlePaste, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
      if ('keyboard' in navigator && typeof (navigator as any).keyboard?.unlock === 'function') {
        try {
          (navigator as any).keyboard.unlock();
        } catch (e) {}
      }
    };
  }, [takingExam, studentAnswers]);

  const classExams = useMemo(() => {
    return exams
      .filter((e) => e.classId === cls.id)
      .filter((e) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          if (!e.title.toLowerCase().includes(q)) return false;
        }

        // Status filter
        if (statusFilter === 'All') return true;
        const status = getExamStatus(e);
        if (statusFilter === 'Active') return status === 'active';
        if (statusFilter === 'Upcoming') return status === 'upcoming';
        if (statusFilter === 'Closed') return status === 'closed';
        return true;
      })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [exams, cls.id, searchQuery, statusFilter]);

  return (
    <View style={{ gap: spacing.md }}>
      {/* Search & Action Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: spacing.sm,
        }}
      >
        <View style={{ flex: 1, minWidth: 200 }}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exams by title..."
            isDark={isDark}
          />
        </View>

        {isTeacher && (
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onPress={openCreate}
            isDark={isDark}
          >
            Create MCQ Exam
          </Button>
        )}
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {(['All', 'Active', 'Upcoming', 'Closed'] as const).map((filter) => {
            const isSelected = statusFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setStatusFilter(filter)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: radius.md,
                  backgroundColor: isSelected ? colors.brandTint : colors.surface2,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.brand : colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 12.5,
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected ? colors.brandDark : colors.inkSoft,
                  }}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Exams Feed */}
      {classExams.length === 0 ? (
        <EmptyState
          icon={Brain}
          title={searchQuery || statusFilter !== 'All' ? 'No matching exams' : 'No exams created'}
          hint={
            searchQuery || statusFilter !== 'All'
              ? 'No exams found matching your current filter settings.'
              : isTeacher
              ? 'Create online MCQ quizzes with anti-cheat lockdown & auto grading.'
              : 'No active or upcoming exams scheduled in this class.'
          }
          actionLabel={
            searchQuery || statusFilter !== 'All'
              ? 'Reset Filters'
              : isTeacher
              ? 'Create MCQ Exam'
              : undefined
          }
          onAction={
            searchQuery || statusFilter !== 'All'
              ? () => {
                  setSearchQuery('');
                  setStatusFilter('All');
                }
              : isTeacher
              ? openCreate
              : undefined
          }
          isDark={isDark}
        />
      ) : (
        classExams.map((exam) => {
          const status = getExamStatus(exam);
          const myAttempt = exam.attempts.find((a) => a.studentId === userId);
          const statusTone: StampTone =
            status === 'active' ? 'green' : status === 'upcoming' ? 'amber' : 'neutral';

          return (
            <Card key={exam.id} isDark={isDark}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, paddingRight: spacing.sm }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
                    {exam.title}
                  </Text>
                  <Text style={{ fontSize: 12.5, color: colors.inkSoft, marginTop: 2 }}>
                    {exam.questions.length} questions • {exam.duration} mins • Opens {fmtDateTime(exam.startTime)}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Stamp tone={statusTone} isDark={isDark}>
                    {status}
                  </Stamp>
                  {isTeacher && (
                    <RowActions
                      onEdit={() => openEdit(exam)}
                      onDelete={() => onDeleteExam(exam.id)}
                      isDark={isDark}
                    />
                  )}
                </View>
              </View>

              {/* Action Buttons */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: spacing.md,
                  paddingTop: spacing.sm,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  flexWrap: 'wrap',
                  gap: spacing.sm,
                }}
              >
                {isTeacher ? (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Trophy size={15} color={colors.brandDark} />
                      <Text style={{ fontSize: 13, color: colors.inkSoft, fontWeight: '500' }}>
                        {exam.attempts.length} submission(s)
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={ListChecks}
                        onPress={() => setViewQuestionPaperExam(exam)}
                        isDark={isDark}
                      >
                        Question Paper
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={Trophy}
                        onPress={() => setLeaderboardExam(exam)}
                        isDark={isDark}
                      >
                        Leaderboard
                      </Button>
                    </View>
                  </>
                ) : (
                  <>
                    {myAttempt ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={15} color="#1E7A52" />
                        <Text style={{ fontSize: 13, color: '#1E7A52', fontWeight: '600' }}>
                          Submitted
                        </Text>
                      </View>
                    ) : (
                      <Text style={{ fontSize: 12.5, color: colors.inkSoft }}>
                        {status === 'active'
                          ? 'Exam is live now'
                          : status === 'upcoming'
                          ? 'Starts ' + fmtDateTime(exam.startTime)
                          : 'Exam window closed'}
                      </Text>
                    )}

                    {myAttempt ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={exam.resultsReleased ? Eye : Lock}
                        onPress={() => setViewingResult({ exam, attempt: myAttempt })}
                        isDark={isDark}
                      >
                        {exam.resultsReleased ? `View Result (${myAttempt.score}/${exam.questions.length})` : 'Status: Under Review'}
                      </Button>
                    ) : status === 'active' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={Brain}
                        onPress={() => handleStartExam(exam)}
                        isDark={isDark}
                      >
                        Start Exam Now
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" disabled isDark={isDark}>
                        {status === 'upcoming' ? 'Upcoming' : 'Closed'}
                      </Button>
                    )}
                  </>
                )}
              </View>
            </Card>
          );
        })
      )}

      {/* TEACHER: Create / Edit MCQ Exam Modal */}
      {(showCreateModal || editingExam) && (
        <Modal
          title={editingExam ? 'Edit MCQ Exam' : 'Create New MCQ Exam'}
          onClose={() => {
            setShowCreateModal(false);
            setEditingExam(null);
          }}
          wide
          isDark={isDark}
        >
          <Field
            label="Exam Title"
            error={formError && !examTitle.trim() ? formError : undefined}
            isDark={isDark}
          >
            <Input
              value={examTitle}
              onChangeText={(txt) => {
                setExamTitle(txt);
                if (formError) setFormError('');
              }}
              placeholder="e.g. Unit Test 1 — Reflection & Optics"
              isDark={isDark}
            />
          </Field>

          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 100 }}>
              <Field label="Duration (Minutes)" isDark={isDark}>
                <Input
                  value={examDuration}
                  onChangeText={setExamDuration}
                  placeholder="15"
                  keyboardType="numeric"
                  isDark={isDark}
                />
              </Field>
            </View>
            <View style={{ flex: 1.5, minWidth: 160 }}>
              <Field label="Start Time (Opens)" isDark={isDark}>
                <Input
                  value={examStartTime}
                  onChangeText={setExamStartTime}
                  placeholder="YYYY-MM-DDTHH:MM"
                  isDark={isDark}
                />
              </Field>
            </View>
            <View style={{ flex: 1.5, minWidth: 160 }}>
              <Field label="End Time (Closes)" isDark={isDark}>
                <Input
                  value={examEndTime}
                  onChangeText={setExamEndTime}
                  placeholder="YYYY-MM-DDTHH:MM"
                  isDark={isDark}
                />
              </Field>
            </View>
          </View>

          {/* Question Builder */}
          <View style={{ marginBottom: spacing.md }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm }}>
              Questions ({questions.length})
            </Text>

            <View style={{ gap: spacing.md }}>
              {questions.map((q, qIdx) => (
                <View
                  key={q.id}
                  style={{
                    backgroundColor: colors.surface2,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    gap: spacing.sm,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13.5, fontWeight: '700', color: colors.ink }}>
                      Question {qIdx + 1}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <TouchableOpacity
                        onPress={() => handleDuplicateQuestion(qIdx)}
                        title="Duplicate this question"
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          paddingVertical: 3,
                          paddingHorizontal: 7,
                          borderRadius: radius.sm,
                          backgroundColor: colors.surface,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Copy size={12} color={colors.inkSoft} />
                        <Text style={{ fontSize: 11, fontWeight: '600', color: colors.inkSoft }}>Duplicate</Text>
                      </TouchableOpacity>

                      {Platform.OS === 'web' && typeof navigator !== 'undefined' && (
                        <TouchableOpacity
                          onPress={() => handlePasteIntoQuestion(q.id)}
                          title="Paste question & answers from clipboard"
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                            paddingVertical: 3,
                            paddingHorizontal: 7,
                            borderRadius: radius.sm,
                            backgroundColor: colors.brandTint,
                          }}
                        >
                          <Clipboard size={12} color={colors.brandDark} />
                          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.brandDark }}>Paste</Text>
                        </TouchableOpacity>
                      )}

                      {questions.length > 1 && (
                        <TouchableOpacity
                          onPress={() => handleRemoveQuestion(q.id)}
                          style={{ padding: 4 }}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <X size={16} color={colors.danger} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <Input
                    value={q.q}
                    onChangeText={(txt) => handleUpdateQuestion(q.id, { q: txt })}
                    placeholder="Enter question text here..."
                    isDark={isDark}
                  />

                  {/* 4 MCQ Options */}
                  <View style={{ gap: 6, marginTop: 4 }}>
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = q.correct === optIdx;
                      return (
                        <View
                          key={optIdx}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: spacing.xs,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => handleUpdateQuestion(q.id, { correct: optIdx })}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              borderWidth: 2,
                              borderColor: isCorrect ? '#1E7A52' : colors.border,
                              backgroundColor: isCorrect ? '#E1F5EA' : colors.surface,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {isCorrect && <Check size={14} color="#1E7A52" />}
                          </TouchableOpacity>

                          <View style={{ flex: 1 }}>
                            <Input
                              value={opt}
                              onChangeText={(txt) => handleUpdateOption(q.id, optIdx, txt)}
                              placeholder={`Option ${optIdx + 1}`}
                              style={{ minHeight: 34, fontSize: 13 }}
                              isDark={isDark}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>

            <Button
              variant="ghost"
              size="sm"
              icon={Plus}
              onPress={handleAddQuestion}
              isDark={isDark}
              style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}
            >
              Add Question
            </Button>
          </View>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={
              !examTitle.trim() ||
              !examStartTime ||
              !examEndTime ||
              questions.some((q) => !q.q.trim() || q.options.some((o) => !o.trim()))
            }
            onPress={handleSaveExam}
            isDark={isDark}
          >
            {editingExam ? 'Save Changes' : 'Schedule Exam'}
          </Button>
        </Modal>
      )}

      {/* TEACHER: Leaderboard Modal */}
      {leaderboardExam && (
        <Modal
          title={`Leaderboard — ${leaderboardExam.title}`}
          onClose={() => setLeaderboardExam(null)}
          wide
          isDark={isDark}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md,
              flexWrap: 'wrap',
              gap: spacing.sm,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.inkSoft }}>
              {leaderboardExam.attempts.length} attempts recorded
            </Text>

            <Button
              size="sm"
              variant={leaderboardExam.resultsReleased ? 'ghost' : 'primary'}
              icon={leaderboardExam.resultsReleased ? EyeOff : Eye}
              onPress={() => onToggleReleaseResults(leaderboardExam.id)}
              isDark={isDark}
            >
              {leaderboardExam.resultsReleased ? 'Hide from Students' : 'Release Results to Students'}
            </Button>
          </View>

          {leaderboardExam.attempts.length === 0 ? (
            <EmptyState icon={Trophy} title="No student attempts submitted yet" isDark={isDark} />
          ) : (
            <View style={{ gap: spacing.xs }}>
              {[...leaderboardExam.attempts]
                .sort((a, b) => b.score - a.score || a.timeTakenSec - b.timeTakenSec)
                .map((att, rank) => {
                  const student = users.find((u) => u.id === att.studentId);
                  return (
                    <View
                      key={att.studentId}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 10,
                        paddingHorizontal: spacing.md,
                        backgroundColor: colors.surface2,
                        borderRadius: radius.md,
                        flexWrap: 'wrap',
                        gap: spacing.sm,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.inkSoft, width: 24 }}>
                          #{rank + 1}
                        </Text>
                        <View>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.ink }}>
                            {student?.name || att.studentId}
                          </Text>
                          <Text style={{ fontSize: 12, color: colors.inkSoft }}>
                            Time: {Math.floor(att.timeTakenSec / 60)}m {att.timeTakenSec % 60}s
                          </Text>
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.brandDark }}>
                          {att.score} / {leaderboardExam.questions.length}
                        </Text>

                        {att.cheatFlag ? (
                          <TouchableOpacity
                            onPress={() =>
                              setViewViolationLog({
                                studentName: student?.name || att.studentId,
                                attempt: att,
                              })
                            }
                          >
                            <Stamp tone="red" isDark={isDark}>
                              Flagged ({att.warnings})
                            </Stamp>
                          </TouchableOpacity>
                        ) : (
                          <Stamp tone="green" isDark={isDark}>
                            Clean
                          </Stamp>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onPress={() => setViewAttemptDetails({ exam: leaderboardExam, attempt: att })}
                          isDark={isDark}
                        >
                          Answer Sheet
                        </Button>
                      </View>
                    </View>
                  );
                })}
            </View>
          )}
        </Modal>
      )}

      {/* TEACHER: Question Paper View Modal */}
      {viewQuestionPaperExam && (
        <Modal
          title={`Question Paper — ${viewQuestionPaperExam.title}`}
          onClose={() => setViewQuestionPaperExam(null)}
          wide
          isDark={isDark}
        >
          {/* Header Action: Copy full paper */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md,
              flexWrap: 'wrap',
              gap: spacing.sm,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.inkSoft }}>
              {viewQuestionPaperExam.questions.length} questions • Duration: {viewQuestionPaperExam.duration}m
            </Text>

            <Button
              size="sm"
              variant={copiedPaper ? 'primary' : 'ghost'}
              icon={copiedPaper ? CheckCircle2 : Copy}
              onPress={() => handleCopyQuestionPaper(viewQuestionPaperExam)}
              isDark={isDark}
            >
              {copiedPaper ? 'Copied Full Paper!' : 'Copy Entire Paper'}
            </Button>
          </View>

          <View style={{ gap: spacing.md }}>
            {viewQuestionPaperExam.questions.map((q, idx) => (
              <View
                key={q.id}
                style={{
                  backgroundColor: colors.surface2,
                  borderRadius: radius.md,
                  padding: spacing.md,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: spacing.sm,
                  }}
                >
                  <Text
                    selectable
                    style={
                      {
                        fontSize: 14.5,
                        fontWeight: '700',
                        color: colors.ink,
                        flex: 1,
                        userSelect: 'text',
                      } as any
                    }
                  >
                    {idx + 1}. {q.q}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleCopySingleQuestion(q, idx)}
                    title="Copy Question"
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingVertical: 2,
                      paddingHorizontal: 6,
                      borderRadius: radius.sm,
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    {copiedQId === q.id ? (
                      <>
                        <Check size={12} color="#1E7A52" />
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#1E7A52' }}>Copied</Text>
                      </>
                    ) : (
                      <>
                        <Copy size={12} color={colors.inkSoft} />
                        <Text style={{ fontSize: 11, fontWeight: '600', color: colors.inkSoft }}>Copy</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={{ gap: 4, marginTop: spacing.sm }}>
                  {q.options.map((opt, oi) => {
                    const isCorrect = oi === q.correct;
                    return (
                      <View
                        key={oi}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          borderRadius: radius.sm,
                          backgroundColor: isCorrect ? '#E1F5EA' : colors.surface,
                        }}
                      >
                        <Text
                          selectable
                          style={
                            {
                              fontSize: 13,
                              fontWeight: isCorrect ? '700' : '400',
                              color: isCorrect ? '#1E7A52' : colors.ink,
                              userSelect: 'text',
                            } as any
                          }
                        >
                          {String.fromCharCode(65 + oi)}. {opt}
                        </Text>
                        {isCorrect && <CheckCircle2 size={14} color="#1E7A52" />}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </Modal>
      )}

      {/* Anti-Cheat Violation Log Modal */}
      {viewViolationLog && (
        <Modal
          title={`Activity Log — ${viewViolationLog.studentName}`}
          onClose={() => setViewViolationLog(null)}
          isDark={isDark}
        >
          <View style={{ marginBottom: spacing.md }}>
            <Stamp tone={viewViolationLog.attempt.cheatFlag ? 'red' : 'green'} isDark={isDark}>
              {viewViolationLog.attempt.cheatFlag ? 'Flagged for Cheating' : 'Clean Session'}
            </Stamp>
          </View>

          {viewViolationLog.attempt.violations.length === 0 ? (
            <EmptyState icon={ShieldAlert} title="No suspicious activity detected" isDark={isDark} />
          ) : (
            <View style={{ gap: spacing.sm }}>
              {viewViolationLog.attempt.violations.map((v, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                    backgroundColor: colors.dangerTint,
                    padding: spacing.md,
                    borderRadius: radius.md,
                  }}
                >
                  <Activity size={16} color={colors.danger} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.danger }}>
                      {v.reason}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.inkSoft, marginTop: 2 }}>
                      {fmtClock(v.time)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Modal>
      )}

      {/* STUDENT / TEACHER: Answer Sheet / Result View Modal */}
      {(viewAttemptDetails || viewingResult) && (() => {
        const item = viewAttemptDetails || viewingResult!;
        const released = isTeacher || item.exam.resultsReleased;

        if (!released) {
          return (
            <Modal
              title={`Exam Status — ${item.exam.title}`}
              onClose={() => {
                setViewAttemptDetails(null);
                setViewingResult(null);
              }}
              isDark={isDark}
            >
              <View style={{ alignItems: 'center', padding: spacing.xl, gap: spacing.sm }}>
                <Lock size={32} color={colors.brand} />
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, textAlign: 'center' }}>
                  Results Not Released Yet
                </Text>
                <Text style={{ fontSize: 13, color: colors.inkSoft, textAlign: 'center' }}>
                  Your submission was recorded on {fmtDateTime(item.attempt.submittedAt)}. Your teacher will publish final scores and answers soon.
                </Text>
              </View>
            </Modal>
          );
        }

        return (
          <Modal
            title={`Result Sheet — ${item.exam.title}`}
            onClose={() => {
              setViewAttemptDetails(null);
              setViewingResult(null);
            }}
            wide
            isDark={isDark}
          >
            {/* Score & Flag Banner */}
            <View
              style={{
                backgroundColor: colors.brandTint,
                padding: spacing.lg,
                borderRadius: radius.md,
                alignItems: 'center',
                marginBottom: spacing.md,
              }}
            >
              <Text style={{ fontSize: 28, fontWeight: '700', color: colors.brandDark }}>
                {item.attempt.score} / {item.exam.questions.length}
              </Text>
              <Text style={{ fontSize: 13, color: colors.inkSoft }}>
                Final Score • Time Taken: {Math.floor(item.attempt.timeTakenSec / 60)}m {item.attempt.timeTakenSec % 60}s
              </Text>
            </View>

            {item.attempt.cheatFlag && (
              <View
                style={{
                  backgroundColor: colors.dangerTint,
                  padding: spacing.md,
                  borderRadius: radius.md,
                  marginBottom: spacing.md,
                  gap: 4,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ShieldAlert size={16} color={colors.danger} />
                  <Text style={{ fontSize: 13.5, fontWeight: '700', color: colors.danger }}>
                    Flagged for Suspected Cheating ({item.attempt.warnings} warnings)
                  </Text>
                </View>
                {item.attempt.violations.map((v, i) => (
                  <Text key={i} style={{ fontSize: 12, color: colors.danger, marginLeft: 22 }}>
                    • {v.reason} ({fmtClock(v.time)})
                  </Text>
                ))}
              </View>
            )}

            {/* Questions Review */}
            <View style={{ gap: spacing.md }}>
              {item.exam.questions.map((q, qIdx) => {
                const studentAns = item.attempt.answers[qIdx];
                const isCorrect = studentAns === q.correct;

                return (
                  <View
                    key={q.id}
                    style={{
                      backgroundColor: colors.surface2,
                      borderRadius: radius.md,
                      padding: spacing.md,
                      gap: spacing.sm,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.ink, flex: 1 }}>
                        {qIdx + 1}. {q.q}
                      </Text>
                      {isCorrect ? (
                        <CheckCircle2 size={18} color="#1E7A52" />
                      ) : (
                        <XCircle size={18} color={colors.danger} />
                      )}
                    </View>

                    <View style={{ gap: 4 }}>
                      {q.options.map((opt, oi) => {
                        const correctOpt = oi === q.correct;
                        const chosenOpt = oi === studentAns;

                        let optBg = colors.surface;
                        let optText = colors.ink;
                        if (correctOpt) {
                          optBg = '#E1F5EA';
                          optText = '#1E7A52';
                        } else if (chosenOpt && !correctOpt) {
                          optBg = colors.dangerTint;
                          optText = colors.danger;
                        }

                        return (
                          <View
                            key={oi}
                            style={{
                              paddingVertical: 6,
                              paddingHorizontal: 10,
                              borderRadius: radius.sm,
                              backgroundColor: optBg,
                            }}
                          >
                            <Text style={{ fontSize: 13, fontWeight: correctOpt || chosenOpt ? '700' : '400', color: optText }}>
                              {String.fromCharCode(65 + oi)}. {opt} {chosenOpt ? '(Your Answer)' : ''}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          </Modal>
        );
      })()}

      {/* STUDENT: Live MCQ Exam Screen (Full-Screen Lockdown Mode) */}
      {takingExam && (() => {
        const q = takingExam.questions[currentQuestionIndex];
        const minutes = Math.floor(secondsRemaining / 60);
        const seconds = secondsRemaining % 60;
        const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        const allAnswered = studentAnswers.every((a) => a !== -1);
        const answeredCount = studentAnswers.filter((a) => a !== -1).length;

        return (
          <RNModal
            visible={true}
            animationType="fade"
            onRequestClose={() => {
              if (Platform.OS === 'web') {
                reEnterFullscreen();
              }
            }}
            transparent={false}
            statusBarTranslucent
          >
            <View
              style={[
                {
                  flex: 1,
                  width: '100%',
                  height: '100%',
                  backgroundColor: colors.bg,
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                } as any,
                Platform.OS === 'web' && ({
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100vw',
                  height: '100vh',
                  zIndex: 999999,
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                } as any),
              ]}
            >
              {/* Fullscreen Lockdown Re-entry Overlay (shown when exited fullscreen e.g. via Esc) */}
              {!isInFullscreen && (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={reEnterFullscreen}
                  style={{
                    position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 12, 35, 0.96)',
                    zIndex: 9999999,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: spacing.xl,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: radius.xl,
                      padding: spacing.xxl,
                      maxWidth: 520,
                      width: '100%',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: colors.danger,
                      shadowColor: colors.ink,
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.3,
                      shadowRadius: 20,
                      elevation: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: colors.dangerTint,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: spacing.md,
                      }}
                    >
                      <AlertTriangle size={36} color={colors.danger} />
                    </View>

                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: '800',
                        color: colors.ink,
                        marginBottom: spacing.sm,
                        textAlign: 'center',
                      }}
                    >
                      Fullscreen Mode Required
                    </Text>

                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.inkSoft,
                        textAlign: 'center',
                        lineHeight: 22,
                        marginBottom: spacing.xl,
                      }}
                    >
                      Exiting fullscreen mode is strictly disallowed during an active exam.
                      A proctoring violation has been recorded. Click anywhere or press the button below to return to full-screen mode and resume your exam.
                    </Text>

                    <Button
                      variant="primary"
                      size="lg"
                      icon={Maximize}
                      onPress={reEnterFullscreen}
                      isDark={isDark}
                      style={{ width: '100%' }}
                    >
                      Return to Fullscreen Mode
                    </Button>
                  </View>
                </TouchableOpacity>
              )}

              {/* Full-width Top Header Bar */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: spacing.xl,
                  paddingVertical: spacing.md,
                  backgroundColor: colors.surface,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                {/* Left: Exam Info */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: radius.md,
                      backgroundColor: colors.brandTint,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Lock size={20} color={colors.brandDark} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: '800',
                        color: colors.ink,
                      }}
                      numberOfLines={1}
                    >
                      Locked Exam Mode — {takingExam.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.inkSoft, fontWeight: '500' }}>
                      Question {currentQuestionIndex + 1} of {takingExam.questions.length} • {cls.name}
                    </Text>
                  </View>
                </View>

                {/* Right: Anti-cheat badge, Warnings & Timer */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: colors.brandTint,
                      paddingHorizontal: spacing.md,
                      paddingVertical: 7,
                      borderRadius: radius.full,
                    }}
                  >
                    <Maximize size={15} color={colors.brandDark} />
                    <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.brandDark }}>
                      Fullscreen Anti-Cheat Active
                    </Text>
                  </View>

                  {warningCount > 0 && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: colors.dangerTint,
                        paddingHorizontal: spacing.md,
                        paddingVertical: 7,
                        borderRadius: radius.full,
                      }}
                    >
                      <AlertTriangle size={15} color={colors.danger} />
                      <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.danger }}>
                        {warningCount}/3 Warnings
                      </Text>
                    </View>
                  )}

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: secondsRemaining < 120 ? colors.dangerTint : colors.surface2,
                      paddingHorizontal: spacing.md,
                      paddingVertical: 7,
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: secondsRemaining < 120 ? colors.danger : colors.border,
                    }}
                  >
                    <Clock size={17} color={secondsRemaining < 120 ? colors.danger : colors.ink} />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '800',
                        color: secondsRemaining < 120 ? colors.danger : colors.ink,
                      }}
                    >
                      {timeFormatted}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Warning Banner Flash */}
              {warningFlash && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    backgroundColor: colors.dangerTint,
                    paddingHorizontal: spacing.xl,
                    paddingVertical: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.danger,
                  }}
                >
                  <AlertTriangle size={18} color={colors.danger} />
                  <Text style={{ fontSize: 13.5, fontWeight: '700', color: colors.danger, flex: 1 }}>
                    {warningFlash}
                  </Text>
                </View>
              )}

              {/* Main Full-Screen Question & Options Area */}
              <ScrollView
                style={{ flex: 1, width: '100%' }}
                contentContainerStyle={{
                  flexGrow: 1,
                  paddingHorizontal: spacing.xl,
                  paddingVertical: spacing.xl,
                  alignItems: 'center',
                }}
                showsVerticalScrollIndicator={false}
              >
                <View
                  style={{
                    width: '100%',
                    maxWidth: 1000,
                    backgroundColor: colors.surface,
                    borderRadius: radius.xl,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: spacing.xxl,
                    gap: spacing.lg,
                  }}
                >
                  {/* Question Meta */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: spacing.sm,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.surface2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '800',
                        color: colors.brandDark,
                        textTransform: 'uppercase',
                        letterSpacing: 0.8,
                      }}
                    >
                      Question {currentQuestionIndex + 1} of {takingExam.questions.length}
                    </Text>

                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '700',
                        color: studentAnswers[currentQuestionIndex] !== -1 ? colors.success : colors.inkSoft,
                      }}
                    >
                      {studentAnswers[currentQuestionIndex] !== -1 ? '● Answered' : '○ Not Answered'}
                    </Text>
                  </View>

                  {/* Question Text */}
                  <Text
                    selectable={false}
                    style={
                      {
                        fontSize: 19,
                        fontWeight: '700',
                        color: colors.ink,
                        lineHeight: 28,
                        userSelect: 'none',
                      } as any
                    }
                  >
                    {q.q}
                  </Text>

                  {/* Options List */}
                  <View style={{ gap: spacing.md, marginTop: spacing.xs }}>
                    {q.options.map((opt, oIdx) => {
                      const isSelected = studentAnswers[currentQuestionIndex] === oIdx;
                      const letter = String.fromCharCode(65 + oIdx);

                      return (
                        <TouchableOpacity
                          key={oIdx}
                          activeOpacity={0.85}
                          onPress={() => {
                            const newAns = [...studentAnswers];
                            newAns[currentQuestionIndex] = oIdx;
                            setStudentAnswers(newAns);
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: spacing.md,
                            paddingVertical: 14,
                            paddingHorizontal: spacing.lg,
                            borderRadius: radius.lg,
                            borderWidth: 2,
                            borderColor: isSelected ? colors.brand : colors.border,
                            backgroundColor: isSelected ? colors.brandTint : colors.surface,
                          }}
                        >
                          {/* Letter / Radio Circle */}
                          <View
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 14,
                              borderWidth: 2,
                              borderColor: isSelected ? colors.brandDark : colors.border,
                              backgroundColor: isSelected ? colors.brandDark : colors.surface2,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {isSelected ? (
                              <Check size={14} color="#FFFFFF" strokeWidth={3} />
                            ) : (
                              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.inkSoft }}>
                                {letter}
                              </Text>
                            )}
                          </View>

                          <Text
                            selectable={false}
                            style={
                              {
                                fontSize: 15,
                                fontWeight: isSelected ? '700' : '500',
                                color: isSelected ? colors.brandDark : colors.ink,
                                flex: 1,
                                lineHeight: 22,
                                userSelect: 'none',
                              } as any
                            }
                          >
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Question Quick-Nav Palette */}
                  <View
                    style={{
                      paddingTop: spacing.md,
                      borderTopWidth: 1,
                      borderTopColor: colors.surface2,
                      gap: spacing.sm,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: colors.inkSoft,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      Question Palette
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {takingExam.questions.map((_, idx) => {
                        const isAnswered = studentAnswers[idx] !== -1;
                        const isCurrent = currentQuestionIndex === idx;

                        return (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => setCurrentQuestionIndex(idx)}
                            style={{
                              minWidth: 36,
                              height: 36,
                              paddingHorizontal: 8,
                              borderRadius: radius.md,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: isCurrent
                                ? colors.brand
                                : isAnswered
                                ? colors.brandTint
                                : colors.surface2,
                              borderWidth: 1.5,
                              borderColor: isCurrent
                                ? colors.brand
                                : isAnswered
                                ? colors.brandDark
                                : colors.border,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: '700',
                                color: isCurrent
                                  ? '#FFFFFF'
                                  : isAnswered
                                  ? colors.brandDark
                                  : colors.inkSoft,
                              }}
                            >
                              {idx + 1}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Full-width Sticky Bottom Navigation Bar */}
              <View
                style={{
                  paddingHorizontal: spacing.xl,
                  paddingVertical: spacing.md,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    maxWidth: 1000,
                    width: '100%',
                    alignSelf: 'center',
                  }}
                >
                  <Button
                    variant="ghost"
                    size="md"
                    disabled={currentQuestionIndex === 0}
                    onPress={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    isDark={isDark}
                  >
                    Previous
                  </Button>

                  <Text style={{ fontSize: 13, color: colors.inkSoft, fontWeight: '600' }}>
                    {answeredCount} of {takingExam.questions.length} answered
                  </Text>

                  {currentQuestionIndex < takingExam.questions.length - 1 ? (
                    <Button
                      variant="primary"
                      size="md"
                      onPress={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      isDark={isDark}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      icon={Check}
                      disabled={!allAnswered}
                      onPress={() => finishAttempt(false, warningCount)}
                      isDark={isDark}
                    >
                      Submit Exam
                    </Button>
                  )}
                </View>
              </View>
            </View>
          </RNModal>
        );
      })()}
    </View>
  );
};
