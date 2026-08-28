import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { School, UserCog, GraduationCap, BookOpen } from 'lucide-react-native';
import { UserRole } from '../../types';
import { lightColors, darkColors, radius, spacing, typography, shadows } from '../../theme';
import { Field, Input, PasswordInput } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

interface SignupScreenProps {
  onSignup: (name: string, email: string, pass: string, role: UserRole) => void;
  onGoLogin: () => void;
  isDark?: boolean;
  isLoading?: boolean;
}

const ROLE_OPTIONS: { role: UserRole; label: string; icon: any }[] = [
  { role: 'student', label: 'Student', icon: BookOpen },
  { role: 'teacher', label: 'Teacher', icon: GraduationCap },
  { role: 'admin', label: 'Admin', icon: UserCog },
];

export const SignupScreen: React.FC<SignupScreenProps> = ({
  onSignup,
  onGoLogin,
  isDark = false,
  isLoading = false,
}) => {
  const colors = isDark ? darkColors : lightColors;
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !password) return;
    onSignup(name.trim(), email.trim(), password, selectedRole);
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: colors.bg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          marginBottom: spacing.xl,
          maxWidth: 400,
          width: '100%',
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.md,
            backgroundColor: colors.brand,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <School size={22} color="#FFFFFF" />
        </View>
        <View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.ink }}>
            ClassDesk
          </Text>
          <Text style={{ fontSize: 12.5, color: colors.inkSoft }}>
            The staff room, roll call and gradebook — in one place.
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.xl,
          padding: spacing.xl,
          width: '100%',
          maxWidth: 400,
          ...shadows.md,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.ink, marginBottom: 4 }}>
          Create your account
        </Text>
        <Text style={{ fontSize: 13, color: colors.inkSoft, marginBottom: spacing.lg }}>
          Choose your role to get started
        </Text>

        {/* Role Selector */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
          {ROLE_OPTIONS.map((item) => {
            const isSelected = selectedRole === item.role;
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.role}
                activeOpacity={0.8}
                onPress={() => setSelectedRole(item.role)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.brand : colors.border,
                  backgroundColor: isSelected ? colors.brandTint : colors.surface2,
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Icon
                  size={18}
                  color={isSelected ? colors.brandDark : colors.inkSoft}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: isSelected ? '700' : '500',
                    color: isSelected ? colors.brandDark : colors.inkSoft,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Field label="Full Name" isDark={isDark}>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Jordan Lee"
            isDark={isDark}
          />
        </Field>

        <Field label="Email Address" isDark={isDark}>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="you@school.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            isDark={isDark}
          />
        </Field>

        <Field label="Password" isDark={isDark}>
          <PasswordInput
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            isDark={isDark}
          />
        </Field>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={!name || !email || !password}
          onPress={handleSubmit}
          isDark={isDark}
          style={{ marginTop: spacing.sm }}
        >
          Sign up as {selectedRole}
        </Button>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: spacing.xl,
            gap: spacing.xs,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.inkSoft }}>Already have an account?</Text>
          <TouchableOpacity onPress={onGoLogin}>
            <Text style={{ fontSize: 13, color: colors.info, fontWeight: '600' }}>
              Log in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};
