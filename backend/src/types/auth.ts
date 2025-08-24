/**
 * Authentication Types and Interfaces
 * Defines all authentication-related data structures
 */

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: UserPermission[];
  teamId?: string;
  isActive: boolean;
  emailVerified: boolean;
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  loginAttempts: number;
  lastLogin?: Date;
  lockedUntil?: Date;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  tokenVersion: number;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions?: UserPermission[];
  teamId?: string;
  phone?: string;
  department?: string;
  position?: string;
  avatar?: string;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  permissions?: UserPermission[];
  teamId?: string;
  phone?: string;
  department?: string;
  position?: string;
  avatar?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  preferences?: Partial<UserPreferences>;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: UserPermission[];
  teamId?: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inspectionReminders: boolean;
    reportGeneration: boolean;
    teamUpdates: boolean;
    systemAlerts: boolean;
  };
  dashboard: {
    defaultView: 'grid' | 'list' | 'kanban';
    itemsPerPage: number;
    showCompletedInspections: boolean;
    autoRefresh: boolean;
    refreshInterval: number; // seconds
  };
  privacy: {
    showOnlineStatus: boolean;
    allowTeamVisibility: boolean;
    shareActivityStatus: boolean;
  };
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  INSPECTOR = 'inspector',
  VIEWER = 'viewer',
  GUEST = 'guest'
}

export enum UserPermission {
  // User Management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_MANAGE_ROLES = 'user:manage_roles',
  USER_MANAGE_PERMISSIONS = 'user:manage_permissions',
  
  // Team Management
  TEAM_CREATE = 'team:create',
  TEAM_READ = 'team:read',
  TEAM_UPDATE = 'team:update',
  TEAM_DELETE = 'team:delete',
  TEAM_MANAGE_MEMBERS = 'team:manage_members',
  
  // Asset Management
  ASSET_CREATE = 'asset:create',
  ASSET_READ = 'asset:read',
  ASSET_UPDATE = 'asset:update',
  ASSET_DELETE = 'asset:delete',
  ASSET_MANAGE_QR = 'asset:manage_qr',
  ASSET_EXPORT = 'asset:export',
  
  // Form Template Management
  FORM_TEMPLATE_CREATE = 'form_template:create',
  FORM_TEMPLATE_READ = 'form_template:read',
  FORM_TEMPLATE_UPDATE = 'form_template:update',
  FORM_TEMPLATE_DELETE = 'form_template:delete',
  FORM_TEMPLATE_PUBLISH = 'form_template:publish',
  
  // Folder Management
  FOLDER_CREATE = 'folder:create',
  FOLDER_READ = 'folder:read',
  FOLDER_UPDATE = 'folder:update',
  FOLDER_DELETE = 'folder:delete',
  FOLDER_MANAGE_SCHEDULE = 'folder:manage_schedule',
  
  // Inspection Management
  INSPECTION_CREATE = 'inspection:create',
  INSPECTION_READ = 'inspection:read',
  INSPECTION_UPDATE = 'inspection:update',
  INSPECTION_DELETE = 'inspection:delete',
  INSPECTION_COMPLETE = 'inspection:complete',
  INSPECTION_APPROVE = 'inspection:approve',
  INSPECTION_ASSIGN = 'inspection:assign',
  
  // Report Management
  REPORT_CREATE = 'report:create',
  REPORT_READ = 'report:read',
  REPORT_UPDATE = 'report:update',
  REPORT_DELETE = 'report:delete',
  REPORT_EXPORT = 'report:export',
  REPORT_SCHEDULE = 'report:schedule',
  
  // Notification Management
  NOTIFICATION_CREATE = 'notification:create',
  NOTIFICATION_READ = 'notification:read',
  NOTIFICATION_UPDATE = 'notification:update',
  NOTIFICATION_DELETE = 'notification:delete',
  NOTIFICATION_SEND = 'notification:send',
  
  // System Administration
  SYSTEM_SETTINGS = 'system:settings',
  SYSTEM_BACKUP = 'system:backup',
  SYSTEM_RESTORE = 'system:restore',
  SYSTEM_LOGS = 'system:logs',
  SYSTEM_MONITORING = 'system:monitoring',
  
  // AI/ML Operations
  AI_ANALYZE_IMAGE = 'ai:analyze_image',
  AI_GENERATE_REPORT = 'ai:generate_report',
  AI_TRAIN_MODEL = 'ai:train_model',
  AI_MANAGE_MODELS = 'ai:manage_models',
  
  // File Operations
  FILE_UPLOAD = 'file:upload',
  FILE_DOWNLOAD = 'file:download',
  FILE_DELETE = 'file:delete',
  FILE_MANAGE_STORAGE = 'file:manage_storage',
  
  // Analytics and Reporting
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_EXPORT = 'analytics:export',
  ANALYTICS_ADVANCED = 'analytics:advanced',
  
