/**
 * Compression Utilities
 * Helper functions for file compression, decompression, and archive operations
 */

import * as zlib from 'zlib';
import { promisify } from 'util';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { join, extname, basename } from 'path';
import { stat, readdir } from 'fs/promises';

// Promisify zlib functions
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);
const deflate = promisify(zlib.deflate);
const inflate = promisify(zlib.inflate);
const brotliCompress = promisify(zlib.brotliCompress);
const brotliDecompress = promisify(zlib.brotliDecompress);
const pipelineAsync = promisify(pipeline);

// Compression options
export interface CompressionOptions {
  level?: number; // 1-9 for gzip/deflate, 0-11 for brotli
  chunkSize?: number;
  windowBits?: number;
  memLevel?: number;
  strategy?: number;
  dictionary?: Buffer;
}

// Archive options
export interface ArchiveOptions {
  compression?: 'gzip' | 'deflate' | 'brotli';
  level?: number;
  includeHidden?: boolean;
  followSymlinks?: boolean;
  filter?: (path: string) => boolean;
  progress?: (processed: number, total: number) => void;
}

// Compression result
export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  algorithm: string;
  processingTime: number;
}

// Archive entry
export interface ArchiveEntry {
  path: string;
  size: number;
  isDirectory: boolean;
  modifiedTime: Date;
  permissions?: string;
}

/**
 * Compress data using gzip
 */
export async function compressGzip(
  data: Buffer | string,
  options: CompressionOptions = {}
): Promise<Buffer> {
  const input = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
  
  const gzipOptions: zlib.ZlibOptions = {
    level: options.level || zlib.constants.Z_DEFAULT_COMPRESSION,
    chunkSize: options.chunkSize || 16 * 1024,
    windowBits: options.windowBits || 15,
    memLevel: options.memLevel || 8,
    strategy: options.strategy || zlib.constants.Z_DEFAULT_STRATEGY
  };
  
  return await gzip(input, gzipOptions);
}

/**
 * Decompress gzip data
 */
export async function decompressGzip(data: Buffer): Promise<Buffer> {
  return await gunzip(data);
}

/**
 * Compress data using deflate
 */
export async function compressDeflate(
  data: Buffer | string,
  options: CompressionOptions = {}
): Promise<Buffer> {
  const input = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
  
  const deflateOptions: zlib.ZlibOptions = {
    level: options.level || zlib.constants.Z_DEFAULT_COMPRESSION,
    chunkSize: options.chunkSize || 16 * 1024,
    windowBits: options.windowBits || 15,
    memLevel: options.memLevel || 8,
    strategy: options.strategy || zlib.constants.Z_DEFAULT_STRATEGY
  };
  
  return await deflate(input, deflateOptions);
}

/**
 * Decompress deflate data
 */
export async function decompressDeflate(data: Buffer): Promise<Buffer> {
  return await inflate(data);
}

/**
 * Compress data using Brotli
 */
export async function compressBrotli(
  data: Buffer | string,
  options: CompressionOptions = {}
): Promise<Buffer> {
  const input = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
  
  const brotliOptions: zlib.BrotliOptions = {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: options.level || 6,
      [zlib.constants.BROTLI_PARAM_SIZE_HINT]: input.length
    }
  };
  
  return await brotliCompress(input, brotliOptions);
}

/**
 * Decompress Brotli data
 */
export async function decompressBrotli(data: Buffer): Promise<Buffer> {
  return await brotliDecompress(data);
}

/**
 * Compress data with specified algorithm
 */
export async function compress(
  data: Buffer | string,
  algorithm: 'gzip' | 'deflate' | 'brotli' = 'gzip',
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const startTime = Date.now();
  const input = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
  const originalSize = input.length;
  
  let compressed: Buffer;
  
  switch (algorithm) {
    case 'gzip':
      compressed = await compressGzip(input, options);
      break;
    case 'deflate':
      compressed = await compressDeflate(input, options);
      break;
    case 'brotli':
      compressed = await compressBrotli(input, options);
      break;
    default:
      throw new Error(`Unsupported compression algorithm: ${algorithm}`);
  }
  
  const compressedSize = compressed.length;
  const compressionRatio = originalSize > 0 ? compressedSize / originalSize : 0;
  const processingTime = Date.now() - startTime;
  
  return {
    originalSize,
    compressedSize,
    compressionRatio,
    algorithm,
    processingTime
  };
}

/**
 * Decompress data with specified algorithm
 */
export async function decompress(
  data: Buffer,
  algorithm: 'gzip' | 'deflate' | 'brotli'
): Promise<Buffer> {
  switch (algorithm) {
    case 'gzip':
      return await decompressGzip(data);
    case 'deflate':
      return await decompressDeflate(data);
    case 'brotli':
      return await decompressBrotli(data);
    default:
      throw new Error(`Unsupported decompression algorithm: ${algorithm}`);
  }
}

