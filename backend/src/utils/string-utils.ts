/**
 * String Utilities
 * Helper functions for string manipulation, validation, and formatting
 */

// String case options
export type StringCase = 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'title' | 'sentence';

// Truncate options
export interface TruncateOptions {
  length: number;
  suffix?: string;
  separator?: string;
  preserveWords?: boolean;
}

// Slug options
export interface SlugOptions {
  separator?: string;
  lowercase?: boolean;
  strict?: boolean;
  trim?: boolean;
}

// Template options
export interface TemplateOptions {
  openDelimiter?: string;
  closeDelimiter?: string;
  escapeFunction?: (str: string) => string;
}

// Highlight options
export interface HighlightOptions {
  caseSensitive?: boolean;
  wholeWords?: boolean;
  className?: string;
  tag?: string;
}

/**
 * Check if string is empty or only whitespace
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Check if string is not empty
 */
export function isNotEmpty(str: string | null | undefined): str is string {
  return !isEmpty(str);
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(str: string): string {
  if (!str) return str;
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Convert string to camelCase
 */
export function toCamelCase(str: string): string {
  if (!str) return str;
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Convert string to PascalCase
 */
export function toPascalCase(str: string): string {
  if (!str) return str;
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

/**
 * Convert string to snake_case
 */
export function toSnakeCase(str: string): string {
  if (!str) return str;
  return str
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('_');
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str: string): string {
  if (!str) return str;
  return str
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('-');
}

/**
 * Convert string to CONSTANT_CASE
 */
export function toConstantCase(str: string): string {
  if (!str) return str;
  return toSnakeCase(str).toUpperCase();
}

/**
 * Convert string to Title Case
 */
export function toTitleCase(str: string): string {
  if (!str) return str;
  return str.replace(/\w\S*/g, txt => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Convert string to sentence case
 */
export function toSentenceCase(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert string to specified case
 */
export function toCase(str: string, caseType: StringCase): string {
  switch (caseType) {
    case 'camel': return toCamelCase(str);
    case 'pascal': return toPascalCase(str);
    case 'snake': return toSnakeCase(str);
    case 'kebab': return toKebabCase(str);
    case 'constant': return toConstantCase(str);
    case 'title': return toTitleCase(str);
    case 'sentence': return toSentenceCase(str);
    default: return str;
  }
}

/**
 * Truncate string to specified length
 */
export function truncate(str: string, options: TruncateOptions): string {
  if (!str) return str;
  
  const {
    length,
    suffix = '...',
    separator,
    preserveWords = false
  } = options;
  
  if (str.length <= length) return str;
  
  let truncated = str.slice(0, length - suffix.length);
  
  if (preserveWords) {
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      truncated = truncated.slice(0, lastSpace);
    }
  }
  
  if (separator) {
    const lastSeparator = truncated.lastIndexOf(separator);
    if (lastSeparator > 0) {
      truncated = truncated.slice(0, lastSeparator);
    }
  }
  
  return truncated + suffix;
}

/**
 * Pad string to specified length
 */
export function pad(str: string, length: number, char: string = ' '): string {
  if (!str) str = '';
  const padLength = length - str.length;
  if (padLength <= 0) return str;
  
  const leftPad = Math.floor(padLength / 2);
  const rightPad = padLength - leftPad;
  
  return char.repeat(leftPad) + str + char.repeat(rightPad);
}

/**
 * Pad string on the left
 */
export function padLeft(str: string, length: number, char: string = ' '): string {
  if (!str) str = '';
  const padLength = length - str.length;
  if (padLength <= 0) return str;
  
  return char.repeat(padLength) + str;
}

/**
 * Pad string on the right
 */
export function padRight(str: string, length: number, char: string = ' '): string {
  if (!str) str = '';
  const padLength = length - str.length;
  if (padLength <= 0) return str;
  
  return str + char.repeat(padLength);
}

/**
 * Remove all whitespace from string
 */
export function removeWhitespace(str: string): string {
  if (!str) return str;
  return str.replace(/\s/g, '');
}

/**
 * Normalize whitespace (replace multiple spaces with single space)
 */
export function normalizeWhitespace(str: string): string {
  if (!str) return str;
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Remove diacritics (accents) from string
 */
export function removeDiacritics(str: string): string {
  if (!str) return str;
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Create URL-friendly slug from string
 */
export function slugify(str: string, options: SlugOptions = {}): string {
  if (!str) return str;
  
  const {
    separator = '-',
    lowercase = true,
    strict = false,
    trim = true
  } = options;
  
  let slug = str;
  
  // Remove diacritics
  slug = removeDiacritics(slug);
  
  // Convert to lowercase
  if (lowercase) {
    slug = slug.toLowerCase();
  }
  
  // Replace spaces and special characters
  if (strict) {
    slug = slug.replace(/[^a-zA-Z0-9]/g, separator);
  } else {
    slug = slug.replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, separator);
  }
  
  // Remove leading/trailing separators
  if (trim) {
    const separatorRegex = new RegExp(`^${separator}+|${separator}+$`, 'g');
    slug = slug.replace(separatorRegex, '');
  }
  
  return slug;
}

/**
 * Count occurrences of substring in string
 */
export function countOccurrences(str: string, substring: string): number {
  if (!str || !substring) return 0;
  return (str.match(new RegExp(substring, 'g')) || []).length;
}

/**
 * Check if string contains substring (case-insensitive option)
 */
export function contains(
  str: string,
  substring: string,
  caseSensitive: boolean = true
): boolean {
  if (!str || !substring) return false;
  
  if (caseSensitive) {
    return str.includes(substring);
  }
  
  return str.toLowerCase().includes(substring.toLowerCase());
}

/**
 * Check if string starts with substring (case-insensitive option)
 */
export function startsWith(
  str: string,
  substring: string,
  caseSensitive: boolean = true
): boolean {
  if (!str || !substring) return false;
  
  if (caseSensitive) {
    return str.startsWith(substring);
  }
  
  return str.toLowerCase().startsWith(substring.toLowerCase());
}

/**
 * Check if string ends with substring (case-insensitive option)
 */
export function endsWith(
  str: string,
  substring: string,
  caseSensitive: boolean = true
): boolean {
  if (!str || !substring) return false;
  
  if (caseSensitive) {
    return str.endsWith(substring);
  }
  
  return str.toLowerCase().endsWith(substring.toLowerCase());
}

/**
 * Reverse string
 */
export function reverse(str: string): string {
  if (!str) return str;
  return str.split('').reverse().join('');
}

/**
 * Check if string is palindrome
 */
export function isPalindrome(str: string): boolean {
  if (!str) return false;
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === reverse(cleaned);
}

/**
 * Generate random string
 */
export function randomString(
  length: number,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * Generate random alphanumeric string
 */
export function randomAlphanumeric(length: number): string {
  return randomString(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
}

/**
 * Generate random alphabetic string
 */
export function randomAlphabetic(length: number): string {
  return randomString(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
}

/**
 * Generate random numeric string
 */
export function randomNumeric(length: number): string {
  return randomString(length, '0123456789');
}

/**
 * Escape HTML characters
 */
export function escapeHtml(str: string): string {
  if (!str) return str;
  
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return str.replace(/[&<>"'/]/g, char => htmlEscapes[char]);
}

/**
 * Unescape HTML characters
 */
export function unescapeHtml(str: string): string {
  if (!str) return str;
  
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/'
  };
  
  return str.replace(/&(?:amp|lt|gt|quot|#x27|#x2F);/g, entity => htmlUnescapes[entity]);
}

/**
 * Escape regular expression special characters
 */
export function escapeRegex(str: string): string {
  if (!str) return str;
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Simple template string replacement
 */
export function template(
  str: string,
  data: Record<string, any>,
  options: TemplateOptions = {}
): string {
  if (!str) return str;
  
  const {
    openDelimiter = '{{',
    closeDelimiter = '}}',
    escapeFunction
  } = options;
  
  const regex = new RegExp(
    escapeRegex(openDelimiter) + '\\s*([^}]+)\\s*' + escapeRegex(closeDelimiter),
    'g'
  );
  
  return str.replace(regex, (match, key) => {
    const value = data[key.trim()];
    if (value === undefined || value === null) {
      return match;
    }
    
    const stringValue = String(value);
    return escapeFunction ? escapeFunction(stringValue) : stringValue;
  });
}

/**
 * Extract words from string
 */
export function extractWords(str: string): string[] {
  if (!str) return [];
  return str.match(/\b\w+\b/g) || [];
}

/**
 * Get word count
 */
export function wordCount(str: string): number {
  return extractWords(str).length;
}

/**
 * Get character count (excluding spaces)
 */
export function charCount(str: string, includeSpaces: boolean = false): number {
  if (!str) return 0;
  return includeSpaces ? str.length : str.replace(/\s/g, '').length;
}

/**
 * Highlight search terms in text
 */
export function highlight(
  text: string,
  searchTerms: string | string[],
  options: HighlightOptions = {}
): string {
  if (!text || !searchTerms) return text;
  
  const {
    caseSensitive = false,
    wholeWords = false,
    className = 'highlight',
    tag = 'mark'
  } = options;
  
  const terms = Array.isArray(searchTerms) ? searchTerms : [searchTerms];
  let result = text;
  
  for (const term of terms) {
    if (!term) continue;
    
    const escapedTerm = escapeRegex(term);
    const pattern = wholeWords ? `\\b${escapedTerm}\\b` : escapedTerm;
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(pattern, flags);
    
    result = result.replace(regex, match => 
      `<${tag} class="${className}">${match}</${tag}>`
    );
  }
  
  return result;
}

/**
 * Calculate string similarity (Levenshtein distance)
 */
export function similarity(str1: string, str2: string): number {
  if (!str1 && !str2) return 1;
  if (!str1 || !str2) return 0;
  
  const matrix: number[][] = [];
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  const maxLength = Math.max(len1, len2);
  return maxLength === 0 ? 1 : (maxLength - matrix[len1][len2]) / maxLength;
}

/**
 * Check if string matches pattern (supports wildcards)
 */
export function matchesPattern(str: string, pattern: string): boolean {
  if (!str || !pattern) return false;
  
  // Convert wildcard pattern to regex
  const regexPattern = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex chars
    .replace(/\\\*/g, '.*')                // Convert * to .*
    .replace(/\\\?/g, '.');                // Convert ? to .
  
  const regex = new RegExp(`^${regexPattern}$`, 'i');
  return regex.test(str);
}

/**
 * Split string by delimiter but respect quoted sections
 */
export function smartSplit(
  str: string,
  delimiter: string = ',',
  quote: string = '"'
): string[] {
  if (!str) return [];
  
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < str.length) {
    const char = str[i];
    
    if (char === quote) {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    
    i++;
  }
  
  if (current) {
    result.push(current.trim());
  }
  
  return result;
}

/**
 * Format string as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Format number with thousands separators
 */
export function formatNumber(
  num: number,
  locale: string = 'en-US',
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat(locale, options).format(num);
}

/**
 * Convert string to boolean
 */
export function toBoolean(str: string): boolean {
  if (!str) return false;
  
  const truthyValues = ['true', '1', 'yes', 'on', 'enabled'];
  return truthyValues.includes(str.toLowerCase().trim());
}

/**
 * Parse query string to object
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};
  
  if (!queryString) return params;
  
  const pairs = queryString.replace(/^\?/, '').split('&');
  
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  }
  
  return params;
}

/**
 * Convert object to query string
 */
export function toQueryString(params: Record<string, any>): string {
  const pairs: string[] = [];
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      pairs.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      );
    }
  }
  
  return pairs.length > 0 ? `?${pairs.join('&')}` : '';
}

/**
 * Mask sensitive information in string
 */
export function maskString(
  str: string,
  maskChar: string = '*',
  visibleStart: number = 2,
  visibleEnd: number = 2
): string {
  if (!str || str.length <= visibleStart + visibleEnd) {
    return str;
  }
  
  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const maskLength = str.length - visibleStart - visibleEnd;
  
  return start + maskChar.repeat(maskLength) + end;
}

/**
 * Extract initials from name
 */
export function getInitials(name: string, maxInitials: number = 2): string {
  if (!name) return '';
  
  const words = name.trim().split(/\s+/);
  const initials = words
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  
  return initials;
}

/**
 * Convert bytes to human readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

// Export common string constants
export const STRING_CONSTANTS = {
  EMPTY: '',
  SPACE: ' ',
  TAB: '\t',
  NEWLINE: '\n',
  CARRIAGE_RETURN: '\r',
  LINE_SEPARATOR: '\n',
  PARAGRAPH_SEPARATOR: '\n\n',
  ELLIPSIS: '...',
  BULLET: '•',
  DASH: '–',
  EM_DASH: '—',
  QUOTE_SINGLE: "'",
  QUOTE_DOUBLE: '"',
  QUOTE_LEFT: '