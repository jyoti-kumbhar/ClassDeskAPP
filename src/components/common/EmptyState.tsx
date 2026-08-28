import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { lightColors, darkColors, spacing } from '../../theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ComponentType<any>;
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
  isDark?: boolean;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  hint,
  actionLabel,
  onAction,
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
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: colors.surface2,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.sm,
        }}
      >
        <Icon size={32} color={colors.inkSoft} strokeWidth={1.8} />
      </View>
      <Text style={{ fontSize: 17, fontWeight: '700', color: colors.ink, textAlign: 'center' }}>
        {title}
      </Text>
      {hint && (
        <Text
          style={{
            fontSize: 13,
            color: colors.inkSoft,
            textAlign: 'center',
            maxWidth: 320,
            lineHeight: 18,
          }}
        >
          {hint}
        </Text>
      )}
      {actionLabel && onAction && (
        <View style={{ marginTop: spacing.md }}>
          <Button size="sm" variant="ghost" onPress={onAction} isDark={isDark}>
            {actionLabel}
          </Button>
        </View>
      )}
    </View>
  );
};
