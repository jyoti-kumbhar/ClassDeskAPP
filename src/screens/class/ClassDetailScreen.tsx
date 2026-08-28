import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import {
  ClassItem,
  ClassTabKey,
  Profile,
  Notice,
  Resource,
  Assignment,
  AttendanceRecord,
  Exam,
  AssignmentSubmission,
  ExamAttempt,
} from '../../types';
import { lightColors, darkColors, radius, spacing } from '../../theme';
import { CodeChip } from '../../components/common/CodeChip';
import { CLASS_TABS } from '../../components/layout/Sidebar';
import { NoticesTab } from './tabs/NoticesTab';
import { ResourcesTab } from './tabs/ResourcesTab';
import { AssignmentsTab } from './tabs/AssignmentsTab';
import { AttendanceTab } from './tabs/AttendanceTab';
import { ExamsTab } from './tabs/ExamsTab';
import { MembersTab } from './tabs/MembersTab';

interface ClassDetailScreenProps {
  cls: ClassItem;
  tab: ClassTabKey;
  setTab: (t: ClassTabKey) => void;
  user: Profile;
  teacherProfiles: Profile[];
  users: Profile[];
  notices: Notice[];
  resources: Resource[];
  resourceLabels: string[];
  assignments: Assignment[];
  attendance: AttendanceRecord[];
  classSubjects: string[];
  exams: Exam[];
  onAddNotice: (n: Omit<Notice, 'id' | 'classId' | 'date'>) => void;
  onUpdateNotice: (id: string, patch: Partial<Notice>) => void;
  onDeleteNotice: (id: string) => void;
  onAddResource: (r: Omit<Resource, 'id' | 'classId' | 'date'>) => void;
  onUpdateResource: (id: string, patch: Partial<Resource>) => void;
  onDeleteResource: (id: string) => void;
  onAddLabel: (lbl: string) => void;
  onRemoveLabel: (lbl: string) => void;
  onAddAssignment: (a: Omit<Assignment, 'id' | 'classId' | 'submissions'>) => void;
  onUpdateAssignment: (id: string, patch: Partial<Assignment>) => void;
  onDeleteAssignment: (id: string) => void;
  onSubmitAssignment: (assignmentId: string, sub: Omit<AssignmentSubmission, 'submittedAt'>) => void;
  onReviewSubmission: (assignmentId: string, studentId: string, patch: Partial<AssignmentSubmission>) => void;
  onSaveAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  onAddSubject: (subject: string) => void;
  onAddExam: (exam: Omit<Exam, 'id' | 'classId' | 'attempts' | 'resultsReleased'>) => void;
  onUpdateExam: (id: string, patch: Partial<Exam>) => void;
  onDeleteExam: (id: string) => void;
  onSubmitAttempt: (examId: string, attempt: ExamAttempt) => void;
  onToggleReleaseResults: (examId: string) => void;
  onRemoveStudent: (studentId: string) => void;
  isDark?: boolean;
}

export const ClassDetailScreen: React.FC<ClassDetailScreenProps> = ({
  cls,
  tab,
  setTab,
  user,
  teacherProfiles,
  users,
  notices,
  resources,
  resourceLabels,
  assignments,
  attendance,
  classSubjects,
  exams,
  onAddNotice,
  onUpdateNotice,
  onDeleteNotice,
  onAddResource,
  onUpdateResource,
  onDeleteResource,
  onAddLabel,
  onRemoveLabel,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onSubmitAssignment,
  onReviewSubmission,
  onSaveAttendance,
  onAddSubject,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
  onSubmitAttempt,
  onToggleReleaseResults,
  onRemoveStudent,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;
  const isTeacher = user.role === 'teacher' || user.role === 'admin';
  const teacher = teacherProfiles.find((t) => t.id === cls.teacherId);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Class Banner Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: spacing.lg,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: spacing.md,
        }}
      >
        <View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.ink }}>
            {cls.name}
          </Text>
          <Text style={{ fontSize: 13, color: colors.inkSoft, marginTop: 2 }}>
            {cls.subject} {teacher ? `• ${teacher.name}` : ''} • {cls.studentIds.length} students
          </Text>
        </View>

        {isTeacher && (
          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.inkSoft, textTransform: 'uppercase' }}>
              Student Join Code
            </Text>
            <CodeChip code={cls.joinCode} isDark={isDark} />
          </View>
        )}
      </View>

      {/* Tab Navigation Pill Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: spacing.lg }}
      >
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {CLASS_TABS.map((t) => {
            const isActive = tab === t.key;
            const Icon = t.icon;
            return (
              <TouchableOpacity
                key={t.key}
                activeOpacity={0.8}
                onPress={() => setTab(t.key)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: radius.md,
                  backgroundColor: isActive ? colors.brandTint : colors.surface,
                  borderWidth: 1,
                  borderColor: isActive ? colors.brand : colors.border,
                }}
              >
                <Icon size={16} color={isActive ? colors.brandDark : colors.inkSoft} />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? colors.brandDark : colors.ink,
                  }}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Active Tab Panel */}
      {tab === 'notices' && (
        <NoticesTab
          cls={cls}
          notices={notices}
          isTeacher={isTeacher}
          userId={user.id}
          onAddNotice={onAddNotice}
          onUpdateNotice={onUpdateNotice}
          onDeleteNotice={onDeleteNotice}
          isDark={isDark}
        />
      )}

      {tab === 'resources' && (
        <ResourcesTab
          cls={cls}
          resources={resources}
          resourceLabels={resourceLabels}
          isTeacher={isTeacher}
          userId={user.id}
          onAddResource={onAddResource}
          onUpdateResource={onUpdateResource}
          onDeleteResource={onDeleteResource}
          onAddLabel={onAddLabel}
          onRemoveLabel={onRemoveLabel}
          isDark={isDark}
        />
      )}

      {tab === 'assignments' && (
        <AssignmentsTab
          cls={cls}
          assignments={assignments}
          users={users}
          isTeacher={isTeacher}
          userId={user.id}
          onAddAssignment={onAddAssignment}
          onUpdateAssignment={onUpdateAssignment}
          onDeleteAssignment={onDeleteAssignment}
          onSubmitAssignment={onSubmitAssignment}
          onReviewSubmission={onReviewSubmission}
          isDark={isDark}
        />
      )}

      {tab === 'attendance' && (
        <AttendanceTab
          cls={cls}
          attendance={attendance}
          classSubjects={classSubjects}
          users={users}
          isTeacher={isTeacher}
          userId={user.id}
          onSaveAttendance={onSaveAttendance}
          onAddSubject={onAddSubject}
          isDark={isDark}
        />
      )}

      {tab === 'exams' && (
        <ExamsTab
          cls={cls}
          exams={exams}
          users={users}
          isTeacher={isTeacher}
          userId={user.id}
          onAddExam={onAddExam}
          onUpdateExam={onUpdateExam}
          onDeleteExam={onDeleteExam}
          onSubmitAttempt={onSubmitAttempt}
          onToggleReleaseResults={onToggleReleaseResults}
          isDark={isDark}
        />
      )}

      {tab === 'members' && (
        <MembersTab
          cls={cls}
          users={users}
          isTeacher={isTeacher}
          onRemoveStudent={onRemoveStudent}
          isDark={isDark}
        />
      )}
    </ScrollView>
  );
};
