/**
 * WebSocket Service
 * Handles real-time communication and notifications
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { AppError, ErrorCodes } from '../types/errors';
import { User, JWTPayload } from '../types/auth';
import {
  WebSocketEvent,
  WebSocketRoom,
  SocketConnection,
  RealTimeUpdate,
  NotificationPayload,
  SyncProgress,
  InspectionUpdate,
  AssetUpdate,
  TeamUpdate,
  SystemAlert
} from '../types/websocket';
import { UserRepository } from '../repositories/user.repository';
import { TeamRepository } from '../repositories/team.repository';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { RateLimiter } from '../utils/rate-limiter';
import { EventEmitter } from 'events';

export interface WebSocketOptions {
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
}

export interface ConnectionStats {
  totalConnections: number;
  activeUsers: number;
  roomCounts: Record<string, number>;
  messagesSent: number;
  messagesReceived: number;
  averageLatency: number;
}

export interface RoomInfo {
  name: string;
  type: 'user' | 'team' | 'inspection' | 'asset' | 'system';
  memberCount: number;
  members: string[];
  createdAt: Date;
  lastActivity: Date;
}

export class WebSocketService extends EventEmitter {
  private io: SocketIOServer;
  private connections: Map<string, SocketConnection> = new Map();
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> socketIds
  private rooms: Map<string, RoomInfo> = new Map();
  private rateLimiter: RateLimiter;
  private stats: ConnectionStats = {
    totalConnections: 0,
    activeUsers: 0,
    roomCounts: {},
    messagesSent: 0,
    messagesReceived: 0,
    averageLatency: 0
  };
  private latencyMeasurements: number[] = [];
  private readonly maxLatencyMeasurements = 100;

  constructor(
    private httpServer: HTTPServer,
    private userRepository: UserRepository,
    private teamRepository: TeamRepository,
    private auditLogRepository: AuditLogRepository,
    private options: WebSocketOptions = {}
  ) {
    super();
    this.initializeSocketIO();
    this.initializeRateLimiter();
    this.startStatsCollection();
  }

  /**
   * Initialize Socket.IO server
   */
  private initializeSocketIO(): void {
    this.io = new SocketIOServer(this.httpServer, {
      cors: this.options.cors || {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
      },
      pingTimeout: this.options.pingTimeout || 60000,
      pingInterval: this.options.pingInterval || 25000,
      transports: ['websocket', 'polling']
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        await this.authenticateSocket(socket);
        next();
      } catch (error) {
        logger.error('Socket authentication failed', {
          socketId: socket.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        next(new Error('Authentication failed'));
      }
    });

    // Rate limiting middleware
    this.io.use(async (socket, next) => {
      try {
        const userId = (socket as any).userId;
        const allowed = await this.rateLimiter.checkLimit(
          `ws:${userId}`,
          this.options.rateLimiting?.maxRequests || 100,
          this.options.rateLimiting?.windowMs || 60000
        );
        
        if (!allowed) {
          throw new Error('Rate limit exceeded');
        }
        
        next();
      } catch (error) {
        next(new Error('Rate limit exceeded'));
      }
    });

    // Connection handling
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    logger.info('WebSocket server initialized', {
      cors: this.options.cors,
      pingTimeout: this.options.pingTimeout,
      pingInterval: this.options.pingInterval
    });
  }

  /**
   * Handle new socket connection
   */
  private async handleConnection(socket: Socket): Promise<void> {
    try {
      const userId = (socket as any).userId;
      const user = (socket as any).user;
      
      logger.info('WebSocket connection established', {
        socketId: socket.id,
        userId,
        userEmail: user.email
      });

      // Store connection info
      const connection: SocketConnection = {
        id: socket.id,
        userId,
        user,
        connectedAt: new Date(),
        lastActivity: new Date(),
        rooms: new Set(),
        metadata: {
          userAgent: socket.handshake.headers['user-agent'],
          ip: socket.handshake.address,
          deviceId: socket.handshake.query.deviceId as string
        }
      };
      
      this.connections.set(socket.id, connection);
      
      // Track user sockets
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);
      
      // Join user-specific room
      await this.joinRoom(socket.id, `user:${userId}`, 'user');
      
      // Join team rooms if user has teams
      if (user.teamIds && user.teamIds.length > 0) {
        for (const teamId of user.teamIds) {
          await this.joinRoom(socket.id, `team:${teamId}`, 'team');
        }
      }
      
      // Update stats
      this.stats.totalConnections++;
      this.updateActiveUserCount();
      
      // Set up event handlers
      this.setupSocketEventHandlers(socket);
      
      // Notify user of successful connection
      socket.emit('connected', {
        socketId: socket.id,
        userId,
        timestamp: new Date(),
        rooms: Array.from(connection.rooms)
      });
      
      // Log audit trail
      await this.auditLogRepository.create({
        id: `audit_${Date.now()}`,
        entityType: 'websocket',
        entityId: socket.id,
        action: 'connect',
        userId,
        metadata: {
          socketId: socket.id,
          deviceId: connection.metadata.deviceId,
          ip: connection.metadata.ip
        },
        timestamp: new Date()
      });
      
    } catch (error) {
      logger.error('Handle connection failed', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      socket.disconnect();
    }
  }

  /**
   * Set up socket event handlers
   */
  private setupSocketEventHandlers(socket: Socket): void {
    const connection = this.connections.get(socket.id);
    if (!connection) return;

    // Handle disconnection
    socket.on('disconnect', async (reason) => {
      await this.handleDisconnection(socket, reason);
    });

    // Handle ping for latency measurement
    socket.on('ping', (timestamp: number) => {
      const latency = Date.now() - timestamp;
      this.recordLatency(latency);
      socket.emit('pong', { timestamp, latency });
    });

    // Handle room join requests
    socket.on('join_room', async (data: { room: string; type?: string }) => {
      try {
        await this.handleJoinRoom(socket, data.room, data.type as any);
      } catch (error) {
        socket.emit('error', {
          event: 'join_room',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle room leave requests
    socket.on('leave_room', async (data: { room: string }) => {
      try {
        await this.handleLeaveRoom(socket, data.room);
      } catch (error) {
        socket.emit('error', {
          event: 'leave_room',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle subscription to inspection updates
    socket.on('subscribe_inspection', async (data: { inspectionId: string }) => {
      try {
        await this.subscribeToInspection(socket, data.inspectionId);
      } catch (error) {
        socket.emit('error', {
          event: 'subscribe_inspection',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle subscription to asset updates
    socket.on('subscribe_asset', async (data: { assetId: string }) => {
      try {
        await this.subscribeToAsset(socket, data.assetId);
      } catch (error) {
        socket.emit('error', {
          event: 'subscribe_asset',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data: { room: string; isTyping: boolean }) => {
      socket.to(data.room).emit('user_typing', {
        userId: connection.userId,
        user: connection.user,
        isTyping: data.isTyping,
        timestamp: new Date()
      });
    });

    // Handle custom events
    socket.on('custom_event', async (data: any) => {
      try {
        await this.handleCustomEvent(socket, data);
      } catch (error) {
        socket.emit('error', {
          event: 'custom_event',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Update last activity
    socket.onAny(() => {
      connection.lastActivity = new Date();
      this.stats.messagesReceived++;
    });
  }

  /**
   * Handle socket disconnection
   */
  private async handleDisconnection(socket: Socket, reason: string): Promise<void> {
    try {
      const connection = this.connections.get(socket.id);
      if (!connection) return;

      logger.info('WebSocket connection closed', {
        socketId: socket.id,
        userId: connection.userId,
        reason,
        duration: Date.now() - connection.connectedAt.getTime()
      });

      // Remove from user sockets
      const userSockets = this.userSockets.get(connection.userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          this.userSockets.delete(connection.userId);
        }
      }

      // Leave all rooms
      for (const room of connection.rooms) {
        await this.leaveRoom(socket.id, room);
      }

      // Remove connection
      this.connections.delete(socket.id);
      
      // Update stats
      this.updateActiveUserCount();
      
      // Log audit trail
      await this.auditLogRepository.create({
        id: `audit_${Date.now()}`,
        entityType: 'websocket',
        entityId: socket.id,
        action: 'disconnect',
        userId: connection.userId,
        metadata: {
          socketId: socket.id,
          reason,
          duration: Date.now() - connection.connectedAt.getTime()
        },
        timestamp: new Date()
      });
      
    } catch (error) {
      logger.error('Handle disconnection failed', {
        socketId: socket.id,
        reason,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Authenticate socket connection
   */
  private async authenticateSocket(socket: Socket): Promise<void> {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        throw new AppError(
          'Authentication token required',
          401,
          ErrorCodes.AUTH_TOKEN_MISSING
        );
      }

      // Verify JWT token
      const decoded = jwt.verify(
        token as string,
        process.env.JWT_SECRET!
      ) as JWTPayload;

      // Get user from database
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || user.status !== 'active') {
        throw new AppError(
          'Invalid or inactive user',
          401,
          ErrorCodes.AUTH_INVALID_USER
        );
      }

      // Check connection limit
      const userConnections = this.userSockets.get(user.id)?.size || 0;
      const maxConnections = this.options.maxConnections || 5;
      
      if (userConnections >= maxConnections) {
        throw new AppError(
          'Maximum connections exceeded',
          429,
          ErrorCodes.WEBSOCKET_CONNECTION_LIMIT
        );
      }

      // Attach user info to socket
      (socket as any).userId = user.id;
      (socket as any).user = user;
      
    } catch (error) {
      logger.error('Socket authentication failed', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Public methods for emitting events
   */
  
  /**
   * Emit event to specific user
   */
  emitToUser(userId: string, event: string, data: any): void {
    try {
      this.io.to(`user:${userId}`).emit(event, {
        ...data,
        timestamp: new Date()
      });
      
      this.stats.messagesSent++;
      
      logger.debug('Event emitted to user', {
        userId,
        event,
        dataKeys: Object.keys(data)
      });
    } catch (error) {
      logger.error('Emit to user failed', {
        userId,
        event,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Emit event to specific team
   */
  emitToTeam(teamId: string, event: string, data: any): void {
    try {
      this.io.to(`team:${teamId}`).emit(event, {
        ...data,
        timestamp: new Date()
      });
      
      this.stats.messagesSent++;
      
      logger.debug('Event emitted to team', {
        teamId,
        event,
        dataKeys: Object.keys(data)
      });
    } catch (error) {
      logger.error('Emit to team failed', {
        teamId,
        event,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Emit event to specific room
   */
  emitToRoom(room: string, event: string, data: any): void {
    try {
      this.io.to(room).emit(event, {
        ...data,
        timestamp: new Date()
      });
      
      this.stats.messagesSent++;
      
      logger.debug('Event emitted to room', {
        room,
        event,
        dataKeys: Object.keys(data)
      });
    } catch (error) {
      logger.error('Emit to room failed', {
        room,
        event,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcast(event: string, data: any): void {
    try {
      this.io.emit(event, {
        ...data,
        timestamp: new Date()
      });
      
      this.stats.messagesSent++;
      
      logger.debug('Event broadcasted', {
        event,
        dataKeys: Object.keys(data)
      });
    } catch (error) {
      logger.error('Broadcast failed', {
        event,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Broadcast event to all connected clients (alias for broadcast)
   */
  async broadcastToAll(event: string, data: any): Promise<void> {
    this.broadcast(event, data);
  }

  /**
   * Broadcast to specific room
   */
  async broadcastToRoom(room: string, event: string, data: any): Promise<void> {
    this.emitToRoom(room, event, data);
  }

  /**
   * Emit event to specific socket
   */
  emit(event: string, data: any): void {
    try {
      this.io.emit(event, {
        ...data,
        timestamp: new Date()
      });
      
      this.stats.messagesSent++;
    } catch (error) {
      logger.error('Emit failed', {
        event,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Send notification to user
   */
  sendNotification(userId: string, notification: NotificationPayload): void {
    this.emitToUser(userId, 'notification', notification);
  }

  /**
   * Send notification to specific user
   */
  async sendNotificationToUser(userId: string, notification: any): Promise<void> {
    this.emitToUser(userId, 'notification', notification);
  }

  /**
   * Send notification to team
   */
  async sendNotificationToTeam(teamId: string, notification: any): Promise<void> {
    this.emitToTeam(teamId, 'notification', notification);
  }

  /**
   * Send notification to users with specific role
   */
  async sendNotificationToRole(role: string, notification: any): Promise<void> {
    try {
      // Get all users with the specified role
      const users = await this.userRepository.findByRole(role);
      
      // Send notification to each user
      for (const user of users) {
        this.emitToUser(user.id, 'notification', notification);
      }
      
      logger.debug('Notification sent to role', {
        role,
        userCount: users.length,
        notificationType: notification.type
      });
    } catch (error) {
      logger.error('Send notification to role failed', {
        role,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Send real-time update
   */
  sendUpdate(update: RealTimeUpdate): void {
    const { entityType, entityId, action, data, userId, teamId } = update;
    
    const event = `${entityType}:${action}`;
    const payload = {
      entityType,
      entityId,
      action,
      data,
      userId
    };
    
    // Send to specific user if specified
    if (userId) {
      this.emitToUser(userId, event, payload);
    }
    
    // Send to team if specified
    if (teamId) {
      this.emitToTeam(teamId, event, payload);
    }
    
    // Send to entity-specific room
    this.emitToRoom(`${entityType}:${entityId}`, event, payload);
  }

  /**
   * Send inspection update
   */
  sendInspectionUpdate(update: InspectionUpdate): void {
    this.sendUpdate({
      entityType: 'inspection',
      entityId: update.inspectionId,
      action: update.action,
      data: update.data,
      userId: update.userId,
      teamId: update.teamId
    });
  }

  /**
   * Send asset update
   */
  sendAssetUpdate(update: AssetUpdate): void {
    this.sendUpdate({
      entityType: 'asset',
      entityId: update.assetId,
      action: update.action,
      data: update.data,
      userId: update.userId,
      teamId: update.teamId
    });
  }

  /**
   * Send team update
   */
  sendTeamUpdate(update: TeamUpdate): void {
    this.emitToTeam(update.teamId, 'team:update', {
      action: update.action,
      data: update.data,
      userId: update.userId
    });
  }

  /**
   * Send system alert
   */
  sendSystemAlert(alert: SystemAlert): void {
    if (alert.targetUsers) {
      alert.targetUsers.forEach(userId => {
        this.emitToUser(userId, 'system:alert', alert);
      });
    } else {
      this.broadcast('system:alert', alert);
    }
  }

  /**
   * Room management methods
   */
  
  private async handleJoinRoom(
    socket: Socket,
    room: string,
    type: 'user' | 'team' | 'inspection' | 'asset' | 'system' = 'system'
  ): Promise<void> {
    const connection = this.connections.get(socket.id);
    if (!connection) return;

    // Validate room access
    const hasAccess = await this.validateRoomAccess(connection.userId, room, type);
    if (!hasAccess) {
      throw new AppError(
        'Access denied to room',
        403,
        ErrorCodes.WEBSOCKET_ROOM_ACCESS_DENIED
      );
    }

    await this.joinRoom(socket.id, room, type);
    
    socket.emit('room_joined', {
      room,
      type,
      timestamp: new Date()
    });
  }

  private async handleLeaveRoom(socket: Socket, room: string): Promise<void> {
    await this.leaveRoom(socket.id, room);
    
    socket.emit('room_left', {
      room,
      timestamp: new Date()
    });
  }

  private async joinRoom(
    socketId: string,
    room: string,
    type: 'user' | 'team' | 'inspection' | 'asset' | 'system'
  ): Promise<void> {
    try {
      const socket = this.io.sockets.sockets.get(socketId);
      const connection = this.connections.get(socketId);
      
      if (!socket || !connection) return;
      
      // Join socket.io room
      await socket.join(room);
      
      // Update connection
      connection.rooms.add(room);
      
      // Update room info
      let roomInfo = this.rooms.get(room);
      if (!roomInfo) {
        roomInfo = {
          name: room,
          type,
          memberCount: 0,
          members: [],
          createdAt: new Date(),
          lastActivity: new Date()
        };
        this.rooms.set(room, roomInfo);
      }
      
      if (!roomInfo.members.includes(connection.userId)) {
        roomInfo.members.push(connection.userId);
        roomInfo.memberCount = roomInfo.members.length;
      }
      roomInfo.lastActivity = new Date();
      
      // Update stats
      this.stats.roomCounts[room] = (this.stats.roomCounts[room] || 0) + 1;
      
      logger.debug('Socket joined room', {
        socketId,
        userId: connection.userId,
        room,
        type,
        memberCount: roomInfo.memberCount
      });
    } catch (error) {
      logger.error('Join room failed', {
        socketId,
        room,
        type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private async leaveRoom(socketId: string, room: string): Promise<void> {
    try {
      const socket = this.io.sockets.sockets.get(socketId);
      const connection = this.connections.get(socketId);
      
      if (!socket || !connection) return;
      
      // Leave socket.io room
      await socket.leave(room);
      
      // Update connection
      connection.rooms.delete(room);
      
      // Update room info
      const roomInfo = this.rooms.get(room);
      if (roomInfo) {
        const memberIndex = roomInfo.members.indexOf(connection.userId);
        if (memberIndex > -1) {
          roomInfo.members.splice(memberIndex, 1);
          roomInfo.memberCount = roomInfo.members.length;
        }
        
        // Remove room if empty
        if (roomInfo.memberCount === 0) {
          this.rooms.delete(room);
          delete this.stats.roomCounts[room];
        } else {
          roomInfo.lastActivity = new Date();
        }
      }
      
      // Update stats
      if (this.stats.roomCounts[room]) {
        this.stats.roomCounts[room]--;
        if (this.stats.roomCounts[room] <= 0) {
          delete this.stats.roomCounts[room];
        }
      }
      
      logger.debug('Socket left room', {
        socketId,
        userId: connection.userId,
        room,
        remainingMembers: roomInfo?.memberCount || 0
      });
    } catch (error) {
      logger.error('Leave room failed', {
        socketId,
        room,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async validateRoomAccess(
    userId: string,
    room: string,
    type: 'user' | 'team' | 'inspection' | 'asset' | 'system'
  ): Promise<boolean> {
    try {
      // Always allow user's own room
      if (room === `user:${userId}`) {
        return true;
      }
      
      // Check team access
      if (type === 'team' && room.startsWith('team:')) {
        const teamId = room.replace('team:', '');
        const user = await this.userRepository.findById(userId);
        return user?.teamIds?.includes(teamId) || false;
      }
      
      // Check inspection access
      if (type === 'inspection' && room.startsWith('inspection:')) {
        // Would need to check if user has access to this inspection
        // For now, allow all authenticated users
        return true;
      }
      
      // Check asset access
      if (type === 'asset' && room.startsWith('asset:')) {
        // Would need to check if user has access to this asset
        // For now, allow all authenticated users
        return true;
      }
      
      // System rooms require admin access
      if (type === 'system') {
        const user = await this.userRepository.findById(userId);
        return user?.role === 'admin' || user?.role === 'super_admin';
      }
      
      return false;
    } catch (error) {
      logger.error('Validate room access failed', {
        userId,
        room,
        type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Subscription methods
   */
  
  private async subscribeToInspection(socket: Socket, inspectionId: string): Promise<void> {
    const connection = this.connections.get(socket.id);
    if (!connection) return;
    
    // Validate access to inspection
    // This would typically check if user has permission to view this inspection
    
    await this.joinRoom(socket.id, `inspection:${inspectionId}`, 'inspection');
    
    socket.emit('inspection_subscribed', {
      inspectionId,
      timestamp: new Date()
    });
  }

  private async subscribeToAsset(socket: Socket, assetId: string): Promise<void> {
    const connection = this.connections.get(socket.id);
    if (!connection) return;
    
    // Validate access to asset
    // This would typically check if user has permission to view this asset
    
    await this.joinRoom(socket.id, `asset:${assetId}`, 'asset');
    
    socket.emit('asset_subscribed', {
      assetId,
      timestamp: new Date()
    });
  }

  /**
   * Custom event handling
   */
  private async handleCustomEvent(socket: Socket, data: any): Promise<void> {
    const connection = this.connections.get(socket.id);
    if (!connection) return;
    
    // Emit custom event to other listeners
    this.emit('custom_event', {
      userId: connection.userId,
      socketId: socket.id,
      data
    });
  }

  /**
   * Utility methods
   */
  
  /**
   * Get connection statistics
   */
  getStats(): ConnectionStats {
    return { ...this.stats };
  }

  /**
   * Get active connections
   */
  getConnections(): SocketConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Get connections for specific user
   */
  getUserConnections(userId: string): SocketConnection[] {
    const socketIds = this.userSockets.get(userId) || new Set();
    return Array.from(socketIds)
      .map(socketId => this.connections.get(socketId))
      .filter(Boolean) as SocketConnection[];
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    const userSockets = this.userSockets.get(userId);
    return userSockets ? userSockets.size > 0 : false;
  }

  /**
   * Get room information
   */
  getRoomInfo(room: string): RoomInfo | undefined {
    return this.rooms.get(room);
  }

  /**
   * Get all rooms
   */
  getAllRooms(): RoomInfo[] {
    return Array.from(this.rooms.values());
  }

  /**
   * Get rooms (alias for getAllRooms)
   */
  getRooms(): RoomInfo[] {
    return this.getAllRooms();
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get online users
   */
  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  /**
   * Disconnect user
   */
  disconnectUser(userId: string, reason?: string): void {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);
        }
      });
    }
  }

  /**
   * Private helper methods
   */
  
  private initializeRateLimiter(): void {
    this.rateLimiter = new RateLimiter({
      windowMs: this.options.rateLimiting?.windowMs || 60000,
      maxRequests: this.options.rateLimiting?.maxRequests || 100
    });
  }

  private updateActiveUserCount(): void {
    this.stats.activeUsers = this.userSockets.size;
  }

  private recordLatency(latency: number): void {
    this.latencyMeasurements.push(latency);
    
    // Keep only recent measurements
    if (this.latencyMeasurements.length > this.maxLatencyMeasurements) {
      this.latencyMeasurements.shift();
    }
    
    // Calculate average latency
    const sum = this.latencyMeasurements.reduce((a, b) => a + b, 0);
    this.stats.averageLatency = Math.round(sum / this.latencyMeasurements.length);
  }

  private startStatsCollection(): void {
    // Collect stats every minute
    setInterval(() => {
      try {
        this.updateActiveUserCount();
        
        // Clean up inactive connections
        const now = Date.now();
        const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
        
        for (const [socketId, connection] of this.connections.entries()) {
          const inactiveTime = now - connection.lastActivity.getTime();
          if (inactiveTime > inactiveThreshold) {
            const socket = this.io.sockets.sockets.get(socketId);
            if (socket) {
              logger.info('Disconnecting inactive socket', {
                socketId,
                userId: connection.userId,
                inactiveTime
              });
              socket.disconnect(true);
            }
          }
        }
        
        // Clean up empty rooms
        for (const [roomName, roomInfo] of this.rooms.entries()) {
          if (roomInfo.memberCount === 0) {
            this.rooms.delete(roomName);
            delete this.stats.roomCounts[roomName];
          }
        }
        
        logger.debug('WebSocket stats updated', this.stats);
      } catch (error) {
        logger.error('Stats collection failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, 60000);
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      logger.info('Shutting down WebSocket service');
      
      // Disconnect all clients
      this.io.disconnectSockets(true);
      
      // Close server
      this.io.close();
      
      // Clear data structures
      this.connections.clear();
      this.userSockets.clear();
      this.rooms.clear();
      
      logger.info('WebSocket service shutdown complete');
    } catch (error) {
      logger.error('WebSocket shutdown failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}