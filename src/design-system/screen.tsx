import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from './tokens';
import { useAppTheme } from './theme';
import { Snackbar } from './snackbar';
import { copy } from '@/localization/copy.en';
import { useKeepUpStore } from '@/store/keepup-store';

interface ScreenProps extends PropsWithChildren { scroll?: boolean; footer?: ReactNode; header?: ReactNode; }

export function Screen({ children, scroll = true, footer, header }: ScreenProps) {
  const { colors } = useAppTheme();
  const dataError = useKeepUpStore((state) => state.dataError);
  const clearDataError = useKeepUpStore((state) => state.clearDataError);
  const lastCompletedActionId = useKeepUpStore((state) => state.lastCompletedActionId);
  const dismissLastCompletion = useKeepUpStore((state) => state.dismissLastCompletion);
  const undoLastCompletion = useKeepUpStore((state) => state.undoLastCompletion);
  const content = <View style={[styles.content, header ? styles.contentWithHeader : null]}>{children}</View>;
  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {header ? <View style={styles.headerShell}><View style={styles.headerContent}>{header}</View></View> : null}
      {scroll ? <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>{content}</ScrollView> : content}
      {dataError ? (
        <Snackbar danger message={dataError} onDismiss={clearDataError} />
      ) : lastCompletedActionId ? (
        <Snackbar key={lastCompletedActionId} actionLabel={copy.today.undo} message={copy.today.completed} onAction={() => void undoLastCompletion()} onDismiss={dismissLastCompletion} />
      ) : footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerShell: { width: '100%', alignItems: 'center' },
  headerContent: { width: '100%', maxWidth: 560, paddingHorizontal: spacing[5], paddingTop: spacing[5] },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  content: { width: '100%', maxWidth: 560, paddingHorizontal: spacing[5], paddingTop: spacing[5], paddingBottom: spacing[10] },
  contentWithHeader: { paddingTop: 0 },
});
