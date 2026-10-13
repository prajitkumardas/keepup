import { CalendarClock, Car, Check, FileText, Folder, House, PawPrint, Pill, Plane, Repeat2, ShieldCheck, ShoppingBag, Sparkles, Tag, Utensils, WalletCards } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';

import type { CategoryColorKey, CategoryIconKey } from '@/domain/types';

const icons: Record<CategoryIconKey, ComponentType<{ color?: string; size?: number; strokeWidth?: number }>> = {
  check: Check, 'file-text': FileText, pill: Pill, 'shopping-bag': ShoppingBag, 'calendar-clock': CalendarClock,
  car: Car, 'shield-check': ShieldCheck, 'wallet-cards': WalletCards, repeat: Repeat2, utensils: Utensils,
  house: House, plane: Plane, sparkles: Sparkles, 'paw-print': PawPrint, tag: Tag,
};

export const categoryColors: Record<CategoryColorKey, { background: string; foreground: string }> = {
  purple: { background: '#F0EDFF', foreground: '#6557C8' }, rose: { background: '#FFF0F3', foreground: '#B84C68' },
  blue: { background: '#EDF5FF', foreground: '#3974B8' }, green: { background: '#ECF8F1', foreground: '#29815A' },
  orange: { background: '#FFF3E8', foreground: '#B76A26' }, teal: { background: '#EAF8F6', foreground: '#258177' },
  violet: { background: '#F4EEFF', foreground: '#7652B7' }, amber: { background: '#FFF8E7', foreground: '#A8781D' },
  slate: { background: '#F0F2F5', foreground: '#667080' },
};

export function CategoryIcon({ iconKey, colorKey = 'slate', size = 46 }: { iconKey: CategoryIconKey; colorKey?: CategoryColorKey; size?: number }) {
  const Icon = icons[iconKey] ?? Folder;
  const palette = categoryColors[colorKey] ?? categoryColors.slate;
  const iconSize = Math.round(size * 0.48);
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.container, { width: size, height: size, borderRadius: Math.round(size * 0.28), backgroundColor: palette.background }]}><Icon color={palette.foreground} size={iconSize} strokeWidth={1.9} /></View>;
}

const styles = StyleSheet.create({ container: { alignItems: 'center', justifyContent: 'center' } });
