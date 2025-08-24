/**
 * Validation Utilities
 * Helper functions for data validation and sanitization
 */

import { ValidationResult } from './index';

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
}

// Phone validation
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[1-9]?[0-9]{7,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// UUID validation
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Password strength validation
export interface PasswordValidationOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  forbiddenPasswords?: string[];
}

export function validatePassword(
  password: string,
  options: PasswordValidationOptions = {}
): ValidationResult {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
    forbiddenPasswords = [],
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];

  // Length check
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  // Character requirements
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Forbidden passwords
  if (forbiddenPasswords.includes(password.toLowerCase())) {
    errors.push('This password is too common and not allowed');
  }

  // Common patterns
  if (/^(.)\1+$/.test(password)) {
    errors.push('Password cannot be all the same character');
  }

  if (/^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    warnings.push('Password contains sequential characters');
  }

  // Strength warnings
  if (password.length < 12) {
    warnings.push('Consider using a longer password for better security');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Sanitize string input
export function sanitizeString(input: string, options: {
  maxLength?: number;
  allowHtml?: boolean;
  trim?: boolean;
} = {}): string {
  const { maxLength, allowHtml = false, trim = true } = options;
  
  let sanitized = input;
  
  if (trim) {
    sanitized = sanitized.trim();
  }
  
  if (!allowHtml) {
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

// Validate and sanitize filename
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 255);
}

// Validate coordinate
export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
}

// Validate date range
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return (
    startDate instanceof Date &&
    endDate instanceof Date &&
    !isNaN(startDate.getTime()) &&
    !isNaN(endDate.getTime()) &&
    startDate <= endDate
  );
}

// Validate pagination parameters
export function validatePagination(page: number, limit: number): ValidationResult {
  const errors: string[] = [];
  
  if (!Number.isInteger(page) || page < 1) {
    errors.push('Page must be a positive integer');
  }
  
  if (!Number.isInteger(limit) || limit < 1) {
    errors.push('Limit must be a positive integer');
  }
  
  if (limit > 100) {
    errors.push('Limit cannot exceed 100');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Validate sort parameters
export function validateSort(sort: string, allowedFields: string[]): ValidationResult {
  const errors: string[] = [];
  
  if (!sort) {
    return { isValid: true, errors: [] };
  }
  
  const sortParts = sort.split(',');
  
  for (const part of sortParts) {
    const trimmed = part.trim();
    const field = trimmed.startsWith('-') ? trimmed.substring(1) : trimmed;
    
    if (!allowedFields.includes(field)) {
      errors.push(`Invalid sort field: ${field}. Allowed fields: ${allowedFields.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Validate JSON string
export function isValidJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

// Validate hex color
export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

// Validate IP address
export function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Validate credit card number (Luhn algorithm)
export function isValidCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

// Validate file size
export function validateFileSize(size: number, maxSize: number): ValidationResult {
  const errors: string[] = [];
  
  if (size <= 0) {
    errors.push('File size must be greater than 0');
  }
  
  if (size > maxSize) {
    errors.push(`File size (${formatBytes(size)}) exceeds maximum allowed size (${formatBytes(maxSize)})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Format bytes for display
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Validate array of items
export function validateArray<T>(
  items: T[],
  validator: (item: T) => ValidationResult,
  options: {
    maxLength?: number;
    minLength?: number;
    allowEmpty?: boolean;
  } = {}
): ValidationResult {
  const { maxLength, minLength = 0, allowEmpty = true } = options;
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!allowEmpty && items.length === 0) {
    errors.push('Array cannot be empty');
  }
  
  if (minLength > 0 && items.length < minLength) {
    errors.push(`Array must contain at least ${minLength} items`);
  }
  
  if (maxLength && items.length > maxLength) {
    errors.push(`Array cannot contain more than ${maxLength} items`);
  }
  
  // Validate each item
  for (let i = 0; i < items.length; i++) {
    const result = validator(items[i]);
    if (!result.isValid) {
      errors.push(`Item ${i + 1}: ${result.errors.join(', ')}`);
    }
    if (result.warnings) {
      warnings.push(...result.warnings.map(w => `Item ${i + 1}: ${w}`));
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate object properties
export function validateObject(
  obj: Record<string, any>,
  schema: Record<string, (value: any) => ValidationResult>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const [key, validator] of Object.entries(schema)) {
    if (obj.hasOwnProperty(key)) {
      const result = validator(obj[key]);
      if (!result.isValid) {
        errors.push(`${key}: ${result.errors.join(', ')}`);
      }
      if (result.warnings) {
        warnings.push(...result.warnings.map(w => `${key}: ${w}`));
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[1-9]?[0-9]{7,15}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  IPV4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  IPV6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  FILENAME: /^[a-zA-Z0-9._-]+$/,
} as const;