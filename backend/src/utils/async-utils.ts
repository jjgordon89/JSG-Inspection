/**
 * Async Utilities
 * Helper functions for asynchronous operations, promises, and concurrency control
 */

import { CONSTANTS } from './index';

// Retry options
export interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoffFactor: number;
  maxDelay: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

// Default retry options
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  delay: 1000,
  backoffFactor: 2,
  maxDelay: 30000
};

// Timeout options
export interface TimeoutOptions {
  timeout: number;
  message?: string;
}

// Batch processing options
export interface BatchOptions<T> {
  batchSize: number;
  concurrency: number;
  delay?: number;
  onBatch?: (batch: T[], batchIndex: number) => void;
  onProgress?: (processed: number, total: number) => void;
}

// Queue options
export interface QueueOptions {
  concurrency: number;
  autoStart: boolean;
  timeout?: number;
}

// Task result
export interface TaskResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  duration: number;
  attempts: number;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Delay execution by specified milliseconds
 */
export const delay = sleep;

/**
 * Retry an async operation with exponential backoff
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      if (opts.retryCondition && !opts.retryCondition(error)) {
        throw error;
      }
      
      // Don't delay after the last attempt
      if (attempt === opts.maxAttempts) {
        break;
      }
      
      // Call retry callback
      if (opts.onRetry) {
        opts.onRetry(attempt, error);
      }
      
      // Calculate delay with exponential backoff
      const delayMs = Math.min(
        opts.delay * Math.pow(opts.backoffFactor, attempt - 1),
        opts.maxDelay
      );
      
      await sleep(delayMs);
    }
  }
  
  throw lastError;
}

/**
 * Add timeout to a promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  options: TimeoutOptions
): Promise<T> {
  const { timeout, message = `Operation timed out after ${timeout}ms` } = options;
  
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeout);
    })
  ]);
}

/**
 * Execute promises with limited concurrency
 */
export async function limitConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];
  
  for (const [index, task] of tasks.entries()) {
    const promise = task().then(result => {
      results[index] = result;
    });
    
    executing.push(promise);
    
    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }
  
  await Promise.all(executing);
  return results;
}

/**
 * Process items in batches with controlled concurrency
 */
export async function processBatches<T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R[]>,
  options: BatchOptions<T>
): Promise<R[]> {
  const results: R[] = [];
  const batches: T[][] = [];
  
  // Create batches
  for (let i = 0; i < items.length; i += options.batchSize) {
    batches.push(items.slice(i, i + options.batchSize));
  }
  
  // Process batches with concurrency control
  const batchTasks = batches.map((batch, index) => async () => {
    if (options.onBatch) {
      options.onBatch(batch, index);
    }
    
    const batchResults = await processor(batch);
    
    if (options.onProgress) {
      const processed = Math.min((index + 1) * options.batchSize, items.length);
      options.onProgress(processed, items.length);
    }
    
    if (options.delay && index < batches.length - 1) {
      await sleep(options.delay);
    }
    
    return batchResults;
  });
  
  const batchResults = await limitConcurrency(batchTasks, options.concurrency);
  
  // Flatten results
  for (const batchResult of batchResults) {
    results.push(...batchResult);
  }
  
  return results;
}

/**
 * Execute async operation with timing
 */
export async function timeAsync<T>(
  operation: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  const result = await operation();
  const duration = Date.now() - start;
  
  return { result, duration };
}

/**
 * Execute operation with retry and timing
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<TaskResult<T>> {
  const start = Date.now();
  let attempts = 0;
  
  try {
    const result = await retry(async () => {
      attempts++;
      return await operation();
    }, options);
    
    return {
      success: true,
      result,
      duration: Date.now() - start,
      attempts
    };
  } catch (error) {
    return {
      success: false,
      error: error as Error,
      duration: Date.now() - start,
      attempts
    };
  }
}

/**
 * Debounce async function
 */
export function debounceAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  delay: number
): (...args: T) => Promise<R> {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingPromise: Promise<R> | null = null;
  
  return (...args: T): Promise<R> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    if (pendingPromise) {
      return pendingPromise;
    }
    
    pendingPromise = new Promise<R>((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          pendingPromise = null;
          timeoutId = null;
        }
      }, delay);
    });
    
    return pendingPromise;
  };
}

/**
 * Throttle async function
 */
export function throttleAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  interval: number
): (...args: T) => Promise<R> {
  let lastExecution = 0;
  let pendingPromise: Promise<R> | null = null;
  
  return (...args: T): Promise<R> => {
    const now = Date.now();
    
    if (pendingPromise) {
      return pendingPromise;
    }
    
    if (now - lastExecution >= interval) {
      lastExecution = now;
      return fn(...args);
    }
    
    pendingPromise = new Promise<R>((resolve, reject) => {
      const delay = interval - (now - lastExecution);
      
      setTimeout(async () => {
        try {
          lastExecution = Date.now();
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          pendingPromise = null;
        }
      }, delay);
    });
    
    return pendingPromise;
  };
}

/**
 * Simple async queue implementation
 */
export class AsyncQueue<T> {
  private queue: (() => Promise<T>)[] = [];
  private running = 0;
  private results: T[] = [];
  
  constructor(private options: QueueOptions) {}
  
  add(task: () => Promise<T>): void {
    this.queue.push(task);
    
    if (this.options.autoStart) {
      this.process();
    }
  }
  
