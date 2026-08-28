import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { ToastMessage } from '../../types';
import { lightColors, darkColors, radius, spacing, shadows } from '../../theme';

interface ToastProps {
  toast: ToastMessage | null;
  isDark?: boolean;
}

export const Toast: React.FC<ToastProps> = ({ toast, isDark = false }) => {
  if (!toast) return null;

  const colors = isDark ? darkColors : lightColors;

  let bg = colors.ink;
  let text = '#FFFFFF';

  if (toast.type === 'success') {
    bg = colors.brandDark;
  } else if (toast.type === 'danger') {
    bg = colors.danger;
  } else if (toast.type === 'info') {
    bg = colors.ink;
  }

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 24,
        alignSelf: 'center',
        backgroundColor: bg,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: radius.md,
        zIndex: 9999,
        maxWidth: '90%',
        ...shadows.lg,
      }}
    >
      <Text
        style={{
          color: text,
          fontSize: 13.5,
          fontWeight: '500',
          textAlign: 'center',
        }}
      >
        {toast.msg}
      </Text>
    </View>
  );
};
