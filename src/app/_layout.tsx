import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { useAppTheme } from '@/design-system/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = useAppTheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ contentStyle: { backgroundColor: theme.colors.background }, headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="tracker/[id]" options={{ presentation: 'card' }} />
      </Stack>
    </ThemeProvider>
  );
}
