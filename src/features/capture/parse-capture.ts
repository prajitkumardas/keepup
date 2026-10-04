import type { DateOnly, TrackerCategory } from '@/domain/types';

export type CaptureSuggestion =
  | { objectType: 'action'; title: string; dateValue?: DateOnly }
  | { objectType: 'tracker'; title: string; category: TrackerCategory; dateValue?: DateOnly };

const monthNumbers: Record<string, string> = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };

function parseDate(text: string): DateOnly | undefined {
  const iso = text.match(/\b(20\d{2})-(0[1-9]|1[0-2])-([0-2]\d|3[01])\b/);
  if (iso) return iso[0] as DateOnly;
  const dayFirst = text.match(/\b([0-2]?\d|3[01])(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[,\s]+(20\d{2})\b/i);
  const monthFirst = text.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+([0-2]?\d|3[01])(?:st|nd|rd|th)?[,]?\s+(20\d{2})\b/i);
  const match = dayFirst ?? monthFirst;
  if (!match) return undefined;
  const day = dayFirst ? match[1] : match[2];
  const month = (dayFirst ? match[2] : match[1]).slice(0, 3).toLowerCase();
  return `${match[3]}-${monthNumbers[month]}-${day.padStart(2, '0')}` as DateOnly;
}

function sentenceTitle(text: string): string {
  const cleaned = text.trim().replace(/[.!?]+$/, '');
  return cleaned.length > 54 ? `${cleaned.slice(0, 51)}…` : cleaned;
}

export function parseCaptureText(text: string): CaptureSuggestion {
  const normalized = text.toLowerCase();
  const dateValue = parseDate(text);
  const trackerMatch: [RegExp, TrackerCategory, string][] = [
    [/passport|licen[cs]e|insurance|document/, 'document', normalized.includes('passport') ? 'Passport' : 'Important document'],
    [/return|receipt|purchase|bought/, 'purchase', sentenceTitle(text)],
    [/warranty/, 'warranty', sentenceTitle(text)],
    [/subscription|renews|renewal/, 'subscription', sentenceTitle(text)],
    [/expires|expiry|use by|best before/, 'expiry', sentenceTitle(text)],
    [/service|maintenance/, 'maintenance', sentenceTitle(text)],
  ];
  const match = trackerMatch.find(([pattern]) => pattern.test(normalized));
  return match ? { objectType: 'tracker', category: match[1], title: match[2], dateValue } : { objectType: 'action', title: sentenceTitle(text), dateValue };
}
