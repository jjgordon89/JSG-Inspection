/**
 * Crypto Utilities
 * Helper functions for encryption, hashing, and security operations
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { promisify } from 'util';
import { CONSTANTS } from './index';

// Encryption configuration
export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  tagLength: number;
  saltLength: number;
  iterations: number;
}

// Default encryption configuration
export const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  tagLength: 16,
  saltLength: 32,
  iterations: 100000
};

// Encrypted data structure
export interface EncryptedData {
  data: string;
  iv: string;
  tag: string;
  salt: string;
}

// Hash options
export interface HashOptions {
  algorithm?: 'sha256' | 'sha512' | 'md5';
  encoding?: 'hex' | 'base64';
  rounds?: number;
}

/**
 * Generate a cryptographically secure random string
 */
export function generateSecureRandom(length: number = 32, encoding: BufferEncoding = 'hex'): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString(encoding).slice(0, length);
}

/**
 * Generate a secure UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Generate a secure token for password reset, API keys, etc.
 */
export function generateSecureToken(length: number = 64): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string, saltRounds: number = 12): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a hash of data
 */
export function generateHash(
  data: string | Buffer,
  options: HashOptions = {}
): string {
  const {
    algorithm = 'sha256',
    encoding = 'hex'
  } = options;

  return crypto.createHash(algorithm).update(data).digest(encoding);
}

/**
 * Generate HMAC signature
 */
export function generateHMAC(
  data: string | Buffer,
  secret: string,
  algorithm: string = 'sha256',
  encoding: BufferEncoding = 'hex'
): string {
  return crypto.createHmac(algorithm, secret).update(data).digest(encoding);
}

/**
 * Verify HMAC signature
 */
