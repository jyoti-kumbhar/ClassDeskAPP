import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { BookOpen, GraduationCap, Users, Brain } from 'lucide-react-native';
import { AppDatabase } from '../../services/dataStore';
import { lightColors, darkColors, radius, spacing } from '../../theme';
import { Card, StatCard } from '../../components/common/Card';
import { CodeChip } from '../../components/common/CodeChip';

interface AdminDashboardScreenProps {
  db: AppDatabase;
  isDark?: boolean;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  db,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;

  const teachers = db.users.filter((u) => u.role === 'teacher');
  const students = db.users.filter((u) => u.role === 'student');

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Institute Hero Banner */}
      <View
        style={{
          backgroundColor: colors.brand,
          borderRadius: radius.lg,
          padding: spacing.xl,
          marginBottom: spacing.lg,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: spacing.md,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: 'rgba(255, 255, 255, 0.8)',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: 4,
            }}
          >
            Your Institute
          </Text>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#FFFFFF' }}>
            {db.institute.name}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: 'rgba(255, 255, 255, 0.8)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 4,
            }}
          >
            Institute Code
          </Text>
          <CodeChip code={db.institute.code} inverted isDark={isDark} />
        </View>
      </View>

      {/* Stats Cards Grid */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        <StatCard
          title="Active Classes"
          value={db.classes.length}
          icon={BookOpen}
          isDark={isDark}
        />
        <StatCard
          title="Teachers"
          value={teachers.length}
          icon={GraduationCap}
          isDark={isDark}
        />
        <StatCard
          title="Students Enrolled"
          value={students.length}
          icon={Users}
          isDark={isDark}
        />
        <StatCard
          title="Exams Created"
          value={db.exams.length}
          icon={Brain}
          isDark={isDark}
        />
      </View>

      {/* Classes at a Glance Table */}
      <Card isDark={isDark}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.md }}>
          Classes Overview
        </Text>

        <View style={{ gap: spacing.sm }}>
          {db.classes.map((cls) => {
            const teacher = db.users.find((u) => u.id === cls.teacherId);
            return (
              <View
                key={cls.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  backgroundColor: colors.surface2,
                  borderRadius: radius.md,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }}>
                    {cls.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.inkSoft }}>
                    {cls.subject} • {teacher ? teacher.name : 'Unassigned'}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <Text style={{ fontSize: 12.5, color: colors.inkSoft, fontWeight: '500' }}>
                    {cls.studentIds.length} students
                  </Text>
                  <CodeChip code={cls.joinCode} isDark={isDark} />
                </View>
              </View>
            );
          })}
        </View>
      </Card>
    </ScrollView>
  );
};
