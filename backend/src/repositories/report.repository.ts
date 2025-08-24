/**
 * Report Repository
 * Data access layer for Report entity operations
 */

import { BaseRepository } from '../database/base.repository';
import { Report, QueryOptions } from '../types/entities';
import { CreateReportDTO, UpdateReportDTO } from '../types/dtos';
import { NotFoundError, DatabaseError } from '../types/errors';
import { logger } from '../utils/logger';

export class ReportRepository extends BaseRepository<Report> {
  constructor() {
    super('reports');
  }

  /**
   * Create a new report
   */
  async createReport(reportData: CreateReportDTO): Promise<Report> {
    try {
      const reportToCreate: Partial<Report> = {
        ...reportData,
        status: 'generating',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const report = await this.create(reportToCreate);
      
      logger.audit('Report created', {
        reportId: report.id,
        type: report.type,
        format: report.format,
        generatedBy: report.generatedBy
      });

      return report;
    } catch (error) {
      logger.error('Failed to create report', {
        error: error.message,
        reportData
      });
      throw error;
    }
  }

  /**
   * Find reports by type
   */
  async findByType(type: string, options?: QueryOptions): Promise<Report[]> {
    try {
      const query = `
        SELECT * FROM reports 
        WHERE type = $type
        ORDER BY ${options?.sortBy || 'createdAt'} ${options?.sortOrder || 'DESC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { type };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find reports by type', {
        error: error.message,
        type
      });
      throw new DatabaseError('Failed to find reports by type');
    }
  }

  /**
   * Find reports by generator
   */
  async findByGenerator(generatorId: string, options?: QueryOptions): Promise<Report[]> {
    try {
      const query = `
        SELECT * FROM reports 
        WHERE generatedBy = $generatorId
        ORDER BY ${options?.sortBy || 'createdAt'} ${options?.sortOrder || 'DESC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { generatorId };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find reports by generator', {
        error: error.message,
        generatorId
      });
      throw new DatabaseError('Failed to find reports by generator');
    }
  }

  /**
   * Find reports by status
   */
  async findByStatus(status: string): Promise<Report[]> {
    try {
      return await this.findByField('status', status);
    } catch (error) {
      logger.error('Failed to find reports by status', {
        error: error.message,
        status
      });
      throw new DatabaseError('Failed to find reports by status');
    }
  }

  /**
   * Find reports by inspection
   */
  async findByInspection(inspectionId: string): Promise<Report[]> {
    try {
      const query = `
        SELECT * FROM reports 
        WHERE inspectionIds CONTAINS $inspectionId
        ORDER BY createdAt DESC
      `;

      const result = await this.db.query(query, { inspectionId });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find reports by inspection', {
        error: error.message,
        inspectionId
      });
      throw new DatabaseError('Failed to find reports by inspection');
    }
  }

  /**
   * Find reports by asset
   */
  async findByAsset(assetId: string): Promise<Report[]> {
    try {
      const query = `
        SELECT * FROM reports 
        WHERE assetIds CONTAINS $assetId
        ORDER BY createdAt DESC
      `;

      const result = await this.db.query(query, { assetId });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find reports by asset', {
        error: error.message,
        assetId
      });
      throw new DatabaseError('Failed to find reports by asset');
    }
  }

  /**
   * Find reports by folder
   */
  async findByFolder(folderId: string): Promise<Report[]> {
    try {
      const query = `
        SELECT * FROM reports 
        WHERE folderIds CONTAINS $folderId
        ORDER BY createdAt DESC
      `;

      const result = await this.db.query(query, { folderId });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find reports by folder', {
        error: error.message,
        folderId
      });
      throw new DatabaseError('Failed to find reports by folder');
    }
  }

  /**
   * Update report status
   */
  async updateReportStatus(reportId: string, status: string, errorMessage?: string): Promise<Report> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString()
      };

      if (status === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }

      if (status === 'failed' && errorMessage) {
        updateData.errorMessage = errorMessage;
      }

      const report = await this.update(reportId, updateData);

      logger.audit('Report status updated', {
        reportId,
        status,
        errorMessage
      });

      return report;
    } catch (error) {
      logger.error('Failed to update report status', {
        error: error.message,
        reportId,
        status
      });
      throw error;
    }
  }

  /**
   * Update report content
   */
  async updateReportContent(reportId: string, content: any, filePath?: string): Promise<Report> {
    try {
      const updateData: any = {
        content,
        updatedAt: new Date().toISOString()
      };

      if (filePath) {
        updateData.filePath = filePath;
      }

      const report = await this.update(reportId, updateData);

      logger.audit('Report content updated', {
        reportId,
        hasContent: !!content,
        filePath
      });

      return report;
    } catch (error) {
      logger.error('Failed to update report content', {
        error: error.message,
        reportId
      });
      throw error;
    }
  }

  /**
   * Search reports with advanced filters
   */
  async searchReports(searchTerm: string, filters: any = {}, options: QueryOptions = {}): Promise<{ reports: Report[], total: number }> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any = {};

      // Add search term
      if (searchTerm) {
        whereClause += ` AND (title CONTAINS $search OR description CONTAINS $search)`;
        params.search = searchTerm;
      }

      // Add filters
      if (filters.type) {
        whereClause += ` AND type = $type`;
        params.type = filters.type;
      }

      if (filters.status) {
        whereClause += ` AND status = $status`;
        params.status = filters.status;
      }

      if (filters.format) {
        whereClause += ` AND format = $format`;
        params.format = filters.format;
      }

      if (filters.generatedBy) {
        whereClause += ` AND generatedBy = $generatedBy`;
        params.generatedBy = filters.generatedBy;
      }

      if (filters.startDate) {
        whereClause += ` AND createdAt >= $startDate`;
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        whereClause += ` AND createdAt <= $endDate`;
        params.endDate = filters.endDate;
      }

      if (filters.inspectionIds && filters.inspectionIds.length > 0) {
        whereClause += ` AND inspectionIds CONTAINSANY $inspectionIds`;
        params.inspectionIds = filters.inspectionIds;
      }

      if (filters.assetIds && filters.assetIds.length > 0) {
        whereClause += ` AND assetIds CONTAINSANY $assetIds`;
        params.assetIds = filters.assetIds;
      }

      if (filters.folderIds && filters.folderIds.length > 0) {
        whereClause += ` AND folderIds CONTAINSANY $folderIds`;
        params.folderIds = filters.folderIds;
      }

      // Count query
      const countQuery = `SELECT count() as total FROM reports ${whereClause}`;
      const countResult = await this.db.query(countQuery, params);
      const total = countResult[0]?.total || 0;

      // Data query
      let dataQuery = `SELECT * FROM reports ${whereClause}`;
      
      // Add sorting
      const sortBy = options.sortBy || 'createdAt';
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
      const reports = dataResult[0] || [];

      return { reports, total };
    } catch (error) {
      logger.error('Failed to search reports', {
        error: error.message,
        searchTerm,
        filters
      });
      throw new DatabaseError('Failed to search reports');
    }
  }

  /**
   * Get report statistics
   */
  async getReportStats(filters: any = {}): Promise<any> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any = {};

      if (filters.startDate) {
        whereClause += ` AND createdAt >= $startDate`;
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        whereClause += ` AND createdAt <= $endDate`;
        params.endDate = filters.endDate;
      }

      if (filters.generatedBy) {
        whereClause += ` AND generatedBy = $generatedBy`;
        params.generatedBy = filters.generatedBy;
      }

      const query = `
        SELECT 
          count() as totalReports,
          count(CASE WHEN status = 'completed' THEN 1 END) as completedReports,
          count(CASE WHEN status = 'generating' THEN 1 END) as generatingReports,
          count(CASE WHEN status = 'failed' THEN 1 END) as failedReports,
          count(CASE WHEN type = 'inspection' THEN 1 END) as inspectionReports,
          count(CASE WHEN type = 'asset' THEN 1 END) as assetReports,
          count(CASE WHEN type = 'summary' THEN 1 END) as summaryReports,
          count(CASE WHEN format = 'pdf' THEN 1 END) as pdfReports,
          count(CASE WHEN format = 'excel' THEN 1 END) as excelReports,
          count(CASE WHEN format = 'csv' THEN 1 END) as csvReports
        FROM reports ${whereClause}
      `;

      const result = await this.db.query(query, params);
      return result[0] || {};
    } catch (error) {
      logger.error('Failed to get report statistics', {
        error: error.message,
        filters
      });
      throw new DatabaseError('Failed to get report statistics');
    }
  }

  /**
   * Get report generation trends
   */
  async getReportTrends(days: number = 30): Promise<any[]> {
    try {
      const query = `
        SELECT 
          time::format(createdAt, '%Y-%m-%d') as date,
          count() as totalReports,
          count(CASE WHEN status = 'completed' THEN 1 END) as completedReports,
          count(CASE WHEN status = 'failed' THEN 1 END) as failedReports
        FROM reports 
        WHERE createdAt >= time::now() - duration::from::days($days)
        GROUP BY time::format(createdAt, '%Y-%m-%d')
        ORDER BY date DESC
      `;

      const result = await this.db.query(query, { days });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get report trends', {
        error: error.message,
        days
      });
      throw new DatabaseError('Failed to get report trends');
    }
  }

  /**
   * Get popular report types
   */
  async getPopularReportTypes(limit: number = 10): Promise<any[]> {
    try {
      const query = `
        SELECT 
          type,
          count() as reportCount,
          count(CASE WHEN status = 'completed' THEN 1 END) as completedCount,
          (count(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / count()) as successRate
        FROM reports 
        GROUP BY type
        ORDER BY reportCount DESC
        LIMIT $limit
      `;

      const result = await this.db.query(query, { limit });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get popular report types', {
        error: error.message,
        limit
      });
      throw new DatabaseError('Failed to get popular report types');
    }
  }

  /**
   * Get user report activity
   */
  async getUserReportActivity(userId: string, days: number = 30): Promise<any> {
    try {
      const query = `
        SELECT 
          count() as totalReports,
          count(CASE WHEN status = 'completed' THEN 1 END) as completedReports,
          count(CASE WHEN status = 'failed' THEN 1 END) as failedReports,
          avg(CASE WHEN completedAt IS NOT NONE THEN time::unix(completedAt) - time::unix(createdAt) END) as avgGenerationTime
        FROM reports 
        WHERE generatedBy = $userId
        AND createdAt >= time::now() - duration::from::days($days)
      `;

      const result = await this.db.query(query, { userId, days });
      return result[0] || {};
    } catch (error) {
      logger.error('Failed to get user report activity', {
        error: error.message,
        userId,
        days
      });
      throw new DatabaseError('Failed to get user report activity');
    }
  }

  /**
   * Get reports requiring cleanup (old completed/failed reports)
   */
  async getReportsForCleanup(olderThanDays: number = 90): Promise<Report[]> {
    try {
      const query = `
        SELECT * FROM reports 
        WHERE (status = 'completed' OR status = 'failed')
        AND createdAt < time::now() - duration::from::days($olderThanDays)
        ORDER BY createdAt ASC
      `;

      const result = await this.db.query(query, { olderThanDays });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get reports for cleanup', {
        error: error.message,
        olderThanDays
      });
      throw new DatabaseError('Failed to get reports for cleanup');
    }
  }

  /**
   * Delete old reports
   */
  async deleteOldReports(olderThanDays: number = 90): Promise<number> {
    try {
      const query = `
        DELETE FROM reports 
        WHERE (status = 'completed' OR status = 'failed')
        AND createdAt < time::now() - duration::from::days($olderThanDays)
      `;

      const result = await this.db.query(query, { olderThanDays });
      const deletedCount = result[0]?.length || 0;

      logger.audit('Old reports deleted', {
        deletedCount,
        olderThanDays
      });

      return deletedCount;
    } catch (error) {
      logger.error('Failed to delete old reports', {
        error: error.message,
        olderThanDays
      });
      throw new DatabaseError('Failed to delete old reports');
    }
  }

  /**
   * Get report types
   */
  async getReportTypes(): Promise<string[]> {
    try {
      const query = `
        SELECT DISTINCT type FROM reports 
        WHERE type IS NOT NONE
        ORDER BY type
      `;

      const result = await this.db.query(query);
      return (result[0] || []).map((row: any) => row.type);
    } catch (error) {
      logger.error('Failed to get report types', {
        error: error.message
      });
      throw new DatabaseError('Failed to get report types');
    }
  }

  /**
   * Get report formats
   */
  async getReportFormats(): Promise<string[]> {
    try {
      const query = `
        SELECT DISTINCT format FROM reports 
        WHERE format IS NOT NONE
        ORDER BY format
      `;

      const result = await this.db.query(query);
      return (result[0] || []).map((row: any) => row.format);
    } catch (error) {
      logger.error('Failed to get report formats', {
        error: error.message
      });
      throw new DatabaseError('Failed to get report formats');
    }
  }

  /**
   * Update report metadata
   */
  async updateReportMetadata(reportId: string, metadata: any): Promise<Report> {
    try {
      const report = await this.update(reportId, {
        metadata,
        updatedAt: new Date().toISOString()
      });

      logger.audit('Report metadata updated', {
        reportId,
        metadataKeys: Object.keys(metadata)
      });

      return report;
    } catch (error) {
      logger.error('Failed to update report metadata', {
        error: error.message,
        reportId
      });
      throw error;
    }
  }

  /**
   * Bulk update reports
   */
  async bulkUpdateReports(reportIds: string[], updateData: Partial<Report>): Promise<void> {
    try {
      const query = `
        UPDATE reports SET 
        ${Object.keys(updateData).map(key => `${key} = $${key}`).join(', ')},
        updatedAt = $updatedAt
        WHERE id IN $reportIds
      `;

      const params = {
        ...updateData,
        updatedAt: new Date().toISOString(),
        reportIds
      };

      await this.db.query(query, params);

      logger.audit('Bulk report update', {
        reportIds,
        updatedFields: Object.keys(updateData)
      });
    } catch (error) {
      logger.error('Failed to bulk update reports', {
        error: error.message,
        reportIds,
        updateData
      });
      throw new DatabaseError('Failed to bulk update reports');
    }
  }

  /**
   * Get report generation queue
   */
  async getReportQueue(): Promise<Report[]> {
    try {
      const query = `
        SELECT * FROM reports 
        WHERE status = 'generating'
        ORDER BY createdAt ASC
      `;

      const result = await this.db.query(query);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get report queue', {
        error: error.message
      });
      throw new DatabaseError('Failed to get report queue');
    }
  }

  /**
   * Get next report in queue
   */
  async getNextReportInQueue(): Promise<Report | null> {
    try {
      const query = `
        SELECT * FROM reports 
        WHERE status = 'generating'
        ORDER BY createdAt ASC
        LIMIT 1
      `;

      const result = await this.db.query(query);
      return result[0]?.[0] || null;
    } catch (error) {
      logger.error('Failed to get next report in queue', {
        error: error.message
      });
      throw new DatabaseError('Failed to get next report in queue');
    }
  }
}