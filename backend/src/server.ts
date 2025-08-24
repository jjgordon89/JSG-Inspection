import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

// Import configurations and middleware
import { config } from '@config/config';
import { logger } from '@utils/logger';
import { errorHandler } from '@middleware/error.middleware';
import { rateLimiter } from '@middleware/rateLimiter.middleware';
import { DatabaseService } from '@database/connection';

// Import routes
import authRoutes from '@routes/auth.routes';
import userRoutes from '@routes/user.routes';
import assetRoutes from '@routes/asset.routes';
import formRoutes from '@routes/form.routes';
import inspectionRoutes from '@routes/inspection.routes';
import reportRoutes from '@routes/report.routes';
import syncRoutes from '@routes/sync.routes';

// Import WebSocket handlers
import { setupWebSocket } from '@utils/websocket';

// Load environment variables
dotenv.config();

class Server {
  private app: express.Application;
  private httpServer: any;
  private io: SocketIOServer;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.server.port;
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeWebSocket();
  }

  private initializeMiddleware(): void {
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
      origin: config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Compression and parsing
    this.app.use(compression({ level: config.performance.compressionLevel }));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    if (config.server.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined', {
        stream: {
          write: (message: string) => logger.info(message.trim())
        }
      }));
    }

    // Rate limiting
    this.app.use(rateLimiter);

    // Request timeout
    this.app.use((req, res, next) => {
      req.setTimeout(config.performance.requestTimeout);
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.server.nodeEnv,
        version: config.server.apiVersion
      });
    });

    // API routes
    const apiPrefix = `/api/${config.server.apiVersion}`;
    this.app.use(`${apiPrefix}/auth`, authRoutes);
    this.app.use(`${apiPrefix}/users`, userRoutes);
    this.app.use(`${apiPrefix}/assets`, assetRoutes);
    this.app.use(`${apiPrefix}/forms`, formRoutes);
    this.app.use(`${apiPrefix}/inspections`, inspectionRoutes);
    this.app.use(`${apiPrefix}/reports`, reportRoutes);
    this.app.use(`${apiPrefix}/sync`, syncRoutes);

    // API documentation
    if (config.development.apiDocsEnabled) {
      import('swagger-ui-express').then(swaggerUi => {
        import('@config/swagger').then(({ swaggerSpec }) => {
          this.app.use('/api-docs', swaggerUi.default.serve, swaggerUi.default.setup(swaggerSpec));
        });
      });
    }

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private initializeWebSocket(): void {
    setupWebSocket(this.io);
  }

  public async start(): Promise<void> {
    try {
      // Initialize database connection
      await DatabaseService.getInstance();
      logger.info('Database connection established');

      // Start server
      this.httpServer.listen(this.port, () => {
        logger.info(`🚀 Server running on port ${this.port}`);
        logger.info(`📚 API Documentation: http://localhost:${this.port}/api-docs`);
        logger.info(`🔌 WebSocket server running on port ${config.websocket.port}`);
        logger.info(`🌍 Environment: ${config.server.nodeEnv}`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.gracefulShutdown.bind(this));
      process.on('SIGINT', this.gracefulShutdown.bind(this));

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private async gracefulShutdown(): Promise<void> {
    logger.info('Received shutdown signal, closing server gracefully...');
    
    this.httpServer.close(() => {
      logger.info('HTTP server closed');
    });

    this.io.close(() => {
      logger.info('WebSocket server closed');
    });

    // Close database connection
    await DatabaseService.close();
    logger.info('Database connection closed');

    process.exit(0);
  }
}

// Start the server
const server = new Server();
server.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

export default server;