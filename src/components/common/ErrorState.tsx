import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { lightColors, darkColors, spacing } from '../../theme';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  isDark?: boolean;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading this information. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  isDark = false,
  style,
}) => {
  const colors = isDark ? darkColors : lightColors;

  return (
    <View
      style={[
        {
          padding: spacing.xxxl,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.xs,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 54,
          height: 54,
          borderRadius: 27,
          backgroundColor: colors.dangerTint,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.sm,
        }}
      >
        <AlertTriangle size={28} color={colors.danger} strokeWidth={1.5} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, textAlign: 'center' }}>
        {title}
      </Text>
      {message && (
        <Text
          style={{
            fontSize: 13,
            color: colors.inkSoft,
            textAlign: 'center',
            maxWidth: 340,
            lineHeight: 18,
          }}
        >
          {message}
        </Text>
      )}
      {onRetry && (
        <View style={{ marginTop: spacing.md }}>
          <Button
            size="sm"
            variant="ghost"
            icon={RefreshCw}
            onPress={onRetry}
            isDark={isDark}
          >
            {retryLabel}
          </Button>
        </View>
      )}
    </View>
  );
};
