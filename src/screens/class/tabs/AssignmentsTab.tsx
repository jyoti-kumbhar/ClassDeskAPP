import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import {
  ClipboardCheck,
  Plus,
  Calendar,
  Tag,
  ExternalLink,
  Trash2,
  CheckCircle2,
  FileText,
  Upload,
  Link as LinkIcon,
} from 'lucide-react-native';
import {
  Assignment,
  AssignmentSubmission,
  AssignmentResource,
  SubmissionStatus,
  ClassItem,
  Profile,
} from '../../../types';
import { fmtDateTime, isPast, isFuture, uid } from '../../../services/dataStore';
import { lightColors, darkColors, radius, spacing, typography, shadows } from '../../../theme';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Field, Input, TextArea } from '../../../components/common/Input';
import { Stamp, StampTone } from '../../../components/common/Stamp';
import { RowActions } from '../../../components/common/RowActions';
import { ScheduleField } from '../../../components/common/ScheduleField';
import { EmptyState } from '../../../components/common/EmptyState';
import { SearchBar } from '../../../components/common/SearchBar';
import { FileUploadButton, FileAttachmentItem } from '../../../components/common/FileUploadButton';

interface AssignmentsTabProps {
  cls: ClassItem;
  assignments: Assignment[];
  users: Profile[];
  isTeacher: boolean;
  userId: string;
  onAddAssignment: (assignment: Omit<Assignment, 'id' | 'classId' | 'submissions'>) => void;
  onUpdateAssignment: (id: string, patch: Partial<Assignment>) => void;
  onDeleteAssignment: (id: string) => void;
  onSubmitAssignment: (assignmentId: string, submission: Omit<AssignmentSubmission, 'submittedAt'>) => void;
  onReviewSubmission: (assignmentId: string, studentId: string, patch: Partial<AssignmentSubmission>) => void;
  isDark?: boolean;
}

