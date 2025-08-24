/**
 * Inspection Repository
 * Data access layer for Inspection entity operations
 */

import { BaseRepository } from '../database/base.repository';
import { Inspection, QueryOptions } from '../types/entities';
import { CreateInspectionDTO, UpdateInspectionDTO } from '../types/dtos';
import { NotFoundError, ConflictError, DatabaseError } from '../types/errors';
import { logger } from '../utils/logger';

export class InspectionRepository extends BaseRepository<Inspection> {
  constructor() {
    super('inspections');
  }

  /**
   * Create a new inspection
   */
  async createInspection(inspectionData: CreateInspectionDTO): Promise<Inspection> {
    try {
      // Prepare inspection data
      const inspectionToCreate: Partial<Inspection> = {
        ...inspectionData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const inspection = await this.create(inspectionToCreate);
      
      logger.audit('Inspection created', {
        inspectionId: inspection.id,
        assetId: inspection.assetId,
        inspector: inspection.inspector,
        formTemplateId: inspection.formTemplateId
      });

      return inspection;
    } catch (error) {
      logger.error('Failed to create inspection', {
        error: error.message,
        inspectionData
      });
      throw error;
    }
  }

  /**
   * Find inspections by asset
   */
  async findByAsset(assetId: string, options?: QueryOptions): Promise<Inspection[]> {
    try {
      const query = `
        SELECT * FROM inspections 
        WHERE assetId = $assetId
        ORDER BY ${options?.sortBy || 'createdAt'} ${options?.sortOrder || 'DESC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { assetId };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find inspections by asset', {
        error: error.message,
        assetId
      });
      throw new DatabaseError('Failed to find inspections by asset');
    }
  }

  /**
   * Find inspections by inspector
   */
  async findByInspector(inspectorId: string, options?: QueryOptions): Promise<Inspection[]> {
    try {
      const query = `
        SELECT * FROM inspections 
        WHERE inspector = $inspectorId
        ORDER BY ${options?.sortBy || 'createdAt'} ${options?.sortOrder || 'DESC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { inspectorId };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find inspections by inspector', {
        error: error.message,
        inspectorId
      });
      throw new DatabaseError('Failed to find inspections by inspector');
    }
  }

  /**
   * Find inspections by folder
   */
  async findByFolder(folderId: string, options?: QueryOptions): Promise<Inspection[]> {
    try {
      const query = `
        SELECT * FROM inspections 
        WHERE folderId = $folderId
        ORDER BY ${options?.sortBy || 'createdAt'} ${options?.sortOrder || 'DESC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { folderId };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find inspections by folder', {
        error: error.message,
        folderId
      });
      throw new DatabaseError('Failed to find inspections by folder');
    }
  }

  /**
   * Find inspections by status
   */
  async findByStatus(status: string, options?: QueryOptions): Promise<Inspection[]> {
    try {
      const query = `
        SELECT * FROM inspections 
        WHERE status = $status
        ORDER BY ${options?.sortBy || 'createdAt'} ${options?.sortOrder || 'DESC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { status };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find inspections by status', {
        error: error.message,
        status
      });
      throw new DatabaseError('Failed to find inspections by status');
    }
  }

  /**
   * Find inspections by priority
   */
  async findByPriority(priority: string, options?: QueryOptions): Promise<Inspection[]> {
    try {
      const query = `
        SELECT * FROM inspections 
        WHERE priority = $priority
        ORDER BY ${options?.sortBy || 'createdAt'} ${options?.sortOrder || 'DESC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { priority };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find inspections by priority', {
        error: error.message,
        priority
      });
      throw new DatabaseError('Failed to find inspections by priority');
    }
  }

  /**
   * Update inspection status
   */
  async updateStatus(inspectionId: string, status: string, completedBy?: string): Promise<Inspection> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString()
      };

      if (status === 'completed') {
        updateData.completedAt = new Date().toISOString();
        if (completedBy) {
          updateData.completedBy = completedBy;
        }
      }

      const inspection = await this.update(inspectionId, updateData);

      logger.audit('Inspection status updated', {
        inspectionId,
        status,
        completedBy
      });

      return inspection;
    } catch (error) {
      logger.error('Failed to update inspection status', {
        error: error.message,
        inspectionId,
        status
      });
      throw error;
    }
  }

  /**
   * Update inspection responses
   */
  async updateResponses(inspectionId: string, responses: any[]): Promise<Inspection> {
    try {
      const inspection = await this.update(inspectionId, {
        responses,
        updatedAt: new Date().toISOString()
      });

      logger.audit('Inspection responses updated', {
        inspectionId,
        responseCount: responses.length
      });

      return inspection;
    } catch (error) {
      logger.error('Failed to update inspection responses', {
        error: error.message,
        inspectionId
      });
      throw error;
    }
  }

  /**
   * Update inspection score
   */
  async updateScore(inspectionId: string, score: any): Promise<Inspection> {
    try {
      const inspection = await this.update(inspectionId, {
        score,
        updatedAt: new Date().toISOString()
      });

      logger.audit('Inspection score updated', {
        inspectionId,
        score
      });

      return inspection;
    } catch (error) {
      logger.error('Failed to update inspection score', {
        error: error.message,
        inspectionId,
        score
      });
      throw error;
    }
  }

  /**
   * Add photos to inspection
   */
  async addPhotos(inspectionId: string, photos: any[]): Promise<Inspection> {
    try {
      const inspection = await this.findById(inspectionId);
      if (!inspection) {
        throw new NotFoundError('Inspection not found', 'inspections', inspectionId);
      }

      const existingPhotos = inspection.photos || [];
      const updatedPhotos = [...existingPhotos, ...photos];

      const updatedInspection = await this.update(inspectionId, {
        photos: updatedPhotos,
        updatedAt: new Date().toISOString()
      });

      logger.audit('Photos added to inspection', {
        inspectionId,
        photoCount: photos.length,
        totalPhotos: updatedPhotos.length
      });

      return updatedInspection;
    } catch (error) {
      logger.error('Failed to add photos to inspection', {
        error: error.message,
        inspectionId
      });
      throw error;
    }
  }

  /**
   * Remove photo from inspection
   */
  async removePhoto(inspectionId: string, photoId: string): Promise<Inspection> {
    try {
      const inspection = await this.findById(inspectionId);
      if (!inspection) {
        throw new NotFoundError('Inspection not found', 'inspections', inspectionId);
      }

      const photos = inspection.photos || [];
      const updatedPhotos = photos.filter(photo => photo.id !== photoId);

      const updatedInspection = await this.update(inspectionId, {
        photos: updatedPhotos,
        updatedAt: new Date().toISOString()
      });

      logger.audit('Photo removed from inspection', {
        inspectionId,
        photoId,
        remainingPhotos: updatedPhotos.length
      });

      return updatedInspection;
    } catch (error) {
      logger.error('Failed to remove photo from inspection', {
        error: error.message,
        inspectionId,
        photoId
      });
      throw error;
    }
  }

  /**
   * Search inspections with advanced filters
   */
  async searchInspections(searchTerm: string, filters: any = {}, options: QueryOptions = {}): Promise<{ inspections: Inspection[], total: number }> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any = {};

      // Add search term
      if (searchTerm) {
        whereClause += ` AND (title CONTAINS $search OR description CONTAINS $search OR notes CONTAINS $search)`;
        params.search = searchTerm;
      }

      // Add filters
      if (filters.status) {
        whereClause += ` AND status = $status`;
        params.status = filters.status;
      }

      if (filters.priority) {
        whereClause += ` AND priority = $priority`;
        params.priority = filters.priority;
      }

      if (filters.inspector) {
        whereClause += ` AND inspector = $inspector`;
        params.inspector = filters.inspector;
      }

      if (filters.assetId) {
        whereClause += ` AND assetId = $assetId`;
        params.assetId = filters.assetId;
      }

      if (filters.folderId) {
        whereClause += ` AND folderId = $folderId`;
        params.folderId = filters.folderId;
      }

      if (filters.formTemplateId) {
        whereClause += ` AND formTemplateId = $formTemplateId`;
        params.formTemplateId = filters.formTemplateId;
      }

      if (filters.startDate) {
        whereClause += ` AND createdAt >= $startDate`;
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        whereClause += ` AND createdAt <= $endDate`;
        params.endDate = filters.endDate;
      }

      if (filters.minScore !== undefined) {
        whereClause += ` AND score.percentage >= $minScore`;
        params.minScore = filters.minScore;
      }

      if (filters.maxScore !== undefined) {
        whereClause += ` AND score.percentage <= $maxScore`;
        params.maxScore = filters.maxScore;
      }

      // Count query
      const countQuery = `SELECT count() as total FROM inspections ${whereClause}`;
      const countResult = await this.db.query(countQuery, params);
      const total = countResult[0]?.total || 0;

      // Data query
      let dataQuery = `SELECT * FROM inspections ${whereClause}`;
      
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
      const inspections = dataResult[0] || [];

      return { inspections, total };
    } catch (error) {
      logger.error('Failed to search inspections', {
        error: error.message,
        searchTerm,
        filters
      });
      throw new DatabaseError('Failed to search inspections');
    }
  }

  /**
   * Get inspection statistics
   */
  async getInspectionStats(filters: any = {}): Promise<any> {
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

      if (filters.inspector) {
        whereClause += ` AND inspector = $inspector`;
        params.inspector = filters.inspector;
      }

      if (filters.folderId) {
        whereClause += ` AND folderId = $folderId`;
        params.folderId = filters.folderId;
      }

      const query = `
        SELECT 
          count() as total,
          count(CASE WHEN status = 'completed' THEN 1 END) as completed,
          count(CASE WHEN status = 'pending' THEN 1 END) as pending,
          count(CASE WHEN status = 'in_progress' THEN 1 END) as inProgress,
          count(CASE WHEN priority = 'high' THEN 1 END) as highPriority,
          count(CASE WHEN priority = 'medium' THEN 1 END) as mediumPriority,
          count(CASE WHEN priority = 'low' THEN 1 END) as lowPriority,
          avg(score.percentage) as avgScore,
          min(score.percentage) as minScore,
          max(score.percentage) as maxScore
        FROM inspections ${whereClause}
      `;

      const result = await this.db.query(query, params);
      return result[0] || {};
    } catch (error) {
      logger.error('Failed to get inspection statistics', {
        error: error.message,
        filters
      });
      throw new DatabaseError('Failed to get inspection statistics');
    }
  }

  /**
   * Get overdue inspections
   */
  async getOverdueInspections(): Promise<Inspection[]> {
    try {
      const query = `
        SELECT * FROM inspections 
        WHERE status IN ['pending', 'in_progress']
        AND dueDate < time::now()
        ORDER BY dueDate ASC
      `;

      const result = await this.db.query(query);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get overdue inspections', {
        error: error.message
      });
      throw new DatabaseError('Failed to get overdue inspections');
    }
  }

  /**
   * Get upcoming inspections
   */
  async getUpcomingInspections(days: number = 7): Promise<Inspection[]> {
    try {
      const query = `
        SELECT * FROM inspections 
        WHERE status IN ['pending', 'in_progress']
        AND dueDate >= time::now()
        AND dueDate <= time::now() + ${days}d
        ORDER BY dueDate ASC
      `;

      const result = await this.db.query(query);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get upcoming inspections', {
        error: error.message,
        days
      });
      throw new DatabaseError('Failed to get upcoming inspections');
    }
  }

  /**
   * Get inspection trends
   */
  async getInspectionTrends(startDate: string, endDate: string, groupBy: 'day' | 'week' | 'month' = 'day'): Promise<any[]> {
    try {
      const query = `
        SELECT 
          date_trunc('${groupBy}', createdAt) as period,
          count() as total,
          count(CASE WHEN status = 'completed' THEN 1 END) as completed,
          avg(score.percentage) as avgScore
        FROM inspections 
        WHERE createdAt >= $startDate 
        AND createdAt <= $endDate
        GROUP BY period
        ORDER BY period ASC
      `;

      const result = await this.db.query(query, { startDate, endDate });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get inspection trends', {
        error: error.message,
        startDate,
        endDate,
        groupBy
      });
      throw new DatabaseError('Failed to get inspection trends');
    }
  }

  /**
   * Get inspector performance
   */
  async getInspectorPerformance(startDate: string, endDate: string): Promise<any[]> {
    try {
      const query = `
        SELECT 
          inspector,
          count() as totalInspections,
          count(CASE WHEN status = 'completed' THEN 1 END) as completedInspections,
          avg(score.percentage) as avgScore,
          avg(time::diff(completedAt, createdAt)) as avgCompletionTime
        FROM inspections 
        WHERE createdAt >= $startDate 
        AND createdAt <= $endDate
        AND inspector IS NOT NONE
        GROUP BY inspector
        ORDER BY totalInspections DESC
      `;

      const result = await this.db.query(query, { startDate, endDate });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get inspector performance', {
        error: error.message,
        startDate,
        endDate
      });
      throw new DatabaseError('Failed to get inspector performance');
    }
  }

  /**
   * Bulk update inspections
   */
  async bulkUpdateInspections(inspectionIds: string[], updateData: Partial<Inspection>): Promise<void> {
    try {
      const query = `
        UPDATE inspections SET 
        ${Object.keys(updateData).map(key => `${key} = $${key}`).join(', ')},
        updatedAt = $updatedAt
        WHERE id IN $inspectionIds
      `;

      const params = {
        ...updateData,
        updatedAt: new Date().toISOString(),
        inspectionIds
      };

      await this.db.query(query, params);

      logger.audit('Bulk inspection update', {
        inspectionIds,
        updatedFields: Object.keys(updateData)
      });
    } catch (error) {
      logger.error('Failed to bulk update inspections', {
        error: error.message,
        inspectionIds,
        updateData
      });
      throw new DatabaseError('Failed to bulk update inspections');
    }
  }

  /**
   * Get inspection completion rate
   */
  async getCompletionRate(startDate: string, endDate: string, groupBy?: string): Promise<any> {
    try {
      let query = `
        SELECT 
          count() as total,
          count(CASE WHEN status = 'completed' THEN 1 END) as completed,
          (count(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / count()) as completionRate
        FROM inspections 
        WHERE createdAt >= $startDate 
        AND createdAt <= $endDate
      `;

      if (groupBy) {
        query = `
          SELECT 
            ${groupBy},
            count() as total,
            count(CASE WHEN status = 'completed' THEN 1 END) as completed,
            (count(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / count()) as completionRate
          FROM inspections 
          WHERE createdAt >= $startDate 
          AND createdAt <= $endDate
          GROUP BY ${groupBy}
          ORDER BY ${groupBy}
        `;
      }

      const result = await this.db.query(query, { startDate, endDate });
      return groupBy ? result[0] || [] : result[0] || {};
    } catch (error) {
      logger.error('Failed to get completion rate', {
        error: error.message,
        startDate,
        endDate,
        groupBy
      });
      throw new DatabaseError('Failed to get completion rate');
    }
  }
}