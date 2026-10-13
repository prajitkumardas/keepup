import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthProvider, useAuth } from '@/auth/auth-context';
import { useAppTheme } from '@/design-system/theme';

function RootNavigator() {
  const theme = useAppTheme();
  const { session, isLoading } = useAuth();

  if (isLoading) return <View style={[styles.loader, { backgroundColor: theme.colors.background }]}><StatusBar style={theme.isDark ? 'light' : 'dark'} /><ActivityIndicator color={theme.colors.actionPrimary} size="large" /></View>;

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ contentStyle: { backgroundColor: theme.colors.background }, headerShown: false }}>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={Boolean(session)}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="notifications" options={{ presentation: 'card' }} />
          <Stack.Screen name="profile" options={{ presentation: 'card' }} />
          <Stack.Screen name="profile-details" options={{ presentation: 'card' }} />
          <Stack.Screen name="categories" options={{ presentation: 'card' }} />
          <Stack.Screen name="settings" options={{ presentation: 'card' }} />
          <Stack.Screen name="subscription" options={{ presentation: 'card' }} />
          <Stack.Screen name="privacy-data" options={{ presentation: 'card' }} />
          <Stack.Screen name="tracker/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="action/[id]" options={{ presentation: 'card' }} />
        </Stack.Protected>
        <Stack.Screen name="reset-password" options={{ presentation: 'card' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const theme = useAppTheme();
  return <ThemeProvider value={theme.isDark ? DarkTheme : DefaultTheme}><AuthProvider><RootNavigator /></AuthProvider></ThemeProvider>;
}

const styles = StyleSheet.create({ loader: { flex: 1, alignItems: 'center', justifyContent: 'center' } });
