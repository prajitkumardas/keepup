import { addDays, toDateOnly } from '@/domain/attention';
import type { Action, Category, Tracker } from '@/domain/types';

const now = new Date();
const category = (id: string, name: string, icon: Category['icon'], color: Category['color']): Category => ({ id, userId: 'seed', name, normalizedName: name.toLowerCase(), icon, color, isCustom: false, createdAt: now.toISOString(), updatedAt: now.toISOString() });
const purchases = category('seed-purchases', 'Purchases', 'shopping-bag', 'orange');
const subscription = category('seed-subscription', 'Subscription', 'repeat', 'violet');
const documents = category('seed-documents', 'Documents', 'file-text', 'purple');
const cosmetics = category('seed-cosmetics', 'Cosmetics', 'sparkles', 'rose');
const finance = category('seed-finance', 'Finance', 'wallet-cards', 'teal');
export const initialTrackers: Tracker[] = [
  { id: 'tracker-return-headphones', title: 'Sony headphones', trackerType: 'purchase', category: purchases, milestone: { id: 'milestone-return', label: 'Return window ends', dateValue: toDateOnly(addDays(now, 1)), provenance: 'extracted' }, reminderPolicy: { awarenessDays: 7, attentionDays: 3 }, createdAt: addDays(now, -5).toISOString(), sourceLabel: 'Order receipt' },
  { id: 'tracker-subscription', title: 'Netflix', trackerType: 'subscription', category: subscription, milestone: { id: 'milestone-renewal', label: 'Renews', dateValue: toDateOnly(addDays(now, 8)), provenance: 'manual' }, reminderPolicy: { awarenessDays: 14, attentionDays: 7 }, createdAt: addDays(now, -40).toISOString() },
  { id: 'tracker-passport', title: 'Passport', trackerType: 'document', category: documents, milestone: { id: 'milestone-expiry', label: 'Expires', dateValue: toDateOnly(addDays(now, 166)), provenance: 'extracted' }, reminderPolicy: { awarenessDays: 180, attentionDays: 90 }, createdAt: addDays(now, -1).toISOString(), sourceLabel: 'Passport scan' },
  { id: 'tracker-warranty', title: 'Laptop warranty', trackerType: 'warranty', category: purchases, milestone: { id: 'milestone-warranty', label: 'Coverage ends', dateValue: toDateOnly(addDays(now, 24)), provenance: 'imported' }, reminderPolicy: { awarenessDays: 30, attentionDays: 7 }, createdAt: addDays(now, -90).toISOString(), sourceLabel: 'Purchase invoice' },
  { id: 'tracker-serum', title: 'Face serum', trackerType: 'expiry', category: cosmetics, milestone: { id: 'milestone-product-expiry', label: 'Expires', dateValue: toDateOnly(addDays(now, 190)), provenance: 'manual' }, reminderPolicy: { awarenessDays: 30, attentionDays: 7 }, createdAt: addDays(now, -12).toISOString() },
];
export const initialActions: Action[] = [
  { id: 'action-return-headphones', title: 'Start return', category: purchases, status: 'open', dueDate: toDateOnly(addDays(now, 1)), trackerId: 'tracker-return-headphones', createdAt: addDays(now, -1).toISOString() },
  { id: 'action-credit-card', title: 'Pay credit card', category: finance, status: 'open', dueDate: toDateOnly(now), createdAt: now.toISOString() },
];
