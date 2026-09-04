import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { UserCog, GraduationCap, BookOpen } from 'lucide-react-native';
import { UserRole } from '../../types';
import { lightColors, darkColors, radius, spacing, shadows } from '../../theme';
import { Field, Input, PasswordInput } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { BrandLogo } from '../../components/common/BrandLogo';

interface LoginScreenProps {
  onLogin: (email: string, pass: string, role: UserRole) => void;
  onQuickDemoLogin: (role: UserRole) => void;
  onGoSignup: () => void;
  onGoForgot: () => void;
  isDark?: boolean;
  isLoading?: boolean;
}

const ROLE_OPTIONS: { role: UserRole; label: string; icon: any }[] = [
  { role: 'teacher', label: 'Teacher', icon: GraduationCap },
  { role: 'student', label: 'Student', icon: BookOpen },
  { role: 'admin', label: 'Admin', icon: UserCog },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onQuickDemoLogin,
  onGoSignup,
  onGoForgot,
  isDark = false,
  isLoading = false,
}) => {
  const colors = isDark ? darkColors : lightColors;
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const demoNames: Record<UserRole, string> = {
    teacher: 'Rohan Iyer (Teacher)',
    student: 'Aarav Shah (Student)',
    admin: 'Meera Kapoor (Admin)',
  };

  const handleSubmit = () => {
    if (!email.trim() || !password) return;
    onLogin(email.trim(), password, selectedRole);
  };

  return (
    <ScrollView
      style={{ flex: 1, width: '100%' }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: colors.bg,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Brand Header */}
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.xl,
          maxWidth: 400,
          width: '100%',
        }}
      >
        <BrandLogo size="lg" showSubtitle={false} isDark={isDark} />
      </View>

      {/* Auth Card */}
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
          Welcome back
        </Text>
        <Text style={{ fontSize: 13, color: colors.inkSoft, marginBottom: spacing.lg }}>
          Log in to your ClassDesk account
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

        {/* Credentials Form */}
        <Field label="Email" isDark={isDark}>
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
            placeholder="••••••••"
            isDark={isDark}
          />
        </Field>

        <TouchableOpacity
          onPress={onGoForgot}
          style={{ alignSelf: 'flex-start', marginBottom: spacing.lg, marginTop: -4 }}
        >
          <Text style={{ fontSize: 13, color: colors.info, fontWeight: '600' }}>
            Forgot password?
          </Text>
        </TouchableOpacity>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={!email || !password}
          onPress={handleSubmit}
          isDark={isDark}
        >
          Log in as {selectedRole}
        </Button>

        {/* Divider */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: spacing.lg,
            gap: spacing.sm,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text style={{ fontSize: 12, color: colors.inkSoft }}>or quick demo</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        {/* Quick Demo Login */}
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onPress={() => onQuickDemoLogin(selectedRole)}
          isDark={isDark}
        >
          Demo Login — {demoNames[selectedRole]}
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
          <Text style={{ fontSize: 13, color: colors.inkSoft }}>New to ClassDesk?</Text>
          <TouchableOpacity onPress={onGoSignup}>
            <Text style={{ fontSize: 13, color: colors.info, fontWeight: '600' }}>
              Create account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};
