import type { Category, CategoryColorKey, CategoryIconKey } from '@/domain/types';

export const categoryIconKeys: CategoryIconKey[] = ['check', 'file-text', 'pill', 'shopping-bag', 'calendar-clock', 'car', 'shield-check', 'wallet-cards', 'repeat', 'utensils', 'house', 'plane', 'sparkles', 'paw-print', 'tag'];
export const categoryColorKeys: CategoryColorKey[] = ['purple', 'rose', 'blue', 'green', 'orange', 'teal', 'violet', 'amber', 'slate'];

const keywordConfig: { pattern: RegExp; name: string; icon: CategoryIconKey; color: CategoryColorKey }[] = [
  { pattern: /passport|document|certificate|licen[cs]e|visa/, name: 'Documents', icon: 'file-text', color: 'purple' },
  { pattern: /medicine|medication|tablet|vitamin|prescription|pharmacy/, name: 'Medicines', icon: 'pill', color: 'rose' },
  { pattern: /car|vehicle|blue book|pollution|service|registration/, name: 'Vehicle', icon: 'car', color: 'blue' },
  { pattern: /insurance|policy|coverage/, name: 'Insurance', icon: 'shield-check', color: 'green' },
  { pattern: /purchase|receipt|order|warranty|bought|return/, name: 'Purchases', icon: 'shopping-bag', color: 'orange' },
  { pattern: /finance|bank|credit card|debit card|loan|payment|bill/, name: 'Finance', icon: 'wallet-cards', color: 'teal' },
  { pattern: /subscription|netflix|spotify|renews|renewal/, name: 'Subscription', icon: 'repeat', color: 'violet' },
  { pattern: /food|grocery|meal|restaurant/, name: 'Food', icon: 'utensils', color: 'amber' },
  { pattern: /home|house|rent|apartment|utility/, name: 'Home', icon: 'house', color: 'green' },
  { pattern: /travel|flight|hotel|trip|booking/, name: 'Travel', icon: 'plane', color: 'blue' },
  { pattern: /cosmetic|serum|makeup|skincare/, name: 'Cosmetics', icon: 'sparkles', color: 'rose' },
  { pattern: /expire|expiry|best before|use by/, name: 'Expiry', icon: 'calendar-clock', color: 'amber' },
  { pattern: /action|task|todo|to-do/, name: 'Action', icon: 'check', color: 'purple' },
  { pattern: /pet|dog|cat|veterinary|vet/, name: 'Pet', icon: 'paw-print', color: 'purple' },
];

export function normalizeCategoryName(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

export function inferCategoryAppearance(name: string): { icon: CategoryIconKey; color: CategoryColorKey } {
  const match = keywordConfig.find(({ pattern }) => pattern.test(normalizeCategoryName(name)));
  return match ? { icon: match.icon, color: match.color } : { icon: 'tag', color: 'slate' };
}

export function suggestCategory(content: string, categories: Category[]): Category | undefined {
  const match = keywordConfig.find(({ pattern }) => pattern.test(content.toLocaleLowerCase()));
  if (!match) return undefined;
  const normalized = normalizeCategoryName(match.name);
  return categories.find((category) => category.normalizedName === normalized);
}

export function categoryUsage(categoryId: string, trackers: { category: Category }[], actions: { category: Category }[]) {
  return trackers.filter((item) => item.category.id === categoryId).length + actions.filter((item) => item.category.id === categoryId).length;
}
