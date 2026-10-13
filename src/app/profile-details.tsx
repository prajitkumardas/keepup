import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { InnerPageHeader } from '@/components/inner-page-header';
import { AppText } from '@/design-system/app-text';
import { Button } from '@/design-system/button';
import { Screen } from '@/design-system/screen';
import { radii, spacing, typography } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { useKeepUpStore } from '@/store/keepup-store';

export default function ProfileDetailsScreen() {
  const { colors } = useAppTheme();
  const profile = useKeepUpStore((state) => state.profile);
  const updateDisplayName = useKeepUpStore((state) => state.updateDisplayName);
  const [draftName, setDraftName] = useState(profile.displayName);
  const [isSaving, setIsSaving] = useState(false);
  const normalizedName = draftName.trim();

  const save = async () => {
    if (!normalizedName) return;
    setIsSaving(true);
    await updateDisplayName(normalizedName);
    setIsSaving(false);
    if (useKeepUpStore.getState().profile.displayName === normalizedName) router.back();
  };

  return (
    <Screen>
      <InnerPageHeader title="Profile details" />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.field}>
          <AppText variant="label">Display name</AppText>
          <TextInput accessibilityLabel="Profile display name" autoCapitalize="words" autoComplete="name" value={draftName} onChangeText={setDraftName} returnKeyType="done" onSubmitEditing={() => void save()} style={[styles.input, { backgroundColor: colors.background, borderColor: colors.borderStrong, color: colors.textPrimary }]} />
        </View>
        <View style={styles.actions}>
          <Button label="Cancel" variant="secondary" disabled={isSaving} onPress={() => router.back()} style={styles.action} />
          <Button label={isSaving ? 'Saving...' : 'Save changes'} disabled={isSaving || !normalizedName || normalizedName === profile.displayName} onPress={() => void save()} style={styles.action} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radii.xl, padding: spacing[4], gap: spacing[5] },
  field: { gap: spacing[2] },
  input: { ...typography.body, minHeight: 52, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing[4] },
  actions: { flexDirection: 'row', gap: spacing[3] },
  action: { flex: 1 },
});