/**
 * Compress file to another file
 */
export async function compressFile(
  inputPath: string,
  outputPath: string,
  algorithm: 'gzip' | 'deflate' | 'brotli' = 'gzip',
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const startTime = Date.now();
  const inputStats = await stat(inputPath);
  const originalSize = inputStats.size;
  
  const readStream = createReadStream(inputPath);
  const writeStream = createWriteStream(outputPath);
  
  let compressionStream: zlib.Gzip | zlib.Deflate | zlib.BrotliCompress;
  
  switch (algorithm) {
    case 'gzip':
      compressionStream = zlib.createGzip({
        level: options.level || zlib.constants.Z_DEFAULT_COMPRESSION,
        chunkSize: options.chunkSize || 16 * 1024
      });
      break;
    case 'deflate':
      compressionStream = zlib.createDeflate({
        level: options.level || zlib.constants.Z_DEFAULT_COMPRESSION,
        chunkSize: options.chunkSize || 16 * 1024
      });
      break;
    case 'brotli':
      compressionStream = zlib.createBrotliCompress({
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: options.level || 6
        }
      });
      break;
    default:
      throw new Error(`Unsupported compression algorithm: ${algorithm}`);
  }
  
  await pipelineAsync(readStream, compressionStream, writeStream);
  
  const outputStats = await stat(outputPath);
  const compressedSize = outputStats.size;
  const compressionRatio = originalSize > 0 ? compressedSize / originalSize : 0;
  const processingTime = Date.now() - startTime;
  
  return {
    originalSize,
    compressedSize,
    compressionRatio,
    algorithm,
    processingTime
  };
}

/**
 * Decompress file to another file
 */
export async function decompressFile(
  inputPath: string,
  outputPath: string,
  algorithm: 'gzip' | 'deflate' | 'brotli'
): Promise<void> {
  const readStream = createReadStream(inputPath);
  const writeStream = createWriteStream(outputPath);
  
  let decompressionStream: zlib.Gunzip | zlib.Inflate | zlib.BrotliDecompress;
  
  switch (algorithm) {
    case 'gzip':
      decompressionStream = zlib.createGunzip();
      break;
    case 'deflate':
      decompressionStream = zlib.createInflate();
      break;
    case 'brotli':
      decompressionStream = zlib.createBrotliDecompress();
      break;
    default:
      throw new Error(`Unsupported decompression algorithm: ${algorithm}`);
  }
  
  await pipelineAsync(readStream, decompressionStream, writeStream);
}

/**
 * Get optimal compression algorithm for data
 */
export async function getOptimalCompression(
  data: Buffer | string,
  algorithms: Array<'gzip' | 'deflate' | 'brotli'> = ['gzip', 'deflate', 'brotli']
): Promise<{ algorithm: string; result: CompressionResult }> {
  const results: Array<{ algorithm: string; result: CompressionResult }> = [];
  
  for (const algorithm of algorithms) {
    try {
      const result = await compress(data, algorithm);
      results.push({ algorithm, result });
    } catch (error) {
      // Skip algorithms that fail
      continue;
    }
  }
  
  if (results.length === 0) {
    throw new Error('No compression algorithms succeeded');
  }
  
  // Find the algorithm with the best compression ratio
  return results.reduce((best, current) => 
    current.result.compressionRatio < best.result.compressionRatio ? current : best
  );
}

/**
 * Check if data is compressed
 */
export function isCompressed(data: Buffer): { compressed: boolean; algorithm?: string } {
  if (data.length < 2) {
    return { compressed: false };
  }
  
  // Check for gzip magic number
  if (data[0] === 0x1f && data[1] === 0x8b) {
    return { compressed: true, algorithm: 'gzip' };
  }
  
  // Check for deflate (zlib) magic number
  if (data[0] === 0x78 && (data[1] === 0x01 || data[1] === 0x9c || data[1] === 0xda)) {
    return { compressed: true, algorithm: 'deflate' };
  }
  
  // Check for Brotli magic number (not standardized, but common)
  if (data.length >= 6) {
    const brotliSignature = Buffer.from([0xce, 0xb2, 0xcf, 0x81]);
    if (data.subarray(0, 4).equals(brotliSignature)) {
      return { compressed: true, algorithm: 'brotli' };
    }
  }
  
  return { compressed: false };
}

/**
 * Calculate compression ratio
 */
export function calculateCompressionRatio(
  originalSize: number,
  compressedSize: number
): number {
  if (originalSize === 0) return 0;
  return compressedSize / originalSize;
}

/**
 * Calculate compression percentage
 */
export function calculateCompressionPercentage(
  originalSize: number,
  compressedSize: number
): number {
  if (originalSize === 0) return 0;
  return ((originalSize - compressedSize) / originalSize) * 100;
}

