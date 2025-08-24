/**
 * Image Utilities
 * Helper functions for image processing, optimization, and manipulation
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { CONSTANTS } from './index';

// Image processing options
export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  background?: string;
  progressive?: boolean;
  optimize?: boolean;
  strip?: boolean;
}

// Thumbnail options
export interface ThumbnailOptions {
  size?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  fit?: 'cover' | 'contain';
  background?: string;
}

// Image metadata
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  channels: number;
  hasAlpha: boolean;
  orientation?: number;
  density?: number;
  colorSpace?: string;
  exif?: Record<string, any>;
}

// Watermark options
export interface WatermarkOptions {
  text?: string;
  image?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity?: number;
  fontSize?: number;
  fontColor?: string;
  margin?: number;
}

/**
 * Process image with various options
 */
export async function processImage(
  inputPath: string,
  outputPath: string,
  options: ImageProcessingOptions = {}
): Promise<ImageMetadata> {
  const {
    width,
    height,
    quality = CONSTANTS.DEFAULT_IMAGE_QUALITY,
    format,
    fit = 'cover',
    background = 'white',
    progressive = true,
    optimize = true,
    strip = true,
  } = options;

  let pipeline = sharp(inputPath);

  // Resize if dimensions provided
  if (width || height) {
    pipeline = pipeline.resize(width, height, {
      fit,
      background,
      withoutEnlargement: true,
    });
  }

  // Set format and quality
  if (format) {
    switch (format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({
          quality,
          progressive,
          mozjpeg: optimize,
        });
        break;
      case 'png':
        pipeline = pipeline.png({
          quality,
          progressive,
          compressionLevel: optimize ? 9 : 6,
        });
        break;
      case 'webp':
        pipeline = pipeline.webp({
          quality,
          effort: optimize ? 6 : 4,
        });
        break;
      case 'avif':
        pipeline = pipeline.avif({
          quality,
          effort: optimize ? 9 : 4,
        });
        break;
    }
  }

  // Strip metadata if requested
  if (strip) {
    pipeline = pipeline.withMetadata({
      exif: {},
      icc: false,
    });
  }

  // Process and save
  const info = await pipeline.toFile(outputPath);

  return {
    width: info.width,
    height: info.height,
    format: info.format,
    size: info.size,
    channels: info.channels,
    hasAlpha: info.channels === 4,
  };
}

/**
 * Create thumbnail from image
 */
export async function createThumbnail(
  inputPath: string,
  outputPath: string,
  options: ThumbnailOptions = {}
): Promise<ImageMetadata> {
  const {
    size = CONSTANTS.THUMBNAIL_SIZE,
    quality = CONSTANTS.DEFAULT_IMAGE_QUALITY,
    format = 'jpeg',
    fit = 'cover',
    background = 'white',
  } = options;

  return processImage(inputPath, outputPath, {
    width: size,
    height: size,
    quality,
    format,
    fit,
    background,
    optimize: true,
    strip: true,
  });
}

/**
 * Get image metadata without processing
 */
export async function getImageMetadata(imagePath: string): Promise<ImageMetadata> {
  const metadata = await sharp(imagePath).metadata();
  const stats = await fs.stat(imagePath);

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: stats.size,
    channels: metadata.channels || 0,
    hasAlpha: metadata.hasAlpha || false,
    orientation: metadata.orientation,
    density: metadata.density,
    colorSpace: metadata.space,
    exif: metadata.exif,
  };
}

/**
 * Optimize image for web
 */
export async function optimizeForWeb(
  inputPath: string,
  outputPath: string,
  maxWidth: number = CONSTANTS.MAX_IMAGE_DIMENSION
): Promise<ImageMetadata> {
  const metadata = await getImageMetadata(inputPath);
  
  // Calculate new dimensions if needed
  let width = metadata.width;
  let height = metadata.height;
  
  if (width > maxWidth) {
    const ratio = maxWidth / width;
    width = maxWidth;
    height = Math.round(height * ratio);
  }

  return processImage(inputPath, outputPath, {
    width,
    height,
    quality: 85,
    format: 'webp',
    progressive: true,
    optimize: true,
    strip: true,
  });
}

/**
 * Add watermark to image
 */
export async function addWatermark(
  inputPath: string,
  outputPath: string,
  options: WatermarkOptions
): Promise<ImageMetadata> {
  const {
    text,
    image: watermarkImage,
    position = 'bottom-right',
    opacity = 0.5,
    fontSize = 24,
    fontColor = 'white',
    margin = 20,
  } = options;

  let pipeline = sharp(inputPath);
  const metadata = await pipeline.metadata();
  const imageWidth = metadata.width || 0;
  const imageHeight = metadata.height || 0;

  if (text) {
    // Create text watermark
    const textSvg = `
      <svg width="${imageWidth}" height="${imageHeight}">
        <text
          x="${getTextPosition(position, imageWidth, margin).x}"
          y="${getTextPosition(position, imageHeight, margin).y}"
          font-family="Arial, sans-serif"
          font-size="${fontSize}"
          fill="${fontColor}"
          opacity="${opacity}"
          text-anchor="${getTextAnchor(position)}"
        >${text}</text>
      </svg>
    `;

    const textBuffer = Buffer.from(textSvg);
    pipeline = pipeline.composite([{
      input: textBuffer,
      blend: 'over',
    }]);
  } else if (watermarkImage) {
    // Add image watermark
    const watermarkBuffer = await sharp(watermarkImage)
      .resize(Math.round(imageWidth * 0.2))
      .png()
      .toBuffer();

    const { x, y } = getImagePosition(position, imageWidth, imageHeight, margin);
    
    pipeline = pipeline.composite([{
      input: watermarkBuffer,
      left: x,
      top: y,
      blend: 'over',
    }]);
  }

  const info = await pipeline.toFile(outputPath);

  return {
    width: info.width,
    height: info.height,
    format: info.format,
    size: info.size,
    channels: info.channels,
    hasAlpha: info.channels === 4,
  };
}

