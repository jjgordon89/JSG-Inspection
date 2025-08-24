import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JSG-Inspections API',
      version: '1.0.0',
      description: 'Comprehensive inspection management API for cross-platform applications',
      contact: {
        name: 'JSG Inspections Team',
        email: 'support@jsginspections.com',
        url: 'https://jsginspections.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || `http://localhost:${config.server.port}`,
        description: 'Development server'
      },
      {
        url: 'https://api.jsginspections.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        },
        refreshToken: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Refresh token for obtaining new access tokens'
        }
      },
      schemas: {
        // Authentication Schemas
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'User password'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
                expiresIn: { type: 'number' }
              }
            }
          }
        },
        
        // User Schemas
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'inspector', 'viewer'],
              description: 'User role in the system'
            },
            teamId: { type: 'string', format: 'uuid' },
            permissions: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of user permissions'
            },
            isActive: { type: 'boolean' },
            lastLoginAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateUserRequest: {
          type: 'object',
          required: ['email', 'firstName', 'lastName', 'role'],
          properties: {
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'inspector', 'viewer']
            },
            teamId: { type: 'string', format: 'uuid' },
            permissions: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        },
        
        // Asset Schemas
        Asset: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            type: {
              type: 'string',
              enum: ['equipment', 'building', 'vehicle', 'tool', 'person'],
              description: 'Type of asset'
            },
            qrCode: { type: 'string' },
            location: {
              type: 'object',
              properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' },
                address: { type: 'string' }
              }
            },
            metadata: {
              type: 'object',
              additionalProperties: true,
              description: 'Additional asset metadata'
            },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateAssetRequest: {
          type: 'object',
          required: ['name', 'type'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            type: {
              type: 'string',
              enum: ['equipment', 'building', 'vehicle', 'tool', 'person']
            },
            location: {
              type: 'object',
              properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' },
                address: { type: 'string' }
              }
            },
            metadata: {
              type: 'object',
              additionalProperties: true
            }
          }
        },
        
        // Form Schemas
        Form: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            version: { type: 'string' },
            fields: {
              type: 'array',
              items: { $ref: '#/components/schemas/FormField' }
            },
            isActive: { type: 'boolean' },
            createdBy: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        FormField: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: {
              type: 'string',
              enum: ['text', 'number', 'boolean', 'select', 'multiselect', 'date', 'photo', 'signature']
            },
            label: { type: 'string' },
            required: { type: 'boolean' },
            options: {
              type: 'array',
              items: { type: 'string' }
            },
            validation: {
              type: 'object',
              properties: {
                min: { type: 'number' },
                max: { type: 'number' },
                pattern: { type: 'string' }
              }
            }
          }
        },
        
        // Inspection Schemas
        Inspection: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            formId: { type: 'string', format: 'uuid' },
            assetId: { type: 'string', format: 'uuid' },
            folderId: { type: 'string', format: 'uuid' },
            status: {
              type: 'string',
              enum: ['draft', 'in_progress', 'completed', 'cancelled'],
              description: 'Current status of the inspection'
            },
            answers: {
              type: 'array',
              items: { $ref: '#/components/schemas/Answer' }
            },
            photos: {
              type: 'array',
              items: { $ref: '#/components/schemas/Photo' }
            },
            score: {
              type: 'object',
              properties: {
                percentage: { type: 'number', minimum: 0, maximum: 100 },
                points: { type: 'number' },
                maxPoints: { type: 'number' }
              }
            },
            priority: {
              type: 'string',
              enum: ['na', 'good', 'low', 'medium', 'high'],
              description: 'Priority level based on inspection results'
            },
            notes: { type: 'string' },
            inspectorId: { type: 'string', format: 'uuid' },
            startedAt: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Answer: {
          type: 'object',
          properties: {
            fieldId: { type: 'string' },
            value: {
              oneOf: [
                { type: 'string' },
                { type: 'number' },
                { type: 'boolean' },
                { type: 'array', items: { type: 'string' } }
              ]
            },
            notes: { type: 'string' }
          }
        },
        Photo: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            filename: { type: 'string' },
            url: { type: 'string' },
            caption: { type: 'string' },
            fieldId: { type: 'string' },
            metadata: {
              type: 'object',
              properties: {
                size: { type: 'number' },
                mimeType: { type: 'string' },
                dimensions: {
                  type: 'object',
                  properties: {
                    width: { type: 'number' },
                    height: { type: 'number' }
                  }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateInspectionRequest: {
          type: 'object',
          required: ['formId', 'assetId'],
          properties: {
            formId: { type: 'string', format: 'uuid' },
            assetId: { type: 'string', format: 'uuid' },
            folderId: { type: 'string', format: 'uuid' },
            notes: { type: 'string' }
          }
        },
        
        // Folder Schemas
        Folder: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            type: {
              type: 'string',
              enum: ['workflow', 'schedule', 'project'],
              description: 'Type of folder organization'
            },
            parentId: { type: 'string', format: 'uuid' },
            teamId: { type: 'string', format: 'uuid' },
            settings: {
              type: 'object',
              properties: {
                autoAssign: { type: 'boolean' },
                notifications: { type: 'boolean' },
                deadline: { type: 'string', format: 'date-time' }
              }
            },
            isActive: { type: 'boolean' },
            createdBy: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        
        // Report Schemas
        Report: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            type: {
              type: 'string',
              enum: ['inspection', 'summary', 'analytics', 'compliance']
            },
            content: { type: 'string' },
            format: {
              type: 'string',
              enum: ['pdf', 'html', 'json']
            },
            filters: {
              type: 'object',
              additionalProperties: true
            },
            generatedBy: { type: 'string', format: 'uuid' },
            generatedAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time' }
          }
        },
        
        // Sync Schemas
        SyncRequest: {
          type: 'object',
          properties: {
            lastSyncAt: { type: 'string', format: 'date-time' },
            deviceId: { type: 'string' },
            changes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  table: { type: 'string' },
                  operation: {
                    type: 'string',
                    enum: ['create', 'update', 'delete']
                  },
                  data: { type: 'object' },
                  timestamp: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        SyncResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            conflicts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  table: { type: 'string' },
                  id: { type: 'string' },
                  serverData: { type: 'object' },
                  clientData: { type: 'object' },
                  resolution: {
                    type: 'string',
                    enum: ['server_wins', 'client_wins', 'manual']
                  }
                }
              }
            },
            serverChanges: {
              type: 'array',
              items: { type: 'object' }
            },
            lastSyncAt: { type: 'string', format: 'date-time' }
          }
        },
        
        // Common Response Schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'object' }
              }
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                items: { type: 'array' },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'number' },
                    limit: { type: 'number' },
                    total: { type: 'number' },
                    totalPages: { type: 'number' },
                    hasNext: { type: 'boolean' },
                    hasPrev: { type: 'boolean' }
                  }
                }
              }
            }
          }
        }
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20
          }
        },
        SearchParam: {
          name: 'search',
          in: 'query',
          description: 'Search query string',
          required: false,
          schema: {
            type: 'string'
          }
        },
        SortParam: {
          name: 'sort',
          in: 'query',
          description: 'Sort field and direction (e.g., "name:asc", "createdAt:desc")',
          required: false,
          schema: {
            type: 'string'
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Users',
        description: 'User management operations'
      },
      {
        name: 'Assets',
        description: 'Asset management and tracking'
      },
      {
        name: 'Forms',
        description: 'Form template management'
      },
      {
        name: 'Inspections',
        description: 'Inspection workflow and data management'
      },
      {
        name: 'Reports',
        description: 'Report generation and analytics'
      },
      {
        name: 'Sync',
        description: 'Data synchronization for offline support'
      },
      {
        name: 'Health',
        description: 'System health and monitoring'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);

// Swagger UI options
export const swaggerUiOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .scheme-container { background: #fafafa; padding: 15px; margin: 20px 0; }
  `,
  customSiteTitle: 'JSG-Inspections API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
};