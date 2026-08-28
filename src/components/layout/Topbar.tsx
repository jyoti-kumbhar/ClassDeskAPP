import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Menu, Sun, Moon } from 'lucide-react-native';
import { Profile } from '../../types';
import { getInitials } from '../../services/dataStore';
import { lightColors, darkColors, radius, spacing, typography } from '../../theme';

interface TopbarProps {
  user: Profile;
  title: string;
  isDark?: boolean;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
  onToggleTheme?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  user,
  title,
  isDark = false,
  isMobile = false,
  onToggleSidebar,
  onToggleTheme,
}) => {
  const colors = isDark ? darkColors : lightColors;
  const initials = getInitials(user.name);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: isMobile ? spacing.md : spacing.xl,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
        {onToggleSidebar && (
          <TouchableOpacity
            onPress={onToggleSidebar}
            style={{
              padding: 8,
              borderRadius: radius.md,
              backgroundColor: colors.surface2,
            }}
          >
            <Menu size={18} color={colors.ink} />
          </TouchableOpacity>
        )}
        <Text
          numberOfLines={1}
          style={{
            fontSize: isMobile ? 16 : typography.h3.fontSize,
            fontWeight: '700',
            color: colors.ink,
            flex: 1,
          }}
        >
          {title}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {onToggleTheme && (
          <TouchableOpacity
            onPress={onToggleTheme}
            style={{
              padding: 8,
              borderRadius: radius.md,
              backgroundColor: colors.surface2,
            }}
          >
            {isDark ? (
              <Sun size={16} color={colors.accent} />
            ) : (
              <Moon size={16} color={colors.inkSoft} />
            )}
          </TouchableOpacity>
        )}

        {/* User profile capsule */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: colors.accentTint,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.brandDark }}>
              {initials}
            </Text>
          </View>
          {!isMobile && (
            <View style={{ marginLeft: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.ink }}>
                {user.name}
              </Text>
              <Text style={{ fontSize: 11, color: colors.inkSoft, textTransform: 'capitalize' }}>
                {user.role}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
