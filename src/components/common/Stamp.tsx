import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { lightColors, darkColors, radius, spacing } from '../../theme';

export type StampTone = 'neutral' | 'green' | 'amber' | 'red' | 'brand';

interface StampProps {
  children: React.ReactNode;
  tone?: StampTone;
  isDark?: boolean;
  style?: ViewStyle;
}

export const Stamp: React.FC<StampProps> = ({
  children,
  tone = 'neutral',
  isDark = false,
  style,
}) => {
  const colors = isDark ? darkColors : lightColors;

  let bg = colors.surface2;
  let text = colors.inkSoft;
  let border = colors.border;

  switch (tone) {
    case 'green':
      bg = isDark ? '#17352A' : '#E1F5EA';
      text = isDark ? '#6FE0A8' : '#1E7A52';
      border = isDark ? '#1E7A52' : '#A3E2C4';
      break;
    case 'amber':
      bg = isDark ? '#3A2A1C' : colors.accentTint;
      text = isDark ? colors.accent : '#9A5B10';
      border = isDark ? '#9A5B10' : '#FFCF9E';
      break;
    case 'red':
      bg = isDark ? '#3A222A' : colors.dangerTint;
      text = isDark ? '#F27085' : colors.danger;
      border = isDark ? colors.danger : '#F5B8C1';
      break;
    case 'brand':
      bg = colors.brandTint;
      text = colors.brandDark;
      border = colors.brand;
      break;
    case 'neutral':
    default:
      bg = colors.surface2;
      text = colors.inkSoft;
      border = colors.border;
      break;
  }

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: 1,
          borderRadius: radius.sm,
          paddingVertical: 3,
          paddingHorizontal: 8,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text
        style={{
          color: text,
          fontSize: 10.5,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {children}
      </Text>
    </View>
  );
};
