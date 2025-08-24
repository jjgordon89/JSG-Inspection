/**
 * Performance Utilities
 * Helper functions for performance monitoring, profiling, and optimization
 */

import { performance } from 'perf_hooks';
import { logger } from './logger';

// Performance metric types
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

// Timer interface
export interface Timer {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags?: Record<string, string>;
}

// Memory usage interface
export interface MemoryUsage {
  rss: number; // Resident Set Size
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
  timestamp: number;
}

// Performance profile interface
export interface PerformanceProfile {
  operation: string;
  duration: number;
  memoryBefore: MemoryUsage;
  memoryAfter: MemoryUsage;
  memoryDelta: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  timestamp: number;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

// Performance threshold interface
export interface PerformanceThreshold {
  name: string;
  warning: number;
  critical: number;
  unit: string;
}

// Performance monitor options
export interface MonitorOptions {
  enableMemoryTracking?: boolean;
  enableTimingTracking?: boolean;
  sampleRate?: number;
  thresholds?: PerformanceThreshold[];
  logResults?: boolean;
}

// Benchmark options
export interface BenchmarkOptions {
  iterations?: number;
  warmupIterations?: number;
  timeout?: number;
  memoryTracking?: boolean;
}

// Benchmark result
export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  standardDeviation: number;
  operationsPerSecond: number;
  memoryUsage?: {
    before: MemoryUsage;
    after: MemoryUsage;
    peak: MemoryUsage;
  };
}

/**
 * Performance monitor class
 */
export class PerformanceMonitor {
  private timers: Map<string, Timer> = new Map();
  private metrics: PerformanceMetric[] = [];
  private options: MonitorOptions;

  constructor(options: MonitorOptions = {}) {
    this.options = {
      enableMemoryTracking: true,
      enableTimingTracking: true,
      sampleRate: 1.0,
      logResults: true,
      ...options
    };
  }

  /**
   * Start a timer
   */
  startTimer(name: string, tags?: Record<string, string>): void {
    if (!this.options.enableTimingTracking) return;
    
    if (Math.random() > this.options.sampleRate!) return;

    const timer: Timer = {
      name,
      startTime: performance.now(),
      tags
    };

    this.timers.set(name, timer);
  }

  /**
   * End a timer and record the duration
   */
  endTimer(name: string): number | null {
    if (!this.options.enableTimingTracking) return null;
    
    const timer = this.timers.get(name);
    if (!timer) {
      logger.warn(`Timer '${name}' not found`);
      return null;
    }

    timer.endTime = performance.now();
    timer.duration = timer.endTime - timer.startTime;

    // Record metric
    this.recordMetric({
      name: `timer.${name}`,
      value: timer.duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags: timer.tags
    });

    // Check thresholds
    this.checkThresholds(name, timer.duration, 'ms');

    // Clean up
    this.timers.delete(name);

    if (this.options.logResults) {
      logger.debug(`Timer '${name}' completed in ${timer.duration.toFixed(2)}ms`, {
        duration: timer.duration,
        tags: timer.tags
      });
    }

    return timer.duration;
  }

  /**
   * Record a custom metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Check thresholds
    this.checkThresholds(metric.name, metric.value, metric.unit);

    if (this.options.logResults) {
      logger.debug(`Metric recorded: ${metric.name} = ${metric.value} ${metric.unit}`, metric);
    }
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage(): MemoryUsage {
    const usage = process.memoryUsage();
    return {
      ...usage,
      timestamp: Date.now()
    };
  }

  /**
   * Record memory usage metric
   */
  recordMemoryUsage(name: string = 'memory_usage'): MemoryUsage {
    if (!this.options.enableMemoryTracking) {
      return this.getMemoryUsage();
    }

    const usage = this.getMemoryUsage();
    
    // Record individual memory metrics
    ['rss', 'heapTotal', 'heapUsed', 'external', 'arrayBuffers'].forEach(key => {
      this.recordMetric({
        name: `${name}.${key}`,
        value: usage[key as keyof MemoryUsage] as number,
        unit: 'bytes',
        timestamp: usage.timestamp
      });
    });

    return usage;
  }