  async process(): Promise<T[]> {
    while (this.queue.length > 0 && this.running < this.options.concurrency) {
      const task = this.queue.shift()!;
      this.running++;
      
      this.executeTask(task);
    }
    
    // Wait for all tasks to complete
    while (this.running > 0) {
      await sleep(10);
    }
    
    return this.results;
  }
  
  private async executeTask(task: () => Promise<T>): Promise<void> {
    try {
      let result: T;
      
      if (this.options.timeout) {
        result = await withTimeout(task(), { timeout: this.options.timeout });
      } else {
        result = await task();
      }
      
      this.results.push(result);
    } catch (error) {
      // Handle error (could add error callback)
      console.error('Task failed:', error);
    } finally {
      this.running--;
      
      // Process next task if available
      if (this.queue.length > 0) {
        const nextTask = this.queue.shift()!;
        this.executeTask(nextTask);
      }
    }
  }
  
  clear(): void {
    this.queue = [];
    this.results = [];
  }
  
  get size(): number {
    return this.queue.length;
  }
  
  get isRunning(): boolean {
    return this.running > 0;
  }
}

/**
 * Create an async queue
 */
export function createAsyncQueue<T>(options: QueueOptions): AsyncQueue<T> {
  return new AsyncQueue<T>(options);
}

/**
 * Execute promises in sequence
 */
export async function sequence<T>(
  tasks: (() => Promise<T>)[]
): Promise<T[]> {
  const results: T[] = [];
  
  for (const task of tasks) {
    const result = await task();
    results.push(result);
  }
  
  return results;
}

/**
 * Execute promises in parallel with error handling
 */
export async function parallel<T>(
  tasks: (() => Promise<T>)[]
): Promise<(T | Error)[]> {
  const promises = tasks.map(async (task) => {
    try {
      return await task();
    } catch (error) {
      return error as Error;
    }
  });
  
  return Promise.all(promises);
}

/**
 * Execute promises with settled results
 */
export async function allSettled<T>(
  promises: Promise<T>[]
): Promise<Array<{ status: 'fulfilled' | 'rejected'; value?: T; reason?: any }>> {
  return Promise.allSettled(promises);
}

/**
 * Race promises with timeout
 */
export async function raceWithTimeout<T>(
  promises: Promise<T>[],
  timeout: number
): Promise<T> {
  return Promise.race([
    ...promises,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Race timed out after ${timeout}ms`)), timeout);
    })
  ]);
}

/**
 * Memoize async function results
 */
export function memoizeAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator?: (...args: T) => string,
  ttl?: number
): (...args: T) => Promise<R> {
  const cache = new Map<string, { value: R; timestamp: number }>();
  
  const defaultKeyGenerator = (...args: T) => JSON.stringify(args);
  const getKey = keyGenerator || defaultKeyGenerator;
  
  return async (...args: T): Promise<R> => {
    const key = getKey(...args);
    const now = Date.now();
    
    // Check cache
    const cached = cache.get(key);
    if (cached && (!ttl || now - cached.timestamp < ttl)) {
      return cached.value;
    }
    
    // Execute function and cache result
    const result = await fn(...args);
    cache.set(key, { value: result, timestamp: now });
    
    return result;
  };
}

/**
 * Create a cancellable promise
 */
export function cancellable<T>(
  promise: Promise<T>
): { promise: Promise<T>; cancel: () => void } {
  let cancelled = false;
  
  const cancellablePromise = new Promise<T>((resolve, reject) => {
    promise
      .then(value => {
        if (!cancelled) {
          resolve(value);
        }
      })
      .catch(error => {
        if (!cancelled) {
          reject(error);
        }
      });
  });
  
  return {
    promise: cancellablePromise,
    cancel: () => {
      cancelled = true;
    }
  };
}

/**
 * Wait for condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options: {
    timeout?: number;
    interval?: number;
    timeoutMessage?: string;
  } = {}
): Promise<void> {
  const {
    timeout = 30000,
    interval = 100,
    timeoutMessage = 'Condition not met within timeout'
  } = options;
  
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    const result = await condition();
    if (result) {
      return;
    }
    
    await sleep(interval);
  }
  
  throw new Error(timeoutMessage);
}

/**
 * Convert callback-based function to promise
 */
export function promisify<T>(
  fn: (callback: (error: any, result?: T) => void) => void
): () => Promise<T> {
  return () => {
    return new Promise<T>((resolve, reject) => {
      fn((error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!);
        }
      });
    });
  };
}

// Export common async constants
export const ASYNC_CONSTANTS = {
  DEFAULT_TIMEOUT: 30000,
  DEFAULT_RETRY_ATTEMPTS: 3,
  DEFAULT_RETRY_DELAY: 1000,
  DEFAULT_BACKOFF_FACTOR: 2,
  DEFAULT_MAX_DELAY: 30000,
  DEFAULT_CONCURRENCY: 5,
  DEFAULT_BATCH_SIZE: 10,
  DEFAULT_DEBOUNCE_DELAY: 300,
  DEFAULT_THROTTLE_INTERVAL: 1000,
  DEFAULT_QUEUE_CONCURRENCY: 3,
  DEFAULT_MEMOIZE_TTL: 300000, // 5 minutes
  DEFAULT_WAIT_INTERVAL: 100
} as const;

// Export utility types
export type AsyncFunction<T extends any[], R> = (...args: T) => Promise<R>;
export type CancellablePromise<T> = { promise: Promise<T>; cancel: () => void };
export type PromiseResult<T> = { status: 'fulfilled' | 'rejected'; value?: T; reason?: any };