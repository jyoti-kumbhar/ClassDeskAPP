import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  Platform,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { lightColors, darkColors, radius, spacing, typography } from '../../theme';

interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  isDark?: boolean;
}

export const Field: React.FC<FieldProps> = ({
  label,
  error,
  hint,
  children,
  style,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;
  return (
    <View style={[{ marginBottom: spacing.md }, style]}>
      {label && (
        <Text
          style={{
            fontSize: typography.caption.fontSize,
            fontWeight: typography.caption.fontWeight,
            color: colors.inkSoft,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: spacing.xs,
          }}
        >
          {label}
        </Text>
      )}
      {children}
      {hint && !error && (
        <Text style={{ fontSize: 12, color: colors.inkSoft, marginTop: 4 }}>{hint}</Text>
      )}
      {error && (
        <Text style={{ fontSize: 12, color: colors.danger, marginTop: 4, fontWeight: '500' }}>
          {error}
        </Text>
      )}
    </View>
  );
};

interface InputProps extends TextInputProps {
  isDark?: boolean;
  hasError?: boolean;
  icon?: React.ComponentType<any>;
}

export const Input: React.FC<InputProps> = ({
  isDark = false,
  hasError = false,
  icon: Icon,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const colors = isDark ? darkColors : lightColors;
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: hasError
          ? colors.danger
          : isFocused
          ? colors.brand
          : colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        minHeight: 42,
      }}
    >
      {Icon && (
        <View style={{ marginRight: spacing.sm }}>
          <Icon size={18} color={colors.inkSoft} />
        </View>
      )}
      <TextInput
        placeholderTextColor={colors.inkSoft}
        onFocus={(e) => {
          setIsFocused(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (onBlur) onBlur(e);
        }}
        style={[
          {
            flex: 1,
            color: colors.ink,
            fontSize: 14,
            paddingVertical: 8,
            ...Platform.select({
              web: {
                outlineStyle: 'none',
                outlineWidth: 0,
              },
            }),
          },
          style,
        ]}
        {...props}
      />
    </View>
  );
};

interface PasswordInputProps extends Omit<InputProps, 'secureTextEntry'> {}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  onFocus,
  onBlur,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const colors = props.isDark ? darkColors : lightColors;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: props.hasError
          ? colors.danger
          : isFocused
          ? colors.brand
          : colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        minHeight: 42,
      }}
    >
      <TextInput
        secureTextEntry={!showPassword}
        placeholderTextColor={colors.inkSoft}
        onFocus={(e) => {
          setIsFocused(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (onBlur) onBlur(e);
        }}
        style={[
          {
            flex: 1,
            color: colors.ink,
            fontSize: 14,
            paddingVertical: 8,
            ...Platform.select({
              web: {
                outlineStyle: 'none',
                outlineWidth: 0,
              },
            }),
          },
          props.style,
        ]}
        {...props}
      />
      <TouchableOpacity
        onPress={() => setShowPassword((p) => !p)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {showPassword ? (
          <EyeOff size={18} color={colors.inkSoft} />
        ) : (
          <Eye size={18} color={colors.inkSoft} />
        )}
      </TouchableOpacity>
    </View>
  );
};

interface TextAreaProps extends TextInputProps {
  isDark?: boolean;
  hasError?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  isDark = false,
  hasError = false,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const colors = isDark ? darkColors : lightColors;
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      multiline
      numberOfLines={4}
      textAlignVertical="top"
      placeholderTextColor={colors.inkSoft}
      onFocus={(e) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
      }}
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: hasError
            ? colors.danger
            : isFocused
            ? colors.brand
            : colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
          color: colors.ink,
          fontSize: 14,
          minHeight: 80,
          ...Platform.select({
            web: {
              outlineStyle: 'none',
              outlineWidth: 0,
            },
          }),
        },
        style,
      ]}
      {...props}
    />
  );
};
