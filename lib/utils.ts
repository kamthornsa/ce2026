import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { transliterate } from 'transliteration';
import slugify from 'slugify';

function containsThai(text: string): boolean {
  return /[\u0E00-\u0E7F]/.test(text);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generate a URL-safe slug from any text, including Thai.
 * Thai text is translated to meaningful English first (e.g. "สุนัข" → "dog").
 * Other non-ASCII text is transliterated. Falls back to a timestamp suffix
 * if translation fails or produces an empty result.
 */
export async function createSlug(text: string, fallback = 'item'): Promise<string> {
  let processedText = text;

  if (containsThai(text)) {
    try {
      const { translate } = await import('@vitalets/google-translate-api');
      const result = await translate(text, { from: 'th', to: 'en' });
      processedText = result.text;
    } catch {
      // Translation failed (network error, rate limit, etc.) → use timestamp fallback
      return `${fallback}-${Date.now()}`;
    }
  } else if (/[^\x00-\x7F]/.test(text)) {
    // Other non-ASCII scripts → transliterate
    processedText = transliterate(text);
  }

  const base = slugify(processedText, { lower: true, strict: true })
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return base || `${fallback}-${Date.now()}`;
}
