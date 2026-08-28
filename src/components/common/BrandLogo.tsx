import React from 'react';
import { View, Text, StyleSheet, Platform, ViewStyle } from 'react-native';
import { GraduationCap } from 'lucide-react-native';
import { lightColors, darkColors, radius, spacing } from '../../theme';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  instituteName?: string;
  showText?: boolean;
  showSubtitle?: boolean;
  isDark?: boolean;
  style?: ViewStyle;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  instituteName,
  showText = true,
  showSubtitle = true,
  isDark = false,
  style,
}) => {
  const colors = isDark ? darkColors : lightColors;

  const dims = {
    sm: { box: 40, icon: 22, title: 16, sub: 11.5, radius: radius.md },
    md: { box: 46, icon: 26, title: 18.5, sub: 12.5, radius: radius.lg },
    lg: { box: 58, icon: 32, title: 24, sub: 14, radius: radius.xl },
  }[size];

  return (
    <View style={[styles.container, style]}>
      {/* Brand Icon Badge */}
      <View
        style={[
          styles.badge,
          {
            width: dims.box,
            height: dims.box,
            borderRadius: dims.radius,
            backgroundColor: colors.brand,
          },
        ]}
      >
        <GraduationCap size={dims.icon} color="#FFFFFF" strokeWidth={2.4} />
      </View>

      {/* Brand Text */}
      {showText && (
        <View style={styles.textWrap}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.brandTitle,
                {
                  fontSize: dims.title,
                  color: colors.ink,
                },
              ]}
            >
              ClassDesk
            </Text>
          </View>
          {showSubtitle && instituteName ? (
            <Text
              numberOfLines={1}
              style={[
                styles.brandSubtitle,
                {
                  fontSize: dims.sub,
                  color: colors.inkSoft,
                },
              ]}
            >
              {instituteName}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(91, 79, 224, 0.28)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  textWrap: {
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontWeight: '500',
    marginTop: 1,
    maxWidth: 160,
  },
});
