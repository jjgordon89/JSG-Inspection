/**
 * Core Entity Type Definitions
 * TypeScript interfaces for all database entities
 */

// Base entity interface
export interface BaseEntity {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

// User entity
export interface User extends BaseEntity {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'inspector' | 'user';
  isActive: boolean;
  lastLogin?: string;
  profileImage?: string;
  phoneNumber?: string;
  department?: string;
  teamId?: string;
  preferences?: UserPreferences;
  permissions?: string[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: string;
    widgets: string[];
  };
}

// Team entity
export interface Team extends BaseEntity {
  name: string;
  description?: string;
  isActive: boolean;
  members?: string[]; // User IDs
  leaderId?: string; // User ID
  department?: string;
  location?: Location;
}

// Asset entity
export interface Asset extends BaseEntity {
  name: string;
  description?: string;
  type: 'equipment' | 'building' | 'vehicle' | 'tool' | 'other';
  location?: Location;
  qrCode?: string;
  barcode?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  specifications?: Record<string, any>;
  maintenanceSchedule?: MaintenanceSchedule;
  photos?: string[];
  documents?: Document[];
  parentAssetId?: string;
  childAssets?: string[];
}

export interface Location {
  latitude?: number;
  longitude?: number;
  address?: string;
  building?: string;
  floor?: string;
  room?: string;
  zone?: string;
  coordinates?: {
    x: number;
    y: number;
    z?: number;
  };
}

export interface MaintenanceSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastMaintenance?: string;
  nextMaintenance?: string;
  maintenanceType: string;
  assignedTo?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  size: number;
}

// Form Template entity
export interface FormTemplate extends BaseEntity {
  name: string;
  description?: string;
  version: string;
  fields: FormField[];
  isActive: boolean;
  createdBy: string;
  category?: string;
  tags?: string[];
  estimatedDuration?: number; // in minutes
  requiredRole?: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  description?: string;
  required: boolean;
  order: number;
  validation?: FieldValidation;
  options?: FormFieldOption[];
  defaultValue?: any;
  placeholder?: string;
  helpText?: string;
  conditional?: FieldConditional;
  scoring?: FieldScoring;
}

export type FormFieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'url'
  | 'date'
  | 'time'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'boolean'
  | 'file'
  | 'image'
  | 'signature'
  | 'rating'
  | 'slider'
  | 'location'
  | 'barcode'
  | 'qrcode';

export interface FormFieldOption {
  value: string;
  label: string;
  color?: string;
  icon?: string;
  score?: number;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customValidation?: string;
  errorMessage?: string;
}

export interface FieldConditional {
  dependsOn: string; // Field ID
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  action: 'show' | 'hide' | 'require' | 'disable';
}

export interface FieldScoring {
  enabled: boolean;
  scoreType: 'points' | 'percentage' | 'pass_fail';
  maxScore?: number;
  passingScore?: number;
  weightage?: number;
}

// Folder entity
export interface Folder extends BaseEntity {
  name: string;
  description?: string;
  type: 'inspection' | 'maintenance' | 'audit' | 'safety';
  status: 'active' | 'completed' | 'cancelled' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledDate?: string;
  dueDate?: string;
  assignedTo?: string;
  createdBy: string;
  formTemplateId?: string;
  assetIds?: string[];
  tags?: string[];
  estimatedDuration?: number;
  actualDuration?: number;
  completionPercentage?: number;
  instructions?: string;
  attachments?: Document[];
}

