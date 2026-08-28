import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { BookOpen, UserX } from 'lucide-react-native';
import { AppDatabase } from '../../services/dataStore';
import { lightColors, darkColors, radius, spacing, typography } from '../../theme';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CodeChip } from '../../components/common/CodeChip';
import { EmptyState } from '../../components/common/EmptyState';
import { SearchBar } from '../../components/common/SearchBar';

interface AdminClassesScreenProps {
  db: AppDatabase;
  onRemoveTeacher: (classId: string) => void;
  isDark?: boolean;
}

export const AdminClassesScreen: React.FC<AdminClassesScreenProps> = ({
  db,
  onRemoveTeacher,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return db.classes;
    const q = searchQuery.toLowerCase().trim();
    return db.classes.filter((cls) => {
      const teacher = db.users.find((u) => u.id === cls.teacherId);
      return (
        cls.name.toLowerCase().includes(q) ||
        cls.subject.toLowerCase().includes(q) ||
        cls.joinCode.toLowerCase().includes(q) ||
        (teacher && teacher.name.toLowerCase().includes(q))
      );
    });
  }, [db.classes, db.users, searchQuery]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <Card isDark={isDark}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: spacing.sm,
            marginBottom: spacing.md,
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: '700', color: colors.ink }}>
            All Institute Classes ({db.classes.length})
          </Text>
        </View>

        {/* Search Bar */}
        {db.classes.length > 0 && (
          <View style={{ marginBottom: spacing.md }}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search classes by name, subject, teacher, or code..."
              isDark={isDark}
            />
          </View>
        )}

        {db.classes.length === 0 ? (
          <EmptyState icon={BookOpen} title="No classes in institute yet" isDark={isDark} />
        ) : filteredClasses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No matching classes"
            hint={`No classes found matching "${searchQuery}".`}
            actionLabel="Clear Search"
            onAction={() => setSearchQuery('')}
            isDark={isDark}
          />
        ) : (
          <View style={{ gap: spacing.md }}>
            {filteredClasses.map((cls) => {
              const teacher = db.users.find((u) => u.id === cls.teacherId);
              return (
                <View
                  key={cls.id}
                  style={{
                    backgroundColor: colors.surface2,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: spacing.sm,
                  }}
                >
                  <View style={{ flex: 1, minWidth: 200 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink }}>
                      {cls.name}
                    </Text>
                    <Text style={{ fontSize: 12.5, color: colors.inkSoft, marginTop: 2 }}>
                      Subject: {cls.subject} • {cls.studentIds.length} students enrolled
                    </Text>
                    <Text style={{ fontSize: 12.5, color: colors.inkSoft, marginTop: 2 }}>
                      Teacher: <Text style={{ fontWeight: '600', color: colors.ink }}>{teacher ? teacher.name : 'None (Unassigned)'}</Text>
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <CodeChip code={cls.joinCode} isDark={isDark} />
                    {teacher && (
                      <Button
                        size="sm"
                        variant="ghost-danger"
                        icon={UserX}
                        onPress={() => onRemoveTeacher(cls.id)}
                        isDark={isDark}
                      >
                        Remove Teacher
                      </Button>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Card>
    </ScrollView>
  );
};