  // Audit and Compliance
  AUDIT_VIEW = 'audit:view',
  AUDIT_EXPORT = 'audit:export',
  COMPLIANCE_MANAGE = 'compliance:manage'
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: UserPermission[];
  teamId?: string;
  avatar?: string;
  preferences: UserPreferences;
  lastLogin?: Date;
}

export interface LoginResponse {
  user: AuthenticatedUser;
  tokens: AuthTokens;
  message: string;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

export interface PasswordResetResponse {
  message: string;
  resetToken?: string; // Only for development/testing
}

export interface AuthSession {
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface SecurityEvent {
  id: string;
  userId?: string;
  eventType: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',
  PASSWORD_RESET_COMPLETED = 'password_reset_completed',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  TOKEN_REFRESHED = 'token_refreshed',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  PERMISSION_DENIED = 'permission_denied',
  MULTIPLE_LOGIN_ATTEMPTS = 'multiple_login_attempts',
  SESSION_EXPIRED = 'session_expired'
}

export interface RolePermissionMatrix {
  [UserRole.SUPER_ADMIN]: UserPermission[];
  [UserRole.ADMIN]: UserPermission[];
  [UserRole.MANAGER]: UserPermission[];
  [UserRole.INSPECTOR]: UserPermission[];
  [UserRole.VIEWER]: UserPermission[];
  [UserRole.GUEST]: UserPermission[];
}

// Default role-permission mappings
export const DEFAULT_ROLE_PERMISSIONS: RolePermissionMatrix = {
  [UserRole.SUPER_ADMIN]: Object.values(UserPermission),
  
  [UserRole.ADMIN]: [
    // User Management (limited)
    UserPermission.USER_CREATE,
    UserPermission.USER_READ,
    UserPermission.USER_UPDATE,
    UserPermission.USER_MANAGE_ROLES,
    
    // Team Management
    UserPermission.TEAM_CREATE,
    UserPermission.TEAM_READ,
    UserPermission.TEAM_UPDATE,
    UserPermission.TEAM_DELETE,
    UserPermission.TEAM_MANAGE_MEMBERS,
    
    // Asset Management
    UserPermission.ASSET_CREATE,
    UserPermission.ASSET_READ,
    UserPermission.ASSET_UPDATE,
    UserPermission.ASSET_DELETE,
    UserPermission.ASSET_MANAGE_QR,
    UserPermission.ASSET_EXPORT,
    
    // Form Template Management
    UserPermission.FORM_TEMPLATE_CREATE,
    UserPermission.FORM_TEMPLATE_READ,
    UserPermission.FORM_TEMPLATE_UPDATE,
    UserPermission.FORM_TEMPLATE_DELETE,
    UserPermission.FORM_TEMPLATE_PUBLISH,
    
    // Folder Management
    UserPermission.FOLDER_CREATE,
    UserPermission.FOLDER_READ,
    UserPermission.FOLDER_UPDATE,
    UserPermission.FOLDER_DELETE,
    UserPermission.FOLDER_MANAGE_SCHEDULE,
    
    // Inspection Management
    UserPermission.INSPECTION_CREATE,
    UserPermission.INSPECTION_READ,
    UserPermission.INSPECTION_UPDATE,
    UserPermission.INSPECTION_DELETE,
    UserPermission.INSPECTION_COMPLETE,
    UserPermission.INSPECTION_APPROVE,
    UserPermission.INSPECTION_ASSIGN,
    
    // Report Management
    UserPermission.REPORT_CREATE,
    UserPermission.REPORT_READ,
    UserPermission.REPORT_UPDATE,
    UserPermission.REPORT_DELETE,
    UserPermission.REPORT_EXPORT,
    UserPermission.REPORT_SCHEDULE,
    
    // Notification Management
    UserPermission.NOTIFICATION_CREATE,
    UserPermission.NOTIFICATION_READ,
    UserPermission.NOTIFICATION_UPDATE,
    UserPermission.NOTIFICATION_DELETE,
    UserPermission.NOTIFICATION_SEND,
    
    // AI/ML Operations
    UserPermission.AI_ANALYZE_IMAGE,
    UserPermission.AI_GENERATE_REPORT,
    
    // File Operations
    UserPermission.FILE_UPLOAD,
    UserPermission.FILE_DOWNLOAD,
    UserPermission.FILE_DELETE,
    
    // Analytics
    UserPermission.ANALYTICS_VIEW,
    UserPermission.ANALYTICS_EXPORT,
    UserPermission.ANALYTICS_ADVANCED,
    
    // Audit
    UserPermission.AUDIT_VIEW,
    UserPermission.AUDIT_EXPORT
  ],
  
  [UserRole.MANAGER]: [
    // User Management (limited)
    UserPermission.USER_READ,
    UserPermission.USER_UPDATE,
    
    // Team Management (limited)
    UserPermission.TEAM_READ,
    UserPermission.TEAM_UPDATE,
    UserPermission.TEAM_MANAGE_MEMBERS,
    
    // Asset Management
    UserPermission.ASSET_CREATE,
    UserPermission.ASSET_READ,
    UserPermission.ASSET_UPDATE,
    UserPermission.ASSET_MANAGE_QR,
    UserPermission.ASSET_EXPORT,
    
    // Form Template Management
    UserPermission.FORM_TEMPLATE_CREATE,
    UserPermission.FORM_TEMPLATE_READ,
    UserPermission.FORM_TEMPLATE_UPDATE,
    UserPermission.FORM_TEMPLATE_PUBLISH,
    
    // Folder Management
    UserPermission.FOLDER_CREATE,
    UserPermission.FOLDER_READ,
    UserPermission.FOLDER_UPDATE,
    UserPermission.FOLDER_MANAGE_SCHEDULE,
    
    // Inspection Management
    UserPermission.INSPECTION_CREATE,
    UserPermission.INSPECTION_READ,
    UserPermission.INSPECTION_UPDATE,
    UserPermission.INSPECTION_COMPLETE,
    UserPermission.INSPECTION_APPROVE,
    UserPermission.INSPECTION_ASSIGN,
    
    // Report Management
    UserPermission.REPORT_CREATE,
    UserPermission.REPORT_READ,
    UserPermission.REPORT_UPDATE,
    UserPermission.REPORT_EXPORT,
    UserPermission.REPORT_SCHEDULE,
    
    // Notification Management
    UserPermission.NOTIFICATION_CREATE,
    UserPermission.NOTIFICATION_READ,
    UserPermission.NOTIFICATION_SEND,
    
    // AI/ML Operations
    UserPermission.AI_ANALYZE_IMAGE,
    UserPermission.AI_GENERATE_REPORT,
    
    // File Operations
    UserPermission.FILE_UPLOAD,
    UserPermission.FILE_DOWNLOAD,
    
    // Analytics
    UserPermission.ANALYTICS_VIEW,
    UserPermission.ANALYTICS_EXPORT
  ],
  
  [UserRole.INSPECTOR]: [
    // User Management (self only)
    UserPermission.USER_READ,
    
    // Team Management (read only)
    UserPermission.TEAM_READ,
    
    // Asset Management (limited)
    UserPermission.ASSET_READ,
    UserPermission.ASSET_UPDATE,
    
    // Form Template Management (read only)
    UserPermission.FORM_TEMPLATE_READ,
    
    // Folder Management (limited)
    UserPermission.FOLDER_READ,
    
    // Inspection Management
    UserPermission.INSPECTION_CREATE,
    UserPermission.INSPECTION_READ,
    UserPermission.INSPECTION_UPDATE,
    UserPermission.INSPECTION_COMPLETE,
    
    // Report Management (limited)
    UserPermission.REPORT_READ,
    UserPermission.REPORT_EXPORT,
    
    // Notification Management (read only)
    UserPermission.NOTIFICATION_READ,
    
    // AI/ML Operations
    UserPermission.AI_ANALYZE_IMAGE,
    
    // File Operations
    UserPermission.FILE_UPLOAD,
    UserPermission.FILE_DOWNLOAD,
    
    // Analytics (limited)
    UserPermission.ANALYTICS_VIEW
  ],
  
  [UserRole.VIEWER]: [
    // User Management (self only)
    UserPermission.USER_READ,
    
    // Team Management (read only)
    UserPermission.TEAM_READ,
    
    // Asset Management (read only)
    UserPermission.ASSET_READ,
    
    // Form Template Management (read only)
    UserPermission.FORM_TEMPLATE_READ,
    
    // Folder Management (read only)
    UserPermission.FOLDER_READ,
    
    // Inspection Management (read only)
    UserPermission.INSPECTION_READ,
    
    // Report Management (read only)
    UserPermission.REPORT_READ,
    UserPermission.REPORT_EXPORT,
    
    // Notification Management (read only)
    UserPermission.NOTIFICATION_READ,
    
    // File Operations (download only)
    UserPermission.FILE_DOWNLOAD,
    
    // Analytics (limited)
    UserPermission.ANALYTICS_VIEW
  ],
  
  [UserRole.GUEST]: [
    // Very limited read-only access
    UserPermission.ASSET_READ,
    UserPermission.FORM_TEMPLATE_READ,
    UserPermission.INSPECTION_READ,
    UserPermission.REPORT_READ
  ]
};

export interface AuthMiddlewareOptions {
  required?: boolean;
  roles?: UserRole[];
  permissions?: UserPermission[];
  requireAll?: boolean; // If true, user must have ALL specified permissions
  teamAccess?: boolean; // If true, check team-based access
  ownershipCheck?: boolean; // If true, check if user owns the resource
}

export interface TeamAccessContext {
  userId: string;
  teamId?: string;
  resourceTeamId?: string;
  resourceOwnerId?: string;
}

export interface AuthContext {
  user: AuthenticatedUser;
  session?: AuthSession;
  permissions: UserPermission[];
  teamAccess: TeamAccessContext;
}