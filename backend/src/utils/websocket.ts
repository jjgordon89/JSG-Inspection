/**
 * WebSocket Utility
 * Sets up and configures WebSocket server with comprehensive real-time features
 */

import { Server as SocketIOServer } from 'socket.io';
import { WebSocketService } from '../services/websocket.service';
import { UserRepository } from '../repositories/user.repository';
import { TeamRepository } from '../repositories/team.repository';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { NotificationService } from '../services/notification.service';
import { InspectionService } from '../services/inspection.service';
import { ReportService } from '../services/report.service';
import { logger } from './logger';
import { config } from '../config/config';

let webSocketService: WebSocketService | null = null;

/**
 * Setup WebSocket server with comprehensive real-time features
 */
export function setupWebSocket(io: SocketIOServer): WebSocketService {
  try {
    logger.info('Initializing WebSocket service...');

    // Initialize repositories
    const userRepository = new UserRepository();
    const teamRepository = new TeamRepository();
    const auditLogRepository = new AuditLogRepository();

    // Initialize services
    const notificationService = new NotificationService(
      userRepository,
      teamRepository
    );
    
    const inspectionService = new InspectionService(
      userRepository,
      auditLogRepository
    );
    
    const reportService = new ReportService(
      userRepository,
      auditLogRepository
    );

    // Create WebSocket service with comprehensive options
    webSocketService = new WebSocketService(
      io.engine.server,
      userRepository,
      teamRepository,
      auditLogRepository,
      {
        cors: {
          origin: config.cors.origin,
          credentials: true
        },
        pingTimeout: config.websocket?.pingTimeout || 60000,
        pingInterval: config.websocket?.pingInterval || 25000,
        maxConnections: config.websocket?.maxConnections || 1000,
        rateLimiting: {
          windowMs: config.websocket?.rateLimiting?.windowMs || 60000,
          maxRequests: config.websocket?.rateLimiting?.maxRequests || 100
        }
      }
    );

    // Set up event listeners for service integration
    setupServiceIntegration(webSocketService, {
      notificationService,
      inspectionService,
      reportService
    });

    logger.info('WebSocket service initialized successfully');
    return webSocketService;

  } catch (error) {
    logger.error('Failed to initialize WebSocket service:', error);
    throw error;
  }
}

/**
 * Setup integration between WebSocket service and other services
 */
