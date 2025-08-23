# JSG-Inspections Backend API & Middleware Architecture

## Executive Summary

This document outlines the comprehensive backend architecture for the JSG-Inspections application, designed to support cross-platform Flutter clients with robust API services, middleware layers, and seamless SurrealDB integration. The architecture emphasizes scalability, security, offline synchronization, and real-time capabilities.

## Technology Stack

### Core Technologies
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js with TypeScript
- **Database**: SurrealDB Embedded
- **Authentication**: JWT with refresh tokens
- **Real-time**: WebSocket (Socket.io)
- **File Storage**: Local filesystem with cloud backup
- **API Documentation**: OpenAPI 3.0 (Swagger)
- **Testing**: Jest with Supertest
- **Process Management**: PM2

### Supporting Libraries
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "surrealdb.js": "^0.11.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "multer": "^1.4.5",
    "socket.io": "^4.7.2",
    "helmet": "^7.0.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^6.10.0",
    "express-validator": "^7.0.1",
    "winston": "^3.10.0",
    "compression": "^1.7.4",
    "sharp": "^0.32.5",
    "node-cron": "^3.0.2",
    "swagger-ui-express": "^5.0.0",
    "@types/express": "^4.17.17",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/bcryptjs": "^2.4.2",
    "@types/multer": "^1.4.7",
    "@types/cors": "^2.8.13"
  },
  "devDependencies": {
    "typescript": "^5.1.6",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3",
    "@types/jest": "^29.5.3",
    "@types/supertest": "^2.0.12"
  }
}
```

## Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── asset.controller.ts
│   ├── form.controller.ts
│   ├── inspection.controller.ts
│   ├── report.controller.ts
│   └── sync.controller.ts
├── middleware/           # Custom middleware
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   ├── upload.middleware.ts
│   ├── error.middleware.ts
│   └── logging.middleware.ts
├── models/              # Data models and types
│   ├── user.model.ts
│   ├── asset.model.ts
│   ├── form.model.ts
│   ├── inspection.model.ts
│   └── report.model.ts
├── routes/              # API route definitions
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── asset.routes.ts
│   ├── form.routes.ts
│   ├── inspection.routes.ts
│   ├── report.routes.ts
│   └── sync.routes.ts
├── services/            # Business logic layer
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── asset.service.ts
│   ├── form.service.ts
│   ├── inspection.service.ts
│   ├── report.service.ts
│   ├── sync.service.ts
│   ├── notification.service.ts
│   └── ai.service.ts
├── database/            # Database layer
│   ├── connection.ts
│   ├── migrations/
│   ├── seeders/
│   └── queries/
├── utils/               # Utility functions
│   ├── logger.ts
│   ├── encryption.ts
│   ├── validation.ts
│   ├── file-handler.ts
│   └── response.ts
├── config/              # Configuration files
│   ├── database.ts
│   ├── auth.ts
│   ├── upload.ts
│   └── environment.ts
├── types/               # TypeScript type definitions
│   ├── api.types.ts
│   ├── database.types.ts
│   └── auth.types.ts
├── tests/               # Test files
│   ├── unit/
│   ├── integration/
│   └── fixtures/
└── app.ts               # Application entry point
```

## API Architecture

### RESTful API Design

#### Authentication Endpoints
```typescript
// auth.routes.ts
interface AuthRoutes {
  'POST /api/auth/register': RegisterRequest;
  'POST /api/auth/login': LoginRequest;
  'POST /api/auth/refresh': RefreshTokenRequest;
  'POST /api/auth/logout': LogoutRequest;
  'POST /api/auth/forgot-password': ForgotPasswordRequest;
  'POST /api/auth/reset-password': ResetPasswordRequest;
  'GET /api/auth/verify-email/:token': VerifyEmailRequest;
}

// Request/Response Types
interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationId?: string;
}

interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: UserProfile;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}
```

