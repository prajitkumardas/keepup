import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { Camera, CheckCircle2, FileText, Image as ImageIcon, Keyboard, Paperclip, Sparkles, TriangleAlert, X } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { PageHeader } from '@/components/page-header';
import { CategoryPicker } from '@/components/category-picker';
import { AppText } from '@/design-system/app-text';
import { Button } from '@/design-system/button';
import { DateField } from '@/design-system/date-field';
import { Screen } from '@/design-system/screen';
import { Snackbar } from '@/design-system/snackbar';
import { radii, spacing, typography } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { normalizeCategoryName, suggestCategory } from '@/domain/categories';
import type { Category, DateOnly } from '@/domain/types';
import { parseCaptureText, type CaptureSuggestion } from '@/features/capture/parse-capture';
import { getErrorMessage } from '@/lib/errors';
import { useKeepUpStore } from '@/store/keepup-store';
import { copy } from '@/localization/copy.en';

type SavedTarget = { type: 'tracker'; id: string } | { type: 'action'; id: string };
type CaptureMethodType = 'type' | 'scan' | 'document' | 'photo';
type CaptureAttachment = { kind: Exclude<CaptureMethodType, 'type'>; uri: string; name: string; mimeType?: string; size?: number; file?: File };
type CaptureNotice = { danger?: boolean; message: string };

function CaptureMethod({ icon: Icon, label, active, onPress }: { icon: LucideIcon; label: string; active?: boolean; onPress: () => void }) {
  const { colors } = useAppTheme();
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.method, { backgroundColor: active ? colors.actionSoft : colors.surface, borderColor: active ? colors.actionPrimary : colors.border, opacity: pressed ? 0.72 : 1 }]}><Icon color={active ? colors.actionPrimary : colors.textSecondary} size={23} /><AppText variant="caption" style={{ color: active ? colors.actionPrimary : colors.textSecondary }}>{label}</AppText></Pressable>;
}

