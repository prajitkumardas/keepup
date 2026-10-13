import type { ChangeEvent, CSSProperties } from 'react';

import { isDateOnly } from '@/domain/attention';

import type { DateFieldProps } from './date-field.types';
import { radii, typography } from './tokens';
import { useAppTheme } from './theme';

export function DateField({ accessibilityLabel, invalid = false, onChange, value }: DateFieldProps) {
  const { colors, isDark } = useAppTheme();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value;
    onChange(isDateOnly(nextValue) ? nextValue : undefined);
  };
  const style: CSSProperties = {
    ...typography.body,
    appearance: 'auto',
    backgroundColor: invalid ? colors.attentionSoft : colors.background,
    border: `1px solid ${invalid ? colors.attention : colors.borderStrong}`,
    borderRadius: radii.md,
    boxSizing: 'border-box',
    color: colors.textPrimary,
    colorScheme: isDark ? 'dark' : 'light',
    minHeight: 52,
    padding: '0 16px',
    width: '100%',
  };

  return <input aria-label={accessibilityLabel} onChange={handleChange} style={style} type="date" value={value ?? ''} />;
}
