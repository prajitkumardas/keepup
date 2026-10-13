import { MoonStar, Sun } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { InnerPageHeader } from '@/components/inner-page-header';
import { AppText } from '@/design-system/app-text';
import { Chip } from '@/design-system/chip';
import { Screen } from '@/design-system/screen';
import { radii, spacing } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { useKeepUpStore } from '@/store/keepup-store';

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const themeMode = useKeepUpStore((state) => state.profile.themeMode);
  const setThemeMode = useKeepUpStore((state) => state.setThemeMode);

  return (
    <Screen>
      <InnerPageHeader title="Settings" />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.heading}>{themeMode === 'dark' ? <MoonStar color={colors.actionPrimary} size={24} /> : <Sun color={colors.actionPrimary} size={24} />}<View style={styles.copy}><AppText variant="title">Appearance</AppText><AppText variant="bodySmall" tone="secondary">Choose a comfortable theme for the app.</AppText></View></View>
        <View style={styles.options}><Chip label="Light" selected={themeMode === 'light'} onPress={() => void setThemeMode('light')} /><Chip label="Dark" selected={themeMode === 'dark'} onPress={() => void setThemeMode('dark')} /></View>
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
