import React from 'react';
import { View, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { lightColors, darkColors, spacing } from '../../theme';

interface LoadingStateProps {
  message?: string;
  isDark?: boolean;
  style?: ViewStyle;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
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
          gap: spacing.md,
        },
        style,
      ]}
    >
      <ActivityIndicator size="large" color={colors.brand} />
      {message && (
        <Text style={{ fontSize: 13.5, color: colors.inkSoft, fontWeight: '500' }}>
          {message}
        </Text>
      )}
    </View>
  );
};
