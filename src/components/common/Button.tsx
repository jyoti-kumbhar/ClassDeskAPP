import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { lightColors, darkColors, radius, spacing, typography } from '../../theme';

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'ghost-danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  isDark?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: 'transparent',
    };

    if (fullWidth) base.width = '100%';

    // Size
    if (size === 'sm') {
      base.paddingVertical = 6;
      base.paddingHorizontal = 11;
      base.gap = 4;
    } else if (size === 'lg') {
      base.paddingVertical = 12;
      base.paddingHorizontal = 20;
      base.gap = 8;
    } else {
      base.paddingVertical = 9;
      base.paddingHorizontal = 16;
      base.gap = 6;
    }

    // Variant
    switch (variant) {
      case 'primary':
        base.backgroundColor = colors.brand;
        base.borderColor = colors.brand;
        break;
      case 'ghost':
        base.backgroundColor = colors.surface2;
        base.borderColor = colors.border;
        break;
      case 'danger':
        base.backgroundColor = colors.danger;
        base.borderColor = colors.danger;
        break;
      case 'ghost-danger':
        base.backgroundColor = colors.dangerTint;
        base.borderColor = 'transparent';
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderColor = colors.border;
        break;
    }

    if (disabled || loading) {
      base.opacity = 0.5;
    }

    return base;
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'ghost':
      case 'outline':
        return colors.ink;
      case 'ghost-danger':
        return colors.danger;
      default:
        return colors.ink;
    }
  };

  const textColor = getTextColor();
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {Icon && <Icon size={iconSize} color={textColor} />}
          {typeof children === 'string' ? (
            <Text
              style={[
                {
                  color: textColor,
                  fontSize: size === 'sm' ? 12.5 : size === 'lg' ? 15 : 13.5,
                  fontWeight: '600',
                },
                textStyle,
              ]}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </>
      )}
    </TouchableOpacity>
  );
};
