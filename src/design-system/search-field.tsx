import { Search, X } from 'lucide-react-native';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { radii, spacing, typography } from './tokens';
import { useAppTheme } from './theme';

interface SearchFieldProps {
  accessibilityLabel: string;
  clearAccessibilityLabel: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}

export function SearchField({ accessibilityLabel, clearAccessibilityLabel, onChangeText, placeholder, value }: SearchFieldProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Search color={colors.textTertiary} size={21} />
      <TextInput
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="none"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        returnKeyType="search"
        style={[styles.input, { color: colors.textPrimary }]}
        value={value}
      />
      {value ? (
        <Pressable accessibilityLabel={clearAccessibilityLabel} accessibilityRole="button" onPress={() => onChangeText('')} style={styles.clear}>
          <X color={colors.textSecondary} size={19} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  search: { minHeight: 52, borderWidth: 1, borderRadius: radii.md, paddingLeft: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  input: { ...typography.body, flex: 1, minHeight: 50, paddingVertical: 0 },
  clear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
