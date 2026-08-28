import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import {
  CalendarCheck,
  Check,
  Download,
  AlertTriangle,
  Clock,
  BookOpen,
  Plus,
} from 'lucide-react-native';
import { AttendanceRecord, AttendanceStatus, ClassItem, Profile } from '../../../types';
import { fmtDate, fmtDateShort, uid } from '../../../services/dataStore';
import { lightColors, darkColors, radius, spacing, typography, shadows } from '../../../theme';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input, Field } from '../../../components/common/Input';
import { Stamp, StampTone } from '../../../components/common/Stamp';
import { EmptyState } from '../../../components/common/EmptyState';
import { SearchBar } from '../../../components/common/SearchBar';

interface AttendanceTabProps {
  cls: ClassItem;
  attendance: AttendanceRecord[];
  classSubjects: string[];
  users: Profile[];
  isTeacher: boolean;
  userId: string;
  onSaveAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  onAddSubject: (subject: string) => void;
  isDark?: boolean;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  cls,
  attendance,
  classSubjects,
  users,
  isTeacher,
  userId,
  onSaveAttendance,
  onAddSubject,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;

  const todayStr = new Date().toISOString().slice(0, 10);
  const nowTimeStr = new Date().toTimeString().slice(0, 5);
  const currentMonthStr = todayStr.slice(0, 7);

  // Teacher Form State
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(nowTimeStr);
  const subjects = classSubjects.length > 0 ? classSubjects : [cls.subject];
  const [subject, setSubject] = useState(subjects[0] || cls.subject);
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [studentSearch, setStudentSearch] = useState('');

  // Sync existing attendance record when date/subject change
  useEffect(() => {
    const existing = attendance.find(
      (a) => a.classId === cls.id && a.date === date && a.subject === subject
    );
    if (existing) {
      setRecords(existing.records || {});
      setTime(existing.time || nowTimeStr);
    } else {
      // Default to Present for all students
      const defaults: Record<string, AttendanceStatus> = {};
      cls.studentIds.forEach((sid) => {
        defaults[sid] = 'P';
      });
      setRecords(defaults);
      setTime(nowTimeStr);
    }
  }, [date, subject, cls.id, attendance]);

  const setStudentMark = (studentId: string, mark: AttendanceStatus) => {
    setRecords((prev) => ({ ...prev, [studentId]: mark }));
  };

