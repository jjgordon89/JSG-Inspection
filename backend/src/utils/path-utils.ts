/**
 * Path Utilities
 * Helper functions for path manipulation, validation, and file system operations
 */

import { join, resolve, relative, dirname, basename, extname, parse, format, sep, delimiter, isAbsolute, normalize } from 'path';
import { stat, access, readdir, mkdir } from 'fs/promises';
import { constants } from 'fs';
import { homedir, tmpdir, platform } from 'os';

// Path validation options
export interface PathValidationOptions {
  allowAbsolute?: boolean;
  allowRelative?: boolean;
  allowTraversal?: boolean;
  maxLength?: number;
  allowedExtensions?: string[];
  blockedExtensions?: string[];
  allowedDirectories?: string[];
  blockedDirectories?: string[];
}

// Path info interface
export interface PathInfo {
  path: string;
  absolutePath: string;
  directory: string;
  filename: string;
  basename: string;
  extension: string;
  isAbsolute: boolean;
  isRelative: boolean;
  depth: number;
  segments: string[];
  exists?: boolean;
  isFile?: boolean;
  isDirectory?: boolean;
  size?: number;
  permissions?: {
    readable: boolean;
    writable: boolean;
    executable: boolean;
  };
}

// Safe path options
export interface SafePathOptions {
  basePath: string;
  allowTraversal?: boolean;
  normalize?: boolean;
}

// Directory tree options
export interface DirectoryTreeOptions {
  maxDepth?: number;
  includeFiles?: boolean;
  includeDirectories?: boolean;
  includeHidden?: boolean;
  filter?: (path: string, stats: any) => boolean;
}

// Directory tree node
export interface DirectoryTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: DirectoryTreeNode[];
  depth: number;
}

/**
 * Validate path against security and format rules
 */
