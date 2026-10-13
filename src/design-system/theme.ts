import { useKeepUpStore } from '@/store/keepup-store';

import { darkColors, lightColors } from './tokens';

export function useAppTheme() {
  const isDark = useKeepUpStore((state) => state.profile.themeMode === 'dark');
  return { colors: isDark ? darkColors : lightColors, isDark };
}
