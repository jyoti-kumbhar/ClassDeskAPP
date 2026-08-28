import React from 'react';
import { View, Text, TouchableOpacity, Switch, Platform } from 'react-native';
import { CalendarClock } from 'lucide-react-native';
import { lightColors, darkColors, radius, spacing } from '../../theme';
import { Input } from './Input';

interface ScheduleFieldProps {
  scheduledFor: string | null;
  setScheduledFor: (val: string | null) => void;
  isDark?: boolean;
}

export const ScheduleField: React.FC<ScheduleFieldProps> = ({
  scheduledFor,
  setScheduledFor,
  isDark = false,
}) => {
  const colors = isDark ? darkColors : lightColors;
  const isScheduled = scheduledFor !== null;

  const getTomorrowDefault = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface2,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        gap: spacing.sm,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setScheduledFor(isScheduled ? null : getTomorrowDefault())}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        }}
      >
        <CalendarClock size={16} color={isScheduled ? colors.brand : colors.inkSoft} />
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: isScheduled ? colors.brand : colors.ink,
            flex: 1,
          }}
        >
          Schedule for later release
        </Text>
        <Switch
          value={isScheduled}
          onValueChange={(val) => setScheduledFor(val ? getTomorrowDefault() : null)}
          trackColor={{ false: colors.border, true: colors.brandTint }}
          thumbColor={isScheduled ? colors.brand : colors.surface}
        />
      </TouchableOpacity>

      {isScheduled && (
        <View style={{ marginTop: spacing.xs }}>
          <Input
            value={scheduledFor || ''}
            onChangeText={setScheduledFor}
            placeholder="YYYY-MM-DDTHH:MM (e.g. 2026-09-01T09:00)"
            isDark={isDark}
          />
          <Text style={{ fontSize: 11, color: colors.inkSoft, marginTop: 4 }}>
            Hidden from students until this date and time
          </Text>
        </View>
      )}
    </View>
  );
};
