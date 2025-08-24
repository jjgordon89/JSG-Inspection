/**
 * WebSocket Types
 * Type definitions for real-time communication
 */

import { User } from './auth';

/**
 * WebSocket Events
 */
export enum WebSocketEvent {
  // Connection events
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  
  // Room events
  ROOM_JOINED = 'room_joined',
  ROOM_LEFT = 'room_left',
  USER_TYPING = 'user_typing',
  
  // Notification events
  NOTIFICATION = 'notification',
  NOTIFICATION_READ = 'notification_read',
  
  // Inspection events
  INSPECTION_CREATED = 'inspection:created',
  INSPECTION_UPDATED = 'inspection:updated',
  INSPECTION_COMPLETED = 'inspection:completed',
  INSPECTION_CANCELLED = 'inspection:cancelled',
  INSPECTION_ASSIGNED = 'inspection:assigned',
  INSPECTION_DUE = 'inspection:due',
  INSPECTION_OVERDUE = 'inspection:overdue',
  
  // Asset events
  ASSET_CREATED = 'asset:created',
  ASSET_UPDATED = 'asset:updated',
  ASSET_DELETED = 'asset:deleted',
  ASSET_MAINTENANCE_DUE = 'asset:maintenance_due',
  ASSET_LOCATION_UPDATED = 'asset:location_updated',
  
  // Team events
  TEAM_CREATED = 'team:created',
  TEAM_UPDATED = 'team:updated',
  TEAM_MEMBER_ADDED = 'team:member_added',
  TEAM_MEMBER_REMOVED = 'team:member_removed',
  
  // User events
  USER_ONLINE = 'user:online',
  USER_OFFLINE = 'user:offline',
  USER_STATUS_CHANGED = 'user:status_changed',
  
  // System events
  SYSTEM_ALERT = 'system:alert',
  SYSTEM_MAINTENANCE = 'system:maintenance',
  SYSTEM_UPDATE = 'system:update',
  
  // Sync events
  SYNC_STARTED = 'sync:started',
  SYNC_PROGRESS = 'sync:progress',
  SYNC_COMPLETED = 'sync:completed',
  SYNC_FAILED = 'sync:failed',
  SYNC_CONFLICT = 'sync:conflict',
  
  // Report events
  REPORT_GENERATED = 'report:generated',
  REPORT_FAILED = 'report:failed',
  
  // File events
  FILE_UPLOADED = 'file:uploaded',
  FILE_PROCESSED = 'file:processed',
  FILE_FAILED = 'file:failed',
  
  // Custom events
  CUSTOM_EVENT = 'custom_event',
  PING = 'ping',
  PONG = 'pong'
}

/**
 * WebSocket Room Types
 */
export enum WebSocketRoom {
  USER = 'user',
  TEAM = 'team',
  INSPECTION = 'inspection',
  ASSET = 'asset',
  SYSTEM = 'system',
  GLOBAL = 'global'
}

/**
 * Socket Connection Information
 */
export interface SocketConnection {
  id: string;
  userId: string;
  user: User;
  connectedAt: Date;
  lastActivity: Date;
  rooms: Set<string>;
  metadata: {
    userAgent?: string;
    ip?: string;
    deviceId?: string;
    platform?: string;
    version?: string;
  };
}

/**
 * Real-time Update
 */
export interface RealTimeUpdate {
  entityType: 'inspection' | 'asset' | 'team' | 'user' | 'report' | 'notification';
  entityId: string;
  action: 'created' | 'updated' | 'deleted' | 'completed' | 'assigned' | 'cancelled';
  data: any;
  userId?: string;
  teamId?: string;
  timestamp?: Date;
}

/**
 * Notification Payload
 */
export interface NotificationPayload {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'inspection' | 'asset' | 'team' | 'system';
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  expiresAt?: Date;
  createdAt: Date;
}

/**
 * Sync Progress Information
 */
export interface SyncProgress {
  sessionId: string;
  userId: string;
  status: 'started' | 'in_progress' | 'completed' | 'failed';
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  stage: 'uploading' | 'downloading' | 'processing' | 'resolving_conflicts' | 'finalizing';
  message?: string;
  error?: string;
  startedAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  stats?: {
    uploaded: number;
    downloaded: number;
    conflicts: number;
    resolved: number;
    failed: number;
  };
}

/**
 * Inspection Update
 */
