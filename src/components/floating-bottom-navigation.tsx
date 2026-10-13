import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { CalendarDays, Library, Plus, Search, SunMedium, type LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/design-system/app-text';
import { radii, spacing } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { copy } from '@/localization/copy.en';

export type MainTabName = 'index' | 'library' | 'upcoming' | 'search';

const tabItems: Record<MainTabName, { icon: LucideIcon; label: string }> = {
  index: { icon: SunMedium, label: copy.tabs.today },
  library: { icon: Library, label: copy.tabs.library },
  upcoming: { icon: CalendarDays, label: copy.tabs.upcoming },
  search: { icon: Search, label: copy.tabs.search },
};

interface FloatingBottomNavigationProps extends BottomTabBarProps {
  activeTab: MainTabName;
  captureOpen: boolean;
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReducedMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reducedMotion;
}

function CaptureButton({ open, onLongPress, onPress }: { open: boolean; onLongPress: () => void; onPress: () => void }) {
  const { colors } = useAppTheme();
  const reducedMotion = useReducedMotion();
  const [rotation] = useState(() => new Animated.Value(open ? 1 : 0));
  const [pressScale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reducedMotion) {
      rotation.stopAnimation();
      rotation.setValue(open ? 1 : 0);
      return;
    }
    const animation = Animated.timing(rotation, {
      toValue: open ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [open, reducedMotion, rotation]);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });
  const animatePress = (toValue: number) => {
    pressScale.stopAnimation();
    if (reducedMotion) {
      pressScale.setValue(toValue);
      return;
    }
    Animated.timing(pressScale, { toValue, duration: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  };

  return (
    <View style={styles.fabSlot}>
      <Animated.View style={{ transform: [{ translateY: -28 }, { scale: pressScale }] }}>
        <Pressable
          accessibilityLabel={open ? 'Close capture' : 'Add new item'}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          onLongPress={onLongPress}
          onPress={onPress}
          onPressIn={() => animatePress(0.95)}
          onPressOut={() => animatePress(1)}
          style={({ pressed }) => [styles.fab, { backgroundColor: pressed ? colors.actionPrimaryPressed : colors.actionPrimary, shadowColor: colors.actionPrimary, shadowOpacity: pressed ? 0.16 : 0.3, elevation: pressed ? 4 : 9 }]}
        >
          <Animated.View style={{ transform: [{ rotate }] }}><Plus color="#FFFFFF" size={29} strokeWidth={2.2} /></Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function NavigationItem({ icon: Icon, label, onLongPress, onPress, selected }: { icon: LucideIcon; label: string; onLongPress: () => void; onPress: () => void; selected: boolean }) {
  const { colors } = useAppTheme();
  const color = selected ? colors.actionPrimary : colors.textSecondary;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [styles.item, { opacity: pressed ? 0.68 : 1, transform: [{ scale: pressed ? 0.97 : selected ? 1.04 : 1 }] }]}
    >
      <View style={[styles.iconHalo, selected && { backgroundColor: colors.actionSoft }]}><Icon color={color} size={23} strokeWidth={1.9} /></View>
      <AppText numberOfLines={1} style={[styles.label, { color, fontWeight: selected ? '600' : '500' }]}>{label}</AppText>
    </Pressable>
  );
}

export function FloatingBottomNavigation({ activeTab, captureOpen, insets, navigation, state }: FloatingBottomNavigationProps) {
  const { colors } = useAppTheme();

  const tabPressHandlers = (route: (typeof state.routes)[number], index: number) => ({
    onLongPress: () => navigation.emit({ type: 'tabLongPress', target: route.key }),
    onPress: () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (state.index !== index && !event.defaultPrevented) navigation.navigate(route.name, route.params);
    },
  });

  return (
    <View style={[styles.shell, { paddingBottom: insets.bottom + spacing[3] }]}>
      <View style={[styles.surface, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.textPrimary }]}>
        {state.routes.map((route, index) => {
          const handlers = tabPressHandlers(route, index);
          if (route.name === 'capture') return <CaptureButton key={route.key} open={captureOpen} {...handlers} />;
          const item = tabItems[route.name as MainTabName];
          if (!item) return null;
          return <NavigationItem key={route.key} {...item} {...handlers} selected={route.name === activeTab} />;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { paddingTop: spacing[5], paddingHorizontal: spacing[4] },
  surface: { height: 80, borderWidth: 1, borderRadius: 30, paddingHorizontal: spacing[1], flexDirection: 'row', alignItems: 'center', overflow: 'visible', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 6 },
  item: { flex: 1, minWidth: 0, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: spacing[1] },
  iconHalo: { width: 36, height: 32, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, lineHeight: 14 },
  fabSlot: { width: 72, height: 80, alignItems: 'center', justifyContent: 'center' },
  fab: { width: 64, height: 64, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 7 }, shadowRadius: 12 },
});