function setupServiceIntegration(
  wsService: WebSocketService,
  services: {
    notificationService: NotificationService;
    inspectionService: InspectionService;
    reportService: ReportService;
  }
): void {
  const { notificationService, inspectionService, reportService } = services;

  // Notification service integration
  notificationService.on('notification:created', async (notification) => {
    try {
      if (notification.userId) {
        await wsService.sendNotificationToUser(notification.userId, {
          type: 'notification',
          payload: notification,
          timestamp: new Date()
        });
      }
      
      if (notification.teamId) {
        await wsService.sendNotificationToTeam(notification.teamId, {
          type: 'notification',
          payload: notification,
          timestamp: new Date()
        });
      }
      
      if (notification.role) {
        await wsService.sendNotificationToRole(notification.role, {
          type: 'notification',
          payload: notification,
          timestamp: new Date()
        });
      }
    } catch (error) {
      logger.error('Failed to send notification via WebSocket:', error);
    }
  });

  // Inspection service integration
  inspectionService.on('inspection:created', async (inspection) => {
    try {
      await wsService.broadcastToRoom(`team:${inspection.teamId}`, 'inspection:created', {
        inspection,
        timestamp: new Date()
      });
      
      if (inspection.assignedTo) {
        await wsService.sendNotificationToUser(inspection.assignedTo, {
          type: 'inspection:assigned',
          payload: inspection,
          timestamp: new Date()
        });
      }
    } catch (error) {
      logger.error('Failed to broadcast inspection creation:', error);
    }
  });

  inspectionService.on('inspection:updated', async (inspection) => {
    try {
      await wsService.broadcastToRoom(`inspection:${inspection.id}`, 'inspection:updated', {
        inspection,
        timestamp: new Date()
      });
      
      await wsService.broadcastToRoom(`team:${inspection.teamId}`, 'inspection:updated', {
        inspection,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Failed to broadcast inspection update:', error);
    }
  });

  inspectionService.on('inspection:completed', async (inspection) => {
    try {
      await wsService.broadcastToRoom(`inspection:${inspection.id}`, 'inspection:completed', {
        inspection,
        timestamp: new Date()
      });
      
      await wsService.broadcastToRoom(`team:${inspection.teamId}`, 'inspection:completed', {
        inspection,
        timestamp: new Date()
      });
      
      // Notify supervisors
      await wsService.sendNotificationToRole('supervisor', {
        type: 'inspection:completed',
        payload: inspection,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Failed to broadcast inspection completion:', error);
    }
  });

  inspectionService.on('inspection:overdue', async (inspection) => {
    try {
      if (inspection.assignedTo) {
        await wsService.sendNotificationToUser(inspection.assignedTo, {
          type: 'inspection:overdue',
          payload: inspection,
          timestamp: new Date(),
          priority: 'high'
        });
      }
      
      // Notify supervisors
      await wsService.sendNotificationToRole('supervisor', {
        type: 'inspection:overdue',
        payload: inspection,
        timestamp: new Date(),
        priority: 'high'
      });
    } catch (error) {
      logger.error('Failed to send overdue inspection notification:', error);
    }
  });

  // Report service integration
  reportService.on('report:generated', async (report) => {
    try {
      if (report.requestedBy) {
        await wsService.sendNotificationToUser(report.requestedBy, {
          type: 'report:generated',
          payload: report,
          timestamp: new Date()
        });
      }
      
      if (report.teamId) {
        await wsService.broadcastToRoom(`team:${report.teamId}`, 'report:generated', {
          report,
          timestamp: new Date()
        });
      }
    } catch (error) {
      logger.error('Failed to broadcast report generation:', error);
    }
  });

  reportService.on('report:failed', async (reportRequest) => {
    try {
      if (reportRequest.requestedBy) {
        await wsService.sendNotificationToUser(reportRequest.requestedBy, {
          type: 'report:failed',
          payload: reportRequest,
          timestamp: new Date(),
          priority: 'medium'
        });
      }
    } catch (error) {
      logger.error('Failed to send report failure notification:', error);
    }
  });

  // System events
  wsService.on('system:alert', async (alert) => {
    try {
      await wsService.broadcastToAll('system:alert', {
        alert,
        timestamp: new Date(),
        priority: alert.severity || 'medium'
      });
    } catch (error) {
      logger.error('Failed to broadcast system alert:', error);
    }
  });

  wsService.on('system:maintenance', async (maintenance) => {
    try {
      await wsService.broadcastToAll('system:maintenance', {
        maintenance,
        timestamp: new Date(),
        priority: 'high'
      });
    } catch (error) {
      logger.error('Failed to broadcast maintenance notification:', error);
    }
  });

  logger.info('WebSocket service integration setup completed');
}

/**
 * Get the current WebSocket service instance
 */
export function getWebSocketService(): WebSocketService | null {
  return webSocketService;
}

/**
 * Broadcast a message to all connected clients
 */
export async function broadcastToAll(event: string, data: any): Promise<void> {
  if (webSocketService) {
    await webSocketService.broadcastToAll(event, data);
  } else {
    logger.warn('WebSocket service not initialized, cannot broadcast message');
  }
}

/**
 * Send a notification to a specific user
 */
export async function sendNotificationToUser(userId: string, notification: any): Promise<void> {
  if (webSocketService) {
    await webSocketService.sendNotificationToUser(userId, notification);
  } else {
    logger.warn('WebSocket service not initialized, cannot send user notification');
  }
}

/**
 * Send a notification to a team
 */
export async function sendNotificationToTeam(teamId: string, notification: any): Promise<void> {
  if (webSocketService) {
    await webSocketService.sendNotificationToTeam(teamId, notification);
  } else {
    logger.warn('WebSocket service not initialized, cannot send team notification');
  }
}

/**
 * Get WebSocket connection statistics
 */
export function getWebSocketStats(): any {
  if (webSocketService) {
    return {
      connectedUsers: webSocketService.getConnectedUsersCount(),
      onlineUsers: webSocketService.getOnlineUsers(),
      rooms: webSocketService.getRooms()
    };
  }
  return null;
}

/**
 * Gracefully shutdown WebSocket service
 */
export async function shutdownWebSocket(): Promise<void> {
  if (webSocketService) {
    await webSocketService.shutdown();
    webSocketService = null;
    logger.info('WebSocket service shut down');
  }
}