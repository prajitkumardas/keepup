import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/design-system/app-text';
import { Button } from '@/design-system/button';
import { DateField } from '@/design-system/date-field';
import { radii, spacing, typography } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import type { DateOnly } from '@/domain/types';
import { copy } from '@/localization/copy.en';

interface ReminderEditorProps {
  dateLabel: string;
  dateRequired?: boolean;
  initialDate?: DateOnly;
  initialTitle: string;
  isSaving?: boolean;
  onCancel: () => void;
  onSave: (title: string, date?: DateOnly) => void;
}

export function ReminderEditor({ dateLabel, dateRequired = false, initialDate, initialTitle, isSaving = false, onCancel, onSave }: ReminderEditorProps) {
  const { colors } = useAppTheme();
  const [title, setTitle] = useState(initialTitle);
  const [date, setDate] = useState(initialDate);
  const normalizedTitle = title.trim();
  const dateMissing = dateRequired && !date;

  return (
    <View style={[styles.editor, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.field}>
        <AppText variant="label">{copy.itemEditor.title}</AppText>
        <TextInput
          accessibilityLabel={copy.itemEditor.titleAccessibility}
          maxLength={160}
          onChangeText={setTitle}
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.borderStrong, color: colors.textPrimary }]}
          value={title}
        />
      </View>
      <View style={styles.field}>
        <AppText variant="label">{dateLabel}</AppText>
        <DateField
          accessibilityLabel={dateLabel}
          allowClear={!dateRequired}
          invalid={dateMissing}
          onChange={setDate}
          placeholder={copy.capture.datePlaceholder}
          value={date}
        />
        {dateMissing ? <AppText variant="bodySmall" style={{ color: colors.attention }}>{copy.capture.invalidDate}</AppText> : null}
      </View>
      <View style={styles.actions}>
        <Button disabled={isSaving} label={copy.common.cancel} onPress={onCancel} style={styles.action} variant="secondary" />
        <Button disabled={isSaving || !normalizedTitle || dateMissing} label={isSaving ? copy.itemEditor.saving : copy.itemEditor.save} onPress={() => onSave(normalizedTitle, date)} style={styles.action} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  editor: { borderWidth: 1, borderRadius: radii.lg, padding: spacing[4], gap: spacing[4] },
  field: { gap: spacing[2] },
  input: { ...typography.body, minHeight: 52, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing[4] },
  actions: { flexDirection: 'row', gap: spacing[3] },
  action: { flex: 1 },
});
