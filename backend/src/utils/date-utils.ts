/**
 * Date Utilities
 * Helper functions for date manipulation, formatting, and validation
 */

// Date format options
export interface DateFormatOptions {
  locale?: string;
  timeZone?: string;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  format?: string; // Custom format string
}

// Date range interface
export interface DateRange {
  start: Date;
  end: Date;
}

// Duration interface
export interface Duration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

// Common date formats
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  ISO_DATE: 'YYYY-MM-DD',
  ISO_TIME: 'HH:mm:ss',
  US_DATE: 'MM/DD/YYYY',
  EU_DATE: 'DD/MM/YYYY',
  READABLE: 'MMMM D, YYYY',
  READABLE_WITH_TIME: 'MMMM D, YYYY [at] h:mm A',
  SHORT: 'MMM D, YYYY',
  TIMESTAMP: 'YYYY-MM-DD HH:mm:ss',
  FILE_SAFE: 'YYYY-MM-DD_HH-mm-ss',
  API: 'YYYY-MM-DDTHH:mm:ss[Z]'
} as const;

// Time zones
export const TIME_ZONES = {
  UTC: 'UTC',
  EST: 'America/New_York',
  PST: 'America/Los_Angeles',
  CST: 'America/Chicago',
  MST: 'America/Denver',
  GMT: 'Europe/London',
  CET: 'Europe/Paris',
  JST: 'Asia/Tokyo',
  AEST: 'Australia/Sydney'
} as const;

/**
 * Get current timestamp in milliseconds
 */
export function now(): number {
  return Date.now();
}

/**
 * Get current date
 */
export function today(): Date {
  return new Date();
}

/**
 * Get current date at start of day
 */
export function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get current date at end of day
 */
