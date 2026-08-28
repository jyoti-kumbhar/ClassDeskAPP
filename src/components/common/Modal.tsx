import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { X } from 'lucide-react-native';
import { lightColors, darkColors, radius, spacing, typography, shadows } from '../../theme';

interface ModalProps {
  visible?: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  isDark?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible = true,
  title,
  onClose,
  children,
  wide = false,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(20, 17, 40, 0.55)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.lg,
          }}
        >
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.xl,
                borderWidth: 1,
                borderColor: colors.border,
                width: '100%',
                maxWidth: wide ? 640 : 460,
                maxHeight: '90%',
                ...shadows.lg,
                overflow: 'hidden',
              }}
            >
              {/* Modal Header */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: spacing.xl,
                  paddingVertical: spacing.lg,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.h3.fontSize,
                    fontWeight: typography.h3.fontWeight,
                    color: colors.ink,
                    flex: 1,
                  }}
                >
                  {title}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{
                    padding: spacing.xs,
                    borderRadius: radius.sm,
                  }}
                >
                  <X size={20} color={colors.inkSoft} />
                </TouchableOpacity>
              </View>

              {/* Modal Body */}
              <ScrollView
                style={{ padding: spacing.xl }}
                contentContainerStyle={{ paddingBottom: spacing.lg }}
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};
