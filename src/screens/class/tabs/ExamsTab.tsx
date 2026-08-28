import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
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

  // Student Exam Mode State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<number[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [warningFlash, setWarningFlash] = useState<string | null>(null);
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

  // Student Start Exam
  const handleStartExam = (ex: Exam) => {
    setTakingExam(ex);
    setCurrentQuestionIndex(0);
    setStudentAnswers(new Array(ex.questions.length).fill(-1));
    setSecondsRemaining(ex.duration * 60);
    setWarningCount(0);
    setWarningFlash(null);
    examStartTimeRef.current = Date.now();
    violationsRef.current = [];
    isSubmittedRef.current = false;

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        document.documentElement.requestFullscreen().catch(() => {});
      } catch (e) {}
    }
  };

  // Finish exam attempt
  const finishAttempt = (cheatFlag: boolean, finalWarnings?: number) => {
    const exam = takingExamRef.current;
    if (isSubmittedRef.current || !exam) return;
    isSubmittedRef.current = true;

    if (Platform.OS === 'web' && typeof document !== 'undefined' && document.fullscreenElement) {
      try {
        document.exitFullscreen().catch(() => {});
      } catch (e) {}
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

  // Anti-Cheat Event Listeners (Tab change, window blur, fullscreen exit)
  useEffect(() => {
    if (!takingExam || Platform.OS !== 'web' || typeof window === 'undefined') return;

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
        setTimeout(() => setWarningFlash(null), 3000);

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
        recordViolation('Exited locked full-screen mode');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
                    {questions.length > 1 && (
                      <TouchableOpacity onPress={() => handleRemoveQuestion(q.id)}>
                        <X size={16} color={colors.danger} />
                      </TouchableOpacity>
                    )}
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
                <Text style={{ fontSize: 14.5, fontWeight: '700', color: colors.ink }}>
                  {idx + 1}. {q.q}
                </Text>
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
                          style={{
                            fontSize: 13,
                            fontWeight: isCorrect ? '700' : '400',
                            color: isCorrect ? '#1E7A52' : colors.ink,
                          }}
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

      {/* STUDENT: Live MCQ Exam Screen */}
      {takingExam && (() => {
        const q = takingExam.questions[currentQuestionIndex];
        const minutes = Math.floor(secondsRemaining / 60);
        const seconds = secondsRemaining % 60;
        const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        const allAnswered = studentAnswers.every((a) => a !== -1);

        return (
          <Modal
            title={`Locked Exam Mode — ${takingExam.title}`}
            onClose={() => {}}
            wide
            isDark={isDark}
          >
            {/* Top Exam Status Bar */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: colors.surface2,
                padding: spacing.sm,
                borderRadius: radius.md,
                marginBottom: spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Maximize size={15} color={colors.brandDark} />
                <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.brandDark }}>
                  Fullscreen Anti-Cheat Active
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Clock size={16} color={secondsRemaining < 120 ? colors.danger : colors.ink} />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: secondsRemaining < 120 ? colors.danger : colors.ink,
                  }}
                >
                  {timeFormatted}
                </Text>
              </View>
            </View>

            {/* Warning Banner Flash */}
            {warningFlash && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: colors.dangerTint,
                  padding: spacing.md,
                  borderRadius: radius.md,
                  marginBottom: spacing.md,
                }}
              >
                <AlertTriangle size={18} color={colors.danger} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.danger, flex: 1 }}>
                  {warningFlash}
                </Text>
              </View>
            )}

            {/* Current Question */}
            <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.inkSoft, textTransform: 'uppercase' }}>
              Question {currentQuestionIndex + 1} of {takingExam.questions.length}
            </Text>

            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginTop: 4, marginBottom: spacing.md }}>
              {q.q}
            </Text>

            {/* Options */}
            <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
              {q.options.map((opt, oIdx) => {
                const isSelected = studentAnswers[currentQuestionIndex] === oIdx;
                return (
                  <TouchableOpacity
                    key={oIdx}
                    activeOpacity={0.8}
                    onPress={() => {
                      const newAns = [...studentAnswers];
                      newAns[currentQuestionIndex] = oIdx;
                      setStudentAnswers(newAns);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.sm,
                      paddingVertical: 10,
                      paddingHorizontal: spacing.md,
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.brand : colors.border,
                      backgroundColor: isSelected ? colors.brandTint : colors.surface2,
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: isSelected ? colors.brandDark : colors.inkSoft,
                        backgroundColor: isSelected ? colors.brandDark : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isSelected && <Check size={12} color="#FFFFFF" />}
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: isSelected ? '700' : '400',
                        color: isSelected ? colors.brandDark : colors.ink,
                      }}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Question Quick-Nav Dots */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.lg }}>
              {takingExam.questions.map((_, idx) => {
                const isAnswered = studentAnswers[idx] !== -1;
                const isCurrent = currentQuestionIndex === idx;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setCurrentQuestionIndex(idx)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: radius.sm,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isCurrent
                        ? colors.brand
                        : isAnswered
                        ? colors.brandTint
                        : colors.surface2,
                      borderWidth: 1,
                      borderColor: isCurrent ? colors.brand : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
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

            {/* Navigation & Submit Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="ghost"
                size="md"
                disabled={currentQuestionIndex === 0}
                onPress={() => setCurrentQuestionIndex((prev) => prev - 1)}
                isDark={isDark}
              >
                Previous
              </Button>

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
          </Modal>
        );
      })()}
    </View>
  );
};