// Inspection entity
export interface Inspection extends BaseEntity {
  folder?: string; // Folder ID
  asset: string; // Asset ID
  formTemplate: string; // Form Template ID
  inspector: string; // User ID
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  responses: InspectionResponse[];
  photos: InspectionPhoto[];
  notes?: string;
  score?: InspectionScore;
  startedAt?: string;
  completedAt?: string;
  location?: Location;
  weather?: WeatherCondition;
  defects?: Defect[];
  recommendations?: string[];
  followUpRequired?: boolean;
  followUpDate?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface InspectionResponse {
  fieldId: string;
  fieldType: FormFieldType;
  value: any;
  score?: number;
  notes?: string;
  timestamp: string;
  location?: Location;
  photos?: string[];
}

export interface InspectionPhoto {
  id: string;
  url: string;
  thumbnail?: string;
  caption?: string;
  fieldId?: string;
  location?: Location;
  timestamp: string;
  metadata?: PhotoMetadata;
  aiAnalysis?: AIAnalysis;
}

export interface PhotoMetadata {
  filename: string;
  size: number;
  mimeType: string;
  width: number;
  height: number;
  exif?: Record<string, any>;
  hash?: string;
}

export interface AIAnalysis {
  defectsDetected: DetectedDefect[];
  confidence: number;
  processingTime: number;
  modelVersion: string;
  timestamp: string;
}

export interface DetectedDefect {
  type: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
}

export interface InspectionScore {
  total: number;
  maximum: number;
  percentage: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: ScoreBreakdown[];
  passFailStatus: 'pass' | 'fail';
  criticalIssues: number;
}

export interface ScoreBreakdown {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  weight: number;
}

export interface WeatherCondition {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  visibility: number;
  conditions: string;
  timestamp: string;
}

export interface Defect {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: Location;
  photos?: string[];
  recommendedAction: string;
  estimatedCost?: number;
  priority: number;
  assignedTo?: string;
  dueDate?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'deferred';
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

// Report entity
export interface Report extends BaseEntity {
  title: string;
  type: 'inspection' | 'summary' | 'analytics' | 'compliance';
  content: string;
  data: Record<string, any>;
  generatedBy: string;
  generatedAt: string;
  filters?: ReportFilters;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'generating' | 'completed' | 'failed';
  fileUrl?: string;
  fileSize?: number;
  expiresAt?: string;
  isPublic?: boolean;
  sharedWith?: string[];
  scheduledReport?: ScheduledReportConfig;
}

export interface ReportFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  assetIds?: string[];
  inspectorIds?: string[];
  folderIds?: string[];
  status?: string[];
  priority?: string[];
  tags?: string[];
  location?: Location;
  customFilters?: Record<string, any>;
}

export interface ScheduledReportConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
  recipients: string[];
  isActive: boolean;
  lastGenerated?: string;
  nextGeneration?: string;
}

// Audit Log entity
export interface AuditLog extends BaseEntity {
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  sessionId?: string;
  correlationId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'data' | 'system' | 'security' | 'api';
  metadata?: Record<string, any>;
}

// Notification entity
export interface Notification extends BaseEntity {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  userId: string;
  isRead: boolean;
  data?: Record<string, any>;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'inspection' | 'system' | 'reminder' | 'alert';
  expiresAt?: string;
  channels: NotificationChannel[];
  deliveryStatus?: NotificationDeliveryStatus;
}

export interface NotificationChannel {
  type: 'email' | 'push' | 'sms' | 'in_app';
  enabled: boolean;
  delivered?: boolean;
  deliveredAt?: string;
  error?: string;
}

export interface NotificationDeliveryStatus {
  email?: {
    sent: boolean;
    sentAt?: string;
    error?: string;
  };
  push?: {
    sent: boolean;
    sentAt?: string;
    error?: string;
  };
  sms?: {
    sent: boolean;
    sentAt?: string;
    error?: string;
  };
}

// Sync entity for offline support
export interface SyncRecord extends BaseEntity {
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: Record<string, any>;
  userId: string;
  deviceId: string;
  timestamp: string;
  status: 'pending' | 'synced' | 'failed' | 'conflict';
  retryCount: number;
  lastRetry?: string;
  error?: string;
  conflictData?: Record<string, any>;
  resolvedAt?: string;
  resolvedBy?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  correlationId?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: string;
  correlationId?: string;
  stack?: string; // Only in development
}

// Query and filter types
export interface QueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
  search?: string;
  searchFields?: string[];
  include?: string[];
  exclude?: string[];
}

export interface DateRange {
  start: string;
  end: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  radius?: number; // in meters
}

// Authentication types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

// File upload types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

export interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  metadata?: Record<string, any>;
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  userId?: string;
  correlationId?: string;
}

export interface WebSocketEvent {
  event: string;
  data: any;
  room?: string;
  userId?: string;
  timestamp: string;
}

// AI Integration types
export interface AIModelConfig {
  name: string;
  version: string;
  type: 'computer_vision' | 'nlp' | 'predictive';
  endpoint: string;
  apiKey?: string;
  isActive: boolean;
  confidence_threshold: number;
  maxRetries: number;
  timeout: number;
}

export interface AIProcessingResult {
  modelName: string;
  modelVersion: string;
  confidence: number;
  processingTime: number;
  result: any;
  metadata?: Record<string, any>;
  timestamp: string;
}