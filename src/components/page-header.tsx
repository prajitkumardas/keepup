import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/design-system/app-text';
import { spacing } from '@/design-system/tokens';

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <View style={styles.row}><View style={styles.copy}><AppText variant="h1">{title}</AppText>{subtitle ? <AppText tone="secondary">{subtitle}</AppText> : null}</View>{action}</View>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing[4], marginBottom: spacing[8] }, copy: { flex: 1, gap: spacing[1] } });
