/**
 * Data Transfer Objects (DTOs)
 * Request and response validation schemas
 */

import { FormField, Location, QueryOptions } from './entities';

// Base DTO interfaces
export interface CreateDTO {
  [key: string]: any;
}

export interface UpdateDTO {
  [key: string]: any;
}

export interface ResponseDTO {
  [key: string]: any;
}

// Authentication DTOs
export interface LoginDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceId?: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  department?: string;
  teamId?: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordDTO {
  email: string;
}

export interface ResetPasswordConfirmDTO {
  token: string;
  newPassword: string;
}

export interface AuthResponseDTO {
  user: UserResponseDTO;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

// User DTOs
export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'inspector' | 'user';
  phoneNumber?: string;
  department?: string;
  teamId?: string;
  permissions?: string[];
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
  teamId?: string;
  role?: 'admin' | 'manager' | 'inspector' | 'user';
  isActive?: boolean;
  permissions?: string[];
}

export interface UserResponseDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  phoneNumber?: string;
  department?: string;
  teamId?: string;
  profileImage?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
}

// Team DTOs
export interface CreateTeamDTO {
  name: string;
  description?: string;
  leaderId?: string;
  department?: string;
  location?: Location;
}

export interface UpdateTeamDTO {
  name?: string;
  description?: string;
  leaderId?: string;
  department?: string;
  location?: Location;
  isActive?: boolean;
}