export function validatePath(
  path: string,
  options: PathValidationOptions = {}
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!path) {
    errors.push('Path cannot be empty');
    return { valid: false, errors };
  }
  
  const {
    allowAbsolute = true,
    allowRelative = true,
    allowTraversal = false,
    maxLength = 260, // Windows MAX_PATH
    allowedExtensions,
    blockedExtensions,
    allowedDirectories,
    blockedDirectories
  } = options;
  
  // Check path length
  if (path.length > maxLength) {
    errors.push(`Path exceeds maximum length of ${maxLength} characters`);
  }
  
  // Check absolute/relative restrictions
  const pathIsAbsolute = isAbsolute(path);
  if (pathIsAbsolute && !allowAbsolute) {
    errors.push('Absolute paths are not allowed');
  }
  if (!pathIsAbsolute && !allowRelative) {
    errors.push('Relative paths are not allowed');
  }
  
  // Check for path traversal
  if (!allowTraversal && (path.includes('..') || path.includes('~'))) {
    errors.push('Path traversal is not allowed');
  }
  
  // Check for invalid characters (Windows)
  if (platform() === 'win32') {
    const invalidChars = /[<>:"|?*\x00-\x1f]/;
    if (invalidChars.test(path)) {
      errors.push('Path contains invalid characters');
    }
  }
  
  // Check extension restrictions
  const ext = extname(path).toLowerCase();
  if (allowedExtensions && ext && !allowedExtensions.includes(ext)) {
    errors.push(`Extension '${ext}' is not allowed`);
  }
  if (blockedExtensions && ext && blockedExtensions.includes(ext)) {
    errors.push(`Extension '${ext}' is blocked`);
  }
  
  // Check directory restrictions
  const dir = dirname(path);
  if (allowedDirectories && !allowedDirectories.some(allowed => dir.startsWith(allowed))) {
    errors.push('Path is not in an allowed directory');
  }
  if (blockedDirectories && blockedDirectories.some(blocked => dir.startsWith(blocked))) {
    errors.push('Path is in a blocked directory');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Create a safe path within a base directory
 */
export function createSafePath(
  inputPath: string,
  options: SafePathOptions
): string {
  const { basePath, allowTraversal = false, normalize: shouldNormalize = true } = options;
  
  let safePath = inputPath;
  
  // Normalize path if requested
  if (shouldNormalize) {
    safePath = normalize(safePath);
  }
  
  // Remove path traversal if not allowed
  if (!allowTraversal) {
    safePath = safePath.replace(/\.\./g, '');
  }
  
  // Ensure path is within base directory
  const resolvedPath = resolve(basePath, safePath);
  const resolvedBase = resolve(basePath);
  
  if (!resolvedPath.startsWith(resolvedBase)) {
    throw new Error('Path is outside the allowed base directory');
  }
  
  return resolvedPath;
}

/**
 * Get comprehensive path information
 */
export async function getPathInfo(path: string): Promise<PathInfo> {
  const parsedPath = parse(path);
  const absolutePath = resolve(path);
  const segments = absolutePath.split(sep).filter(Boolean);
  
  const info: PathInfo = {
    path,
    absolutePath,
    directory: parsedPath.dir,
    filename: parsedPath.base,
    basename: parsedPath.name,
    extension: parsedPath.ext,
    isAbsolute: isAbsolute(path),
    isRelative: !isAbsolute(path),
    depth: segments.length,
    segments
  };
  
  try {
    const stats = await stat(absolutePath);
    info.exists = true;
    info.isFile = stats.isFile();
    info.isDirectory = stats.isDirectory();
    info.size = stats.size;
    
    // Check permissions
    try {
      await access(absolutePath, constants.R_OK);
      info.permissions = { ...info.permissions, readable: true };
    } catch {
      info.permissions = { ...info.permissions, readable: false };
    }
    
    try {
      await access(absolutePath, constants.W_OK);
      info.permissions = { ...info.permissions, writable: true };
    } catch {
      info.permissions = { ...info.permissions, writable: false };
    }
    
    try {
      await access(absolutePath, constants.X_OK);
      info.permissions = { ...info.permissions, executable: true };
    } catch {
      info.permissions = { ...info.permissions, executable: false };
    }
  } catch {
    info.exists = false;
    info.isFile = false;
    info.isDirectory = false;
    info.permissions = {
      readable: false,
      writable: false,
      executable: false
    };
  }
  
  return info;
}

/**
 * Check if path exists and is accessible
 */
export async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if path is a file
 */
export async function isFile(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isFile();
  } catch {
    return false;
  }
}

/**
 * Check if path is a directory
 */
export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if path is readable
 */
export async function isReadable(path: string): Promise<boolean> {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if path is writable
 */
export async function isWritable(path: string): Promise<boolean> {
  try {
    await access(path, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if path is executable
 */
export async function isExecutable(path: string): Promise<boolean> {
  try {
    await access(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure directory exists, create if it doesn't
 */
export async function ensureDirectory(path: string): Promise<void> {
  try {
    await mkdir(path, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Get relative path between two paths
 */
export function getRelativePath(from: string, to: string): string {
  return relative(from, to);
}

/**
 * Join multiple path segments safely
 */
export function joinPaths(...segments: string[]): string {
  return join(...segments);
}

/**
 * Resolve path to absolute path
 */
export function resolvePath(...segments: string[]): string {
  return resolve(...segments);
}

/**
 * Get parent directory of path
 */
export function getParentDirectory(path: string): string {
  return dirname(path);
}

/**
 * Get filename from path
 */
export function getFilename(path: string): string {
  return basename(path);
}

/**
 * Get filename without extension
 */
export function getBasename(path: string): string {
  return basename(path, extname(path));
}

/**
 * Get file extension
 */
export function getExtension(path: string): string {
  return extname(path);
}

/**
 * Change file extension
 */
export function changeExtension(path: string, newExtension: string): string {
  const parsed = parse(path);
  return format({
    ...parsed,
    base: undefined,
    ext: newExtension.startsWith('.') ? newExtension : `.${newExtension}`
  });
}

/**
 * Add suffix to filename before extension
 */
export function addFilenameSuffix(path: string, suffix: string): string {
  const parsed = parse(path);
  return format({
    ...parsed,
    base: undefined,
    name: parsed.name + suffix
  });
}

/**
 * Add prefix to filename
 */
export function addFilenamePrefix(path: string, prefix: string): string {
  const parsed = parse(path);
  return format({
    ...parsed,
    base: undefined,
    name: prefix + parsed.name
  });
}

/**
 * Generate unique filename by adding number suffix
 */
export async function generateUniqueFilename(path: string): Promise<string> {
  if (!(await pathExists(path))) {
    return path;
  }
  
  const parsed = parse(path);
  let counter = 1;
  let uniquePath: string;
  
  do {
    const suffix = `_${counter}`;
    uniquePath = format({
      ...parsed,
      base: undefined,
      name: parsed.name + suffix
    });
    counter++;
  } while (await pathExists(uniquePath));
  
  return uniquePath;
}

/**
 * Get common path prefix of multiple paths
 */
export function getCommonPath(paths: string[]): string {
  if (paths.length === 0) return '';
  if (paths.length === 1) return dirname(paths[0]);
  
  const resolvedPaths = paths.map(p => resolve(p));
  const segments = resolvedPaths.map(p => p.split(sep));
  const minLength = Math.min(...segments.map(s => s.length));
  
  let commonSegments: string[] = [];
  
  for (let i = 0; i < minLength; i++) {
    const segment = segments[0][i];
    if (segments.every(s => s[i] === segment)) {
      commonSegments.push(segment);
    } else {
      break;
    }
  }
  
  return commonSegments.join(sep) || sep;
}

/**
 * Get directory tree structure
 */
export async function getDirectoryTree(
  rootPath: string,
  options: DirectoryTreeOptions = {}
): Promise<DirectoryTreeNode> {
  const {
    maxDepth = Infinity,
    includeFiles = true,
    includeDirectories = true,
    includeHidden = false,
    filter
  } = options;
  
  async function buildTree(path: string, depth: number): Promise<DirectoryTreeNode> {
    const stats = await stat(path);
    const name = basename(path);
    const isDir = stats.isDirectory();
    
    const node: DirectoryTreeNode = {
      name,
      path,
      type: isDir ? 'directory' : 'file',
      depth
    };
    
    if (!isDir) {
      node.size = stats.size;
      return node;
    }
    
    if (depth < maxDepth) {
      try {
        const entries = await readdir(path);
        const children: DirectoryTreeNode[] = [];
        
        for (const entry of entries) {
          // Skip hidden files if not included
          if (!includeHidden && entry.startsWith('.')) {
            continue;
          }
          
          const entryPath = join(path, entry);
          const entryStats = await stat(entryPath);
          
          // Apply type filters
          if (entryStats.isFile() && !includeFiles) continue;
          if (entryStats.isDirectory() && !includeDirectories) continue;
          
          // Apply custom filter
          if (filter && !filter(entryPath, entryStats)) continue;
          
          const childNode = await buildTree(entryPath, depth + 1);
          children.push(childNode);
        }
        
        node.children = children;
      } catch {
        // Handle permission errors gracefully
        node.children = [];
      }
    }
    
    return node;
  }
  
  return await buildTree(rootPath, 0);
}

/**
 * Get system paths
 */
export function getSystemPaths() {
  return {
    home: homedir(),
    temp: tmpdir(),
    cwd: process.cwd(),
    separator: sep,
    delimiter,
    platform: platform()
  };
}

/**
 * Convert path to URL format
 */
export function pathToUrl(path: string): string {
  return 'file://' + resolve(path).replace(/\\/g, '/');
}

/**
 * Convert URL to path format
 */
export function urlToPath(url: string): string {
  if (!url.startsWith('file://')) {
    throw new Error('URL must start with file://');
  }
  
  let path = url.slice(7); // Remove 'file://'
  
  // Handle Windows paths
  if (platform() === 'win32' && path.match(/^\/[a-zA-Z]:/)) {
    path = path.slice(1); // Remove leading slash
  }
  
  return decodeURIComponent(path.replace(/\//g, sep));
}

/**
 * Check if path is within another path
 */
export function isPathWithin(childPath: string, parentPath: string): boolean {
  const resolvedChild = resolve(childPath);
  const resolvedParent = resolve(parentPath);
  
  return resolvedChild.startsWith(resolvedParent + sep) || resolvedChild === resolvedParent;
}

/**
 * Get path depth (number of directory levels)
 */
export function getPathDepth(path: string): number {
  return resolve(path).split(sep).filter(Boolean).length;
}

/**
 * Normalize path separators for current platform
 */
export function normalizePath(path: string): string {
  return normalize(path);
}

/**
 * Convert path separators to forward slashes (Unix-style)
 */
export function toUnixPath(path: string): string {
  return path.replace(/\\/g, '/');
}

/**
 * Convert path separators to backslashes (Windows-style)
 */
export function toWindowsPath(path: string): string {
  return path.replace(/\//g, '\\');
}

/**
 * Get path segments as array
 */
export function getPathSegments(path: string): string[] {
  return resolve(path).split(sep).filter(Boolean);
}

/**
 * Check if filename is valid for current platform
 */
export function isValidFilename(filename: string): boolean {
  if (!filename || filename.length === 0) return false;
  
  // Common invalid characters across platforms
  const invalidChars = /[\/<>:"|?*\x00-\x1f]/;
  if (invalidChars.test(filename)) return false;
  
  // Windows reserved names
  if (platform() === 'win32') {
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
    if (reservedNames.test(filename)) return false;
  }
  
  // Check for leading/trailing spaces or dots
  if (filename.startsWith(' ') || filename.endsWith(' ') || 
      filename.startsWith('.') || filename.endsWith('.')) {
    return false;
  }
  
  return true;
}

// Export path constants
export const PATH_CONSTANTS = {
  SEPARATOR: sep,
  DELIMITER: delimiter,
  MAX_PATH_LENGTH: {
    windows: 260,
    unix: 4096
  },
  RESERVED_NAMES: {
    windows: ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'],
    unix: []
  },
  INVALID_CHARS: {
    windows: /[<>:"|?*\x00-\x1f]/,
    unix: /[\x00]/
  }
};

// Export path types
export type PathType = 'file' | 'directory' | 'symlink' | 'unknown';
export type PathPermission = 'readable' | 'writable' | 'executable';
export type PathSeparator = '/' | '\\';