function formatFileSize(size?: number) {
  if (!size) return undefined;
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function imageAttachment(kind: 'scan' | 'photo', asset: ImagePicker.ImagePickerAsset): CaptureAttachment {
  return { kind, uri: asset.uri, name: asset.fileName ?? `${kind}-${Date.now()}.jpg`, mimeType: asset.mimeType ?? 'image/jpeg', size: asset.fileSize, file: asset.file };
}

export default function CaptureScreen() {
  const { colors } = useAppTheme();
  const addTracker = useKeepUpStore((state) => state.addTracker);
  const addAction = useKeepUpStore((state) => state.addAction);
  const categories = useKeepUpStore((state) => state.categories);
  const createCategory = useKeepUpStore((state) => state.createCategory);
  const trackers = useKeepUpStore((state) => state.trackers);
  const actions = useKeepUpStore((state) => state.actions);
  const [method, setMethod] = useState<CaptureMethodType>('type');
  const [attachment, setAttachment] = useState<CaptureAttachment>();
  const [text, setText] = useState('');
  const [suggestion, setSuggestion] = useState<CaptureSuggestion>();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<DateOnly>();
  const [category, setCategory] = useState<Category>();
  const [categoryWasSuggested, setCategoryWasSuggested] = useState(false);
  const [notice, setNotice] = useState<CaptureNotice>();
  const [savedTarget, setSavedTarget] = useState<SavedTarget>();
  const [isPicking, setIsPicking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isDateInvalid = suggestion?.objectType === 'tracker' && !date;

  const resetForm = useCallback(() => {
    setMethod('type');
    setAttachment(undefined);
    setText('');
    setSuggestion(undefined);
    setTitle('');
    setDate(undefined);
    setCategory(undefined);
    setCategoryWasSuggested(false);
    setNotice(undefined);
    setSavedTarget(undefined);
    setIsPicking(false);
    setIsSaving(false);
  }, []);

  useFocusEffect(useCallback(() => () => resetForm(), [resetForm]));

  const attach = (next: CaptureAttachment) => {
    if (next.size && next.size > 25 * 1024 * 1024) {
      setNotice({ danger: true, message: copy.capture.fileTooLarge });
      return;
    }
    setMethod(next.kind);
    setAttachment(next);
    setSuggestion(undefined);
    setNotice({ message: copy.capture.attachmentReady });
  };

  const scan = async () => {
    setIsPicking(true); setNotice(undefined);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) { setNotice({ danger: true, message: copy.capture.cameraPermissionDenied }); return; }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.9 });
      if (!result.canceled) attach(imageAttachment('scan', result.assets[0]));
    } catch (error) { setNotice({ danger: true, message: getErrorMessage(error, copy.capture.pickerError) }); }
    finally { setIsPicking(false); }
  };

  const pickPhoto = async () => {
    setIsPicking(true); setNotice(undefined);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 });
      if (!result.canceled) attach(imageAttachment('photo', result.assets[0]));
    } catch (error) { setNotice({ danger: true, message: getErrorMessage(error, copy.capture.pickerError) }); }
    finally { setIsPicking(false); }
  };

  const pickDocument = async () => {
    setIsPicking(true); setNotice(undefined);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true, multiple: false });
      if (!result.canceled) {
        const asset = result.assets[0];
        attach({ kind: 'document', uri: asset.uri, name: asset.name, mimeType: asset.mimeType, size: asset.size, file: asset.file });
      }
    } catch (error) { setNotice({ danger: true, message: getErrorMessage(error, copy.capture.pickerError) }); }
    finally { setIsPicking(false); }
  };

  const analyze = () => {
    const next = parseCaptureText(text);
    const suggested = suggestCategory(text, categories)
      ?? categories.find((item) => item.normalizedName === normalizeCategoryName(next.objectType === 'action' ? 'Action' : 'Other'));
    setSuggestion(next);
    setTitle(next.title);
    setDate(next.dateValue);
    setCategory(suggested);
    setCategoryWasSuggested(Boolean(suggested));
    setNotice(undefined);
  };

  const save = async () => {
    if (!suggestion || !title.trim() || !category || isSaving) return;
    setIsSaving(true);
    try {
      const source = attachment ? { kind: attachment.kind, uri: attachment.uri, fileName: attachment.name, mimeType: attachment.mimeType, sizeBytes: attachment.size, file: attachment.file } : undefined;
      if (suggestion.objectType === 'tracker') {
        if (!date) return;
        const id = await addTracker({ title: title.trim(), trackerType: suggestion.category, category, dateValue: date, attachment: source });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSavedTarget({ type: 'tracker', id });
        return;
      }
      const id = await addAction({ title: title.trim(), category, dueDate: date, attachment: source });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSavedTarget({ type: 'action', id });
    } catch (error) {
      setNotice({ danger: true, message: getErrorMessage(error, 'KeepUp could not save this item.') });
    } finally {
      setIsSaving(false);
    }
  };

  if (savedTarget) return <Screen><View style={styles.success}><View style={[styles.successIcon, { backgroundColor: colors.safeSoft }]}><CheckCircle2 color={colors.safe} size={36} /></View><AppText variant="h2">{copy.capture.savedTitle}</AppText><AppText tone="secondary" style={styles.center}>{copy.capture.savedBody}</AppText><Button label={copy.capture.addAnother} onPress={resetForm} style={styles.successAction} /><Button label={savedTarget.type === 'tracker' ? copy.capture.reviewTracker : copy.capture.reviewAction} variant="secondary" onPress={() => router.push({ pathname: savedTarget.type === 'tracker' ? '/tracker/[id]' : '/action/[id]', params: { id: savedTarget.id } })} style={styles.successSecondaryAction} /></View></Screen>;

  return (
    <Screen header={<PageHeader title={copy.capture.title} />} footer={notice ? <Snackbar danger={notice.danger} message={notice.message} onDismiss={() => setNotice(undefined)} /> : undefined}>
      <View style={styles.methods}>
        <CaptureMethod icon={Keyboard} label={copy.capture.methods.type} active={method === 'type'} onPress={() => { setMethod('type'); setAttachment(undefined); setNotice(undefined); }} />
        <CaptureMethod icon={Camera} label={copy.capture.methods.scan} active={method === 'scan'} onPress={() => { if (!isPicking) void scan(); }} />
        <CaptureMethod icon={FileText} label={copy.capture.methods.document} active={method === 'document'} onPress={() => { if (!isPicking) void pickDocument(); }} />
        <CaptureMethod icon={ImageIcon} label={copy.capture.methods.photo} active={method === 'photo'} onPress={() => { if (!isPicking) void pickPhoto(); }} />
      </View>
      {attachment ? <View style={[styles.attachment, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {attachment.mimeType?.startsWith('image/') ? <Image source={{ uri: attachment.uri }} style={styles.attachmentPreview} contentFit="cover" /> : <View style={[styles.attachmentIcon, { backgroundColor: colors.actionSoft }]}><Paperclip color={colors.actionPrimary} size={21} /></View>}
        <View style={styles.attachmentCopy}><AppText variant="label" numberOfLines={1}>{attachment.name}</AppText><AppText variant="caption" tone="secondary">{[copy.capture.methods[attachment.kind], formatFileSize(attachment.size)].filter(Boolean).join(' | ')}</AppText></View>
        <Pressable accessibilityRole="button" accessibilityLabel={copy.capture.removeAttachment} onPress={() => { setAttachment(undefined); setMethod('type'); setNotice(undefined); }} style={styles.removeAttachment}><X color={colors.textSecondary} size={20} /></Pressable>
      </View> : null}
      <View style={styles.formSection}>
        <AppText variant="label">{copy.capture.descriptionLabel}</AppText>
        <TextInput accessibilityLabel={copy.capture.descriptionAccessibility} value={text} onChangeText={(value) => { setText(value); setSuggestion(undefined); }} multiline placeholder={copy.capture.descriptionPlaceholder} placeholderTextColor={colors.textTertiary} style={[styles.captureInput, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]} />
        <Button label={copy.capture.understand} icon={<Sparkles color="#FFFFFF" size={18} />} onPress={analyze} disabled={!text.trim()} />
      </View>
      {suggestion ? <View style={[styles.confirmation, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.confirmHeader}><View><AppText variant="caption" tone="secondary">{copy.capture.suggestionType(suggestion.objectType)}</AppText><AppText variant="h3">{copy.capture.confirm}</AppText></View></View>
        <View style={styles.field}><AppText variant="label">{copy.capture.titleLabel}</AppText><TextInput accessibilityLabel={copy.capture.titleAccessibility} value={title} onChangeText={setTitle} style={[styles.input, { color: colors.textPrimary, borderColor: colors.borderStrong, backgroundColor: colors.background }]} /></View>
        <View style={styles.field}><CategoryPicker categories={categories} label={categoryWasSuggested ? 'Category · Suggested' : 'Category'} onCreate={createCategory} onSelect={(next) => { setCategory(next); setCategoryWasSuggested(false); }} recentCategoryIds={[...trackers, ...actions].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)).map((item) => item.category.id)} selected={category} />{!category ? <AppText variant="bodySmall" style={{ color: colors.overdue }}>Choose a category before saving.</AppText> : null}</View>
        <View style={styles.field}><AppText variant="label">{suggestion.objectType === 'tracker' ? copy.capture.trackerDate : copy.capture.actionDate}</AppText><DateField accessibilityLabel={copy.capture.dateAccessibility} allowClear={suggestion.objectType === 'action'} invalid={isDateInvalid} onChange={setDate} placeholder={copy.capture.datePlaceholder} value={date} />
          {isDateInvalid ? <View style={styles.warning}><TriangleAlert color={colors.attention} size={17} /><AppText variant="bodySmall" style={{ color: colors.attention }}>{copy.capture.invalidDate}</AppText></View> : null}
        </View>
        <Button label={isSaving ? copy.capture.saving : suggestion.objectType === 'tracker' ? copy.capture.startTracking : copy.capture.saveAction} onPress={() => void save()} disabled={isSaving || !title.trim() || !category || isDateInvalid} />
      </View> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  methods: { flexDirection: 'row', gap: spacing[2] }, method: { flex: 1, minHeight: 76, borderRadius: radii.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[2] },
  formSection: { marginTop: spacing[6], gap: spacing[3] },
  attachment: { marginTop: spacing[3], minHeight: 68, borderWidth: 1, borderRadius: radii.md, padding: spacing[2], flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  attachmentPreview: { width: 52, height: 52, borderRadius: radii.sm }, attachmentIcon: { width: 52, height: 52, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' }, attachmentCopy: { flex: 1, gap: spacing[1] }, removeAttachment: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  captureInput: { ...typography.body, minHeight: 112, borderWidth: 1, borderRadius: radii.md, padding: spacing[4], textAlignVertical: 'top' },
  confirmation: { marginTop: spacing[8], borderWidth: 1, borderRadius: radii.lg, padding: spacing[5], gap: spacing[5] }, confirmHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  field: { gap: spacing[2] }, input: { ...typography.body, minHeight: 52, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing[4] }, warning: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 520, gap: spacing[3] }, successIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2] }, center: { textAlign: 'center', maxWidth: 320 }, successAction: { alignSelf: 'stretch', marginTop: spacing[4] }, successSecondaryAction: { alignSelf: 'stretch' },
});