export function endOfToday(): Date {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

/**
 * Create date from ISO string
 */
export function fromISO(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Convert date to ISO string
 */
export function toISO(date: Date): string {
  return date.toISOString();
}

/**
 * Format date using Intl.DateTimeFormat
 */
export function formatDate(
  date: Date,
  options: DateFormatOptions = {}
): string {
  const {
    locale = 'en-US',
    timeZone = 'UTC',
    dateStyle,
    timeStyle,
    format
  } = options;

  if (format) {
    return formatWithCustomFormat(date, format);
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone
  };

  if (dateStyle) formatOptions.dateStyle = dateStyle;
  if (timeStyle) formatOptions.timeStyle = timeStyle;

  return new Intl.DateTimeFormat(locale, formatOptions).format(date);
}

/**
 * Format date with custom format string
 */
function formatWithCustomFormat(date: Date, format: string): string {
  const tokens: Record<string, string> = {
    'YYYY': date.getFullYear().toString(),
    'YY': date.getFullYear().toString().slice(-2),
    'MM': (date.getMonth() + 1).toString().padStart(2, '0'),
    'M': (date.getMonth() + 1).toString(),
    'MMMM': date.toLocaleString('en-US', { month: 'long' }),
    'MMM': date.toLocaleString('en-US', { month: 'short' }),
    'DD': date.getDate().toString().padStart(2, '0'),
    'D': date.getDate().toString(),
    'HH': date.getHours().toString().padStart(2, '0'),
    'H': date.getHours().toString(),
    'hh': (date.getHours() % 12 || 12).toString().padStart(2, '0'),
    'h': (date.getHours() % 12 || 12).toString(),
    'mm': date.getMinutes().toString().padStart(2, '0'),
    'm': date.getMinutes().toString(),
    'ss': date.getSeconds().toString().padStart(2, '0'),
    's': date.getSeconds().toString(),
    'sss': date.getMilliseconds().toString().padStart(3, '0'),
    'A': date.getHours() >= 12 ? 'PM' : 'AM',
    'a': date.getHours() >= 12 ? 'pm' : 'am',
    'Z': formatTimezone(date)
  };

  let result = format;
  for (const [token, value] of Object.entries(tokens)) {
    result = result.replace(new RegExp(token, 'g'), value);
  }

  return result;
}

/**
 * Format timezone offset
 */
function formatTimezone(date: Date): string {
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0');
  const minutes = (Math.abs(offset) % 60).toString().padStart(2, '0');
  return `${sign}${hours}:${minutes}`;
}

/**
 * Parse date from string with multiple format attempts
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;

  // Try ISO format first
  const isoDate = new Date(dateString);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Try common formats
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
    /^(\d{2})\/(\d{2})\/(\d{2})$/, // MM/DD/YY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // M/D/YYYY
    /^(\d{4})\/(\d{2})\/(\d{2})$/, // YYYY/MM/DD
  ];

  for (const format of formats) {
    const match = dateString.match(format);
    if (match) {
      const [, part1, part2, part3] = match;
      
      // Try different interpretations
      const attempts = [
        new Date(parseInt(part1), parseInt(part2) - 1, parseInt(part3)),
        new Date(parseInt(part3), parseInt(part1) - 1, parseInt(part2)),
        new Date(parseInt(part3), parseInt(part2) - 1, parseInt(part1))
      ];

      for (const attempt of attempts) {
        if (!isNaN(attempt.getTime())) {
          return attempt;
        }
      }
    }
  }

  return null;
}

/**
 * Check if date is valid
 */
export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Check if year is leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Get days in month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Add duration to date
 */
export function addDuration(date: Date, duration: Duration): Date {
  const result = new Date(date);

  if (duration.years) {
    result.setFullYear(result.getFullYear() + duration.years);
  }
  if (duration.months) {
    result.setMonth(result.getMonth() + duration.months);
  }
  if (duration.weeks) {
    result.setDate(result.getDate() + (duration.weeks * 7));
  }
  if (duration.days) {
    result.setDate(result.getDate() + duration.days);
  }
  if (duration.hours) {
    result.setHours(result.getHours() + duration.hours);
  }
  if (duration.minutes) {
    result.setMinutes(result.getMinutes() + duration.minutes);
  }
  if (duration.seconds) {
    result.setSeconds(result.getSeconds() + duration.seconds);
  }
  if (duration.milliseconds) {
    result.setMilliseconds(result.getMilliseconds() + duration.milliseconds);
  }

  return result;
}

/**
 * Subtract duration from date
 */
export function subtractDuration(date: Date, duration: Duration): Date {
  const negativeDuration: Duration = {};
  
  for (const [key, value] of Object.entries(duration)) {
    if (typeof value === 'number') {
      (negativeDuration as any)[key] = -value;
    }
  }
  
  return addDuration(date, negativeDuration);
}

/**
 * Get difference between two dates
 */
export function dateDiff(date1: Date, date2: Date): Duration {
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  const milliseconds = diffMs % 1000;
  
  return {
    days,
    hours,
    minutes,
    seconds,
    milliseconds
  };
}

/**
 * Get start of day
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get start of week
 */
export function startOfWeek(date: Date, startDay: number = 0): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day < startDay ? 7 : 0) + day - startDay;
  result.setDate(result.getDate() - diff);
  return startOfDay(result);
}

/**
 * Get end of week
 */
export function endOfWeek(date: Date, startDay: number = 0): Date {
  const start = startOfWeek(date, startDay);
  return endOfDay(addDuration(start, { days: 6 }));
}

/**
 * Get start of month
 */
export function startOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  return startOfDay(result);
}

/**
 * Get end of month
 */
export function endOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  return endOfDay(result);
}

/**
 * Get start of year
 */
export function startOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(0, 1);
  return startOfDay(result);
}

/**
 * Get end of year
 */
export function endOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(11, 31);
  return endOfDay(result);
}

/**
 * Check if date is in range
 */
export function isInRange(date: Date, range: DateRange): boolean {
  return date >= range.start && date <= range.end;
}

/**
 * Check if ranges overlap
 */
export function rangesOverlap(range1: DateRange, range2: DateRange): boolean {
  return range1.start <= range2.end && range2.start <= range1.end;
}

/**
 * Get age from birth date
 */
export function getAge(birthDate: Date, referenceDate: Date = new Date()): number {
  const age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
    return age - 1;
  }
  
  return age;
}

/**
 * Format duration as human readable string
 */