export interface TeamResponseDTO {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  leaderId?: string;
  department?: string;
  location?: Location;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddTeamMemberDTO {
  userId: string;
}

// Asset DTOs
export interface CreateAssetDTO {
  name: string;
  description?: string;
  type: 'equipment' | 'building' | 'vehicle' | 'tool' | 'other';
  location?: Location;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  specifications?: Record<string, any>;
  parentAssetId?: string;
}

export interface UpdateAssetDTO {
  name?: string;
  description?: string;
  type?: 'equipment' | 'building' | 'vehicle' | 'tool' | 'other';
  location?: Location;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  status?: 'active' | 'inactive' | 'maintenance' | 'retired';
  specifications?: Record<string, any>;
  parentAssetId?: string;
}

export interface AssetResponseDTO {
  id: string;
  name: string;
  description?: string;
  type: string;
  location?: Location;
  qrCode?: string;
  barcode?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  status: string;
  parentAssetId?: string;
  childAssets?: string[];
  lastInspection?: {
    id: string;
    date: string;
    status: string;
    score?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GenerateQRCodeDTO {
  assetId: string;
  size?: number;
  format?: 'png' | 'svg';
}

// Form Template DTOs
export interface CreateFormTemplateDTO {
  name: string;
  description?: string;
  fields: FormField[];
  category?: string;
  tags?: string[];
  estimatedDuration?: number;
  requiredRole?: string;
}

export interface UpdateFormTemplateDTO {
  name?: string;
  description?: string;
  fields?: FormField[];
  category?: string;
  tags?: string[];
  estimatedDuration?: number;
  requiredRole?: string;
  isActive?: boolean;
}

export interface FormTemplateResponseDTO {
  id: string;
  name: string;
  description?: string;
  version: string;
  fields: FormField[];
  isActive: boolean;
  category?: string;
  tags?: string[];
  estimatedDuration?: number;
  requiredRole?: string;
  createdBy: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CloneFormTemplateDTO {
  name: string;
  description?: string;
}

// Folder DTOs
export interface CreateFolderDTO {
  name: string;
  description?: string;
  type: 'inspection' | 'maintenance' | 'audit' | 'safety';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledDate?: string;
  dueDate?: string;
  assignedTo?: string;
  formTemplateId?: string;
  assetIds?: string[];
  tags?: string[];
  estimatedDuration?: number;
  instructions?: string;
}

export interface UpdateFolderDTO {
  name?: string;
  description?: string;
  type?: 'inspection' | 'maintenance' | 'audit' | 'safety';
  status?: 'active' | 'completed' | 'cancelled' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  scheduledDate?: string;
  dueDate?: string;
  assignedTo?: string;
  formTemplateId?: string;
  assetIds?: string[];
  tags?: string[];
  estimatedDuration?: number;
  instructions?: string;
}

export interface FolderResponseDTO {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
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
  inspectionCount: number;
  completedInspections: number;
  createdAt: string;
  updatedAt: string;
}

// Inspection DTOs
export interface CreateInspectionDTO {
  folderId?: string;
  assetId: string;
  formTemplateId: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  location?: Location;
}

export interface UpdateInspectionDTO {
  status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  location?: Location;
  followUpRequired?: boolean;
  followUpDate?: string;
}

export interface InspectionResponseDTO {
  id: string;
  folder?: string;
  asset: {
    id: string;
    name: string;
    type: string;
  };
  formTemplate: {
    id: string;
    name: string;
    version: string;
  };
  inspector: {
    id: string;
    firstName: string;
    lastName: string;
  };
  status: string;
  priority: string;
  responses: any[];
  photos: any[];
  notes?: string;
  score?: {
    total: number;
    maximum: number;
    percentage: number;
    grade: string;
  };
  startedAt?: string;
  completedAt?: string;
  location?: Location;
  defects?: any[];
  followUpRequired?: boolean;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitInspectionResponseDTO {
  fieldId: string;
  value: any;
  notes?: string;
  photos?: string[];
  location?: Location;
}

export interface CompleteInspectionDTO {
  responses: SubmitInspectionResponseDTO[];
  notes?: string;
  defects?: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location?: Location;
    photos?: string[];
    recommendedAction: string;
  }[];
  recommendations?: string[];
  followUpRequired?: boolean;
  followUpDate?: string;
}

// Report DTOs
export interface CreateReportDTO {
  title: string;
  type: 'inspection' | 'summary' | 'analytics' | 'compliance';
  filters?: {
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
  };
  format?: 'pdf' | 'excel' | 'csv' | 'json';
  isPublic?: boolean;
  sharedWith?: string[];
}

export interface ReportResponseDTO {
  id: string;
  title: string;
  type: string;
  status: string;
  format: string;
  fileUrl?: string;
  fileSize?: number;
  generatedBy: string;
  generatedAt: string;
  expiresAt?: string;
  isPublic?: boolean;
  createdAt: string;
}

export interface ScheduleReportDTO {
  reportConfig: CreateReportDTO;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    timezone: string;
    recipients: string[];
  };
}

// File Upload DTOs
export interface FileUploadResponseDTO {
  id: string;
  originalName: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface BulkFileUploadDTO {
  files: Express.Multer.File[];
  category?: string;
  tags?: string[];
}

// Notification DTOs
export interface CreateNotificationDTO {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  userId: string;
  data?: Record<string, any>;
  actionUrl?: string;
  actionText?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: 'inspection' | 'system' | 'reminder' | 'alert';
  expiresAt?: string;
  channels?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
}

export interface NotificationResponseDTO {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data?: Record<string, any>;
  actionUrl?: string;
  actionText?: string;
  priority: string;
  category: string;
  createdAt: string;
}

export interface MarkNotificationReadDTO {
  notificationIds: string[];
}

// Search and Filter DTOs
export interface SearchDTO {
  query: string;
  entities?: ('users' | 'assets' | 'inspections' | 'folders' | 'reports')[];
  filters?: Record<string, any>;
  options?: QueryOptions;
}

export interface SearchResultDTO {
  entity: string;
  results: any[];
  total: number;
}

export interface FilterDTO {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
}

// Analytics DTOs
export interface AnalyticsQueryDTO {
  metric: string;
  dateRange: {
    start: string;
    end: string;
  };
  groupBy?: string;
  filters?: Record<string, any>;
}

export interface AnalyticsResponseDTO {
  metric: string;
  data: {
    labels: string[];
    values: number[];
  };
  summary: {
    total: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
    changePercentage: number;
  };
  generatedAt: string;
}

// Sync DTOs
export interface SyncRequestDTO {
  lastSyncTimestamp?: string;
  deviceId: string;
  changes?: {
    entity: string;
    operation: 'create' | 'update' | 'delete';
    data: any;
    timestamp: string;
  }[];
}

export interface SyncResponseDTO {
  changes: {
    entity: string;
    operation: 'create' | 'update' | 'delete';
    data: any;
    timestamp: string;
  }[];
  conflicts?: {
    entity: string;
    entityId: string;
    serverData: any;
    clientData: any;
    timestamp: string;
  }[];
  lastSyncTimestamp: string;
  nextSyncRecommended: string;
}

// Health Check DTOs
export interface HealthCheckResponseDTO {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    ai: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    storage: {
      status: 'up' | 'down';
      freeSpace?: number;
      error?: string;
    };
  };
  metrics: {
    memoryUsage: {
      used: number;
      total: number;
      percentage: number;
    };
    cpuUsage: number;
    activeConnections: number;
    requestsPerMinute: number;
  };
}

// Validation DTOs
export interface ValidationErrorDTO {
  field: string;
  message: string;
  value?: any;
  code?: string;
}

export interface ValidationResponseDTO {
  valid: boolean;
  errors: ValidationErrorDTO[];
}

// Bulk Operation DTOs
export interface BulkOperationDTO {
  operation: 'create' | 'update' | 'delete';
  entities: any[];
  options?: {
    skipValidation?: boolean;
    continueOnError?: boolean;
    batchSize?: number;
  };
}

export interface BulkOperationResponseDTO {
  success: boolean;
  processed: number;
  failed: number;
  results: {
    success: boolean;
    data?: any;
    error?: string;
  }[];
  errors: {
    index: number;
    error: string;
  }[];
}

// Export/Import DTOs
export interface ExportDTO {
  entities: string[];
  format: 'json' | 'csv' | 'excel';
  filters?: Record<string, any>;
  includeRelations?: boolean;
}

export interface ImportDTO {
  entity: string;
  data: any[];
  options?: {
    skipValidation?: boolean;
    updateExisting?: boolean;
    createMissing?: boolean;
  };
}

// AI Integration DTOs
export interface AIAnalysisRequestDTO {
  type: 'image_analysis' | 'text_analysis' | 'predictive_analysis';
  data: any;
  options?: {
    model?: string;
    confidence_threshold?: number;
    max_results?: number;
  };
}

export interface AIAnalysisResponseDTO {
  type: string;
  results: any;
  confidence: number;
  processingTime: number;
  modelUsed: string;
  timestamp: string;
}

// WebSocket DTOs
export interface WebSocketMessageDTO {
  type: string;
  payload: any;
  room?: string;
  userId?: string;
}

export interface WebSocketEventDTO {
  event: string;
  data: any;
  timestamp: string;
}