  /**
   * Profile an operation
   */
  async profile<T>(
    operation: string,
    fn: () => Promise<T> | T,
    tags?: Record<string, string>,
    metadata?: Record<string, any>
  ): Promise<{ result: T; profile: PerformanceProfile }> {
    const memoryBefore = this.getMemoryUsage();
    const startTime = performance.now();

    try {
      const result = await fn();
      const endTime = performance.now();
      const memoryAfter = this.getMemoryUsage();

      const profile: PerformanceProfile = {
        operation,
        duration: endTime - startTime,
        memoryBefore,
        memoryAfter,
        memoryDelta: {
          rss: memoryAfter.rss - memoryBefore.rss,
          heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
          heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
          external: memoryAfter.external - memoryBefore.external,
          arrayBuffers: memoryAfter.arrayBuffers - memoryBefore.arrayBuffers
        },
        timestamp: Date.now(),
        tags,
        metadata
      };

      // Record metrics
      this.recordMetric({
        name: `profile.${operation}.duration`,
        value: profile.duration,
        unit: 'ms',
        timestamp: profile.timestamp,
        tags
      });

      if (this.options.enableMemoryTracking) {
        this.recordMetric({
          name: `profile.${operation}.memory_delta`,
          value: profile.memoryDelta.heapUsed,
          unit: 'bytes',
          timestamp: profile.timestamp,
          tags
        });
      }

      if (this.options.logResults) {
        logger.debug(`Operation '${operation}' profiled`, {
          duration: profile.duration,
          memoryDelta: profile.memoryDelta,
          tags,
          metadata
        });
      }

      return { result, profile };
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      logger.error(`Operation '${operation}' failed after ${duration.toFixed(2)}ms`, {
        error: error instanceof Error ? error.message : String(error),
        duration,
        tags,
        metadata
      });
      
      throw error;
    }
  }

  /**
   * Check performance thresholds
   */
  private checkThresholds(name: string, value: number, unit: string): void {
    if (!this.options.thresholds) return;

    const threshold = this.options.thresholds.find(t => 
      name.includes(t.name) && t.unit === unit
    );

    if (!threshold) return;

    if (value >= threshold.critical) {
      logger.error(`Performance threshold exceeded (CRITICAL): ${name} = ${value} ${unit}`, {
        threshold: threshold.critical,
        actual: value,
        severity: 'critical'
      });
    } else if (value >= threshold.warning) {
      logger.warn(`Performance threshold exceeded (WARNING): ${name} = ${value} ${unit}`, {
        threshold: threshold.warning,
        actual: value,
        severity: 'warning'
      });
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): Record<string, any> {
    const summary: Record<string, any> = {};
    
    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          sum: 0,
          min: Infinity,
          max: -Infinity,
          unit: metric.unit
        };
      }
      
      const stats = summary[metric.name];
      stats.count++;
      stats.sum += metric.value;
      stats.min = Math.min(stats.min, metric.value);
      stats.max = Math.max(stats.max, metric.value);
      stats.average = stats.sum / stats.count;
    });
    
    return summary;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for timing function execution
 */
export function timed(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const timerName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      performanceMonitor.startTimer(timerName);
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        performanceMonitor.endTimer(timerName);
      }
    };

    return descriptor;
  };
}

/**
 * Decorator for profiling function execution
 */
export function profiled(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const operationName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const { result } = await performanceMonitor.profile(
        operationName,
        () => originalMethod.apply(this, args)
      );
      return result;
    };

    return descriptor;
  };
}

/**
 * Time a function execution
 */
export async function timeFunction<T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<{ result: T; duration: number }> {
  const startTime = performance.now();
  const result = await fn();
  const duration = performance.now() - startTime;
  
  logger.debug(`Function '${name}' executed in ${duration.toFixed(2)}ms`);
  
  return { result, duration };
}

/**
 * Benchmark a function
 */
