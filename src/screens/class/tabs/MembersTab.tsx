import React, { useState, useMemo } from 'react';
import { View, Text } from 'react-native';
import { Users, Trash2, User } from 'lucide-react-native';
import { ClassItem, Profile } from '../../../types';
import { lightColors, darkColors, radius, spacing } from '../../../theme';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { EmptyState } from '../../../components/common/EmptyState';
import { SearchBar } from '../../../components/common/SearchBar';

interface MembersTabProps {
  cls: ClassItem;
  users: Profile[];
  isTeacher: boolean;
  onRemoveStudent: (studentId: string) => void;
  isDark?: boolean;
}

export const MembersTab: React.FC<MembersTabProps> = ({
  cls,
  users,
  isTeacher,
  onRemoveStudent,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;
  const [searchQuery, setSearchQuery] = useState('');

  const enrolledStudents = useMemo(() => {
    return users.filter((u) => cls.studentIds.includes(u.id));
  }, [users, cls.studentIds]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return enrolledStudents;
    const q = searchQuery.toLowerCase().trim();
    return enrolledStudents.filter(
      (st) => st.name.toLowerCase().includes(q) || st.email.toLowerCase().includes(q)
    );
  }, [enrolledStudents, searchQuery]);

  return (
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
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
          Enrolled Class Members ({enrolledStudents.length})
        </Text>
      </View>

      {/* Search Bar */}
      {enrolledStudents.length > 0 && (
        <View style={{ marginBottom: spacing.md }}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search students by name or email..."
            isDark={isDark}
          />
        </View>
      )}

      {enrolledStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students enrolled yet"
          hint={
            isTeacher
              ? `Share the 6-digit class join code (${cls.joinCode}) with your students.`
              : 'No other students have enrolled in this class.'
          }
          isDark={isDark}
        />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No matching students"
          hint={`No students found matching "${searchQuery}".`}
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
          isDark={isDark}
        />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {filteredStudents.map((st) => (
            <View
              key={st.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 10,
                paddingHorizontal: spacing.md,
                backgroundColor: colors.surface2,
                borderRadius: radius.md,
                flexWrap: 'wrap',
                gap: spacing.xs,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, minWidth: 200 }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: colors.brandTint,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={16} color={colors.brandDark} />
                </View>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }}>
                    {st.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.inkSoft }}>
                    {st.email}
                  </Text>
                </View>
              </View>

              {isTeacher && (
                <Button
                  size="sm"
                  variant="ghost-danger"
                  icon={Trash2}
                  onPress={() => onRemoveStudent(st.id)}
                  isDark={isDark}
                >
                  Remove
                </Button>
              )}
            </View>
          ))}
        </View>
      )}
    </Card>
  );
};
