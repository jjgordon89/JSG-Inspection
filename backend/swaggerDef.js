const path = require('path');

module.exports = {
    openapi: '3.0.0',
    info: {
      title: 'JSG-Inspections API',
      version: '1.0.0',
      description: 'Comprehensive inspection management system API with real-time features, AI integration, and offline synchronization support.',
      contact: {
        name: 'JSG Development Team',
        email: 'support@jsg-inspections.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.jsg-inspections.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token for authentication'
        },
        refreshToken: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT refresh token for token renewal'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR'
                },
                message: {
                  type: 'string',
                  example: 'Validation failed'
                },
                details: {
                  type: 'string',
                  example: 'Email is required'
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'user:123'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'inspector', 'viewer'],
              example: 'inspector'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            isEmailVerified: {
              type: 'boolean',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        Asset: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'asset:123'
            },
            name: {
              type: 'string',
              example: 'Water Pump #1'
            },
            type: {
              type: 'string',
              enum: ['equipment', 'building', 'tool', 'person'],
              example: 'equipment'
            },
            qrCode: {
              type: 'string',
              example: 'QR123456'
            },
            location: {
              type: 'object',
              properties: {
                latitude: {
                  type: 'number',
                  example: 40.7128
                },
                longitude: {
                  type: 'number',
                  example: -74.0060
                },
                address: {
                  type: 'string',
                  example: '123 Main St, New York, NY'
                }
              }
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'maintenance', 'retired'],
              example: 'active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        Inspection: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'inspection:123'
            },
            title: {
              type: 'string',
              example: 'Monthly Safety Inspection'
            },
            status: {
              type: 'string',
              enum: ['draft', 'in_progress', 'completed', 'cancelled'],
              example: 'in_progress'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              example: 'medium'
            },
            assetId: {
              type: 'string',
              example: 'asset:123'
            },
            formId: {
              type: 'string',
              example: 'form:123'
            },
            inspectorId: {
              type: 'string',
              example: 'user:123'
            },
            scheduledDate: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            },
            completedDate: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            },
            score: {
              type: 'object',
              properties: {
                percentage: {
                  type: 'number',
                  example: 85.5
                },
                grade: {
                  type: 'string',
                  example: 'B'
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1
            },
            limit: {
              type: 'integer',
              example: 20
            },
            total: {
              type: 'integer',
              example: 100
            },
            pages: {
              type: 'integer',
              example: 5
            },
            hasNext: {
              type: 'boolean',
              example: true
            },
            hasPrev: {
              type: 'boolean',
              example: false
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
        SortByParam: {
          name: 'sortBy',
          in: 'query',
          description: 'Field to sort by',
          required: false,
          schema: {
            type: 'string'
          }
        },
        SortOrderParam: {
          name: 'sortOrder',
          in: 'query',
          description: 'Sort order',
          required: false,
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'asc'
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};