#### User Management Endpoints
```typescript
// user.routes.ts
interface UserRoutes {
  'GET /api/users/profile': GetProfileRequest;
  'PUT /api/users/profile': UpdateProfileRequest;
  'GET /api/users/team': GetTeamMembersRequest;
  'POST /api/users/invite': InviteUserRequest;
  'PUT /api/users/:id/role': UpdateUserRoleRequest;
  'DELETE /api/users/:id': DeleteUserRequest;
}

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  permissions: Permission[];
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Asset Management Endpoints
```typescript
// asset.routes.ts
interface AssetRoutes {
  'GET /api/assets': GetAssetsRequest;
  'POST /api/assets': CreateAssetRequest;
  'GET /api/assets/:id': GetAssetRequest;
  'PUT /api/assets/:id': UpdateAssetRequest;
  'DELETE /api/assets/:id': DeleteAssetRequest;
  'POST /api/assets/:id/qr-code': GenerateQRCodeRequest;
  'GET /api/assets/search': SearchAssetsRequest;
}

interface Asset {
  id: string;
  name: string;
  type: AssetType;
  description?: string;
  location: Location;
  qrCode?: string;
  customFields: Record<string, any>;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Form Template Endpoints
```typescript
// form.routes.ts
interface FormRoutes {
  'GET /api/forms': GetFormsRequest;
  'POST /api/forms': CreateFormRequest;
  'GET /api/forms/:id': GetFormRequest;
  'PUT /api/forms/:id': UpdateFormRequest;
  'DELETE /api/forms/:id': DeleteFormRequest;
  'POST /api/forms/:id/duplicate': DuplicateFormRequest;
  'GET /api/forms/:id/preview': PreviewFormRequest;
}

interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  questions: Question[];
  scoring: ScoringConfig;
  organizationId: string;
  isActive: boolean;
  version: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Inspection Endpoints
```typescript
// inspection.routes.ts
interface InspectionRoutes {
  'GET /api/inspections': GetInspectionsRequest;
  'POST /api/inspections': CreateInspectionRequest;
  'GET /api/inspections/:id': GetInspectionRequest;
  'PUT /api/inspections/:id': UpdateInspectionRequest;
  'POST /api/inspections/:id/complete': CompleteInspectionRequest;
  'POST /api/inspections/:id/photos': UploadPhotosRequest;
  'DELETE /api/inspections/:id/photos/:photoId': DeletePhotoRequest;
  'GET /api/inspections/:id/report': GenerateReportRequest;
}

interface Inspection {
  id: string;
  formId: string;
  assetId: string;
  folderId?: string;
  status: InspectionStatus;
  answers: Answer[];
  photos: Photo[];
  score?: number;
  priority?: Priority;
  notes?: string;
  inspectorId: string;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Synchronization Endpoints
```typescript
// sync.routes.ts
interface SyncRoutes {
  'POST /api/sync/upload': UploadSyncDataRequest;
  'GET /api/sync/download': DownloadSyncDataRequest;
  'POST /api/sync/conflict-resolution': ResolveConflictsRequest;
  'GET /api/sync/status': GetSyncStatusRequest;
}

interface SyncData {
  lastSyncTimestamp: Date;
  changes: {
    inspections: Inspection[];
    assets: Asset[];
    forms: FormTemplate[];
    deletions: string[];
  };
  conflicts: SyncConflict[];
}
```

## Middleware Architecture

### Authentication Middleware
```typescript
// auth.middleware.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

export class AuthMiddleware {
  static async authenticate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await UserService.findById(decoded.userId);
      
      if (!user) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  static authorize(permissions: Permission[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const hasPermission = permissions.some(permission => 
        req.user!.permissions.includes(permission)
      );

      if (!hasPermission) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      next();
    };
  }
}
```

### Validation Middleware
```typescript
// validation.middleware.ts
import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export class ValidationMiddleware {
  static validateRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }
    
    next();
  }

  static validateInspectionCreation() {
    return [
      body('formId').isUUID().withMessage('Valid form ID required'),
      body('assetId').isUUID().withMessage('Valid asset ID required'),
      body('folderId').optional().isUUID(),
      body('answers').isArray().withMessage('Answers must be an array'),
      body('answers.*.questionId').isUUID(),
      body('answers.*.value').notEmpty(),
      this.validateRequest
    ];
  }

  static validateAssetCreation() {
    return [
      body('name').trim().isLength({ min: 1, max: 255 }),
      body('type').isIn(['building', 'equipment', 'vehicle', 'person']),
      body('location.address').optional().isString(),
      body('location.coordinates.lat').optional().isFloat({ min: -90, max: 90 }),
      body('location.coordinates.lng').optional().isFloat({ min: -180, max: 180 }),
      this.validateRequest
    ];
  }
}
```

### File Upload Middleware
```typescript
// upload.middleware.ts
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

interface MulterRequest extends Request {
  files?: Express.Multer.File[];
}

export class UploadMiddleware {
  private static storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'uploads', 'temp');
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  private static fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  };

  static upload = multer({
    storage: this.storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 10
    },
    fileFilter: this.fileFilter
  });

  static async processImages(
    req: MulterRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.files || req.files.length === 0) {
        next();
        return;
      }

      const processedFiles = await Promise.all(
        req.files.map(async (file) => {
          if (file.mimetype.startsWith('image/')) {
            const outputPath = file.path.replace(/\.[^/.]+$/, '_processed.jpg');
            
            await sharp(file.path)
              .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality: 85 })
              .toFile(outputPath);

            return {
              ...file,
              path: outputPath,
              filename: file.filename.replace(/\.[^/.]+$/, '_processed.jpg')
            };
          }
          return file;
        })
      );

      req.files = processedFiles;
      next();
    } catch (error) {
      next(error);
    }
  }
}
```

### Error Handling Middleware
```typescript
// error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ErrorMiddleware {
  static handleError(
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    Logger.error('API Error:', {
      error: message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(statusCode).json({
      success: false,
      error: {
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      }
    });
  }

  static notFound(req: Request, res: Response): void {
    res.status(404).json({
      success: false,
      error: {
        message: `Route ${req.originalUrl} not found`
      }
    });
  }

  static asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}
```

## Service Layer Architecture

### Base Service Class
```typescript
// base.service.ts
import { Surreal } from 'surrealdb.js';
import { DatabaseConnection } from '../database/connection';

export abstract class BaseService {
  protected db: Surreal;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  protected async executeQuery<T>(query: string, params?: Record<string, any>): Promise<T[]> {
    try {
      const result = await this.db.query(query, params);
      return result[0].result || [];
    } catch (error) {
      throw new Error(`Database query failed: ${error}`);
    }
  }

  protected async executeTransaction<T>(
    queries: Array<{ query: string; params?: Record<string, any> }>
  ): Promise<T[]> {
    try {
      await this.db.query('BEGIN TRANSACTION');
      
      const results = [];
      for (const { query, params } of queries) {
        const result = await this.db.query(query, params);
        results.push(result[0].result);
      }
      
      await this.db.query('COMMIT TRANSACTION');
      return results;
    } catch (error) {
      await this.db.query('ROLLBACK TRANSACTION');
      throw new Error(`Transaction failed: ${error}`);
    }
  }
}
```

### Inspection Service
```typescript
// inspection.service.ts
import { BaseService } from './base.service';
import { Inspection, InspectionStatus, Answer } from '../models/inspection.model';
import { NotificationService } from './notification.service';

export class InspectionService extends BaseService {
  async createInspection(data: Partial<Inspection>): Promise<Inspection> {
    const inspection: Partial<Inspection> = {
      ...data,
      id: crypto.randomUUID(),
      status: InspectionStatus.IN_PROGRESS,
      startedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const query = `
      CREATE inspections CONTENT $inspection
      RETURN *
    `;

    const result = await this.executeQuery<Inspection>(query, { inspection });
    
    // Send notification to team members
    await NotificationService.notifyInspectionStarted(result[0]);
    
    return result[0];
  }

  async updateInspection(id: string, data: Partial<Inspection>): Promise<Inspection> {
    const updateData = {
      ...data,
      updatedAt: new Date()
    };

    const query = `
      UPDATE inspections:$id MERGE $data
      RETURN *
    `;

    const result = await this.executeQuery<Inspection>(query, { id, data: updateData });
    return result[0];
  }

  async completeInspection(id: string, finalAnswers: Answer[]): Promise<Inspection> {
    const completionData = {
      status: InspectionStatus.COMPLETED,
      answers: finalAnswers,
      completedAt: new Date(),
      updatedAt: new Date()
    };

    // Calculate score based on answers
    const score = await this.calculateInspectionScore(id, finalAnswers);
    completionData['score'] = score;

    const query = `
      UPDATE inspections:$id MERGE $data
      RETURN *
    `;

    const result = await this.executeQuery<Inspection>(query, { 
      id, 
      data: completionData 
    });

    // Generate and store report
    await this.generateInspectionReport(result[0]);
    
    // Send completion notification
    await NotificationService.notifyInspectionCompleted(result[0]);

    return result[0];
  }

  async getInspectionsByUser(userId: string, filters?: any): Promise<Inspection[]> {
    let query = `
      SELECT * FROM inspections 
      WHERE inspectorId = $userId
    `;

    const params: any = { userId };

    if (filters?.status) {
      query += ` AND status = $status`;
      params.status = filters.status;
    }

    if (filters?.dateFrom) {
      query += ` AND createdAt >= $dateFrom`;
      params.dateFrom = filters.dateFrom;
    }

    if (filters?.dateTo) {
      query += ` AND createdAt <= $dateTo`;
      params.dateTo = filters.dateTo;
    }

    query += ` ORDER BY createdAt DESC`;

    return this.executeQuery<Inspection>(query, params);
  }

  private async calculateInspectionScore(inspectionId: string, answers: Answer[]): Promise<number> {
    // Get form scoring configuration
    const formQuery = `
      SELECT scoring FROM forms 
      WHERE id = (SELECT formId FROM inspections:$inspectionId)
    `;
    
    const formResult = await this.executeQuery(formQuery, { inspectionId });
    const scoring = formResult[0]?.scoring;

    if (!scoring || !scoring.enabled) {
      return 0;
    }

    let totalScore = 0;
    let totalWeight = 0;

    for (const answer of answers) {
      const questionWeight = scoring.weights[answer.questionId] || 1;
      const answerScore = this.getAnswerScore(answer, scoring);
      
      totalScore += answerScore * questionWeight;
      totalWeight += questionWeight;
    }

    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
  }

  private getAnswerScore(answer: Answer, scoring: any): number {
    // Implement scoring logic based on answer type and value
    switch (answer.type) {
      case 'single_select':
        return scoring.optionScores[answer.value] || 0;
      case 'multi_select':
        const values = Array.isArray(answer.value) ? answer.value : [answer.value];
        return values.reduce((sum, val) => sum + (scoring.optionScores[val] || 0), 0) / values.length;
      case 'yes_no':
        return answer.value === 'yes' ? 100 : 0;
      case 'rating':
        return (parseInt(answer.value) / 5) * 100;
      default:
        return 0;
    }
  }

  private async generateInspectionReport(inspection: Inspection): Promise<void> {
    // Generate PDF report logic will be implemented here
    // This will integrate with the report generation service
  }
}
```

### Synchronization Service
```typescript
// sync.service.ts
import { BaseService } from './base.service';
import { SyncData, SyncConflict } from '../types/api.types';

export class SyncService extends BaseService {
  async uploadSyncData(userId: string, syncData: SyncData): Promise<{ conflicts: SyncConflict[] }> {
    const conflicts: SyncConflict[] = [];
    
    try {
      await this.db.query('BEGIN TRANSACTION');

      // Process inspections
      for (const inspection of syncData.changes.inspections) {
        const conflict = await this.processInspectionSync(inspection, userId);
        if (conflict) conflicts.push(conflict);
      }

      // Process assets
      for (const asset of syncData.changes.assets) {
        const conflict = await this.processAssetSync(asset, userId);
        if (conflict) conflicts.push(conflict);
      }

      // Process deletions
      for (const deletionId of syncData.changes.deletions) {
        await this.processDeletion(deletionId, userId);
      }

      if (conflicts.length === 0) {
        await this.db.query('COMMIT TRANSACTION');
      } else {
        await this.db.query('ROLLBACK TRANSACTION');
      }

      return { conflicts };
    } catch (error) {
      await this.db.query('ROLLBACK TRANSACTION');
      throw error;
    }
  }

  async downloadSyncData(userId: string, lastSyncTimestamp: Date): Promise<SyncData> {
    const query = `
      LET $userOrg = (SELECT organizationId FROM users:$userId);
      