/**
 * Convert image format
 */
export async function convertFormat(
  inputPath: string,
  outputPath: string,
  targetFormat: 'jpeg' | 'png' | 'webp' | 'avif',
  quality: number = CONSTANTS.DEFAULT_IMAGE_QUALITY
): Promise<ImageMetadata> {
  return processImage(inputPath, outputPath, {
    format: targetFormat,
    quality,
    optimize: true,
  });
}

/**
 * Create multiple sizes of an image
 */
export async function createMultipleSizes(
  inputPath: string,
  outputDir: string,
  sizes: { name: string; width: number; height?: number }[],
  format: 'jpeg' | 'png' | 'webp' = 'webp'
): Promise<{ name: string; path: string; metadata: ImageMetadata }[]> {
  const results = [];
  const inputName = path.parse(inputPath).name;

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `${inputName}_${size.name}.${format}`);
    const metadata = await processImage(inputPath, outputPath, {
      width: size.width,
      height: size.height,
      format,
      optimize: true,
    });

    results.push({
      name: size.name,
      path: outputPath,
      metadata,
    });
  }

  return results;
}

/**
 * Extract dominant colors from image
 */
export async function extractDominantColors(
  imagePath: string,
  count: number = 5
): Promise<string[]> {
  try {
    const { data, info } = await sharp(imagePath)
      .resize(150, 150, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = [];
    for (let i = 0; i < data.length; i += info.channels) {
      pixels.push({
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
      });
    }

    // Simple color quantization (k-means would be better)
    const colorCounts = new Map<string, number>();
    
    for (const pixel of pixels) {
      // Reduce color space for grouping
      const r = Math.round(pixel.r / 32) * 32;
      const g = Math.round(pixel.g / 32) * 32;
      const b = Math.round(pixel.b / 32) * 32;
      
      const color = `rgb(${r},${g},${b})`;
      colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
    }

    // Sort by frequency and return top colors
    return Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([color]) => color);
  } catch {
    return [];
  }
}

/**
 * Check if image needs rotation based on EXIF
 */
export async function autoRotate(inputPath: string, outputPath: string): Promise<ImageMetadata> {
  const info = await sharp(inputPath)
    .rotate() // Auto-rotate based on EXIF
    .toFile(outputPath);

  return {
    width: info.width,
    height: info.height,
    format: info.format,
    size: info.size,
    channels: info.channels,
    hasAlpha: info.channels === 4,
  };
}

// Helper functions
function getTextPosition(position: string, dimension: number, margin: number): { x: number; y: number } {
  switch (position) {
    case 'top-left':
      return { x: margin, y: margin + 20 };
    case 'top-right':
      return { x: dimension - margin, y: margin + 20 };
    case 'bottom-left':
      return { x: margin, y: dimension - margin };
    case 'bottom-right':
      return { x: dimension - margin, y: dimension - margin };
    case 'center':
      return { x: dimension / 2, y: dimension / 2 };
    default:
      return { x: dimension - margin, y: dimension - margin };
  }
}

function getTextAnchor(position: string): string {
  if (position.includes('right') || position === 'center') {
    return 'end';
  }
  return 'start';
}

function getImagePosition(
  position: string,
  imageWidth: number,
  imageHeight: number,
  margin: number
): { x: number; y: number } {
  const watermarkSize = Math.round(imageWidth * 0.2);
  
  switch (position) {
    case 'top-left':
      return { x: margin, y: margin };
    case 'top-right':
      return { x: imageWidth - watermarkSize - margin, y: margin };
    case 'bottom-left':
      return { x: margin, y: imageHeight - watermarkSize - margin };
    case 'bottom-right':
      return { x: imageWidth - watermarkSize - margin, y: imageHeight - watermarkSize - margin };
    case 'center':
      return { x: (imageWidth - watermarkSize) / 2, y: (imageHeight - watermarkSize) / 2 };
    default:
      return { x: imageWidth - watermarkSize - margin, y: imageHeight - watermarkSize - margin };
  }
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(
  width: number,
  height: number,
  maxWidth: number = CONSTANTS.MAX_IMAGE_DIMENSION,
  maxHeight: number = CONSTANTS.MAX_IMAGE_DIMENSION
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (width > maxWidth) {
    errors.push(`Image width (${width}px) exceeds maximum allowed width (${maxWidth}px)`);
  }
  
  if (height > maxHeight) {
    errors.push(`Image height (${height}px) exceeds maximum allowed height (${maxHeight}px)`);
  }
  
  if (width < 1 || height < 1) {
    errors.push('Image dimensions must be at least 1x1 pixels');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate aspect ratio
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * Get orientation from dimensions
 */
export function getOrientation(width: number, height: number): 'portrait' | 'landscape' | 'square' {
  if (width === height) return 'square';
  return width > height ? 'landscape' : 'portrait';
}