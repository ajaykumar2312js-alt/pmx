import { parseISO, isValid } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

/**
 * Converts a local date string (YYYY-MM-DD) or UTC string to a UTC Date object
 */
export const toUtcDate = (dateStr: string): Date => {
  if (
    dateStr.includes('+') ||
    (dateStr.includes('-') && dateStr.split('-').length > 3 && dateStr.includes('T'))
  ) {
    // Basic offset check: date-only has 2 hyphens. If it's a datetime with an offset, reject it unless it ends with Z
    if (!dateStr.endsWith('Z')) {
      throw new Error('Offset strings are rejected. Must be UTC (Z) or date-only.');
    }
  }

  const parsed = parseISO(dateStr);
  if (!isValid(parsed)) {
    throw new Error('Invalid date');
  }

  if (!dateStr.includes('T')) {
    // Treat date-only string as UTC midnight
    return new Date(`${dateStr}T00:00:00Z`);
  }
  return parsed;
};

/**
 * Formats a date object to ISO-8601 UTC with 'Z' suffix
 */
export const serializeUtc = (date: Date): string => {
  if (!isValid(date)) throw new Error('Invalid date');
  return date.toISOString();
};

/**
 * Converts a UTC string to local date formatted string for display
 */
export const formatLocal = (utcStr: string, fmt: string = 'PPpp'): string => {
  try {
    const date = parseISO(utcStr);
    if (!isValid(date)) return utcStr;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return formatInTimeZone(date, timeZone, fmt);
  } catch {
    return utcStr;
  }
};

/**
 * Formats a Date object to YYYY-MM-DD
 */
export const formatDateOnly = (date: Date): string => {
  if (!isValid(date)) throw new Error('Invalid date');
  // Format in UTC so a UTC-midnight instant is not shifted to the previous/next
  // day for users in non-UTC timezones (consistent with toUtcDate/serializeUtc).
  return formatInTimeZone(date, 'UTC', 'yyyy-MM-dd');
};