      SELECT {
        inspections: (SELECT * FROM inspections WHERE 
          organizationId = $userOrg.organizationId AND 
          updatedAt > $lastSync
        ),
        assets: (SELECT * FROM assets WHERE 
          organizationId = $userOrg.organizationId AND 
          updatedAt > $lastSync
        ),
        forms: (SELECT * FROM forms WHERE 
          organizationId = $userOrg.organizationId AND 
          updatedAt > $lastSync
        ),
        deletions: (SELECT id FROM audit_logs WHERE 
          action = 'DELETE' AND 
          organizationId = $userOrg.organizationId AND 
          createdAt > $lastSync
        )
      }
    `;

    const result = await this.executeQuery(query, {
      userId,
      lastSync: lastSyncTimestamp
    });

    return {
      lastSyncTimestamp: new Date(),
      changes: result[0],
      conflicts: []
    };
  }

  private async processInspectionSync(inspection: any, userId: string): Promise<SyncConflict | null> {
    const existingQuery = `
      SELECT * FROM inspections:$id
    `;
    
    const existing = await this.executeQuery(existingQuery, { id: inspection.id });
    
    if (existing.length > 0) {
      const existingInspection = existing[0];
      
      // Check for conflicts
      if (existingInspection.updatedAt > inspection.updatedAt) {
        return {
          id: inspection.id,
          type: 'inspection',
          localVersion: inspection,
          serverVersion: existingInspection,
          conflictFields: this.identifyConflictFields(inspection, existingInspection)
        };
      }
    }

    // No conflict, proceed with update/insert
    const upsertQuery = `
      UPDATE inspections:$id CONTENT $inspection
    `;
    
    await this.executeQuery(upsertQuery, { id: inspection.id, inspection });
    return null;
  }

  private identifyConflictFields(local: any, server: any): string[] {
    const conflicts: string[] = [];
    const fieldsToCheck = ['answers', 'status', 'score', 'notes'];
    
    for (const field of fieldsToCheck) {
      if (JSON.stringify(local[field]) !== JSON.stringify(server[field])) {
        conflicts.push(field);
      }
    }
    
    return conflicts;
  }
}
```

## Real-time Communication

### WebSocket Integration
```typescript
// websocket.service.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

export class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST']
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        socket.userId = decoded.userId;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);
      this.connectedUsers.set(socket.userId, socket.id);

      socket.join(`user:${socket.userId}`);
      socket.join(`org:${socket.organizationId}`);

      socket.on('inspection:start', (data) => {
        this.broadcastToOrganization(socket.organizationId, 'inspection:started', {
          inspectionId: data.inspectionId,
          inspector: socket.userId,
          timestamp: new Date()
        });
      });

      socket.on('inspection:update', (data) => {
        this.broadcastToOrganization(socket.organizationId, 'inspection:updated', data);
      });

      socket.on('inspection:complete', (data) => {
        this.broadcastToOrganization(socket.organizationId, 'inspection:completed', data);
      });

      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        this.connectedUsers.delete(socket.userId);
      });
    });
  }

  broadcastToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  broadcastToOrganization(organizationId: string, event: string, data: any): void {
    this.io.to(`org:${organizationId}`).emit(event, data);
  }

  notifyInspectionAssigned(userId: string, inspection: any): void {
    this.broadcastToUser(userId, 'inspection:assigned', {
      inspection,
      timestamp: new Date()
    });
  }
}
```

## Database Integration

### SurrealDB Connection Manager
```typescript
// database/connection.ts
import { Surreal } from 'surrealdb.js';

export class DatabaseConnection {
  private static instance: Surreal;
  private static isConnected: boolean = false;

  static async getInstance(): Promise<Surreal> {
    if (!this.instance) {
      this.instance = new Surreal();
      await this.connect();
    }
    return this.instance;
  }

  private static async connect(): Promise<void> {
    try {
      const dbConfig = {
        endpoint: process.env.SURREALDB_ENDPOINT || 'memory',
        namespace: process.env.SURREALDB_NAMESPACE || 'jsg_inspections',
        database: process.env.SURREALDB_DATABASE || 'main',
        username: process.env.SURREALDB_USERNAME,
        password: process.env.SURREALDB_PASSWORD
      };

      await this.instance.connect(dbConfig.endpoint);
      await this.instance.use({
        ns: dbConfig.namespace,
        db: dbConfig.database
      });

      if (dbConfig.username && dbConfig.password) {
        await this.instance.signin({
          user: dbConfig.username,
          pass: dbConfig.password
        });
      }

      this.isConnected = true;
      console.log('Connected to SurrealDB');
      
      // Run migrations
      await this.runMigrations();
    } catch (error) {
      console.error('Failed to connect to SurrealDB:', error);
      throw error;
    }
  }

  private static async runMigrations(): Promise<void> {
    // Define database schema and indexes
    const migrations = [
      // Users table
      `DEFINE TABLE users SCHEMAFULL;`,
      `DEFINE FIELD email ON users TYPE string ASSERT string::is::email($value);`,
      `DEFINE FIELD password ON users TYPE string;`,
      `DEFINE FIELD firstName ON users TYPE string;`,
      `DEFINE FIELD lastName ON users TYPE string;`,
      `DEFINE FIELD role ON users TYPE string ASSERT $value IN ['admin', 'inspector', 'viewer'];`,
      `DEFINE FIELD organizationId ON users TYPE record(organizations);`,
      `DEFINE FIELD permissions ON users TYPE array<string>;`,
      `DEFINE FIELD isActive ON users TYPE bool DEFAULT true;`,
      `DEFINE FIELD lastLoginAt ON users TYPE datetime;`,
      `DEFINE FIELD createdAt ON users TYPE datetime DEFAULT time::now();`,
      `DEFINE FIELD updatedAt ON users TYPE datetime DEFAULT time::now();`,
      `DEFINE INDEX idx_users_email ON users COLUMNS email UNIQUE;`,
      
      // Assets table
      `DEFINE TABLE assets SCHEMAFULL;`,
      `DEFINE FIELD name ON assets TYPE string;`,
      `DEFINE FIELD type ON assets TYPE string ASSERT $value IN ['building', 'equipment', 'vehicle', 'person'];`,
      `DEFINE FIELD description ON assets TYPE string;`,
      `DEFINE FIELD location ON assets TYPE object;`,
      `DEFINE FIELD qrCode ON assets TYPE string;`,
      `DEFINE FIELD customFields ON assets TYPE object;`,
      `DEFINE FIELD organizationId ON assets TYPE record(organizations);`,
      `DEFINE FIELD createdBy ON assets TYPE record(users);`,
      `DEFINE FIELD createdAt ON assets TYPE datetime DEFAULT time::now();`,
      `DEFINE FIELD updatedAt ON assets TYPE datetime DEFAULT time::now();`,
      `DEFINE INDEX idx_assets_qr ON assets COLUMNS qrCode UNIQUE;`,
      `DEFINE INDEX idx_assets_org ON assets COLUMNS organizationId;`,
      
      // Inspections table
      `DEFINE TABLE inspections SCHEMAFULL;`,
      `DEFINE FIELD formId ON inspections TYPE record(forms);`,
      `DEFINE FIELD assetId ON inspections TYPE record(assets);`,
      `DEFINE FIELD folderId ON inspections TYPE record(folders);`,
      `DEFINE FIELD status ON inspections TYPE string ASSERT $value IN ['draft', 'in_progress', 'completed', 'cancelled'];`,
      `DEFINE FIELD answers ON inspections TYPE array<object>;`,
      `DEFINE FIELD photos ON inspections TYPE array<object>;`,
      `DEFINE FIELD score ON inspections TYPE number;`,
      `DEFINE FIELD priority ON inspections TYPE string ASSERT $value IN ['na', 'good', 'low', 'medium', 'high'];`,
      `DEFINE FIELD notes ON inspections TYPE string;`,
      `DEFINE FIELD inspectorId ON inspections TYPE record(users);`,
      `DEFINE FIELD startedAt ON inspections TYPE datetime;`,
      `DEFINE FIELD completedAt ON inspections TYPE datetime;`,
      `DEFINE FIELD createdAt ON inspections TYPE datetime DEFAULT time::now();`,
      `DEFINE FIELD updatedAt ON inspections TYPE datetime DEFAULT time::now();`,
      `DEFINE INDEX idx_inspections_inspector ON inspections COLUMNS inspectorId;`,
      `DEFINE INDEX idx_inspections_asset ON inspections COLUMNS assetId;`,
      `DEFINE INDEX idx_inspections_status ON inspections COLUMNS status;`
    ];

    for (const migration of migrations) {
      try {
        await this.instance.query(migration);
      } catch (error) {
        console.error(`Migration failed: ${migration}`, error);
      }
    }
  }

  static async disconnect(): Promise<void> {
    if (this.instance && this.isConnected) {
      await this.instance.close();
      this.isConnected = false;
      console.log('Disconnected from SurrealDB');
    }
  }

  static isConnectionActive(): boolean {
    return this.isConnected;
  }
}
```

## Security Implementation

### JWT Token Management
```typescript
// auth.service.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserService } from './user.service';

export class AuthService {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';

  static async login(email: string, password: string): Promise<{
    user: any;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await UserService.findByEmail(email);
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token in database
    await this.storeRefreshToken(user.id, refreshToken);
    
    // Update last login
    await UserService.updateLastLogin(user.id);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }

  static generateAccessToken(user: any): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        permissions: user.permissions
      },
      process.env.JWT_SECRET!,
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    );
  }

  static generateRefreshToken(user: any): string {
    return jwt.sign(
      { userId: user.id, tokenType: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );
  }

  static async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      // Verify refresh token exists in database
      const isValidToken = await this.verifyRefreshToken(decoded.userId, refreshToken);
      if (!isValidToken) {
        throw new Error('Invalid refresh token');
      }

      const user = await UserService.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Replace old refresh token
      await this.replaceRefreshToken(user.id, refreshToken, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  private static async storeRefreshToken(userId: string, token: string): Promise<void> {
    const hashedToken = await bcrypt.hash(token, 10);
    
    const query = `
      CREATE refresh_tokens CONTENT {
        userId: users:$userId,
        token: $hashedToken,
        expiresAt: time::now() + 7d,
        createdAt: time::now()
      }
    `;
    
    await DatabaseConnection.getInstance().then(db => 
      db.query(query, { userId, hashedToken })
    );
  }

  private static sanitizeUser(user: any): any {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
```

## Performance Optimization

### Caching Strategy
```typescript
// cache.service.ts
import NodeCache from 'node-cache';

export class CacheService {
  private static instance: NodeCache;
  private static readonly DEFAULT_TTL = 300; // 5 minutes

  static getInstance(): NodeCache {
    if (!this.instance) {
      this.instance = new NodeCache({
        stdTTL: this.DEFAULT_TTL,
        checkperiod: 60,
        useClones: false
      });
    }
    return this.instance;
  }

  static async get<T>(key: string): Promise<T | null> {
    const cache = this.getInstance();
    const value = cache.get<T>(key);
    return value || null;
  }

  static async set(key: string, value: any, ttl?: number): Promise<void> {
    const cache = this.getInstance();
    cache.set(key, value, ttl || this.DEFAULT_TTL);
  }

  static async del(key: string): Promise<void> {
    const cache = this.getInstance();
    cache.del(key);
  }

  static async flush(): Promise<void> {
    const cache = this.getInstance();
    cache.flushAll();
  }

  // Cache patterns for common operations
  static getUserCacheKey(userId: string): string {
    return `user:${userId}`;
  }

  static getFormCacheKey(formId: string): string {
    return `form:${formId}`;
  }

  static getAssetCacheKey(assetId: string): string {
    return `asset:${assetId}`;
  }

  static getInspectionsCacheKey(userId: string, filters: string): string {
    return `inspections:${userId}:${filters}`;
  }
}
```

## API Documentation

### OpenAPI Specification
```typescript
// swagger.config.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JSG-Inspections API',
      version: '1.0.0',
      description: 'Comprehensive inspection management API',
      contact: {
        name: 'JSG Inspections Team',
        email: 'support@jsginspections.com'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'inspector', 'viewer'] },
            organizationId: { type: 'string', format: 'uuid' },
            permissions: { type: 'array', items: { type: 'string' } },
            isActive: { type: 'boolean' },
            lastLoginAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Inspection: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            formId: { type: 'string', format: 'uuid' },
            assetId: { type: 'string', format: 'uuid' },
            folderId: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['draft', 'in_progress', 'completed', 'cancelled'] },
            answers: { type: 'array', items: { $ref: '#/components/schemas/Answer' } },
            photos: { type: 'array', items: { $ref: '#/components/schemas/Photo' } },
            score: { type: 'number', minimum: 0, maximum: 100 },
            priority: { type: 'string', enum: ['na', 'good', 'low', 'medium', 'high'] },
            notes: { type: 'string' },
            inspectorId: { type: 'string', format: 'uuid' },
            startedAt: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts']
};

export const specs = swaggerJsdoc(options);
export const swaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }'
};
```

## Deployment Configuration

### Production Setup
```typescript
// app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { DatabaseConnection } from './database/connection';
import { WebSocketService } from './services/websocket.service';
import { ErrorMiddleware } from './middleware/error.middleware';
import { Logger } from './utils/logger';

class Application {
  private app: express.Application;
  private server: any;
  private wsService: WebSocketService;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use('/api/', limiter);

    // Body parsing and compression
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    this.app.use((req, res, next) => {
      Logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  private setupRoutes(): void {
    // API routes
    this.app.use('/api/auth', require('./routes/auth.routes'));
    this.app.use('/api/users', require('./routes/user.routes'));
    this.app.use('/api/assets', require('./routes/asset.routes'));
    this.app.use('/api/forms', require('./routes/form.routes'));
    this.app.use('/api/inspections', require('./routes/inspection.routes'));
    this.app.use('/api/reports', require('./routes/report.routes'));
    this.app.use('/api/sync', require('./routes/sync.routes'));

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: DatabaseConnection.isConnectionActive()
      });
    });

    // API documentation
    if (process.env.NODE_ENV !== 'production') {
      const swaggerUi = require('swagger-ui-express');
      const { specs, swaggerUiOptions } = require('./swagger.config');
      this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));
    }
  }

  private setupErrorHandling(): void {
    this.app.use(ErrorMiddleware.notFound);
    this.app.use(ErrorMiddleware.handleError);
  }

  async start(): Promise<void> {
    try {
      // Initialize database connection
      await DatabaseConnection.getInstance();
      
      const port = process.env.PORT || 3000;
      this.server = this.app.listen(port, () => {
        Logger.info(`Server running on port ${port}`);
      });

      // Initialize WebSocket service
      this.wsService = new WebSocketService(this.server);

      // Graceful shutdown
      process.on('SIGTERM', this.gracefulShutdown.bind(this));
      process.on('SIGINT', this.gracefulShutdown.bind(this));
    } catch (error) {
      Logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private async gracefulShutdown(): Promise<void> {
    Logger.info('Received shutdown signal, closing server gracefully...');
    
    this.server.close(async () => {
      await DatabaseConnection.disconnect();
      Logger.info('Server closed successfully');
      process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
      Logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  }
}

// Start the application
const app = new Application();
app.start().catch(error => {
  Logger.error('Application startup failed:', error);
  process.exit(1);
});
```

## Conclusion

This backend architecture provides a robust, scalable foundation for the JSG-Inspections application with:

- **RESTful API Design** with comprehensive endpoints for all inspection operations
- **Layered Architecture** with clear separation between controllers, services, and data layers
- **Real-time Communication** via WebSocket for live updates and notifications
- **Offline Synchronization** with conflict resolution for mobile-first operations
- **Security-First Approach** with JWT authentication, input validation, and data encryption
- **Performance Optimization** through caching, compression, and efficient database queries
- **Comprehensive Error Handling** with proper logging and user-friendly error responses
- **API Documentation** with OpenAPI/Swagger for developer experience
- **Production-Ready Configuration** with security middleware, rate limiting, and monitoring

The architecture is designed to scale horizontally and integrate seamlessly with the Flutter frontend and SurrealDB database while maintaining high performance and security standards.