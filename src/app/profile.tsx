import { router } from 'expo-router';
import { Bell, Crown, EllipsisVertical, Layers3, LogOut, Pencil, Settings, ShieldCheck, UserRound } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { InnerPageHeader } from '@/components/inner-page-header';
import { ProfileSettingsRow } from '@/components/profile-settings-row';
import { AppText } from '@/design-system/app-text';
import { ConfirmationDialog } from '@/design-system/confirmation-dialog';
import { Screen } from '@/design-system/screen';
import { radii, spacing } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { daysUntil } from '@/domain/attention';
import { AuthNotice } from '@/features/auth/auth-shell';
import { getErrorMessage } from '@/lib/errors';
import { useKeepUpStore } from '@/store/keepup-store';

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const { user, signOut } = useAuth();
  const profile = useKeepUpStore((state) => state.profile);
  const trackers = useKeepUpStore((state) => state.trackers);
  const actions = useKeepUpStore((state) => state.actions);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [accountError, setAccountError] = useState<string>();

  const openActionsCount = actions.filter((action) => action.status === 'open').length;
  const upcomingCount = useMemo(
    () => trackers.filter((tracker) => !tracker.archivedAt && daysUntil(tracker.milestone.dateValue) >= 0).length
      + actions.filter((action) => action.status === 'open' && action.dueDate && daysUntil(action.dueDate) >= 0).length,
    [actions, trackers],
  );

  const confirmSignOut = async () => {
    setIsSigningOut(true);
    setAccountError(undefined);
    try {
      await signOut();
    } catch (error) {
      setAccountError(getErrorMessage(error, 'KeepUp could not sign you out.'));
      setIsSigningOut(false);
      setShowSignOut(false);
    }
  };

  const requestSignOut = () => {
    setShowAccountMenu(false);
    setShowSignOut(true);
  };

  return (
    <Screen>
      <InnerPageHeader
        title="Profile"
        action={
        <Pressable accessibilityLabel="Open account actions" accessibilityRole="button" hitSlop={8} onPress={() => setShowAccountMenu(true)} style={({ pressed }) => [styles.headerButton, { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 }]}>
          <EllipsisVertical color={colors.textPrimary} size={23} />
        </Pressable>
        }
      />

      {accountError ? <AuthNotice message={accountError} danger /> : null}

      <View style={[styles.card, styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.actionSoft }]}><UserRound color={colors.actionPrimary} size={30} /></View>
        <View style={styles.profileCopy}>
          <AppText variant="title" numberOfLines={1}>{profile.displayName}</AppText>
          <AppText variant="bodySmall" tone="secondary" numberOfLines={1}>{user?.email ?? 'No email address'}</AppText>
        </View>
        <Pressable accessibilityLabel="Edit profile details" accessibilityRole="button" onPress={() => router.push('/profile-details')} style={({ pressed }) => [styles.editButton, { borderColor: colors.border, backgroundColor: pressed ? colors.surfaceSecondary : colors.surface }]}>
          <Pencil color={colors.textPrimary} size={20} />
        </Pressable>
      </View>

      <View style={[styles.card, styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Stat value={trackers.length} label="Tracked" backgroundColor={colors.actionSoft} />
        <Stat value={upcomingCount} label="Upcoming" backgroundColor={colors.upcomingSoft} />
        <Stat value={openActionsCount} label="Open actions" backgroundColor={colors.safeSoft} />
      </View>

      <View style={[styles.card, styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ProfileSettingsRow label="Profile details" icon={<UserRound color={colors.textPrimary} size={22} />} onPress={() => router.push('/profile-details')} />
        <ProfileSettingsRow label="All categories" icon={<Layers3 color={colors.textPrimary} size={22} />} onPress={() => router.push('/categories')} />
        <ProfileSettingsRow label="Settings" icon={<Settings color={colors.textPrimary} size={22} />} onPress={() => router.push('/settings')} />
        <ProfileSettingsRow label="Subscription" icon={<Crown color={colors.textPrimary} size={22} />} onPress={() => router.push('/subscription')} />
        <ProfileSettingsRow label="Notification" icon={<Bell color={colors.textPrimary} size={22} />} onPress={() => router.push('/notifications')} />
        <ProfileSettingsRow label="Privacy & data" icon={<ShieldCheck color={colors.textPrimary} size={22} />} onPress={() => router.push('/privacy-data')} />
        <ProfileSettingsRow destructive label="Log out" icon={<LogOut color={colors.overdue} size={22} />} onPress={requestSignOut} showDivider={false} />
      </View>

      <Modal animationType="fade" onRequestClose={() => setShowAccountMenu(false)} transparent visible={showAccountMenu}>
        <View style={styles.menuRoot}>
          <Pressable accessibilityLabel="Close account actions" accessibilityRole="button" onPress={() => setShowAccountMenu(false)} style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} />
          <View accessibilityViewIsModal style={[styles.menu, { backgroundColor: colors.surfaceElevated }]}>
            <Pressable accessibilityRole="button" onPress={() => { setShowAccountMenu(false); router.push('/profile-details'); }} style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: colors.surfaceSecondary }]}>
              <Pencil color={colors.textPrimary} size={20} /><AppText variant="label">Edit profile</AppText>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={requestSignOut} style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: colors.surfaceSecondary }]}>
              <LogOut color={colors.overdue} size={20} /><AppText variant="label" tone="danger">Log out</AppText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ConfirmationDialog cancelLabel="Cancel" confirmLabel={isSigningOut ? 'Logging out...' : 'Log out'} isConfirming={isSigningOut} message="You will need to sign in again to access your KeepUp account." onCancel={() => setShowSignOut(false)} onConfirm={() => void confirmSignOut()} title="Log out of KeepUp?" visible={showSignOut} />
    </Screen>
  );
}

function Stat({ backgroundColor, label, value }: { backgroundColor: string; label: string; value: number }) {
  return <View style={[styles.stat, { backgroundColor }]}><AppText variant="h2">{value}</AppText><AppText variant="bodySmall" tone="secondary" numberOfLines={2}>{label}</AppText></View>;
}

const styles = StyleSheet.create({
  headerButton: { width: 48, height: 48, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: 1, borderRadius: radii.xl },
  profileCard: { minHeight: 112, padding: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  avatar: { width: 64, height: 64, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center' },
  profileCopy: { flex: 1, minWidth: 0, gap: spacing[1] },
  editButton: { width: 48, height: 48, borderWidth: 1, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  statsCard: { marginTop: spacing[4], padding: spacing[3], flexDirection: 'row', gap: spacing[2] },
  stat: { flex: 1, minWidth: 0, minHeight: 96, borderRadius: radii.lg, paddingHorizontal: spacing[3], paddingVertical: spacing[4], justifyContent: 'center', gap: spacing[1] },
  settingsCard: { marginTop: spacing[4], overflow: 'hidden' },
  menuRoot: { flex: 1, alignItems: 'flex-end', paddingTop: spacing[16] + spacing[5], paddingRight: spacing[5] },
  menu: { width: 200, borderRadius: radii.lg, paddingVertical: spacing[2], overflow: 'hidden' },
  menuItem: { minHeight: 52, paddingHorizontal: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
});