export interface InspectionUpdate {
  inspectionId: string;
  action: 'created' | 'updated' | 'completed' | 'cancelled' | 'assigned' | 'due' | 'overdue';
  data: {
    inspection?: any;
    assignedTo?: string;
    completedBy?: string;
    status?: string;
    score?: number;
    dueDate?: Date;
    changes?: Record<string, any>;
  };
  userId: string;
  teamId?: string;
  timestamp: Date;
}

/**
 * Asset Update
 */
export interface AssetUpdate {
  assetId: string;
  action: 'created' | 'updated' | 'deleted' | 'maintenance_due' | 'location_updated';
  data: {
    asset?: any;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    maintenance?: {
      type: string;
      dueDate: Date;
      priority: string;
    };
    changes?: Record<string, any>;
  };
  userId: string;
  teamId?: string;
  timestamp: Date;
}

/**
 * Team Update
 */
export interface TeamUpdate {
  teamId: string;
  action: 'created' | 'updated' | 'member_added' | 'member_removed' | 'role_changed';
  data: {
    team?: any;
    member?: {
      userId: string;
      role: string;
      addedBy?: string;
      removedBy?: string;
    };
    changes?: Record<string, any>;
  };
  userId: string;
  timestamp: Date;
}

/**
 * System Alert
 */
export interface SystemAlert {
  id: string;
  type: 'maintenance' | 'update' | 'security' | 'performance' | 'error' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  details?: string;
  actionRequired?: boolean;
  actionUrl?: string;
  actionText?: string;
  targetUsers?: string[];
  targetRoles?: string[];
  expiresAt?: Date;
  createdAt: Date;
  metadata?: Record<string, any>;
}

/**
 * User Typing Indicator
 */
export interface TypingIndicator {
  userId: string;
  user: User;
  room: string;
  isTyping: boolean;
  timestamp: Date;
}

/**
 * Connection Event Data
 */
export interface ConnectionEventData {
  socketId: string;
  userId: string;
  timestamp: Date;
  rooms?: string[];
  metadata?: Record<string, any>;
}

/**
 * Room Event Data
 */
export interface RoomEventData {
  room: string;
  type?: 'user' | 'team' | 'inspection' | 'asset' | 'system';
  action: 'joined' | 'left';
  userId: string;
  timestamp: Date;
  memberCount?: number;
}

/**
 * Error Event Data
 */
export interface ErrorEventData {
  event: string;
  error: string;
  code?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Ping/Pong Data
 */
export interface PingPongData {
  timestamp: number;
  latency?: number;
}

/**
 * File Upload Progress
 */
export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: {
    loaded: number;
    total: number;
    percentage: number;
  };
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
  result?: {
    url: string;
    thumbnailUrl?: string;
    metadata?: Record<string, any>;
  };
  timestamp: Date;
}

/**
 * Report Generation Progress
 */
export interface ReportProgress {
  reportId: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  stage: 'collecting_data' | 'processing' | 'generating_content' | 'creating_file' | 'finalizing';
  message?: string;
  error?: string;
  result?: {
    url: string;
    format: string;
    size: number;
  };
  timestamp: Date;
}

/**
 * WebSocket Event Handlers
 */
export interface WebSocketEventHandlers {
  // Connection events
  connected?: (data: ConnectionEventData) => void;
  disconnected?: (data: ConnectionEventData) => void;
  error?: (data: ErrorEventData) => void;
  
  // Room events
  room_joined?: (data: RoomEventData) => void;
  room_left?: (data: RoomEventData) => void;
  user_typing?: (data: TypingIndicator) => void;
  
  // Notification events
  notification?: (data: NotificationPayload) => void;
  notification_read?: (data: { notificationId: string; userId: string; timestamp: Date }) => void;
  
  // Inspection events
  'inspection:created'?: (data: InspectionUpdate) => void;
  'inspection:updated'?: (data: InspectionUpdate) => void;
  'inspection:completed'?: (data: InspectionUpdate) => void;
  'inspection:cancelled'?: (data: InspectionUpdate) => void;
  'inspection:assigned'?: (data: InspectionUpdate) => void;
  'inspection:due'?: (data: InspectionUpdate) => void;
  'inspection:overdue'?: (data: InspectionUpdate) => void;
  
