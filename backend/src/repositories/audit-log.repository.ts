/**
 * Audit Log Repository
 * Data access layer for AuditLog entity operations
 */

import { BaseRepository } from '../database/base.repository';
import { AuditLog, QueryOptions } from '../types/entities';
import { CreateAuditLogDTO } from '../types/dtos';
import { DatabaseError } from '../types/errors';
import { logger } from '../utils/logger';

export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor() {
    super('audit_logs');
  }

  /**
   * Create a new audit log entry
   */
  async createAuditLog(auditData: CreateAuditLogDTO): Promise<AuditLog> {
    try {
      const auditLogToCreate: Partial<AuditLog> = {
        ...auditData,
        timestamp: new Date().toISOString()
      };

      const auditLog = await this.create(auditLogToCreate);
      
      // Don't log audit creation to avoid infinite loops
      return auditLog;
    } catch (error) {
      logger.error('Failed to create audit log', {
        error: error.message,
        auditData
      });
      throw error;
    }
  }

  /**
   * Find audit logs by user
   */
  async findByUser(userId: string, options?: QueryOptions): Promise<AuditLog[]> {
    try {
      const query = `
        SELECT * FROM audit_logs 
        WHERE userId = $userId
        ORDER BY ${options?.sortBy || 'timestamp'} ${options?.sortOrder || 'DESC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { userId };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find audit logs by user', {
        error: error.message,
        userId
      });
      throw new DatabaseError('Failed to find audit logs by user');
    }
  }

  /**
   * Find audit logs by action
   */
  async findByAction(action: string, options?: QueryOptions): Promise<AuditLog[]> {
    try {
      const query = `
        SELECT * FROM audit_logs 
        WHERE action = $action
        ORDER BY ${options?.sortBy || 'timestamp'} ${options?.sortOrder || 'DESC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { action };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find audit logs by action', {
        error: error.message,
        action
      });
      throw new DatabaseError('Failed to find audit logs by action');
    }
  }

  /**
   * Find audit logs by entity
   */
  async findByEntity(entityType: string, entityId: string, options?: QueryOptions): Promise<AuditLog[]> {
    try {
      const query = `
        SELECT * FROM audit_logs 
        WHERE entityType = $entityType AND entityId = $entityId
        ORDER BY ${options?.sortBy || 'timestamp'} ${options?.sortOrder || 'DESC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { entityType, entityId };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find audit logs by entity', {
        error: error.message,
        entityType,
        entityId
      });
      throw new DatabaseError('Failed to find audit logs by entity');
    }
  }

  /**
   * Find audit logs by IP address
   */
  async findByIpAddress(ipAddress: string, options?: QueryOptions): Promise<AuditLog[]> {
    try {
      const query = `
        SELECT * FROM audit_logs 
        WHERE ipAddress = $ipAddress
        ORDER BY ${options?.sortBy || 'timestamp'} ${options?.sortOrder || 'DESC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { ipAddress };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find audit logs by IP address', {
        error: error.message,
        ipAddress
      });
      throw new DatabaseError('Failed to find audit logs by IP address');
    }
  }

  /**
   * Find audit logs by severity
   */
  async findBySeverity(severity: string, options?: QueryOptions): Promise<AuditLog[]> {
    try {
      const query = `
        SELECT * FROM audit_logs 
        WHERE severity = $severity
        ORDER BY ${options?.sortBy || 'timestamp'} ${options?.sortOrder || 'DESC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { severity };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find audit logs by severity', {
        error: error.message,
        severity
      });
      throw new DatabaseError('Failed to find audit logs by severity');
    }
  }

  /**
   * Search audit logs with advanced filters
   */
  async searchAuditLogs(searchTerm: string, filters: any = {}, options: QueryOptions = {}): Promise<{ auditLogs: AuditLog[], total: number }> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any = {};

      // Add search term
      if (searchTerm) {
        whereClause += ` AND (action CONTAINS $search OR description CONTAINS $search OR entityType CONTAINS $search)`;
        params.search = searchTerm;
      }

      // Add filters
      if (filters.userId) {
        whereClause += ` AND userId = $userId`;
        params.userId = filters.userId;
      }

      if (filters.action) {
        whereClause += ` AND action = $action`;
        params.action = filters.action;
      }

      if (filters.entityType) {
        whereClause += ` AND entityType = $entityType`;
        params.entityType = filters.entityType;
      }

      if (filters.entityId) {
        whereClause += ` AND entityId = $entityId`;
        params.entityId = filters.entityId;
      }

      if (filters.severity) {
        whereClause += ` AND severity = $severity`;
        params.severity = filters.severity;
      }

      if (filters.ipAddress) {
        whereClause += ` AND ipAddress = $ipAddress`;
        params.ipAddress = filters.ipAddress;
      }

      if (filters.userAgent) {
        whereClause += ` AND userAgent CONTAINS $userAgent`;
        params.userAgent = filters.userAgent;
      }

      if (filters.startDate) {
        whereClause += ` AND timestamp >= $startDate`;
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        whereClause += ` AND timestamp <= $endDate`;
        params.endDate = filters.endDate;
      }

      if (filters.actions && filters.actions.length > 0) {
        whereClause += ` AND action IN $actions`;
        params.actions = filters.actions;
      }

      if (filters.entityTypes && filters.entityTypes.length > 0) {
        whereClause += ` AND entityType IN $entityTypes`;
        params.entityTypes = filters.entityTypes;
      }

      if (filters.severities && filters.severities.length > 0) {
        whereClause += ` AND severity IN $severities`;
        params.severities = filters.severities;
      }

      // Count query
      const countQuery = `SELECT count() as total FROM audit_logs ${whereClause}`;
      const countResult = await this.db.query(countQuery, params);
      const total = countResult[0]?.total || 0;

      // Data query
      let dataQuery = `SELECT * FROM audit_logs ${whereClause}`;
      
      // Add sorting
      const sortBy = options.sortBy || 'timestamp';
      const sortOrder = options.sortOrder || 'DESC';
      dataQuery += ` ORDER BY ${sortBy} ${sortOrder}`;

      // Add pagination
      if (options.pageSize) {
        dataQuery += ` LIMIT $limit`;
        params.limit = options.pageSize;

        if (options.page) {
          dataQuery += ` START $start`;
          params.start = (options.page - 1) * options.pageSize;
        }
      }

      const dataResult = await this.db.query(dataQuery, params);
      const auditLogs = dataResult[0] || [];

      return { auditLogs, total };
    } catch (error) {
      logger.error('Failed to search audit logs', {
        error: error.message,
        searchTerm,
        filters
      });
      throw new DatabaseError('Failed to search audit logs');
    }
  }

  /**
   * Get audit log statistics
   */
  async getAuditStats(filters: any = {}): Promise<any> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any = {};

      if (filters.userId) {
        whereClause += ` AND userId = $userId`;
        params.userId = filters.userId;
      }

      if (filters.startDate) {
        whereClause += ` AND timestamp >= $startDate`;
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        whereClause += ` AND timestamp <= $endDate`;
        params.endDate = filters.endDate;
      }

      const query = `
        SELECT 
          count() as totalLogs,
          count(CASE WHEN severity = 'low' THEN 1 END) as lowSeverityLogs,
          count(CASE WHEN severity = 'medium' THEN 1 END) as mediumSeverityLogs,
          count(CASE WHEN severity = 'high' THEN 1 END) as highSeverityLogs,
          count(CASE WHEN severity = 'critical' THEN 1 END) as criticalSeverityLogs,
          count(CASE WHEN action = 'create' THEN 1 END) as createActions,
          count(CASE WHEN action = 'update' THEN 1 END) as updateActions,
          count(CASE WHEN action = 'delete' THEN 1 END) as deleteActions,
          count(CASE WHEN action = 'login' THEN 1 END) as loginActions,
          count(CASE WHEN action = 'logout' THEN 1 END) as logoutActions,
          count(DISTINCT userId) as uniqueUsers,
          count(DISTINCT ipAddress) as uniqueIpAddresses
        FROM audit_logs ${whereClause}
      `;

      const result = await this.db.query(query, params);
      return result[0] || {};
    } catch (error) {
      logger.error('Failed to get audit log statistics', {
        error: error.message,
        filters
      });
      throw new DatabaseError('Failed to get audit log statistics');
    }
  }

  /**
   * Get audit log trends
   */
  async getAuditTrends(days: number = 30): Promise<any[]> {
    try {
      const query = `
        SELECT 
          time::format(timestamp, '%Y-%m-%d') as date,
          count() as totalLogs,
          count(CASE WHEN severity = 'high' OR severity = 'critical' THEN 1 END) as highSeverityLogs,
          count(DISTINCT userId) as uniqueUsers,
          count(DISTINCT ipAddress) as uniqueIpAddresses
        FROM audit_logs 
        WHERE timestamp >= time::now() - duration::from::days($days)
        GROUP BY time::format(timestamp, '%Y-%m-%d')
        ORDER BY date DESC
      `;

      const result = await this.db.query(query, { days });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get audit log trends', {
        error: error.message,
        days
      });
      throw new DatabaseError('Failed to get audit log trends');
    }
  }

  /**
   * Get most active users
   */
  async getMostActiveUsers(limit: number = 10, days?: number): Promise<any[]> {
    try {
      let whereClause = '';
      const params: any = { limit };

      if (days) {
        whereClause = 'WHERE timestamp >= time::now() - duration::from::days($days)';
        params.days = days;
      }

      const query = `
        SELECT 
          userId,
          count() as activityCount,
          count(DISTINCT action) as uniqueActions,
          max(timestamp) as lastActivity
        FROM audit_logs 
        ${whereClause}
        GROUP BY userId
        ORDER BY activityCount DESC
        LIMIT $limit
      `;

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get most active users', {
        error: error.message,
        limit,
        days
      });
      throw new DatabaseError('Failed to get most active users');
    }
  }

  /**
   * Get most common actions
   */
  async getMostCommonActions(limit: number = 10, days?: number): Promise<any[]> {
    try {
      let whereClause = '';
      const params: any = { limit };

      if (days) {
        whereClause = 'WHERE timestamp >= time::now() - duration::from::days($days)';
        params.days = days;
      }

      const query = `
        SELECT 
          action,
          count() as actionCount,
          count(DISTINCT userId) as uniqueUsers
        FROM audit_logs 
        ${whereClause}
        GROUP BY action
        ORDER BY actionCount DESC
        LIMIT $limit
      `;

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get most common actions', {
        error: error.message,
        limit,
        days
      });
      throw new DatabaseError('Failed to get most common actions');
    }
  }

  /**
   * Get security events
   */
  async getSecurityEvents(days: number = 7): Promise<AuditLog[]> {
    try {
      const securityActions = [
        'login_failed',
        'login_success',
        'logout',
        'password_change',
        'permission_denied',
        'account_locked',
        'suspicious_activity'
      ];

      const query = `
        SELECT * FROM audit_logs 
        WHERE action IN $securityActions
        AND timestamp >= time::now() - duration::from::days($days)
        ORDER BY timestamp DESC
      `;

      const result = await this.db.query(query, { securityActions, days });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get security events', {
        error: error.message,
        days
      });
      throw new DatabaseError('Failed to get security events');
    }
  }

  /**
   * Get failed login attempts
   */
  async getFailedLoginAttempts(hours: number = 24): Promise<any[]> {
    try {
      const query = `
        SELECT 
          ipAddress,
          userId,
          count() as attemptCount,
          max(timestamp) as lastAttempt
        FROM audit_logs 
        WHERE action = 'login_failed'
        AND timestamp >= time::now() - duration::from::hours($hours)
        GROUP BY ipAddress, userId
        ORDER BY attemptCount DESC
      `;

      const result = await this.db.query(query, { hours });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get failed login attempts', {
        error: error.message,
        hours
      });
      throw new DatabaseError('Failed to get failed login attempts');
    }
  }

  /**
   * Get user activity timeline
   */
  async getUserActivityTimeline(userId: string, days: number = 7): Promise<AuditLog[]> {
    try {
      const query = `
        SELECT * FROM audit_logs 
        WHERE userId = $userId
        AND timestamp >= time::now() - duration::from::days($days)
        ORDER BY timestamp DESC
      `;

      const result = await this.db.query(query, { userId, days });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get user activity timeline', {
        error: error.message,
        userId,
        days
      });
      throw new DatabaseError('Failed to get user activity timeline');
    }
  }

  /**
   * Get entity change history
   */
  async getEntityChangeHistory(entityType: string, entityId: string): Promise<AuditLog[]> {
    try {
      const query = `
        SELECT * FROM audit_logs 
        WHERE entityType = $entityType AND entityId = $entityId
        ORDER BY timestamp DESC
      `;

      const result = await this.db.query(query, { entityType, entityId });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get entity change history', {
        error: error.message,
        entityType,
        entityId
      });
      throw new DatabaseError('Failed to get entity change history');
    }
  }

  /**
   * Delete old audit logs
   */
  async deleteOldAuditLogs(olderThanDays: number = 365): Promise<number> {
    try {
      const query = `
        DELETE FROM audit_logs 
        WHERE timestamp < time::now() - duration::from::days($olderThanDays)
      `;

      const result = await this.db.query(query, { olderThanDays });
      const deletedCount = result[0]?.length || 0;

      // Create audit log for this cleanup action
      await this.createAuditLog({
        userId: 'system',
        action: 'cleanup',
        entityType: 'audit_logs',
        entityId: 'bulk',
        description: `Deleted ${deletedCount} old audit logs older than ${olderThanDays} days`,
        severity: 'low',
        ipAddress: 'system',
        userAgent: 'system-cleanup'
      });

      return deletedCount;
    } catch (error) {
      logger.error('Failed to delete old audit logs', {
        error: error.message,
        olderThanDays
      });
      throw new DatabaseError('Failed to delete old audit logs');
    }
  }

  /**
   * Get audit log export data
   */
  async getAuditLogExport(filters: any = {}): Promise<AuditLog[]> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any = {};

      if (filters.userId) {
        whereClause += ` AND userId = $userId`;
        params.userId = filters.userId;
      }

      if (filters.startDate) {
        whereClause += ` AND timestamp >= $startDate`;
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        whereClause += ` AND timestamp <= $endDate`;
        params.endDate = filters.endDate;
      }

      if (filters.actions && filters.actions.length > 0) {
        whereClause += ` AND action IN $actions`;
        params.actions = filters.actions;
      }

      if (filters.entityTypes && filters.entityTypes.length > 0) {
        whereClause += ` AND entityType IN $entityTypes`;
        params.entityTypes = filters.entityTypes;
      }

      const query = `
        SELECT * FROM audit_logs 
        ${whereClause}
        ORDER BY timestamp DESC
      `;

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get audit log export data', {
        error: error.message,
        filters
      });
      throw new DatabaseError('Failed to get audit log export data');
    }
  }

  /**
   * Get distinct values for filtering
   */
  async getDistinctValues(field: string): Promise<string[]> {
    try {
      const query = `
        SELECT DISTINCT ${field} FROM audit_logs 
        WHERE ${field} IS NOT NONE
        ORDER BY ${field}
      `;

      const result = await this.db.query(query);
      return (result[0] || []).map((row: any) => row[field]);
    } catch (error) {
      logger.error('Failed to get distinct values', {
        error: error.message,
        field
      });
      throw new DatabaseError('Failed to get distinct values');
    }
  }

  /**
   * Get audit log summary for compliance reporting
   */
  async getComplianceSummary(startDate: string, endDate: string): Promise<any> {
    try {
      const query = `
        SELECT 
          count() as totalEvents,
          count(DISTINCT userId) as uniqueUsers,
          count(DISTINCT ipAddress) as uniqueIpAddresses,
          count(CASE WHEN action LIKE '%login%' THEN 1 END) as authenticationEvents,
          count(CASE WHEN action IN ['create', 'update', 'delete'] THEN 1 END) as dataModificationEvents,
          count(CASE WHEN severity IN ['high', 'critical'] THEN 1 END) as highSeverityEvents,
          min(timestamp) as firstEvent,
          max(timestamp) as lastEvent
        FROM audit_logs 
        WHERE timestamp >= $startDate AND timestamp <= $endDate
      `;

      const result = await this.db.query(query, { startDate, endDate });
      return result[0] || {};
    } catch (error) {
      logger.error('Failed to get compliance summary', {
        error: error.message,
        startDate,
        endDate
      });
      throw new DatabaseError('Failed to get compliance summary');
    }
  }
}