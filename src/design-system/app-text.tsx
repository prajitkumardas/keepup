import type { ComponentProps } from 'react';
import { Text } from 'react-native';

import { typography } from './tokens';
import { useAppTheme } from './theme';

type TextVariant = keyof typeof typography;
interface AppTextProps extends ComponentProps<typeof Text> { variant?: TextVariant; tone?: 'primary' | 'secondary' | 'tertiary' | 'action' | 'danger'; }

export function AppText({ variant = 'body', tone = 'primary', style, ...props }: AppTextProps) {
  const { colors } = useAppTheme();
  const color = tone === 'secondary' ? colors.textSecondary : tone === 'tertiary' ? colors.textTertiary : tone === 'action' ? colors.actionPrimary : tone === 'danger' ? colors.overdue : colors.textPrimary;
  return <Text {...props} style={[typography[variant], { color }, style]} />;
}
