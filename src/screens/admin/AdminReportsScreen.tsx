import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { ClipboardCheck, Download, Brain } from 'lucide-react-native';
import { AppDatabase } from '../../services/dataStore';
import { lightColors, darkColors, radius, spacing } from '../../theme';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Stamp } from '../../components/common/Stamp';
import { EmptyState } from '../../components/common/EmptyState';

interface AdminReportsScreenProps {
  db: AppDatabase;
  isDark?: boolean;
}

export const AdminReportsScreen: React.FC<AdminReportsScreenProps> = ({
  db,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;
  const [selectedClassId, setSelectedClassId] = useState<string>(db.classes[0]?.id || '');

  const selectedClass = db.classes.find((c) => c.id === selectedClassId);
  const classExams = db.exams.filter((e) => e.classId === selectedClassId);

  // Compute attendance percentage
  const getAttendancePct = (classId: string, studentId: string) => {
    const recs = db.attendance.filter(
      (a) => a.classId === classId && a.records && a.records[studentId]
    );
    if (recs.length === 0) return null;
    const attended = recs.filter(
      (r) => r.records[studentId] === 'P' || r.records[studentId] === 'L'
    ).length;
    return Math.round((attended / recs.length) * 100);
  };

  const handleExportCsv = () => {
    if (!selectedClass) return;

    const sessions = db.attendance.filter((a) => a.classId === selectedClass.id);
    const sessionKeys = Array.from(
      new Set(sessions.map((a) => `${a.date} (${a.subject})`))
    ).sort();

    const headers = ['Student Name', 'Email', ...sessionKeys, 'Attendance %'];
    const rows = selectedClass.studentIds.map((sid) => {
      const student = db.users.find((u) => u.id === sid);
      const row = [student?.name || sid, student?.email || ''];
      sessionKeys.forEach((key) => {
        const date = key.slice(0, 10);
        const subj = key.slice(12, -1);
        const rec = sessions.find(
          (a) => a.date === date && a.subject === subj
        );
        row.push(rec?.records[sid] || '-');
      });
      const pct = getAttendancePct(selectedClass.id, sid);
      row.push(pct !== null ? `${pct}%` : '-');
      return row;
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance_report_${selectedClass.name.replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Class Selector Bar */}
      <Card isDark={isDark}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm }}>
          Select Class to View Reports
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {db.classes.map((c) => {
              const isSelected = c.id === selectedClassId;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setSelectedClassId(c.id)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.brand : colors.border,
                    backgroundColor: isSelected ? colors.brandTint : colors.surface2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: isSelected ? '700' : '500',
                      color: isSelected ? colors.brandDark : colors.ink,
                    }}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </Card>

      {selectedClass ? (
        <>
          {/* Attendance Section */}
          <Card isDark={isDark}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.md,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
                All-Time Attendance
              </Text>
              <Button
                size="sm"
                variant="ghost"
                icon={Download}
                onPress={handleExportCsv}
                isDark={isDark}
              >
                Export CSV
              </Button>
            </View>

            {selectedClass.studentIds.length === 0 ? (
              <EmptyState
                icon={ClipboardCheck}
                title="No students in this class"
                isDark={isDark}
              />
            ) : (
              <View style={{ gap: spacing.sm }}>
                {selectedClass.studentIds.map((sid) => {
                  const student = db.users.find((u) => u.id === sid);
                  const pct = getAttendancePct(selectedClass.id, sid);
                  const isLow = pct !== null && pct < 75;

                  return (
                    <View
                      key={sid}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 10,
                        paddingHorizontal: spacing.md,
                        backgroundColor: colors.surface2,
                        borderRadius: radius.md,
                      }}
                    >
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }}>
                          {student?.name || sid}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.inkSoft }}>
                          {student?.email}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: '700',
                            color: isLow ? colors.danger : colors.ink,
                          }}
                        >
                          {pct !== null ? `${pct}%` : 'No records'}
                        </Text>
                        {isLow && (
                          <Stamp tone="red" isDark={isDark}>
                            Below 75%
                          </Stamp>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </Card>

          {/* Exam Performance Section */}
          <Card isDark={isDark}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.md }}>
              Exams Performance Overview
            </Text>

            {classExams.length === 0 ? (
              <EmptyState icon={Brain} title="No exams created for this class" isDark={isDark} />
            ) : (
              <View style={{ gap: spacing.md }}>
                {classExams.map((exam) => (
                  <View
                    key={exam.id}
                    style={{
                      backgroundColor: colors.surface2,
                      borderRadius: radius.md,
                      padding: spacing.md,
                      gap: spacing.sm,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 14.5, fontWeight: '700', color: colors.ink }}>
                        {exam.title}
                      </Text>
                      <Stamp tone={exam.resultsReleased ? 'green' : 'amber'} isDark={isDark}>
                        {exam.resultsReleased ? 'Results Released' : 'Unreleased'}
                      </Stamp>
                    </View>

                    <Text style={{ fontSize: 12, color: colors.inkSoft }}>
                      {exam.attempts.length} submission(s) • Total Questions: {exam.questions.length} • Duration: {exam.duration}m
                    </Text>

                    {exam.attempts.length > 0 && (
                      <View style={{ marginTop: spacing.xs, gap: 4 }}>
                        {exam.attempts
                          .sort((a, b) => b.score - a.score)
                          .map((att, idx) => {
                            const st = db.users.find((u) => u.id === att.studentId);
                            return (
                              <View
                                key={att.studentId}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  paddingVertical: 4,
                                  borderTopWidth: 1,
                                  borderTopColor: colors.border,
                                }}
                              >
                                <Text style={{ fontSize: 13, color: colors.ink }}>
                                  {idx + 1}. {st?.name || att.studentId}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.brandDark }}>
                                    {att.score} / {exam.questions.length}
                                  </Text>
                                  {att.cheatFlag && (
                                    <Stamp tone="red" isDark={isDark}>
                                      Flagged
                                    </Stamp>
                                  )}
                                </View>
                              </View>
                            );
                          })}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </Card>
        </>
      ) : (
        <EmptyState icon={ClipboardCheck} title="Select a class to view report" isDark={isDark} />
      )}
    </ScrollView>
  );
};
