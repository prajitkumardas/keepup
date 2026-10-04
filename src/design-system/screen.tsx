import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from './tokens';
import { useAppTheme } from './theme';

interface ScreenProps extends PropsWithChildren { scroll?: boolean; footer?: ReactNode; }

export function Screen({ children, scroll = true, footer }: ScreenProps) {
  const { colors } = useAppTheme();
  const content = <View style={styles.content}>{children}</View>;
  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>{content}</ScrollView> : content}
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  content: { width: '100%', maxWidth: 560, paddingHorizontal: spacing[5], paddingTop: spacing[5], paddingBottom: spacing[10] },
});