export function verifyHMAC(
  data: string | Buffer,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): boolean {
  const expectedSignature = generateHMAC(data, secret, algorithm);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Derive key from password using PBKDF2
 */
export async function deriveKey(
  password: string,
  salt: Buffer,
  iterations: number = DEFAULT_ENCRYPTION_CONFIG.iterations,
  keyLength: number = DEFAULT_ENCRYPTION_CONFIG.keyLength
): Promise<Buffer> {
  const pbkdf2 = promisify(crypto.pbkdf2);
  return pbkdf2(password, salt, iterations, keyLength, 'sha512');
}

/**
 * Encrypt data using AES-256-GCM
 */
export async function encryptData(
  data: string,
  password: string,
  config: Partial<EncryptionConfig> = {}
): Promise<EncryptedData> {
  const fullConfig = { ...DEFAULT_ENCRYPTION_CONFIG, ...config };
  
  // Generate salt and derive key
  const salt = crypto.randomBytes(fullConfig.saltLength);
  const key = await deriveKey(password, salt, fullConfig.iterations, fullConfig.keyLength);
  
  // Generate IV
  const iv = crypto.randomBytes(fullConfig.ivLength);
  
  // Create cipher
  const cipher = crypto.createCipher(fullConfig.algorithm, key);
  cipher.setAAD(salt); // Additional authenticated data
  
  // Encrypt data
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get authentication tag
  const tag = cipher.getAuthTag();
  
  return {
    data: encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    salt: salt.toString('hex')
  };
}

/**
 * Decrypt data using AES-256-GCM
 */
export async function decryptData(
  encryptedData: EncryptedData,
  password: string,
  config: Partial<EncryptionConfig> = {}
): Promise<string> {
  const fullConfig = { ...DEFAULT_ENCRYPTION_CONFIG, ...config };
  
  // Convert hex strings back to buffers
  const salt = Buffer.from(encryptedData.salt, 'hex');
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const tag = Buffer.from(encryptedData.tag, 'hex');
  
  // Derive key
  const key = await deriveKey(password, salt, fullConfig.iterations, fullConfig.keyLength);
  
  // Create decipher
  const decipher = crypto.createDecipher(fullConfig.algorithm, key);
  decipher.setAAD(salt);
  decipher.setAuthTag(tag);
  
  // Decrypt data
  let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Encrypt file content
 */
export async function encryptFile(
  filePath: string,
  outputPath: string,
  password: string
): Promise<void> {
  const fs = await import('fs/promises');
  const data = await fs.readFile(filePath, 'utf8');
  const encrypted = await encryptData(data, password);
  await fs.writeFile(outputPath, JSON.stringify(encrypted));
}

/**
 * Decrypt file content
 */
export async function decryptFile(
  encryptedFilePath: string,
  outputPath: string,
  password: string
): Promise<void> {
  const fs = await import('fs/promises');
  const encryptedContent = await fs.readFile(encryptedFilePath, 'utf8');
  const encryptedData: EncryptedData = JSON.parse(encryptedContent);
  const decrypted = await decryptData(encryptedData, password);
  await fs.writeFile(outputPath, decrypted);
}

/**
 * Generate file checksum
 */
export async function calculateFileChecksum(
  filePath: string,
  algorithm: string = 'sha256'
): Promise<string> {
  const fs = await import('fs');
  const crypto = await import('crypto');
  
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Verify file integrity using checksum
 */
export async function verifyFileIntegrity(
  filePath: string,
  expectedChecksum: string,
  algorithm: string = 'sha256'
): Promise<boolean> {
  try {
    const actualChecksum = await calculateFileChecksum(filePath, algorithm);
    return crypto.timingSafeEqual(
      Buffer.from(expectedChecksum, 'hex'),
      Buffer.from(actualChecksum, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Generate API key with specific format
 */
export function generateApiKey(prefix: string = 'jsg', length: number = 32): string {
  const randomPart = generateSecureRandom(length);
  const timestamp = Date.now().toString(36);
  return `${prefix}_${timestamp}_${randomPart}`;
}

/**
 * Generate session token
 */
export function generateSessionToken(): string {
  return generateSecureToken(64);
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return generateSecureToken(32);
}

/**
 * Constant-time string comparison
 */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(a, 'utf8'),
    Buffer.from(b, 'utf8')
  );
}

/**
 * Generate salt for password hashing
 */
export function generateSalt(length: number = 16): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Key derivation function for encryption keys
 */
export function deriveEncryptionKey(
  password: string,
  salt: string,
  iterations: number = 100000,
  keyLength: number = 32
): Buffer {
  return crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha512');
}

/**
 * Generate nonce for cryptographic operations
 */
export function generateNonce(length: number = 16): string {
  return crypto.randomBytes(length).toString('base64');
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }
  
  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const masked = '*'.repeat(data.length - (visibleChars * 2));
  
  return `${start}${masked}${end}`;
}

/**
 * Generate fingerprint for data
 */
export function generateFingerprint(data: any): string {
  const serialized = typeof data === 'string' ? data : JSON.stringify(data);
  return generateHash(serialized, { algorithm: 'sha256' });
}

/**
 * Secure random number generation
 */
export function generateSecureRandomNumber(min: number, max: number): number {
  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValue = Math.pow(256, bytesNeeded);
  const threshold = maxValue - (maxValue % range);
  
  let randomValue;
  do {
    const randomBytes = crypto.randomBytes(bytesNeeded);
    randomValue = randomBytes.readUIntBE(0, bytesNeeded);
  } while (randomValue >= threshold);
  
  return min + (randomValue % range);
}

/**
 * Generate OTP (One-Time Password)
 */
export function generateOTP(length: number = 6): string {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += generateSecureRandomNumber(0, 9).toString();
  }
  return otp;
}

/**
 * Hash data with salt
 */
export function hashWithSalt(
  data: string,
  salt?: string,
  algorithm: string = 'sha256'
): { hash: string; salt: string } {
  const actualSalt = salt || generateSalt();
  const hash = crypto.createHash(algorithm)
    .update(data + actualSalt)
    .digest('hex');
  
  return { hash, salt: actualSalt };
}

/**
 * Verify hash with salt
 */
export function verifyHashWithSalt(
  data: string,
  hash: string,
  salt: string,
  algorithm: string = 'sha256'
): boolean {
  const { hash: computedHash } = hashWithSalt(data, salt, algorithm);
  return safeCompare(hash, computedHash);
}

// Export common crypto constants
export const CRYPTO_CONSTANTS = {
  DEFAULT_SALT_LENGTH: 16,
  DEFAULT_TOKEN_LENGTH: 32,
  DEFAULT_API_KEY_LENGTH: 32,
  DEFAULT_SESSION_TOKEN_LENGTH: 64,
  DEFAULT_CSRF_TOKEN_LENGTH: 32,
  DEFAULT_OTP_LENGTH: 6,
  DEFAULT_HASH_ALGORITHM: 'sha256',
  DEFAULT_HMAC_ALGORITHM: 'sha256',
  DEFAULT_ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  DEFAULT_PBKDF2_ITERATIONS: 100000,
  DEFAULT_BCRYPT_ROUNDS: 12
} as const;

// Export utility types
export type CryptoAlgorithm = 'sha256' | 'sha512' | 'md5';
export type EncryptionAlgorithm = 'aes-256-gcm' | 'aes-256-cbc' | 'aes-192-gcm';
export type HashEncoding = 'hex' | 'base64';