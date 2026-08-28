import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Mail, CheckCircle2, RefreshCw } from 'lucide-react-native';
import { Profile } from '../../types';
import { lightColors, darkColors, radius, spacing, shadows } from '../../theme';
import { Button } from '../../components/common/Button';

interface VerifyScreenProps {
  pendingUser: Profile | null;
  onVerify: () => void;
  onResend: () => void;
  isDark?: boolean;
}

export const VerifyScreen: React.FC<VerifyScreenProps> = ({
  pendingUser,
  onVerify,
  onResend,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;

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
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.xl,
          padding: spacing.xl,
          width: '100%',
          maxWidth: 400,
          alignItems: 'center',
          ...shadows.md,
        }}
      >
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: colors.brandTint,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
          }}
        >
          <Mail size={24} color={colors.brandDark} />
        </View>

        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.ink, marginBottom: 4 }}>
          Verify your email
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: colors.inkSoft,
            textAlign: 'center',
            marginBottom: spacing.lg,
          }}
        >
          We sent a verification link to{' '}
          <Text style={{ fontWeight: '700', color: colors.ink }}>
            {pendingUser?.email || 'your email'}
          </Text>
        </Text>

        <View
          style={{
            backgroundColor: colors.surface2,
            borderRadius: radius.md,
            padding: spacing.md,
            marginBottom: spacing.lg,
            width: '100%',
          }}
        >
          <Text style={{ fontSize: 12.5, color: colors.inkSoft, textAlign: 'center', lineHeight: 18 }}>
            Click the link in your email to activate your account, or verify now to continue.
          </Text>
        </View>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={CheckCircle2}
          onPress={onVerify}
          isDark={isDark}
          style={{ marginBottom: spacing.sm }}
        >
          I clicked the verification link
        </Button>

        <Button
          variant="ghost"
          size="md"
          fullWidth
          icon={RefreshCw}
          onPress={onResend}
          isDark={isDark}
        >
          Resend email
        </Button>
      </View>
    </ScrollView>
  );
};
