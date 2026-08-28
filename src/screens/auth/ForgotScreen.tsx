import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { KeyRound, ArrowLeft } from 'lucide-react-native';
import { lightColors, darkColors, radius, spacing, shadows } from '../../theme';
import { Field, Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

interface ForgotScreenProps {
  onResetPassword: (email: string) => void;
  onGoLogin: () => void;
  isDark?: boolean;
  isLoading?: boolean;
}

export const ForgotScreen: React.FC<ForgotScreenProps> = ({
  onResetPassword,
  onGoLogin,
  isDark = false,
  isLoading = false,
}) => {
  const colors = isDark ? darkColors : lightColors;
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = () => {
    if (!email.trim()) return;
    onResetPassword(email.trim());
    setIsSent(true);
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
          <KeyRound size={24} color={colors.brandDark} />
        </View>

        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.ink, marginBottom: 4 }}>
          Reset your password
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: colors.inkSoft,
            textAlign: 'center',
            marginBottom: spacing.lg,
          }}
        >
          Enter your registered email to receive a password reset link
        </Text>

        {!isSent ? (
          <View style={{ width: '100%' }}>
            <Field label="Email address" isDark={isDark}>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="you@school.edu"
                keyboardType="email-address"
                autoCapitalize="none"
                isDark={isDark}
              />
            </Field>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={!email}
              onPress={handleSubmit}
              isDark={isDark}
            >
              Send reset link
            </Button>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: colors.surface2,
              borderRadius: radius.md,
              padding: spacing.md,
              marginBottom: spacing.lg,
              width: '100%',
            }}
          >
            <Text style={{ fontSize: 13, color: colors.ink, textAlign: 'center', lineHeight: 18 }}>
              A password reset link has been sent to <Text style={{ fontWeight: '700' }}>{email}</Text>.
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={onGoLogin}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginTop: spacing.lg,
          }}
        >
          <ArrowLeft size={14} color={colors.info} />
          <Text style={{ fontSize: 13, color: colors.info, fontWeight: '600' }}>
            Back to login
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