  // Asset events
  'asset:created'?: (data: AssetUpdate) => void;
  'asset:updated'?: (data: AssetUpdate) => void;
  'asset:deleted'?: (data: AssetUpdate) => void;
  'asset:maintenance_due'?: (data: AssetUpdate) => void;
  'asset:location_updated'?: (data: AssetUpdate) => void;
  
  // Team events
  'team:created'?: (data: TeamUpdate) => void;
  'team:updated'?: (data: TeamUpdate) => void;
  'team:member_added'?: (data: TeamUpdate) => void;
  'team:member_removed'?: (data: TeamUpdate) => void;
  
  // User events
  'user:online'?: (data: { userId: string; timestamp: Date }) => void;
  'user:offline'?: (data: { userId: string; timestamp: Date }) => void;
  'user:status_changed'?: (data: { userId: string; status: string; timestamp: Date }) => void;
  
  // System events
  'system:alert'?: (data: SystemAlert) => void;
  'system:maintenance'?: (data: SystemAlert) => void;
  'system:update'?: (data: SystemAlert) => void;
  
  // Sync events
  'sync:started'?: (data: SyncProgress) => void;
  'sync:progress'?: (data: SyncProgress) => void;
  'sync:completed'?: (data: SyncProgress) => void;
  'sync:failed'?: (data: SyncProgress) => void;
  'sync:conflict'?: (data: { conflictId: string; entityType: string; entityId: string; timestamp: Date }) => void;
  
  // Report events
  'report:generated'?: (data: ReportProgress) => void;
  'report:failed'?: (data: ReportProgress) => void;
  
  // File events
  'file:uploaded'?: (data: FileUploadProgress) => void;
  'file:processed'?: (data: FileUploadProgress) => void;
  'file:failed'?: (data: FileUploadProgress) => void;
  
  // Utility events
  ping?: (data: PingPongData) => void;
  pong?: (data: PingPongData) => void;
  custom_event?: (data: any) => void;
}

/**
 * WebSocket Client Configuration
 */
export interface WebSocketClientConfig {
  url: string;
  auth: {
    token: string;
  };
  options?: {
    autoConnect?: boolean;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    timeout?: number;
    forceNew?: boolean;
  };
  deviceInfo?: {
    deviceId: string;
    platform: string;
    version: string;
  };
}

/**
 * WebSocket Server Configuration
 */
export interface WebSocketServerConfig {
  port?: number;
  cors?: {
    origin: string | string[];
    credentials: boolean;
  };
  pingTimeout?: number;
  pingInterval?: number;
  maxConnections?: number;
  rateLimiting?: {
    windowMs: number;
    maxRequests: number;
  };
  auth?: {
    jwtSecret: string;
    tokenExpiry?: number;
  };
}

/**
 * Room Subscription Options
 */
export interface RoomSubscriptionOptions {
  room: string;
  type?: 'user' | 'team' | 'inspection' | 'asset' | 'system';
  autoJoin?: boolean;
  permissions?: string[];
  metadata?: Record<string, any>;
}

/**
 * WebSocket Middleware Context
 */
export interface WebSocketMiddlewareContext {
  socket: any; // Socket.IO socket
  user?: User;
  userId?: string;
  deviceId?: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * WebSocket Middleware Function
 */
export type WebSocketMiddleware = (
  context: WebSocketMiddlewareContext,
  next: (error?: Error) => void
) => void | Promise<void>;

/**
 * WebSocket Event Filter
 */
export interface WebSocketEventFilter {
  events?: string[];
  users?: string[];
  teams?: string[];
  rooms?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: Date;
  endDate?: Date;
}

/**
 * WebSocket Analytics Data
 */
export interface WebSocketAnalytics {
  connections: {
    total: number;
    active: number;
    peak: number;
    average: number;
  };
  messages: {
    sent: number;
    received: number;
    failed: number;
    averageSize: number;
  };
  rooms: {
    total: number;
    active: number;
    averageMembers: number;
    mostPopular: string;
  };
  latency: {
    average: number;
    min: number;
    max: number;
    p95: number;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
    recent: Array<{
      type: string;
      message: string;
      timestamp: Date;
    }>;
  };
  period: {
    start: Date;
    end: Date;
  };
}

/**
 * WebSocket Health Check
 */
export interface WebSocketHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  connections: {
    active: number;
    total: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  latency: {
    average: number;
    p95: number;
  };
  errors: {
    rate: number;
    recent: number;
  };
  timestamp: Date;
}