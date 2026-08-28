import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { GraduationCap, Users, UserCheck, UserX, Trash2 } from 'lucide-react-native';
import { AppDatabase } from '../../services/dataStore';
import { UserRole } from '../../types';
import { lightColors, darkColors, radius, spacing, typography } from '../../theme';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Stamp } from '../../components/common/Stamp';
import { EmptyState } from '../../components/common/EmptyState';
import { SearchBar } from '../../components/common/SearchBar';

interface AdminPeopleScreenProps {
  db: AppDatabase;
  role: 'teacher' | 'student';
  onToggleStatus: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
  isDark?: boolean;
}

export const AdminPeopleScreen: React.FC<AdminPeopleScreenProps> = ({
  db,
  role,
  onToggleStatus,
  onRemoveUser,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const people = db.users.filter((u) => u.role === role);
  const Icon = role === 'teacher' ? GraduationCap : Users;

  const filteredPeople = useMemo(() => {
    return people.filter((u) => {
      // Status filter
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const enrolledClasses = db.classes.filter(
        (c) => c.teacherId === u.id || c.studentIds.includes(u.id)
      );
      const inClasses = enrolledClasses.some((c) => c.name.toLowerCase().includes(q));

      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        inClasses
      );
    });
  }, [people, db.classes, searchQuery, statusFilter]);

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
          <Text style={{ fontSize: 17, fontWeight: '700', color: colors.ink, textTransform: 'capitalize' }}>
            {role}s Roster ({people.length})
          </Text>

          {/* Status Filter Pills */}
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {(['all', 'active', 'inactive'] as const).map((st) => {
              const isSelected = statusFilter === st;
              return (
                <TouchableOpacity
                  key={st}
                  onPress={() => setStatusFilter(st)}
                  style={{
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    borderRadius: radius.md,
                    backgroundColor: isSelected ? colors.brandTint : colors.surface2,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.brand : colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: isSelected ? '700' : '500',
                      color: isSelected ? colors.brandDark : colors.inkSoft,
                      textTransform: 'capitalize',
                    }}
                  >
                    {st}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Search Bar */}
        {people.length > 0 && (
          <View style={{ marginBottom: spacing.md }}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search ${role}s by name, email, or class...`}
              isDark={isDark}
            />
          </View>
        )}

        {people.length === 0 ? (
          <EmptyState icon={Icon} title={`No ${role}s in institute yet`} isDark={isDark} />
        ) : filteredPeople.length === 0 ? (
          <EmptyState
            icon={Icon}
            title={`No matching ${role}s`}
            hint={`No ${role}s found matching your search and filter criteria.`}
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            isDark={isDark}
          />
        ) : (
          <View style={{ gap: spacing.md }}>
            {filteredPeople.map((u) => {
              const enrolledClasses = db.classes.filter(
                (c) => c.teacherId === u.id || c.studentIds.includes(u.id)
              );

              return (
                <View
                  key={u.id}
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
                  <View style={{ flex: 1, minWidth: 180 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <Text style={{ fontSize: 14.5, fontWeight: '700', color: colors.ink }}>
                        {u.name}
                      </Text>
                      <Stamp tone={u.status === 'active' ? 'green' : 'red'} isDark={isDark}>
                        {u.status}
                      </Stamp>
                    </View>
                    <Text style={{ fontSize: 12.5, color: colors.inkSoft, marginTop: 2 }}>
                      {u.email}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.inkSoft, marginTop: 2 }}>
                      Classes: {enrolledClasses.map((c) => c.name).join(', ') || 'None'}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={u.status === 'active' ? UserX : UserCheck}
                      onPress={() => onToggleStatus(u.id)}
                      isDark={isDark}
                    >
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost-danger"
                      icon={Trash2}
                      onPress={() => onRemoveUser(u.id)}
                      isDark={isDark}
                    >
                      Remove
                    </Button>
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