export async function benchmark(
  name: string,
  fn: () => Promise<any> | any,
  options: BenchmarkOptions = {}
): Promise<BenchmarkResult> {
  const {
    iterations = 1000,
    warmupIterations = 100,
    timeout = 30000,
    memoryTracking = false
  } = options;

  const times: number[] = [];
  let memoryBefore: MemoryUsage | undefined;
  let memoryAfter: MemoryUsage | undefined;
  let memoryPeak: MemoryUsage | undefined;

  // Warmup
  for (let i = 0; i < warmupIterations; i++) {
    await fn();
  }

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  if (memoryTracking) {
    memoryBefore = performanceMonitor.getMemoryUsage();
  }

  const startTime = Date.now();

  // Run benchmark
  for (let i = 0; i < iterations; i++) {
    // Check timeout
    if (Date.now() - startTime > timeout) {
      logger.warn(`Benchmark '${name}' timed out after ${i} iterations`);
      break;
    }

    const iterationStart = performance.now();
    await fn();
    const iterationEnd = performance.now();
    
    times.push(iterationEnd - iterationStart);

    // Track peak memory usage
    if (memoryTracking) {
      const currentMemory = performanceMonitor.getMemoryUsage();
      if (!memoryPeak || currentMemory.heapUsed > memoryPeak.heapUsed) {
        memoryPeak = currentMemory;
      }
    }
  }

  if (memoryTracking) {
    memoryAfter = performanceMonitor.getMemoryUsage();
  }

  // Calculate statistics
  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const averageTime = totalTime / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  // Calculate standard deviation
  const variance = times.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / times.length;
  const standardDeviation = Math.sqrt(variance);
  
  const operationsPerSecond = 1000 / averageTime;

  const result: BenchmarkResult = {
    name,
    iterations: times.length,
    totalTime,
    averageTime,
    minTime,
    maxTime,
    standardDeviation,
    operationsPerSecond
  };

  if (memoryTracking && memoryBefore && memoryAfter && memoryPeak) {
    result.memoryUsage = {
      before: memoryBefore,
      after: memoryAfter,
      peak: memoryPeak
    };
  }

  logger.info(`Benchmark '${name}' completed`, {
    iterations: result.iterations,
    averageTime: result.averageTime,
    operationsPerSecond: result.operationsPerSecond,
    memoryUsage: result.memoryUsage
  });

  return result;
}

/**
 * Create a performance sampling function
 */
export function createSampler(sampleRate: number = 0.1) {
  return () => Math.random() < sampleRate;
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Format duration to human readable string
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds.toFixed(2)}ms`;
  }
  
  const seconds = milliseconds / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(2)}s`;
  }
  
  const minutes = seconds / 60;
  if (minutes < 60) {
    return `${minutes.toFixed(2)}m`;
  }
  
  const hours = minutes / 60;
  return `${hours.toFixed(2)}h`;
}

/**
 * Get system performance info
 */
export function getSystemPerformance(): Record<string, any> {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const uptime = process.uptime();
  
  return {
    memory: {
      rss: formatBytes(memoryUsage.rss),
      heapTotal: formatBytes(memoryUsage.heapTotal),
      heapUsed: formatBytes(memoryUsage.heapUsed),
      external: formatBytes(memoryUsage.external),
      arrayBuffers: formatBytes(memoryUsage.arrayBuffers)
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    uptime: formatDuration(uptime * 1000),
    timestamp: new Date().toISOString()
  };
}

/**
 * Create a performance report
 */
export function createPerformanceReport(): Record<string, any> {
  const metrics = performanceMonitor.getMetricsSummary();
  const system = getSystemPerformance();
  
  return {
    timestamp: new Date().toISOString(),
    system,
    metrics,
    summary: {
      totalMetrics: performanceMonitor.getMetrics().length,
      uniqueMetrics: Object.keys(metrics).length
    }
  };
}

// Export performance constants
export const PERFORMANCE_CONSTANTS = {
  DEFAULT_THRESHOLDS: [
    { name: 'database', warning: 100, critical: 500, unit: 'ms' },
    { name: 'api', warning: 200, critical: 1000, unit: 'ms' },
    { name: 'file', warning: 50, critical: 200, unit: 'ms' },
    { name: 'memory', warning: 100 * 1024 * 1024, critical: 500 * 1024 * 1024, unit: 'bytes' }
  ],
  
  SAMPLE_RATES: {
    HIGH: 1.0,
    MEDIUM: 0.1,
    LOW: 0.01
  },
  
  BENCHMARK_DEFAULTS: {
    iterations: 1000,
    warmupIterations: 100,
    timeout: 30000
  }
};

// Export performance types
export type PerformanceCallback = () => void;
export type AsyncPerformanceCallback<T> = () => Promise<T>;
export type MetricCollector = (metric: PerformanceMetric) => void;
export type ThresholdChecker = (name: string, value: number, unit: string) => boolean;