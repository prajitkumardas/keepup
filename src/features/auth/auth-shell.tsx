import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { AppText } from '@/design-system/app-text';
import { Screen } from '@/design-system/screen';
import { radii, spacing, typography } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';

export function AuthShell({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle: string }>) {
  const { colors } = useAppTheme();
  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.layout}>
        <View style={styles.brand}><View style={[styles.mark, { backgroundColor: colors.actionPrimary }]}><AppText variant="title" style={styles.markText}>K</AppText></View><AppText variant="h3">KeepUp</AppText></View>
        <View style={styles.heading}><AppText variant="h1">{title}</AppText><AppText tone="secondary">{subtitle}</AppText></View>
        <View style={styles.form}>{children}</View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

export function AuthInput({ label, style, ...props }: TextInputProps & { label: string }) {
  const { colors } = useAppTheme();
  return <View style={styles.field}><AppText variant="label">{label}</AppText><TextInput {...props} accessibilityLabel={label} placeholderTextColor={colors.textTertiary} style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.borderStrong }, style]} /></View>;
}

export function AuthNotice({ message, danger = false }: { message: string; danger?: boolean }) {
  const { colors } = useAppTheme();
  return <View accessibilityRole="alert" style={[styles.notice, { backgroundColor: danger ? colors.overdueSoft : colors.actionSoft }]}><AppText variant="bodySmall" style={{ color: danger ? colors.overdue : colors.actionPrimary }}>{message}</AppText></View>;
}

const styles = StyleSheet.create({
  layout: { flex: 1, justifyContent: 'center', minHeight: 620, paddingVertical: spacing[8] },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[10] },
  mark: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' }, markText: { color: '#FFFFFF' },
  heading: { gap: spacing[2], marginBottom: spacing[8] }, form: { gap: spacing[4] }, field: { gap: spacing[2] },
  input: { ...typography.body, minHeight: 52, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing[4] },
  notice: { borderRadius: radii.md, padding: spacing[3] },
});