/**
 * Get compression statistics for multiple files
 */
export async function getCompressionStats(
  filePaths: string[],
  algorithm: 'gzip' | 'deflate' | 'brotli' = 'gzip'
): Promise<{
  totalOriginalSize: number;
  totalCompressedSize: number;
  averageCompressionRatio: number;
  files: Array<{ path: string; result: CompressionResult }>;
}> {
  const results: Array<{ path: string; result: CompressionResult }> = [];
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  
  for (const filePath of filePaths) {
    try {
      const stats = await stat(filePath);
      const data = await import('fs/promises').then(fs => fs.readFile(filePath));
      const result = await compress(data, algorithm);
      
      results.push({ path: filePath, result });
      totalOriginalSize += result.originalSize;
      totalCompressedSize += result.compressedSize;
    } catch (error) {
      // Skip files that can't be processed
      continue;
    }
  }
  
  const averageCompressionRatio = totalOriginalSize > 0 
    ? totalCompressedSize / totalOriginalSize 
    : 0;
  
  return {
    totalOriginalSize,
    totalCompressedSize,
    averageCompressionRatio,
    files: results
  };
}

/**
 * Compress string for storage/transmission
 */
export async function compressString(
  str: string,
  algorithm: 'gzip' | 'deflate' | 'brotli' = 'gzip'
): Promise<string> {
  const buffer = Buffer.from(str, 'utf8');
  const compressed = await compress(buffer, algorithm);
  return compressed.compressedSize.toString('base64');
}

/**
 * Decompress string from storage/transmission
 */
export async function decompressString(
  compressedStr: string,
  algorithm: 'gzip' | 'deflate' | 'brotli'
): Promise<string> {
  const buffer = Buffer.from(compressedStr, 'base64');
  const decompressed = await decompress(buffer, algorithm);
  return decompressed.toString('utf8');
}

/**
 * Stream compression for large files
 */
export async function compressStream(
  inputStream: NodeJS.ReadableStream,
  outputStream: NodeJS.WritableStream,
  algorithm: 'gzip' | 'deflate' | 'brotli' = 'gzip',
  options: CompressionOptions = {}
): Promise<void> {
  let compressionStream: zlib.Gzip | zlib.Deflate | zlib.BrotliCompress;
  
  switch (algorithm) {
    case 'gzip':
      compressionStream = zlib.createGzip({
        level: options.level || zlib.constants.Z_DEFAULT_COMPRESSION,
        chunkSize: options.chunkSize || 16 * 1024
      });
      break;
    case 'deflate':
      compressionStream = zlib.createDeflate({
        level: options.level || zlib.constants.Z_DEFAULT_COMPRESSION,
        chunkSize: options.chunkSize || 16 * 1024
      });
      break;
    case 'brotli':
      compressionStream = zlib.createBrotliCompress({
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: options.level || 6
        }
      });
      break;
    default:
      throw new Error(`Unsupported compression algorithm: ${algorithm}`);
  }
  
  await pipelineAsync(inputStream, compressionStream, outputStream);
}

/**
 * Stream decompression for large files
 */
export async function decompressStream(
  inputStream: NodeJS.ReadableStream,
  outputStream: NodeJS.WritableStream,
  algorithm: 'gzip' | 'deflate' | 'brotli'
): Promise<void> {
  let decompressionStream: zlib.Gunzip | zlib.Inflate | zlib.BrotliDecompress;
  
  switch (algorithm) {
    case 'gzip':
      decompressionStream = zlib.createGunzip();
      break;
    case 'deflate':
      decompressionStream = zlib.createInflate();
      break;
    case 'brotli':
      decompressionStream = zlib.createBrotliDecompress();
      break;
    default:
      throw new Error(`Unsupported decompression algorithm: ${algorithm}`);
  }
  
  await pipelineAsync(inputStream, decompressionStream, outputStream);
}

// Export compression constants
export const COMPRESSION_CONSTANTS = {
  ALGORITHMS: ['gzip', 'deflate', 'brotli'] as const,
  DEFAULT_ALGORITHM: 'gzip' as const,
  DEFAULT_LEVEL: 6,
  DEFAULT_CHUNK_SIZE: 16 * 1024,
  MAX_LEVEL: {
    gzip: 9,
    deflate: 9,
    brotli: 11
  },
  MAGIC_NUMBERS: {
    gzip: [0x1f, 0x8b],
    deflate: [0x78],
    brotli: [0xce, 0xb2, 0xcf, 0x81]
  },
  EXTENSIONS: {
    gzip: '.gz',
    deflate: '.zz',
    brotli: '.br'
  }
};

// Export compression types
export type CompressionAlgorithm = 'gzip' | 'deflate' | 'brotli';
export type CompressionLevel = number;
export type CompressionCallback = (error: Error | null, result?: CompressionResult) => void;