import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ViewStyle, Platform } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { lightColors, darkColors, radius, spacing } from '../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  isDark?: boolean;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  isDark = false,
  style,
}) => {
  const colors = isDark ? darkColors : lightColors;
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText('');
    if (onClear) onClear();
  };

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface2,
          borderWidth: 1,
          borderColor: isFocused ? colors.brand : colors.border,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          minHeight: 42,
          gap: spacing.sm,
        },
        style,
      ]}
    >
      <Search size={19} color={isFocused ? colors.brand : colors.inkSoft} strokeWidth={2.0} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.inkSoft}
        style={{
          flex: 1,
          fontSize: 14,
          color: colors.ink,
          paddingVertical: 8,
          ...Platform.select({
            web: {
              outlineStyle: 'none',
              outlineWidth: 0,
            },
          }),
        }}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ padding: 4 }}
        >
          <X size={17} color={colors.inkSoft} strokeWidth={2.0} />
        </TouchableOpacity>
      )}
    </View>
  );
};
