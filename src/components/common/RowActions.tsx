import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import { lightColors, darkColors, radius, spacing } from '../../theme';

interface RowActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  isDark?: boolean;
}

export const RowActions: React.FC<RowActionsProps> = ({
  onEdit,
  onDelete,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      {onEdit && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onEdit}
          style={{
            padding: 6,
            borderRadius: radius.sm,
            backgroundColor: colors.surface2,
          }}
        >
          <Pencil size={14} color={colors.inkSoft} />
        </TouchableOpacity>
      )}
      {onDelete && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onDelete}
          style={{
            padding: 6,
            borderRadius: radius.sm,
            backgroundColor: colors.dangerTint,
          }}
        >
          <Trash2 size={14} color={colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
};
