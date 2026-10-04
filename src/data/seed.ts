import { addDays, toDateOnly } from '@/domain/attention';
import type { Action, Tracker } from '@/domain/types';

const now = new Date();
export const initialTrackers: Tracker[] = [
  { id: 'tracker-return-headphones', title: 'Sony headphones', category: 'purchase', milestone: { id: 'milestone-return', label: 'Return window ends', dateValue: toDateOnly(addDays(now, 1)), provenance: 'extracted' }, reminderPolicy: { awarenessDays: 7, attentionDays: 3 }, createdAt: addDays(now, -5).toISOString(), sourceLabel: 'Order receipt' },
  { id: 'tracker-subscription', title: 'Netflix', category: 'subscription', milestone: { id: 'milestone-renewal', label: 'Renews', dateValue: toDateOnly(addDays(now, 8)), provenance: 'manual' }, reminderPolicy: { awarenessDays: 14, attentionDays: 7 }, createdAt: addDays(now, -40).toISOString() },
  { id: 'tracker-passport', title: 'Passport', category: 'document', milestone: { id: 'milestone-expiry', label: 'Expires', dateValue: toDateOnly(addDays(now, 166)), provenance: 'extracted' }, reminderPolicy: { awarenessDays: 180, attentionDays: 90 }, createdAt: addDays(now, -1).toISOString(), sourceLabel: 'Passport scan' },
  { id: 'tracker-warranty', title: 'Laptop warranty', category: 'warranty', milestone: { id: 'milestone-warranty', label: 'Coverage ends', dateValue: toDateOnly(addDays(now, 24)), provenance: 'imported' }, reminderPolicy: { awarenessDays: 30, attentionDays: 7 }, createdAt: addDays(now, -90).toISOString(), sourceLabel: 'Purchase invoice' },
  { id: 'tracker-serum', title: 'Face serum', category: 'expiry', milestone: { id: 'milestone-product-expiry', label: 'Expires', dateValue: toDateOnly(addDays(now, 190)), provenance: 'manual' }, reminderPolicy: { awarenessDays: 30, attentionDays: 7 }, createdAt: addDays(now, -12).toISOString() },
];
export const initialActions: Action[] = [
  { id: 'action-return-headphones', title: 'Start return', status: 'open', dueDate: toDateOnly(addDays(now, 1)), trackerId: 'tracker-return-headphones' },
  { id: 'action-credit-card', title: 'Pay credit card', status: 'open', dueDate: toDateOnly(now) },
];