export function formatDuration(duration: Duration): string {
  const parts: string[] = [];
  
  if (duration.years) parts.push(`${duration.years} year${duration.years !== 1 ? 's' : ''}`);
  if (duration.months) parts.push(`${duration.months} month${duration.months !== 1 ? 's' : ''}`);
  if (duration.weeks) parts.push(`${duration.weeks} week${duration.weeks !== 1 ? 's' : ''}`);
  if (duration.days) parts.push(`${duration.days} day${duration.days !== 1 ? 's' : ''}`);
  if (duration.hours) parts.push(`${duration.hours} hour${duration.hours !== 1 ? 's' : ''}`);
  if (duration.minutes) parts.push(`${duration.minutes} minute${duration.minutes !== 1 ? 's' : ''}`);
  if (duration.seconds) parts.push(`${duration.seconds} second${duration.seconds !== 1 ? 's' : ''}`);
  
  if (parts.length === 0) return '0 seconds';
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts.join(' and ');
  
  return parts.slice(0, -1).join(', ') + ', and ' + parts[parts.length - 1];
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: Date, referenceDate: Date = new Date()): string {
  const diffMs = date.getTime() - referenceDate.getTime();
  const isPast = diffMs < 0;
  const absDiffMs = Math.abs(diffMs);
  
  const units = [
    { name: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
    { name: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
    { name: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
    { name: 'day', ms: 1000 * 60 * 60 * 24 },
    { name: 'hour', ms: 1000 * 60 * 60 },
    { name: 'minute', ms: 1000 * 60 },
    { name: 'second', ms: 1000 }
  ];
  
  for (const unit of units) {
    const value = Math.floor(absDiffMs / unit.ms);
    if (value >= 1) {
      const plural = value !== 1 ? 's' : '';
      return isPast 
        ? `${value} ${unit.name}${plural} ago`
        : `in ${value} ${unit.name}${plural}`;
    }
  }
  
  return 'just now';
}

/**
 * Get business days between two dates
 */
export function getBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * Check if date is weekend
 */
export function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
}

/**
 * Check if date is business day
 */
export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date);
}

/**
 * Get next business day
 */
export function getNextBusinessDay(date: Date): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + 1);
  
  while (isWeekend(result)) {
    result.setDate(result.getDate() + 1);
  }
  
  return result;
}

/**
 * Get previous business day
 */
export function getPreviousBusinessDay(date: Date): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - 1);
  
  while (isWeekend(result)) {
    result.setDate(result.getDate() - 1);
  }
  
  return result;
}

/**
 * Convert date to different timezone
 */
export function toTimezone(date: Date, timezone: string): Date {
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * Get timezone offset in minutes
 */
export function getTimezoneOffset(timezone: string): number {
  const date = new Date();
  const utc = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
  const target = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
  return (utc.getTime() - target.getTime()) / 60000;
}

/**
 * Create date range
 */
export function createDateRange(start: Date, end: Date): DateRange {
  return { start, end };
}

/**
 * Generate date array between two dates
 */
export function generateDateRange(
  startDate: Date,
  endDate: Date,
  step: Duration = { days: 1 }
): Date[] {
  const dates: Date[] = [];
  let current = new Date(startDate);
  
  while (current <= endDate) {
    dates.push(new Date(current));
    current = addDuration(current, step);
  }
  
  return dates;
}

/**
 * Get quarter from date
 */
export function getQuarter(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

/**
 * Get week number of year
 */
export function getWeekNumber(date: Date): number {
  const start = startOfYear(date);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek) + 1;
}

/**
 * Get day of year
 */
export function getDayOfYear(date: Date): number {
  const start = startOfYear(date);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay) + 1;
}

/**
 * Check if two dates are same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if two dates are same month
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

/**
 * Check if two dates are same year
 */
export function isSameYear(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear();
}

/**
 * Get Unix timestamp
 */
export function getUnixTimestamp(date: Date = new Date()): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Create date from Unix timestamp
 */
export function fromUnixTimestamp(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

// Export common date constants
export const DATE_CONSTANTS = {
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  DAYS_PER_WEEK: 7,
  DAYS_PER_MONTH: 30, // Average
  DAYS_PER_YEAR: 365,
  MONTHS_PER_YEAR: 12,
  QUARTERS_PER_YEAR: 4,
  MILLISECONDS_PER_MINUTE: 60000,
  MILLISECONDS_PER_HOUR: 3600000,
  MILLISECONDS_PER_DAY: 86400000,
  MILLISECONDS_PER_WEEK: 604800000
} as const;

// Export utility types
export type DateInput = Date | string | number;
export type DateUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0, Monday = 1, etc.