import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { CalendarDays, X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { dateOnlyToLocalDate, formatDateOnly, toDateOnly } from '@/domain/attention';
import { copy } from '@/localization/copy.en';

import { AppText } from './app-text';
import { Button } from './button';
import type { DateFieldProps } from './date-field.types';
import { radii, spacing, typography } from './tokens';
import { useAppTheme } from './theme';

export function DateField({ accessibilityLabel, allowClear = false, invalid = false, onChange, placeholder, value }: DateFieldProps) {
  const { colors, isDark } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(() => dateOnlyToLocalDate(value ?? toDateOnly(new Date())));

  const openCalendar = () => {
    setDraftDate(dateOnlyToLocalDate(value ?? toDateOnly(new Date())));
    setIsOpen(true);
  };

  const selectAndroidDate = (date: Date) => {
    onChange(toDateOnly(date));
    setIsOpen(false);
  };

  const confirmIosDate = () => {
    onChange(toDateOnly(draftDate));
    setIsOpen(false);
  };

  const borderColor = invalid ? colors.attention : colors.borderStrong;
  const backgroundColor = invalid ? colors.attentionSoft : colors.background;
  const selectedLabel = value ? formatDateOnly(value) : undefined;

  return (
    <>
      <View style={[styles.field, { backgroundColor, borderColor }]}>
        <Pressable
          accessibilityHint={copy.capture.openCalendarHint}
          accessibilityLabel={`${accessibilityLabel}. ${selectedLabel ?? copy.capture.noDateSelected}`}
          accessibilityRole="button"
          onPress={openCalendar}
          style={({ pressed }) => [styles.trigger, pressed && { opacity: 0.7 }]}
        >
          <AppText style={[styles.value, !selectedLabel && { color: colors.textTertiary }]}>{selectedLabel ?? placeholder}</AppText>
          <CalendarDays color={colors.actionPrimary} size={20} />
        </Pressable>
        {allowClear && value ? (
          <Pressable
            accessibilityLabel={copy.capture.clearDate}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => onChange(undefined)}
            style={({ pressed }) => [styles.clear, { borderColor: colors.border }, pressed && { opacity: 0.6 }]}
          >
            <X color={colors.textSecondary} size={18} />
          </Pressable>
        ) : null}
      </View>

      {isOpen && Platform.OS === 'android' ? (
        <DateTimePicker
          accentColor={colors.actionPrimary}
          mode="date"
          negativeButton={{ label: copy.common.cancel }}
          onDismiss={() => setIsOpen(false)}
          onValueChange={(_event, date) => selectAndroidDate(date)}
          positiveButton={{ label: copy.common.done }}
          value={draftDate}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal animationType="fade" onRequestClose={() => setIsOpen(false)} transparent visible={isOpen}>
          <View style={styles.modalRoot}>
            <Pressable accessibilityLabel={copy.common.cancel} accessibilityRole="button" onPress={() => setIsOpen(false)} style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} />
            <View accessibilityViewIsModal style={[styles.sheet, { backgroundColor: colors.surfaceElevated }]}>
              <AppText variant="h3">{copy.capture.chooseDate}</AppText>
              <DateTimePicker
                accentColor={colors.actionPrimary}
                display="inline"
                mode="date"
                onValueChange={(_event, date) => setDraftDate(date)}
                style={styles.iosPicker}
                themeVariant={isDark ? 'dark' : 'light'}
                value={draftDate}
              />
              <View style={styles.actions}>
                <Button label={copy.common.cancel} onPress={() => setIsOpen(false)} style={styles.action} variant="secondary" />
                <Button label={copy.common.done} onPress={confirmIosDate} style={styles.action} />
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  field: { minHeight: 52, borderWidth: 1, borderRadius: radii.md, flexDirection: 'row', alignItems: 'center' },
  trigger: { minHeight: 50, flex: 1, paddingLeft: spacing[4], paddingRight: spacing[3], flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  value: { ...typography.body, flex: 1 },
  clear: { width: 40, height: 40, marginRight: spacing[1], borderLeftWidth: 1, alignItems: 'center', justifyContent: 'center' },
  modalRoot: { flex: 1, justifyContent: 'center', padding: spacing[5] },
  sheet: { width: '100%', maxWidth: 480, alignSelf: 'center', borderRadius: radii.xl, padding: spacing[5], gap: spacing[4] },
  iosPicker: { minHeight: 340 },
  actions: { flexDirection: 'row', gap: spacing[3] },
  action: { flex: 1 },
});
