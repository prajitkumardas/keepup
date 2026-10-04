import { Tabs } from 'expo-router';
import { CalendarDays, Library, Plus, Search, SunMedium } from 'lucide-react-native';
import { Platform, View } from 'react-native';

import { radii, spacing } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { copy } from '@/localization/copy.en';

export default function TabLayout() {
  const theme = useAppTheme();
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: theme.colors.actionPrimary, tabBarInactiveTintColor: theme.colors.textTertiary, tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 }, tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, height: Platform.OS === 'ios' ? 88 : 78, paddingTop: spacing[2], paddingBottom: Platform.OS === 'ios' ? spacing[5] : spacing[2] } }}>
      <Tabs.Screen name="index" options={{ title: copy.tabs.today, tabBarAccessibilityLabel: copy.tabs.today, tabBarIcon: ({ color, size }) => <SunMedium color={color} size={size} strokeWidth={1.9} /> }} />
      <Tabs.Screen name="library" options={{ title: copy.tabs.library, tabBarAccessibilityLabel: copy.tabs.library, tabBarIcon: ({ color, size }) => <Library color={color} size={size} strokeWidth={1.9} /> }} />
      <Tabs.Screen name="capture" options={{ title: copy.tabs.add, tabBarAccessibilityLabel: copy.tabs.addAccessibility, tabBarIcon: ({ focused }) => <View style={{ backgroundColor: focused ? theme.colors.actionPrimaryPressed : theme.colors.actionPrimary, borderRadius: radii.full, padding: spacing[3], transform: [{ translateY: -5 }] }}><Plus color="#FFFFFF" size={25} strokeWidth={2.2} /></View> }} />
      <Tabs.Screen name="upcoming" options={{ title: copy.tabs.upcoming, tabBarAccessibilityLabel: copy.tabs.upcoming, tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} strokeWidth={1.9} /> }} />
      <Tabs.Screen name="search" options={{ title: copy.tabs.search, tabBarAccessibilityLabel: copy.tabs.search, tabBarIcon: ({ color, size }) => <Search color={color} size={size} strokeWidth={1.9} /> }} />
    </Tabs>
  );
}
