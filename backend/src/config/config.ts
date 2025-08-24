import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

interface Config {
  server: {
    port: number;
    nodeEnv: string;
    apiVersion: string;
  };
  database: {
    host: string;
    port: number;
    namespace: string;
    database: string;
    user: string;
    password: string;
    path: string;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  security: {
    bcryptRounds: number;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
  };
  upload: {
    path: string;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  ai: {
    openaiApiKey?: string;
    geminiApiKey?: string;
    modelPath: string;
    enabled: boolean;
  };
  websocket: {
    port: number;
    corsOrigin: string;
  };
  logging: {
    level: string;
    filePath: string;
    maxSize: string;
    maxFiles: string;
  };
  email?: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
  sync: {
    interval: number;
    batchSize: number;
    retryAttempts: number;
  };
  performance: {
    cacheTtl: number;
    compressionLevel: number;
    requestTimeout: number;
  };
  development: {
    debug: boolean;
    apiDocsEnabled: boolean;
  };
  cors: {
    origin: string | string[];
  };
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value || defaultValue!;
};

const getEnvNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
};

const getEnvBoolean = (key: string, defaultValue: boolean = false): boolean => {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

const getEnvArray = (key: string, defaultValue: string[] = []): string[] => {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.split(',').map(item => item.trim());
};

export const config: Config = {
  server: {
    port: getEnvNumber('PORT', 3000),
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
    apiVersion: getEnvVar('API_VERSION', 'v1'),
  },
  database: {
    host: getEnvVar('DB_HOST', 'localhost'),
    port: getEnvNumber('DB_PORT', 8000),
    namespace: getEnvVar('DB_NAMESPACE', 'jsg_inspections'),
    database: getEnvVar('DB_DATABASE', 'main'),
    user: getEnvVar('DB_USER', 'root'),
    password: getEnvVar('DB_PASS', 'root'),
    path: getEnvVar('DB_PATH', './data/jsg_inspections.db'),
  },
  jwt: {
    secret: getEnvVar('JWT_SECRET'),
    refreshSecret: getEnvVar('JWT_REFRESH_SECRET'),
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '15m'),
    refreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
  },
  security: {
    bcryptRounds: getEnvNumber('BCRYPT_ROUNDS', 12),
    rateLimitWindowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000),
    rateLimitMaxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  },
  upload: {
    path: getEnvVar('UPLOAD_PATH', './uploads'),
    maxFileSize: getEnvNumber('MAX_FILE_SIZE', 10485760), // 10MB
    allowedFileTypes: getEnvArray('ALLOWED_FILE_TYPES', [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf'
    ]),
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    modelPath: getEnvVar('AI_MODEL_PATH', './models'),
    enabled: getEnvBoolean('AI_ENABLED', false),
  },
  websocket: {
    port: getEnvNumber('WS_PORT', 3001),
    corsOrigin: getEnvVar('WS_CORS_ORIGIN', 'http://localhost:3000'),
  },
  logging: {
    level: getEnvVar('LOG_LEVEL', 'info'),
    filePath: getEnvVar('LOG_FILE_PATH', './logs'),
    maxSize: getEnvVar('LOG_MAX_SIZE', '20m'),
    maxFiles: getEnvVar('LOG_MAX_FILES', '14d'),
  },
  email: process.env.SMTP_HOST ? {
    host: getEnvVar('SMTP_HOST'),
    port: getEnvNumber('SMTP_PORT', 587),
    user: getEnvVar('SMTP_USER'),
    password: getEnvVar('SMTP_PASS'),
    from: getEnvVar('SMTP_FROM'),
  } : undefined,
  sync: {
    interval: getEnvNumber('SYNC_INTERVAL', 300000), // 5 minutes
    batchSize: getEnvNumber('SYNC_BATCH_SIZE', 100),
    retryAttempts: getEnvNumber('SYNC_RETRY_ATTEMPTS', 3),
  },
  performance: {
    cacheTtl: getEnvNumber('CACHE_TTL', 3600), // 1 hour
    compressionLevel: getEnvNumber('COMPRESSION_LEVEL', 6),
    requestTimeout: getEnvNumber('REQUEST_TIMEOUT', 30000), // 30 seconds
  },
  development: {
    debug: getEnvBoolean('DEBUG', false),
    apiDocsEnabled: getEnvBoolean('API_DOCS_ENABLED', true),
  },
  cors: {
    origin: getEnvArray('CORS_ORIGIN', ['http://localhost:3000']),
  },
};

// Validate critical configuration
if (config.server.nodeEnv === 'production') {
  if (!config.jwt.secret || config.jwt.secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  if (!config.jwt.refreshSecret || config.jwt.refreshSecret.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters in production');
  }
}

// Create necessary directories
import fs from 'fs';
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

ensureDirectoryExists(config.upload.path);
ensureDirectoryExists(config.logging.filePath);
ensureDirectoryExists(path.dirname(config.database.path));
if (config.ai.enabled) {
  ensureDirectoryExists(config.ai.modelPath);
}

export default config;