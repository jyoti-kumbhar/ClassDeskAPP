import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { lightColors, darkColors, radius, spacing, typography, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  isDark?: boolean;
  onPress?: () => void;
  variant?: 'surface' | 'subcard';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  isDark = false,
  onPress,
  variant = 'surface',
}) => {
  const colors = isDark ? darkColors : lightColors;

  const containerStyle: ViewStyle = {
    backgroundColor: variant === 'subcard' ? colors.surface2 : colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...(variant === 'surface' && !isDark ? shadows.sm : {}),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[containerStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[containerStyle, style]}>{children}</View>;
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<any>;
  isDark?: boolean;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  isDark = false,
  style,
}) => {
  const colors = isDark ? darkColors : lightColors;

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          flex: 1,
          minWidth: 140,
        },
        style,
      ]}
    >
      {Icon && (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: radius.md,
            backgroundColor: colors.brandTint,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={20} color={colors.brand} />
        </View>
      )}
      <View>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.ink }}>{value}</Text>
        <Text style={{ fontSize: 12, color: colors.inkSoft, marginTop: 2 }}>{title}</Text>
      </View>
    </View>
  );
};
