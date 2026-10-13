import { ActionRow } from '@/components/action-row';
import { TrackerRow } from '@/components/tracker-row';
import type { LibraryItem } from '@/domain/library';

export function LibraryItemRow({ item }: { item: LibraryItem }) {
  return item.kind === 'tracker' ? <TrackerRow tracker={item.tracker} /> : <ActionRow action={item.action} />;
}
