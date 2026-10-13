import { ShieldCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { InnerPageHeader } from '@/components/inner-page-header';
import { AppText } from '@/design-system/app-text';
import { Chip } from '@/design-system/chip';
import { Screen } from '@/design-system/screen';
import { radii, spacing } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { useKeepUpStore } from '@/store/keepup-store';

export default function PrivacyDataScreen() {
  const { colors } = useAppTheme();
  const sourceRetention = useKeepUpStore((state) => state.profile.sourceRetention);
  const setSourceRetention = useKeepUpStore((state) => state.setSourceRetention);

  return (
    <Screen>
      <InnerPageHeader title="Privacy & data" />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.heading}><ShieldCheck color={colors.safe} size={24} /><View style={styles.copy}><AppText variant="title">Source retention</AppText><AppText variant="bodySmall" tone="secondary">Choose what KeepUp should do with photos and documents after extraction.</AppText></View></View>
        <View style={styles.options}><Chip label="Keep source" selected={sourceRetention === 'keep'} onPress={() => void setSourceRetention('keep')} /><Chip label="Delete after" selected={sourceRetention === 'delete'} onPress={() => void setSourceRetention('delete')} /><Chip label="Ask every time" selected={sourceRetention === 'ask'} onPress={() => void setSourceRetention('ask')} /></View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radii.xl, padding: spacing[4], gap: spacing[5] },
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  copy: { flex: 1, gap: spacing[1] },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
});