  const handleSave = () => {
    onSaveAttendance({
      classId: cls.id,
      date,
      subject,
      time,
      records,
    });
  };

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    onAddSubject(newSubject.trim());
    setSubject(newSubject.trim());
    setNewSubject('');
    setAddingSubject(false);
  };

  // Helper calculations
  const calculateStudentPct = (studentId: string, monthFilter?: string) => {
    let recs = attendance.filter((a) => a.classId === cls.id && a.records && a.records[studentId]);
    if (monthFilter) {
      recs = recs.filter((a) => a.date.slice(0, 7) === monthFilter);
    }
    if (recs.length === 0) return null;
    const attended = recs.filter(
      (r) => r.records[studentId] === 'P' || r.records[studentId] === 'L'
    ).length;
    return Math.round((attended / recs.length) * 100);
  };

  const handleExportMonthCsv = () => {
    const monthSessions = attendance.filter(
      (a) => a.classId === cls.id && a.date.slice(0, 7) === selectedMonth
    );
    const sessionKeys = Array.from(
      new Set(monthSessions.map((a) => `${a.date} (${a.subject})`))
    ).sort();

    const headers = ['Student Name', ...sessionKeys, 'Monthly %'];
    const rows = cls.studentIds.map((sid) => {
      const student = users.find((u) => u.id === sid);
      const row = [student?.name || sid];
      sessionKeys.forEach((key) => {
        const d = key.slice(0, 10);
        const s = key.slice(12, -1);
        const rec = monthSessions.find((a) => a.date === d && a.subject === s);
        row.push(rec?.records[sid] || '-');
      });
      const pct = calculateStudentPct(sid, selectedMonth);
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
      link.download = `attendance_${cls.name.replace(/\s+/g, '_')}_${selectedMonth}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Filter student IDs during roll call
  const displayedStudents = useMemo(() => {
    if (!studentSearch.trim()) return cls.studentIds;
    const q = studentSearch.toLowerCase().trim();
    return cls.studentIds.filter((sid) => {
      const student = users.find((u) => u.id === sid);
      return (
        (student && student.name.toLowerCase().includes(q)) ||
        (student && student.email.toLowerCase().includes(q))
      );
    });
  }, [cls.studentIds, users, studentSearch]);

  // Student specific history
  const studentHistory = attendance
    .filter((a) => a.classId === cls.id && a.records && a.records[userId])
    .sort((a, b) => b.date.localeCompare(a.date));

  const studentOverallPct = calculateStudentPct(userId);
  const studentMonths = Array.from(new Set(studentHistory.map((h) => h.date.slice(0, 7))));

  // Today's entries for Teacher
  const todaysEntries = attendance.filter((a) => a.classId === cls.id && a.date === todayStr);

  return (
    <View style={{ gap: spacing.md }}>
      {isTeacher ? (
        /* TEACHER ATTENDANCE DASHBOARD */
        <>
          {/* Mark Attendance Section */}
          <Card isDark={isDark}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md, flexWrap: 'wrap', gap: spacing.sm }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
                Take Attendance Roll Call
              </Text>

              {/* Date & Period Controls */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' }}>
                <Input
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  style={{ width: 130, minHeight: 36, paddingVertical: 4 }}
                  isDark={isDark}
                />
                <Input
                  value={time}
                  onChangeText={setTime}
                  placeholder="HH:MM"
                  style={{ width: 85, minHeight: 36, paddingVertical: 4 }}
                  isDark={isDark}
                />

                {addingSubject ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Input
                      value={newSubject}
                      onChangeText={setNewSubject}
                      placeholder="Subject name"
                      style={{ width: 130, minHeight: 36, paddingVertical: 4 }}
                      isDark={isDark}
                    />
                    <Button size="sm" variant="primary" icon={Check} onPress={handleAddSubject} isDark={isDark}>
                      Add
                    </Button>
                  </View>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      {subjects.map((subj) => (
                        <TouchableOpacity
                          key={subj}
                          onPress={() => setSubject(subj)}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                            borderRadius: radius.md,
                            backgroundColor: subject === subj ? colors.brandTint : colors.surface2,
                            borderWidth: 1,
                            borderColor: subject === subj ? colors.brand : colors.border,
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: subject === subj ? '700' : '500', color: subject === subj ? colors.brandDark : colors.ink }}>
                            {subj}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        onPress={() => setAddingSubject(true)}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 8,
                          borderRadius: radius.md,
                          backgroundColor: colors.surface2,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Text style={{ fontSize: 12, color: colors.inkSoft }}>+ Add Subject</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                )}
              </View>
            </View>

            {/* Student Search Filter during Roll Call */}
            {cls.studentIds.length > 4 && (
              <View style={{ marginBottom: spacing.sm }}>
                <SearchBar
                  value={studentSearch}
                  onChangeText={setStudentSearch}
                  placeholder="Filter student list..."
                  isDark={isDark}
                />
              </View>
            )}

            {/* Students List with P/L/A Toggle */}
            {cls.studentIds.length === 0 ? (
              <EmptyState icon={CalendarCheck} title="No students enrolled in this class" isDark={isDark} />
            ) : displayedStudents.length === 0 ? (
              <EmptyState icon={CalendarCheck} title="No matching students found" isDark={isDark} />
            ) : (
              <View style={{ gap: spacing.xs, marginBottom: spacing.md }}>
                {displayedStudents.map((sid) => {
                  const student = users.find((u) => u.id === sid);
                  const mark = records[sid] || 'P';

                  return (
                    <View
                      key={sid}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 8,
                        paddingHorizontal: spacing.md,
                        backgroundColor: colors.surface2,
                        borderRadius: radius.md,
                        flexWrap: 'wrap',
                        gap: spacing.xs,
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }}>
                        {student?.name || sid}
                      </Text>

                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        {(
                          [
                            ['P', 'Present', '#1E7A52', '#E1F5EA'],
                            ['L', 'Late', '#9A5B10', colors.accentTint],
                            ['A', 'Absent', colors.danger, colors.dangerTint],
                          ] as const
                        ).map(([code, label, textColor, bgTint]) => {
                          const isMarked = mark === code;
                          return (
                            <TouchableOpacity
                              key={code}
                              onPress={() => setStudentMark(sid, code)}
                              style={{
                                paddingVertical: 4,
                                paddingHorizontal: 10,
                                borderRadius: radius.sm,
                                borderWidth: 1,
                                borderColor: isMarked ? textColor : colors.border,
                                backgroundColor: isMarked ? bgTint : colors.surface,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontWeight: isMarked ? '700' : '500',
                                  color: isMarked ? textColor : colors.inkSoft,
                                }}
                              >
                                {label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <Button
              variant="primary"
              size="lg"
              icon={Check}
              onPress={handleSave}
              isDark={isDark}
              style={{ alignSelf: 'flex-start' }}
            >
              Save {subject} Attendance for {date}
            </Button>
          </Card>

          {/* Today's Entries Overview */}
          <Card isDark={isDark}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm }}>
              Today's Recorded Sessions ({todaysEntries.length})
            </Text>

            {todaysEntries.length === 0 ? (
              <Text style={{ fontSize: 13, color: colors.inkSoft }}>
                No attendance marked for today yet.
              </Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {todaysEntries.map((e) => {
                  const counts = { P: 0, L: 0, A: 0 };
                  Object.values(e.records).forEach((val) => {
                    if (counts[val] !== undefined) counts[val]++;
                  });

                  return (
                    <TouchableOpacity
                      key={e.id}
                      onPress={() => {
                        setDate(e.date);
                        setSubject(e.subject);
                        setTime(e.time);
                      }}
                      style={{
                        backgroundColor: colors.surface2,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: radius.md,
                        padding: spacing.md,
                        minWidth: 200,
                        gap: 6,
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.ink }}>
                        {e.subject} • {e.time}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <Stamp tone="green" isDark={isDark}>{counts.P} Present</Stamp>
                        <Stamp tone="amber" isDark={isDark}>{counts.L} Late</Stamp>
                        <Stamp tone="red" isDark={isDark}>{counts.A} Absent</Stamp>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </Card>

          {/* Monthly Attendance Table & CSV Export */}
          <Card isDark={isDark}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
                  Monthly Attendance Roster
                </Text>
                <Text style={{ fontSize: 12, color: colors.inkSoft }}>Month: {selectedMonth}</Text>
              </View>

              <Button
                size="sm"
                variant="ghost"
                icon={Download}
                onPress={handleExportMonthCsv}
                isDark={isDark}
              >
                Export Month CSV
              </Button>
            </View>

            <View style={{ gap: spacing.xs }}>
              {cls.studentIds.map((sid) => {
                const student = users.find((u) => u.id === sid);
                const pct = calculateStudentPct(sid, selectedMonth);
                const isLow = pct !== null && pct < 75;

                return (
                  <View
                    key={sid}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 8,
                      paddingHorizontal: spacing.md,
                      backgroundColor: colors.surface2,
                      borderRadius: radius.md,
                    }}
                  >
                    <Text style={{ fontSize: 13.5, fontWeight: '600', color: colors.ink }}>
                      {student?.name || sid}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: isLow ? colors.danger : colors.ink }}>
                        {pct !== null ? `${pct}%` : '—'}
                      </Text>
                      {isLow && <Stamp tone="red" isDark={isDark}>Below 75%</Stamp>}
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        </>
      ) : (
        /* STUDENT ATTENDANCE VIEW */
        <>
          {/* Summary Ring Card */}
          <Card isDark={isDark}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xl, flexWrap: 'wrap' }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: 6,
                  borderColor:
                    studentOverallPct !== null && studentOverallPct < 75
                      ? colors.danger
                      : colors.brand,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: '700', color: colors.ink }}>
                  {studentOverallPct !== null ? `${studentOverallPct}%` : '—'}
                </Text>
              </View>

              <View style={{ flex: 1, minWidth: 200 }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: colors.ink }}>
                  Your Overall Class Attendance
                </Text>
                <Text style={{ fontSize: 13, color: colors.inkSoft, marginTop: 2 }}>
                  {studentHistory.length} total lecture periods recorded
                </Text>

                {studentOverallPct !== null && studentOverallPct < 75 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      marginTop: spacing.sm,
                      backgroundColor: colors.dangerTint,
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      borderRadius: radius.sm,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <AlertTriangle size={14} color={colors.danger} />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.danger }}>
                      Your attendance is below the 75% institute threshold.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Card>

          {/* Monthly Breakdown */}
          <Card isDark={isDark}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm }}>
              Monthly Performance
            </Text>

            <View style={{ gap: spacing.xs }}>
              {studentMonths.map((m) => {
                const mp = calculateStudentPct(userId, m);
                return (
                  <View
                    key={m}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 8,
                      paddingHorizontal: spacing.md,
                      backgroundColor: colors.surface2,
                      borderRadius: radius.md,
                    }}
                  >
                    <Text style={{ fontSize: 13.5, fontWeight: '600', color: colors.ink }}>
                      {m}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.ink }}>
                        {mp !== null ? `${mp}%` : '—'}
                      </Text>
                      {mp !== null && mp < 75 && <Stamp tone="red" isDark={isDark}>Low</Stamp>}
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>

          {/* Detailed History */}
          <Card isDark={isDark}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm }}>
              Lecture History
            </Text>

            <View style={{ gap: spacing.xs }}>
              {studentHistory.map((h) => {
                const status = h.records[userId];
                const tone: StampTone = status === 'P' ? 'green' : status === 'L' ? 'amber' : 'red';
                const label = status === 'P' ? 'Present' : status === 'L' ? 'Late' : 'Absent';

                return (
                  <View
                    key={h.id}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 8,
                      paddingHorizontal: spacing.md,
                      backgroundColor: colors.surface2,
                      borderRadius: radius.md,
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: 13.5, fontWeight: '600', color: colors.ink }}>
                        {fmtDate(h.date)}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.inkSoft }}>
                        {h.subject} • {h.time}
                      </Text>
                    </View>

                    <Stamp tone={tone} isDark={isDark}>
                      {label}
                    </Stamp>
                  </View>
                );
              })}
            </View>
          </Card>
        </>
      )}
    </View>
  );
};
