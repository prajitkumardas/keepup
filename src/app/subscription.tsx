import { Crown } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { InnerPageHeader } from '@/components/inner-page-header';
import { AppText } from '@/design-system/app-text';
import { Screen } from '@/design-system/screen';
import { radii, spacing } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';

export default function SubscriptionScreen() {
  const { colors } = useAppTheme();
  return (
    <Screen>
      <InnerPageHeader title="Subscription" />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.icon, { backgroundColor: colors.actionSoft }]}><Crown color={colors.actionPrimary} size={26} /></View>
        <View style={styles.copy}><AppText variant="title">Subscription management</AppText><AppText tone="secondary">Billing is not configured in this version of KeepUp. Your current app features remain available.</AppText></View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radii.xl, padding: spacing[5], flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
  icon: { width: 52, height: 52, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: spacing[1] },
});