export const AssignmentsTab: React.FC<AssignmentsTabProps> = ({
  cls,
  assignments,
  users,
  isTeacher,
  userId,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onSubmitAssignment,
  onReviewSubmission,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Teacher Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [openSubmissionsAssignment, setOpenSubmissionsAssignment] = useState<Assignment | null>(null);

  // Student Modals
  const [submitForAssignment, setSubmitForAssignment] = useState<Assignment | null>(null);
  const [submissionLink, setSubmissionLink] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Teacher Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxMarks, setMaxMarks] = useState<string>('');
  const [scheduledFor, setScheduledFor] = useState<string | null>(null);
  const [resources, setResources] = useState<AssignmentResource[]>([]);
  const [formError, setFormError] = useState('');

  const openCreate = () => {
    setTitle('');
    setDescription('');
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 0, 0);
    setDeadline(d.toISOString().slice(0, 16));
    setMaxMarks('20');
    setScheduledFor(null);
    setResources([]);
    setFormError('');
    setShowCreateModal(true);
  };

  const openEdit = (a: Assignment) => {
    setEditingAssignment(a);
    setTitle(a.title);
    setDescription(a.description);
    setDeadline(a.deadline.slice(0, 16));
    setMaxMarks(a.maxMarks != null ? String(a.maxMarks) : '');
    setScheduledFor(a.scheduledFor || null);
    setResources(a.resources.map((r) => ({ ...r })));
    setFormError('');
  };

  const handleSaveTeacher = () => {
    if (!title.trim()) {
      setFormError('Please enter an assignment title.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please enter assignment instructions.');
      return;
    }
    if (!deadline) {
      setFormError('Please enter a submission deadline.');
      return;
    }

    const parsedMarks = maxMarks.trim() ? Number(maxMarks) : null;
    const formattedDeadline = new Date(deadline).toISOString();

    if (editingAssignment) {
      onUpdateAssignment(editingAssignment.id, {
        title: title.trim(),
        description: description.trim(),
        deadline: formattedDeadline,
        maxMarks: parsedMarks,
        scheduledFor,
        resources: resources.filter((r) => r.label.trim() && r.url.trim()),
      });
      setEditingAssignment(null);
    } else {
      onAddAssignment({
        authorId: userId,
        title: title.trim(),
        description: description.trim(),
        deadline: formattedDeadline,
        maxMarks: parsedMarks,
        scheduledFor,
        resources: resources.filter((r) => r.label.trim() && r.url.trim()),
      });
      setShowCreateModal(false);
    }
  };

  const handleStudentSubmit = () => {
    if (!submitForAssignment) return;
    if (!submissionLink.trim() && !uploadedFileUrl) return;

    onSubmitAssignment(submitForAssignment.id, {
      studentId: userId,
      link: submissionLink.trim() || undefined,
      fileUrl: uploadedFileUrl || undefined,
      status: 'Pending',
      feedback: '',
      marks: null,
    });

    setSubmitForAssignment(null);
    setSubmissionLink('');
    setUploadedFileUrl(null);
    setUploadedFileName(null);
  };

  const openUrl = (url?: string) => {
    if (!url) return;
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(() => {});
    }
  };

  const getStatusTone = (status: SubmissionStatus | 'Overdue' | 'Not submitted'): StampTone => {
    switch (status) {
      case 'Reviewed':
        return 'green';
      case 'Needs Revision':
        return 'amber';
      case 'Overdue':
        return 'red';
      case 'Pending':
        return 'brand';
      default:
        return 'neutral';
    }
  };

  const studentFilters = ['All', 'Pending', 'Submitted', 'Reviewed', 'Overdue'];
  const teacherFilters = ['All', 'Active', 'Past Due'];
  const filterOptions = isTeacher ? teacherFilters : studentFilters;

  const classAssignments = useMemo(() => {
    return assignments
      .filter((a) => a.classId === cls.id)
      .filter((a) => isTeacher || !isFuture(a.scheduledFor))
      .filter((a) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = a.title.toLowerCase().includes(q);
          const matchDesc = a.description.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc) return false;
        }

        // Filter tab
        if (statusFilter === 'All') return true;

        if (isTeacher) {
          if (statusFilter === 'Active') return !isPast(a.deadline);
          if (statusFilter === 'Past Due') return isPast(a.deadline);
          return true;
        } else {
          const sub = a.submissions.find((s) => s.studentId === userId);
          const isOverdue = !sub && isPast(a.deadline);
          if (statusFilter === 'Pending') return !sub && !isOverdue;
          if (statusFilter === 'Submitted') return sub && sub.status === 'Pending';
          if (statusFilter === 'Reviewed') return sub && sub.status === 'Reviewed';
          if (statusFilter === 'Overdue') return isOverdue;
          return true;
        }
      })
      .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
  }, [assignments, cls.id, isTeacher, searchQuery, statusFilter, userId]);

  return (
    <View style={{ gap: spacing.md }}>
      {/* Search & Header Action */}
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
            placeholder="Search assignments by title or instructions..."
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
            New Assignment
          </Button>
        )}
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {filterOptions.map((opt) => {
            const isSelected = statusFilter === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => setStatusFilter(opt)}
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
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Assignments Feed */}
      {classAssignments.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title={searchQuery || statusFilter !== 'All' ? 'No matching assignments' : 'No assignments posted'}
          hint={
            searchQuery || statusFilter !== 'All'
              ? 'No assignments matched your current search and filter settings.'
              : isTeacher
              ? 'Create assignments with deadlines, attached references, and scoring.'
              : 'No active homework or problem sets assigned in this class.'
          }
          actionLabel={
            searchQuery || statusFilter !== 'All'
              ? 'Reset Filter'
              : isTeacher
              ? 'Create Assignment'
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
        classAssignments.map((assignment) => {
          const mySubmission = assignment.submissions.find((s) => s.studentId === userId);
          const overdue = !mySubmission && isPast(assignment.deadline);
          const studentStatus = mySubmission ? mySubmission.status : overdue ? 'Overdue' : 'Not submitted';

          return (
            <Card key={assignment.id} isDark={isDark}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, paddingRight: spacing.sm }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
                    {assignment.title}
                  </Text>
                  <Text style={{ fontSize: 12.5, color: colors.inkSoft, marginTop: 2 }}>
                    Due {fmtDateTime(assignment.deadline)}
                    {assignment.maxMarks != null && ` • ${assignment.maxMarks} max marks`}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  {isTeacher ? (
                    <>
                      <Stamp tone="neutral" isDark={isDark}>
                        {assignment.submissions.length}/{cls.studentIds.length} Submitted
                      </Stamp>
                      <RowActions
                        onEdit={() => openEdit(assignment)}
                        onDelete={() => onDeleteAssignment(assignment.id)}
                        isDark={isDark}
                      />
                    </>
                  ) : (
                    <Stamp tone={getStatusTone(studentStatus)} isDark={isDark}>
                      {studentStatus}
                    </Stamp>
                  )}
                </View>
              </View>

              <Text style={{ fontSize: 14, color: colors.ink, marginTop: spacing.sm, lineHeight: 20 }}>
                {assignment.description}
              </Text>

              {/* Resources Attached */}
              {assignment.resources.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm }}>
                  {assignment.resources.map((res) => (
                    <TouchableOpacity
                      key={res.id}
                      onPress={() => openUrl(res.url)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        backgroundColor: colors.surface2,
                        borderRadius: radius.md,
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                      }}
                    >
                      <Tag size={12} color={colors.brand} />
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.ink }}>
                        {res.label}
                      </Text>
                      <ExternalLink size={11} color={colors.inkSoft} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Student Feedback & Marks View */}
              {!isTeacher && mySubmission && (
                <View
                  style={{
                    backgroundColor: colors.surface2,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    marginTop: spacing.md,
                    gap: spacing.xs,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.ink }}>
                      Your Submission
                    </Text>
                    {mySubmission.marks != null && (
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.brandDark }}>
                        Marks: {mySubmission.marks} / {assignment.maxMarks}
                      </Text>
                    )}
                  </View>

                  {mySubmission.link && (
                    <TouchableOpacity
                      onPress={() => openUrl(mySubmission.link)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    >
                      <LinkIcon size={13} color={colors.info} />
                      <Text style={{ fontSize: 12.5, color: colors.info, textDecorationLine: 'underline' }}>
                        {mySubmission.link}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {mySubmission.fileUrl && (
                    <TouchableOpacity
                      onPress={() => openUrl(mySubmission.fileUrl)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    >
                      <FileText size={13} color={colors.brand} />
                      <Text style={{ fontSize: 12.5, color: colors.brandDark, fontWeight: '600' }}>
                        View Attached File
                      </Text>
                    </TouchableOpacity>
                  )}

                  {mySubmission.feedback ? (
                    <View style={{ marginTop: 4, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 4 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: colors.inkSoft, textTransform: 'uppercase' }}>
                        Teacher Feedback
                      </Text>
                      <Text style={{ fontSize: 13, color: colors.ink, fontStyle: 'italic', marginTop: 2 }}>
                        "{mySubmission.feedback}"
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.md }}>
                {isTeacher ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={ClipboardCheck}
                    onPress={() => setOpenSubmissionsAssignment(assignment)}
                    isDark={isDark}
                  >
                    View Submissions ({assignment.submissions.length})
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant={mySubmission ? 'ghost' : 'primary'}
                    icon={Upload}
                    onPress={() => {
                      setSubmitForAssignment(assignment);
                      setSubmissionLink(mySubmission?.link || '');
                    }}
                    isDark={isDark}
                  >
                    {mySubmission ? 'Resubmit Work' : 'Submit Assignment'}
                  </Button>
                )}
              </View>
            </Card>
          );
        })
      )}

      {/* Teacher: Create / Edit Assignment Modal */}
      {(showCreateModal || editingAssignment) && (
        <Modal
          title={editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAssignment(null);
          }}
          wide
          isDark={isDark}
        >
          <Field
            label="Assignment Title"
            error={formError && !title.trim() ? formError : undefined}
            isDark={isDark}
          >
            <Input
              value={title}
              onChangeText={(txt) => {
                setTitle(txt);
                if (formError) setFormError('');
              }}
              placeholder="e.g. Convex Mirror Lab Report"
              isDark={isDark}
            />
          </Field>

          <Field
            label="Instructions & Requirements"
            error={formError && title.trim() && !description.trim() ? formError : undefined}
            isDark={isDark}
          >
            <TextArea
              value={description}
              onChangeText={(txt) => {
                setDescription(txt);
                if (formError) setFormError('');
              }}
              placeholder="Detail assignment questions, format requirements..."
              isDark={isDark}
            />
          </Field>

          <View style={{ flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' }}>
            <View style={{ flex: 1.5, minWidth: 200 }}>
              <Field
                label="Deadline (YYYY-MM-DDTHH:MM)"
                error={formError && title.trim() && description.trim() && !deadline ? formError : undefined}
                isDark={isDark}
              >
                <Input
                  value={deadline}
                  onChangeText={(txt) => {
                    setDeadline(txt);
                    if (formError) setFormError('');
                  }}
                  placeholder="2026-09-01T23:59"
                  isDark={isDark}
                />
              </Field>
            </View>

            <View style={{ flex: 1, minWidth: 120 }}>
              <Field label="Max Marks (Optional)" isDark={isDark}>
                <Input
                  value={maxMarks}
                  onChangeText={setMaxMarks}
                  placeholder="e.g. 20"
                  keyboardType="numeric"
                  isDark={isDark}
                />
              </Field>
            </View>
          </View>

          {/* Attach Resource Reference */}
          <View style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.inkSoft, textTransform: 'uppercase' }}>
                Attached References
              </Text>
              <FileUploadButton
                userId={userId}
                classId={cls.id}
                buttonText="Attach File"
                onUploadSuccess={(meta) => {
                  setResources((prev) => [
                    ...prev,
                    {
                      id: uid('l'),
                      label: meta.fileName,
                      url: meta.url || meta.storagePath,
                    },
                  ]);
                }}
                isDark={isDark}
              />
            </View>

            {resources.map((res) => (
              <View
                key={res.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  marginBottom: 6,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Input
                    value={res.label}
                    onChangeText={(val) =>
                      setResources((prev) =>
                        prev.map((r) => (r.id === res.id ? { ...r, label: val } : r))
                      )
                    }
                    placeholder="Reference label"
                    isDark={isDark}
                  />
                </View>
                <View style={{ flex: 1.5 }}>
                  <Input
                    value={res.url}
                    onChangeText={(val) =>
                      setResources((prev) =>
                        prev.map((r) => (r.id === res.id ? { ...r, url: val } : r))
                      )
                    }
                    placeholder="https://..."
                    isDark={isDark}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setResources((prev) => prev.filter((r) => r.id !== res.id))}
                  style={{ padding: 6 }}
                >
                  <Trash2 size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <ScheduleField
            scheduledFor={scheduledFor}
            setScheduledFor={setScheduledFor}
            isDark={isDark}
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!title.trim() || !description.trim() || !deadline}
            onPress={handleSaveTeacher}
            isDark={isDark}
            style={{ marginTop: spacing.sm }}
          >
            {editingAssignment ? 'Save Changes' : 'Create Assignment'}
          </Button>
        </Modal>
      )}

      {/* Teacher: View Submissions Modal */}
      {openSubmissionsAssignment && (
        <Modal
          title={`Submissions — ${openSubmissionsAssignment.title}`}
          onClose={() => setOpenSubmissionsAssignment(null)}
          wide
          isDark={isDark}
        >
          <View style={{ gap: spacing.md }}>
            {cls.studentIds.map((sid) => {
              const student = users.find((u) => u.id === sid);
              const sub = openSubmissionsAssignment.submissions.find((s) => s.studentId === sid);
              const isOverdue = !sub && isPast(openSubmissionsAssignment.deadline);

              return (
                <View
                  key={sid}
                  style={{
                    backgroundColor: colors.surface2,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    gap: spacing.sm,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={{ fontSize: 14.5, fontWeight: '700', color: colors.ink }}>
                        {student?.name || sid}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.inkSoft }}>{student?.email}</Text>
                    </View>

                    <Stamp
                      tone={
                        sub
                          ? getStatusTone(sub.status)
                          : isOverdue
                          ? 'red'
                          : 'neutral'
                      }
                      isDark={isDark}
                    >
                      {sub ? sub.status : isOverdue ? 'Overdue' : 'Pending'}
                    </Stamp>
                  </View>

                  {sub ? (
                    <>
                      {/* Attached Links / Files */}
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                        {sub.link && (
                          <TouchableOpacity
                            onPress={() => openUrl(sub.link)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4,
                              backgroundColor: colors.surface,
                              paddingVertical: 4,
                              paddingHorizontal: 8,
                              borderRadius: radius.sm,
                            }}
                          >
                            <ExternalLink size={12} color={colors.info} />
                            <Text style={{ fontSize: 12, color: colors.info, fontWeight: '600' }}>
                              Open Document Link
                            </Text>
                          </TouchableOpacity>
                        )}
                        {sub.fileUrl && (
                          <TouchableOpacity
                            onPress={() => openUrl(sub.fileUrl)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4,
                              backgroundColor: colors.surface,
                              paddingVertical: 4,
                              paddingHorizontal: 8,
                              borderRadius: radius.sm,
                            }}
                          >
                            <FileText size={12} color={colors.brand} />
                            <Text style={{ fontSize: 12, color: colors.brandDark, fontWeight: '600' }}>
                              Download Attached File
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Grading Controls */}
                      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                          {(['Reviewed', 'Needs Revision', 'Pending'] as SubmissionStatus[]).map((st) => (
                            <TouchableOpacity
                              key={st}
                              onPress={() =>
                                onReviewSubmission(openSubmissionsAssignment.id, sid, { status: st })
                              }
                              style={{
                                paddingVertical: 4,
                                paddingHorizontal: 8,
                                borderRadius: radius.sm,
                                backgroundColor: sub.status === st ? colors.brandTint : colors.surface,
                                borderWidth: 1,
                                borderColor: sub.status === st ? colors.brand : colors.border,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: sub.status === st ? '700' : '500',
                                  color: sub.status === st ? colors.brandDark : colors.inkSoft,
                                }}
                              >
                                {st}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        {openSubmissionsAssignment.maxMarks != null && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                            <Text style={{ fontSize: 12, color: colors.inkSoft }}>Score:</Text>
                            <Input
                              value={sub.marks != null ? String(sub.marks) : ''}
                              onChangeText={(val) =>
                                onReviewSubmission(openSubmissionsAssignment.id, sid, {
                                  marks: val.trim() ? Number(val) : null,
                                })
                              }
                              placeholder={`/ ${openSubmissionsAssignment.maxMarks}`}
                              keyboardType="numeric"
                              style={{ width: 70, minHeight: 32, paddingVertical: 2, paddingHorizontal: 6 }}
                              isDark={isDark}
                            />
                          </View>
                        )}
                      </View>

                      {/* Teacher Feedback input */}
                      <Input
                        value={sub.feedback || ''}
                        onChangeText={(txt) =>
                          onReviewSubmission(openSubmissionsAssignment.id, sid, { feedback: txt })
                        }
                        placeholder="Add constructive feedback for student..."
                        style={{ minHeight: 34, fontSize: 12.5 }}
                        isDark={isDark}
                      />
                    </>
                  ) : (
                    <Text style={{ fontSize: 12.5, color: colors.inkSoft, fontStyle: 'italic' }}>
                      No submission received yet.
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </Modal>
      )}

      {/* Student: Submit Assignment Modal */}
      {submitForAssignment && (
        <Modal
          title={`Submit — ${submitForAssignment.title}`}
          onClose={() => {
            setSubmitForAssignment(null);
            setUploadedFileUrl(null);
            setUploadedFileName(null);
          }}
          isDark={isDark}
        >
          <Text style={{ fontSize: 13, color: colors.inkSoft, marginBottom: spacing.md }}>
            Attach a link (Google Docs, Google Drive, GitHub) or upload a PDF/Document directly.
          </Text>

          <Field label="Submission URL" isDark={isDark}>
            <Input
              value={submissionLink}
              onChangeText={setSubmissionLink}
              placeholder="https://docs.google.com/..."
              autoCapitalize="none"
              isDark={isDark}
            />
          </Field>

          <View style={{ marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.inkSoft, textTransform: 'uppercase', marginBottom: spacing.xs }}>
              Or Upload a File
            </Text>

            {uploadedFileName ? (
              <FileAttachmentItem
                fileName={uploadedFileName}
                url={uploadedFileUrl || undefined}
                onDelete={() => {
                  setUploadedFileName(null);
                  setUploadedFileUrl(null);
                }}
                isDark={isDark}
              />
            ) : (
              <FileUploadButton
                userId={userId}
                classId={cls.id}
                buttonText="Choose File to Upload"
                onUploadSuccess={(meta) => {
                  setUploadedFileName(meta.fileName);
                  setUploadedFileUrl(meta.url || meta.storagePath);
                }}
                isDark={isDark}
              />
            )}
          </View>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!submissionLink.trim() && !uploadedFileUrl}
            onPress={handleStudentSubmit}
            isDark={isDark}
          >
            Submit Work
          </Button>
        </Modal>
      )}
    </View>
  );
};
