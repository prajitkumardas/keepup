import { router, usePathname } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useEffect, useRef } from 'react';

import { FloatingBottomNavigation, type MainTabName } from '@/components/floating-bottom-navigation';
import { copy } from '@/localization/copy.en';

type MainTabPath = '/' | '/library' | '/upcoming' | '/search';

function isMainTabPath(pathname: string): pathname is MainTabPath {
  return pathname === '/' || pathname === '/library' || pathname === '/upcoming' || pathname === '/search';
}

function getMainTabName(pathname: MainTabPath): MainTabName {
  if (pathname === '/library') return 'library';
  if (pathname === '/upcoming') return 'upcoming';
  if (pathname === '/search') return 'search';
  return 'index';
}

export default function TabLayout() {
  const pathname = usePathname();
  const previousTab = useRef<MainTabPath>('/');
  const isAddActive = pathname === '/capture';

  useEffect(() => {
    if (isMainTabPath(pathname)) previousTab.current = pathname;
  }, [pathname]);

  const activePath = isMainTabPath(pathname) ? pathname : previousTab.current;

  return (
    <Tabs tabBar={(props) => <FloatingBottomNavigation {...props} activeTab={getMainTabName(activePath)} captureOpen={isAddActive} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: copy.tabs.today }} />
      <Tabs.Screen name="library" options={{ title: copy.tabs.library }} />
      <Tabs.Screen
        name="capture"
        listeners={{
          tabPress: (event) => {
            if (!isAddActive) return;
            event.preventDefault();
            router.replace(previousTab.current);
          },
        }}
        options={{
          title: copy.tabs.add,
          tabBarAccessibilityLabel: isAddActive ? 'Close capture' : 'Add new item',
        }}
      />
      <Tabs.Screen name="upcoming" options={{ title: copy.tabs.upcoming }} />
      <Tabs.Screen name="search" options={{ title: copy.tabs.search }} />
    </Tabs>
  );
}
