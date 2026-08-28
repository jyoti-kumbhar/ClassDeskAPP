import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Platform } from 'react-native';
import { User, Trash2, Building, Check } from 'lucide-react-native';
import { Profile, Institute, ClassItem } from '../../types';
import { lightColors, darkColors, radius, spacing, typography, shadows } from '../../theme';
import { Card } from '../../components/common/Card';
import { Field, Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

interface ProfileScreenProps {
  user: Profile;
  institute: Institute;
  classes: ClassItem[];
  onUpdateName: (newName: string) => void;
  onJoinInstitute: (code: string) => void;
  onDeleteAccount: () => void;
  isDark?: boolean;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  institute,
  classes,
  onUpdateName,
  onJoinInstitute,
  onDeleteAccount,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;
  const [name, setName] = useState(user.name);
  const [showJoinInstituteModal, setShowJoinInstituteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [instCode, setInstCode] = useState('');

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSaveName = () => {
    if (!name.trim()) return;
    onUpdateName(name.trim());
  };

  const handleJoinInst = () => {
    if (!instCode.trim()) return;
    onJoinInstitute(instCode.trim().toUpperCase());
    setShowJoinInstituteModal(false);
    setInstCode('');
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Profile Overview Card */}
      <Card isDark={isDark}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.lg,
            marginBottom: spacing.xl,
            flexWrap: 'wrap',
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.brandTint,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.brandDark }}>
              {initials}
            </Text>
          </View>

          <View style={{ flex: 1, minWidth: 200 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.ink }}>
              {user.name}
            </Text>
            <Text style={{ fontSize: 13, color: colors.inkSoft, textTransform: 'capitalize' }}>
              {user.role} • {user.email}
            </Text>
          </View>
        </View>

        {/* Editable Name Field */}
        <Field label="Display Name" isDark={isDark}>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            isDark={isDark}
          />
        </Field>

        <Button
          variant="primary"
          size="md"
          icon={Check}
          disabled={!name.trim() || name === user.name}
          onPress={handleSaveName}
          isDark={isDark}
          style={{ alignSelf: 'flex-start', marginTop: spacing.xs }}
        >
          Save Changes
        </Button>

        {/* Profile Metadata Grid */}
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.md,
            marginTop: spacing.xl,
            paddingTop: spacing.lg,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            flexWrap: 'wrap',
          }}
        >
          <View style={{ flex: 1, minWidth: 120 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.inkSoft, textTransform: 'uppercase' }}>
              Account Role
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink, marginTop: 2, textTransform: 'capitalize' }}>
              {user.role}
            </Text>
          </View>

          <View style={{ flex: 1, minWidth: 120 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.inkSoft, textTransform: 'uppercase' }}>
              Institute
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink, marginTop: 2 }}>
              {institute.name}
            </Text>
          </View>

          <View style={{ flex: 1, minWidth: 120 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.inkSoft, textTransform: 'uppercase' }}>
              Associated Classes
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink, marginTop: 2 }}>
              {classes.length} classes
            </Text>
          </View>
        </View>
      </Card>

      {/* Institute Section for Teachers */}
      {user.role === 'teacher' && (
        <Card isDark={isDark}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink }}>
                Institute Affiliation
              </Text>
              <Text style={{ fontSize: 13, color: colors.inkSoft, marginTop: 2 }}>
                Currently affiliated with <Text style={{ fontWeight: '600', color: colors.ink }}>{institute.name}</Text>
              </Text>
            </View>

            <Button
              size="sm"
              variant="ghost"
              icon={Building}
              onPress={() => setShowJoinInstituteModal(true)}
              isDark={isDark}
            >
              Join Institute
            </Button>
          </View>
        </Card>
      )}

      {/* Danger Zone */}
      <Card
        isDark={isDark}
        style={{
          borderColor: isDark ? '#5C222E' : colors.dangerTint,
          backgroundColor: isDark ? '#261922' : '#FFF9FA',
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.danger, marginBottom: 4 }}>
          Danger Zone
        </Text>
        <Text style={{ fontSize: 13, color: colors.inkSoft, marginBottom: spacing.md }}>
          Deleting your account permanently unlinks your classes, submissions, and records. This action cannot be reversed.
        </Text>

        <Button
          variant="ghost-danger"
          size="sm"
          icon={Trash2}
          onPress={() => setShowDeleteConfirm(true)}
          isDark={isDark}
          style={{ alignSelf: 'flex-start' }}
        >
          Delete Account
        </Button>
      </Card>

      {/* Join Institute Modal */}
      {showJoinInstituteModal && (
        <Modal
          title="Join Another Institute"
          onClose={() => setShowJoinInstituteModal(false)}
          isDark={isDark}
        >
          <Field label="Institute Code" hint="Ask your administrator for the code" isDark={isDark}>
            <Input
              value={instCode}
              onChangeText={setInstCode}
              placeholder="e.g. CREST-2026"
              autoCapitalize="characters"
              isDark={isDark}
            />
          </Field>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!instCode.trim()}
            onPress={handleJoinInst}
            isDark={isDark}
            style={{ marginTop: spacing.sm }}
          >
            Join Institute
          </Button>
        </Modal>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          title="Confirm Account Deletion"
          onClose={() => setShowDeleteConfirm(false)}
          isDark={isDark}
        >
          <Text style={{ fontSize: 14, color: colors.ink, lineHeight: 20, marginBottom: spacing.lg }}>
            Are you sure you want to delete your account? All your class enrollments and progress data will be permanently removed.
          </Text>

          <View style={{ flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end' }}>
            <Button
              variant="ghost"
              size="md"
              onPress={() => setShowDeleteConfirm(false)}
              isDark={isDark}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              icon={Trash2}
              onPress={() => {
                setShowDeleteConfirm(false);
                onDeleteAccount();
              }}
              isDark={isDark}
            >
              Permanently Delete
            </Button>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};
