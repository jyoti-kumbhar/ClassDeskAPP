import React, { useState } from 'react';
import { TouchableOpacity, Text, ViewStyle, Platform } from 'react-native';
import { Copy, Check } from 'lucide-react-native';
import { lightColors, darkColors, radius, spacing } from '../../theme';

interface CodeChipProps {
  code: string;
  isDark?: boolean;
  onCopy?: () => void;
  inverted?: boolean;
  style?: ViewStyle;
}

export const CodeChip: React.FC<CodeChipProps> = ({
  code,
  isDark = false,
  onCopy,
  inverted = false,
  style,
}) => {
  const colors = isDark ? darkColors : lightColors;
  const [copied, setCopied] = useState(false);

  const handlePress = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: inverted ? 'rgba(255, 255, 255, 0.18)' : colors.surface2,
          borderWidth: 1,
          borderColor: inverted ? 'rgba(255, 255, 255, 0.4)' : colors.border,
          borderStyle: 'dashed',
          borderRadius: radius.md,
          paddingVertical: 5,
          paddingHorizontal: 10,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
          fontWeight: '700',
          fontSize: 13,
          color: inverted ? '#FFFFFF' : colors.ink,
        }}
      >
        {code}
      </Text>
      {copied ? (
        <Check size={13} color={inverted ? '#FFFFFF' : colors.brand} />
      ) : (
        <Copy size={13} color={inverted ? '#FFFFFF' : colors.inkSoft} />
      )}
    </TouchableOpacity>
  );
};
