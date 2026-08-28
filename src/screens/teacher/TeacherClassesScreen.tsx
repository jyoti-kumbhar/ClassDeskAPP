import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { BookOpen, Plus, ChevronRight, Users } from 'lucide-react-native';
import { ClassItem, Profile } from '../../types';
import { lightColors, darkColors, radius, spacing, shadows } from '../../theme';
import { Modal } from '../../components/common/Modal';
import { Field, Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { SearchBar } from '../../components/common/SearchBar';

interface TeacherClassesScreenProps {
  classes: ClassItem[];
  user: Profile;
  onOpenClass: (classId: string) => void;
  onCreateClass: (name: string, subject: string) => void;
  isDark?: boolean;
}

export const TeacherClassesScreen: React.FC<TeacherClassesScreenProps> = ({
  classes,
  user,
  onOpenClass,
  onCreateClass,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [formError, setFormError] = useState('');

  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classes;
    const q = searchQuery.toLowerCase().trim();
    return classes.filter(
      (c) => c.name.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q)
    );
  }, [classes, searchQuery]);

  const handleCreate = () => {
    if (!className.trim()) {
      setFormError('Please enter a class name.');
      return;
    }
    if (!subject.trim()) {
      setFormError('Please enter a subject name.');
      return;
    }
    setFormError('');
    onCreateClass(className.trim(), subject.trim());
    setClassName('');
    setSubject('');
    setShowCreateModal(false);
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
            My Assigned Classes
          </Text>
          <Text style={{ fontSize: 13, color: colors.inkSoft, marginTop: 2 }}>
            Manage notices, resources, assignments, roll call, and exams
          </Text>
        </View>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onPress={() => {
            setFormError('');
            setShowCreateModal(true);
          }}
          isDark={isDark}
        >
          Create Class
        </Button>
      </View>

      {/* Search Bar if classes exist */}
      {classes.length > 0 && (
        <View style={{ marginBottom: spacing.lg }}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search classes by name or subject..."
            isDark={isDark}
          />
        </View>
      )}

      {/* Grid of Class Cards */}
      {classes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No classes yet"
          hint="Create your first class to get started sharing materials, publishing assignments, and taking attendance."
          actionLabel="Create a Class"
          onAction={() => setShowCreateModal(true)}
          isDark={isDark}
        />
      ) : filteredClasses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No matching classes"
          hint={`No classes found matching "${searchQuery}". Check your search keyword.`}
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
          {filteredClasses.map((cls) => (
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
                <Users size={14} color={colors.inkSoft} />
                <Text style={{ fontSize: 12.5, color: colors.inkSoft, fontWeight: '600' }}>
                  {cls.studentIds.length} enrolled students
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <Modal
          title="Create a New Class"
          onClose={() => setShowCreateModal(false)}
          isDark={isDark}
        >
          <Field
            label="Class Name"
            hint="e.g. Grade 11 Physics, AP Chemistry"
            error={formError && !className.trim() ? formError : undefined}
            isDark={isDark}
          >
            <Input
              value={className}
              onChangeText={(txt) => {
                setClassName(txt);
                if (formError) setFormError('');
              }}
              placeholder="e.g. Physics XI-A"
              isDark={isDark}
            />
          </Field>

          <Field
            label="Subject"
            hint="The primary course subject"
            error={formError && className.trim() && !subject.trim() ? formError : undefined}
            isDark={isDark}
          >
            <Input
              value={subject}
              onChangeText={(txt) => {
                setSubject(txt);
                if (formError) setFormError('');
              }}
              placeholder="e.g. Physics"
              isDark={isDark}
            />
          </Field>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!className.trim() || !subject.trim()}
            onPress={handleCreate}
            isDark={isDark}
            style={{ marginTop: spacing.sm }}
          >
            Create Class
          </Button>
        </Modal>
      )}
    </ScrollView>
  );
};
