import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Camera, CheckCircle2, FileText, Image as ImageIcon, Keyboard, Sparkles, TriangleAlert } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { PageHeader } from '@/components/page-header';
import { AppText } from '@/design-system/app-text';
import { Button } from '@/design-system/button';
import { Screen } from '@/design-system/screen';
import { radii, spacing, typography } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import type { DateOnly } from '@/domain/types';
import { parseCaptureText, type CaptureSuggestion } from '@/features/capture/parse-capture';
import { useKeepUpStore } from '@/store/keepup-store';
import { copy } from '@/localization/copy.en';

type SavedTarget = { type: 'tracker'; id: string } | { type: 'action' };

function CaptureMethod({ icon: Icon, label, active, onPress }: { icon: LucideIcon; label: string; active?: boolean; onPress: () => void }) {
  const { colors } = useAppTheme();
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.method, { backgroundColor: active ? colors.actionSoft : colors.surface, borderColor: active ? colors.actionPrimary : colors.border, opacity: pressed ? 0.72 : 1 }]}><Icon color={active ? colors.actionPrimary : colors.textSecondary} size={23} /><AppText variant="caption" style={{ color: active ? colors.actionPrimary : colors.textSecondary }}>{label}</AppText></Pressable>;
}

function isDateOnly(value: string): value is DateOnly {
  const match = value.match(/^(20\d{2})-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/);
  if (!match) return false;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1]) && date.getMonth() === Number(match[2]) - 1 && date.getDate() === Number(match[3]);
}

export default function CaptureScreen() {
  const { colors } = useAppTheme();
  const addTracker = useKeepUpStore((state) => state.addTracker);
  const addAction = useKeepUpStore((state) => state.addAction);
  const [text, setText] = useState('');
  const [suggestion, setSuggestion] = useState<CaptureSuggestion>();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [notice, setNotice] = useState<string>();
  const [savedTarget, setSavedTarget] = useState<SavedTarget>();

  const analyze = () => {
    const next = parseCaptureText(text);
    setSuggestion(next);
    setTitle(next.title);
    setDate(next.dateValue ?? '');
    setNotice(undefined);
  };

  const save = async () => {
    if (!suggestion || !title.trim()) return;
    if (suggestion.objectType === 'tracker') {
      if (!isDateOnly(date)) return;
      const id = addTracker({ title: title.trim(), category: suggestion.category, dateValue: date });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSavedTarget({ type: 'tracker', id });
      return;
    }
    addAction({ title: title.trim(), dueDate: isDateOnly(date) ? date : undefined });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSavedTarget({ type: 'action' });
  };

  if (savedTarget) return <Screen><View style={styles.success}><View style={[styles.successIcon, { backgroundColor: colors.safeSoft }]}><CheckCircle2 color={colors.safe} size={36} /></View><AppText variant="h2">{copy.capture.savedTitle}</AppText><AppText tone="secondary" style={styles.center}>{copy.capture.savedBody}</AppText><Button label={savedTarget.type === 'tracker' ? copy.capture.reviewTracker : copy.capture.returnToday} onPress={() => savedTarget.type === 'tracker' ? router.push({ pathname: '/tracker/[id]', params: { id: savedTarget.id } }) : router.replace('/')} style={styles.successAction} /></View></Screen>;

  return (
    <Screen>
      <PageHeader title={copy.capture.title} subtitle={copy.capture.subtitle} />
      <View style={styles.methods}>
        <CaptureMethod icon={Keyboard} label={copy.capture.methods.type} active onPress={() => setNotice(undefined)} />
        <CaptureMethod icon={Camera} label={copy.capture.methods.scan} onPress={() => setNotice(copy.capture.scanNotice)} />
        <CaptureMethod icon={FileText} label={copy.capture.methods.document} onPress={() => setNotice(copy.capture.documentNotice)} />
        <CaptureMethod icon={ImageIcon} label={copy.capture.methods.photo} onPress={() => setNotice(copy.capture.photoNotice)} />
      </View>
      {notice ? <View style={[styles.notice, { backgroundColor: colors.actionSoft }]}><AppText variant="bodySmall" style={{ color: colors.actionPrimary }}>{notice}</AppText></View> : null}
      <View style={styles.formSection}>
        <AppText variant="label">{copy.capture.descriptionLabel}</AppText>
        <TextInput accessibilityLabel={copy.capture.descriptionAccessibility} value={text} onChangeText={(value) => { setText(value); setSuggestion(undefined); }} multiline placeholder={copy.capture.descriptionPlaceholder} placeholderTextColor={colors.textTertiary} style={[styles.captureInput, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]} />
        <Button label={copy.capture.understand} icon={<Sparkles color="#FFFFFF" size={18} />} onPress={analyze} disabled={!text.trim()} />
      </View>
      {suggestion ? <View style={[styles.confirmation, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.confirmHeader}><View><AppText variant="caption" tone="secondary">{copy.capture.suggestionType(suggestion.objectType)}</AppText><AppText variant="h3">{copy.capture.confirm}</AppText></View></View>
        <View style={styles.field}><AppText variant="label">{copy.capture.titleLabel}</AppText><TextInput accessibilityLabel={copy.capture.titleAccessibility} value={title} onChangeText={setTitle} style={[styles.input, { color: colors.textPrimary, borderColor: colors.borderStrong, backgroundColor: colors.background }]} /></View>
        <View style={styles.field}><AppText variant="label">{suggestion.objectType === 'tracker' ? copy.capture.trackerDate : copy.capture.actionDate}</AppText><TextInput accessibilityLabel={copy.capture.dateAccessibility} value={date} onChangeText={setDate} placeholder={copy.capture.datePlaceholder} placeholderTextColor={colors.textTertiary} keyboardType="numbers-and-punctuation" style={[styles.input, { color: colors.textPrimary, borderColor: suggestion.objectType === 'tracker' && !isDateOnly(date) ? colors.attention : colors.borderStrong, backgroundColor: suggestion.objectType === 'tracker' && !isDateOnly(date) ? colors.attentionSoft : colors.background }]} />
          {suggestion.objectType === 'tracker' && !isDateOnly(date) ? <View style={styles.warning}><TriangleAlert color={colors.attention} size={17} /><AppText variant="bodySmall" style={{ color: colors.attention }}>{copy.capture.invalidDate}</AppText></View> : null}
        </View>
        <Button label={suggestion.objectType === 'tracker' ? copy.capture.startTracking : copy.capture.saveAction} onPress={() => void save()} disabled={!title.trim() || (suggestion.objectType === 'tracker' && !isDateOnly(date))} />
      </View> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  methods: { flexDirection: 'row', gap: spacing[2] }, method: { flex: 1, minHeight: 76, borderRadius: radii.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[2] },
  notice: { marginTop: spacing[3], borderRadius: radii.md, padding: spacing[3] }, formSection: { marginTop: spacing[6], gap: spacing[3] },
  captureInput: { ...typography.body, minHeight: 112, borderWidth: 1, borderRadius: radii.md, padding: spacing[4], textAlignVertical: 'top' },
  confirmation: { marginTop: spacing[8], borderWidth: 1, borderRadius: radii.lg, padding: spacing[5], gap: spacing[5] }, confirmHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  field: { gap: spacing[2] }, input: { ...typography.body, minHeight: 52, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing[4] }, warning: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 520, gap: spacing[3] }, successIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2] }, center: { textAlign: 'center', maxWidth: 320 }, successAction: { alignSelf: 'stretch', marginTop: spacing[4] },
});
