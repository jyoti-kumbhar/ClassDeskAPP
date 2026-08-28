import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { BookOpen, Plus, ChevronRight, User } from 'lucide-react-native';
import { ClassItem, Profile } from '../../types';
import { lightColors, darkColors, radius, spacing, typography, shadows } from '../../theme';
import { Modal } from '../../components/common/Modal';
import { Field, Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { SearchBar } from '../../components/common/SearchBar';

interface StudentClassesScreenProps {
  classes: ClassItem[];
  user: Profile;
  teacherProfiles: Profile[];
  onOpenClass: (classId: string) => void;
  onJoinClass: (code: string) => void;
  isDark?: boolean;
}

export const StudentClassesScreen: React.FC<StudentClassesScreenProps> = ({
  classes,
  user,
  teacherProfiles,
  onOpenClass,
  onJoinClass,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;
  const [searchQuery, setSearchQuery] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classes;
    const q = searchQuery.toLowerCase().trim();
    return classes.filter((c) => {
      const teacher = teacherProfiles.find((t) => t.id === c.teacherId);
      return (
        c.name.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        (teacher && teacher.name.toLowerCase().includes(q))
      );
    });
  }, [classes, teacherProfiles, searchQuery]);

  const handleJoin = () => {
    const cleanCode = joinCode.replace(/\s+/g, '').toUpperCase();
    if (cleanCode.length < 4) {
      setJoinError('Please enter a valid class code.');
      return;
    }
    setJoinError('');
    onJoinClass(cleanCode);
    setJoinCode('');
    setShowJoinModal(false);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header action bar */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        <View style={{ flex: 1, minWidth: 220 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.ink }}>
            My Enrolled Classes
          </Text>
          <Text style={{ fontSize: 13, color: colors.inkSoft, marginTop: 2 }}>
            Access class notices, study materials, homework, attendance, and online exams
          </Text>
        </View>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onPress={() => {
            setJoinError('');
            setShowJoinModal(true);
          }}
          isDark={isDark}
        >
          Join Class
        </Button>
      </View>

      {/* Search Bar if enrolled in classes */}
      {classes.length > 0 && (
        <View style={{ marginBottom: spacing.lg }}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search classes by name, subject, or teacher..."
            isDark={isDark}
          />
        </View>
      )}

      {/* Grid of Enrolled Class Cards */}
      {classes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Not enrolled in any class"
          hint="Ask your teacher for a 6-digit class code to join your classroom."
          actionLabel="Join a Class"
          onAction={() => setShowJoinModal(true)}
          isDark={isDark}
        />
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
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
          }}
        >
          {filteredClasses.map((cls) => {
            const teacher = teacherProfiles.find((t) => t.id === cls.teacherId);
            return (
              <TouchableOpacity
                key={cls.id}
                activeOpacity={0.8}
                onPress={() => onOpenClass(cls.id)}
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.lg,
                  padding: spacing.lg,
                  flex: 1,
                  minWidth: 260,
                  maxWidth: 360,
                  justifyContent: 'space-between',
                  ...shadows.sm,
                }}
              >
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: spacing.md,
                    }}
                  >
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
                      <BookOpen size={20} color={colors.brandDark} />
                    </View>
                    <ChevronRight size={18} color={colors.inkSoft} />
                  </View>

                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink }}>
                    {cls.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.inkSoft, marginTop: 2 }}>
                    {cls.subject}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: spacing.lg,
                    paddingTop: spacing.sm,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <User size={14} color={colors.inkSoft} />
                  <Text style={{ fontSize: 12.5, color: colors.inkSoft, fontWeight: '600' }}>
                    Teacher: {teacher ? teacher.name : 'Unassigned'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Join Class Modal */}
      {showJoinModal && (
        <Modal
          title="Join a Class"
          onClose={() => setShowJoinModal(false)}
          isDark={isDark}
        >
          <Field
            label="6-Digit Join Code"
            hint="Enter the code provided by your teacher"
            error={joinError || undefined}
            isDark={isDark}
          >
            <Input
              value={joinCode}
              onChangeText={(txt) => {
                setJoinCode(txt.replace(/\s+/g, ''));
                if (joinError) setJoinError('');
              }}
              placeholder="e.g. 491823"
              maxLength={10}
              autoCapitalize="characters"
              isDark={isDark}
            />
          </Field>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={joinCode.trim().length < 4}
            onPress={handleJoin}
            isDark={isDark}
            style={{ marginTop: spacing.sm }}
          >
            Join Class
          </Button>
        </Modal>
      )}
    </ScrollView>
  );
};
