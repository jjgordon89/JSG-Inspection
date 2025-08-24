import { databaseService } from './database.service';
import { logger } from '@utils/logger';
import { Surreal } from 'surrealdb.js';

/**
 * Base Repository Class
 * Provides common database operations for all entities
 */
export abstract class BaseRepository<T> {
  protected db: Surreal;
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.db = databaseService.getDatabase();
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      const result = await this.db.create(this.tableName, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      logger.database(`Created ${this.tableName} record`, { id: result });
      return result as T;
    } catch (error) {
      logger.error(`Failed to create ${this.tableName} record`, { data, error });
      throw error;
    }
  }

  /**
   * Find record by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const recordId = this.formatRecordId(id);
      const result = await this.db.select(recordId);
      
      if (Array.isArray(result) && result.length > 0) {
        return result[0] as T;
      }
      
      return null;
    } catch (error) {
      logger.error(`Failed to find ${this.tableName} by ID`, { id, error });
      throw error;
    }
  }

  /**
   * Find all records with optional filtering
   */
  async findAll(filters?: Record<string, any>, limit?: number, offset?: number): Promise<T[]> {
    try {
      let query = `SELECT * FROM ${this.tableName}`;
      const params: Record<string, any> = {};

      // Add WHERE clause if filters provided
      if (filters && Object.keys(filters).length > 0) {
        const conditions = Object.keys(filters).map((key, index) => {
          const paramKey = `filter_${index}`;
          params[paramKey] = filters[key];
          return `${key} = $${paramKey}`;
        });
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      // Add ORDER BY
      query += ` ORDER BY createdAt DESC`;

      // Add LIMIT and OFFSET
      if (limit) {
        params.limit = limit;
        query += ` LIMIT $limit`;
      }
      if (offset) {
        params.offset = offset;
        query += ` START $offset`;
      }

      const result = await this.db.query(query, params);
      return (result[0] as T[]) || [];
    } catch (error) {
      logger.error(`Failed to find all ${this.tableName} records`, { filters, error });
      throw error;
    }
  }

  /**
   * Find records by field value
   */
  async findBy(field: string, value: any): Promise<T[]> {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE ${field} = $value ORDER BY createdAt DESC`;
      const result = await this.db.query(query, { value });
      return (result[0] as T[]) || [];
    } catch (error) {
      logger.error(`Failed to find ${this.tableName} by ${field}`, { field, value, error });
      throw error;
    }
  }

  /**
   * Find one record by field value
   */
  async findOneBy(field: string, value: any): Promise<T | null> {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE ${field} = $value LIMIT 1`;
      const result = await this.db.query(query, { value });
      
      if (result[0] && Array.isArray(result[0]) && result[0].length > 0) {
        return result[0][0] as T;
      }
      
      return null;
    } catch (error) {
      logger.error(`Failed to find one ${this.tableName} by ${field}`, { field, value, error });
      throw error;
    }
  }

  /**
   * Update record by ID
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const recordId = this.formatRecordId(id);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      const result = await this.db.merge(recordId, updateData);
      
      logger.database(`Updated ${this.tableName} record`, { id, data: updateData });
      return result as T;
    } catch (error) {
      logger.error(`Failed to update ${this.tableName} record`, { id, data, error });
      throw error;
    }
  }

  /**
   * Delete record by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const recordId = this.formatRecordId(id);
      await this.db.delete(recordId);
      
      logger.database(`Deleted ${this.tableName} record`, { id });
      return true;
    } catch (error) {
      logger.error(`Failed to delete ${this.tableName} record`, { id, error });
      throw error;
    }
  }

  /**
   * Soft delete record by ID (sets isActive to false)
   */
  async softDelete(id: string): Promise<T> {
    try {
      const result = await this.update(id, { isActive: false } as Partial<T>);
      logger.database(`Soft deleted ${this.tableName} record`, { id });
      return result;
    } catch (error) {
      logger.error(`Failed to soft delete ${this.tableName} record`, { id, error });
      throw error;
    }
  }

  /**
   * Count records with optional filtering
   */
  async count(filters?: Record<string, any>): Promise<number> {
    try {
      let query = `SELECT count() FROM ${this.tableName}`;
      const params: Record<string, any> = {};

      if (filters && Object.keys(filters).length > 0) {
        const conditions = Object.keys(filters).map((key, index) => {
          const paramKey = `filter_${index}`;
          params[paramKey] = filters[key];
          return `${key} = $${paramKey}`;
        });
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      const result = await this.db.query(query, params);
      return (result[0] as any)?.count || 0;
    } catch (error) {
      logger.error(`Failed to count ${this.tableName} records`, { filters, error });
      throw error;
    }
  }

  /**
   * Check if record exists by ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      const record = await this.findById(id);
      return record !== null;
    } catch (error) {
      logger.error(`Failed to check if ${this.tableName} exists`, { id, error });
      return false;
    }
  }

  /**
   * Execute custom query
   */
  async query<R = any>(sql: string, params?: Record<string, any>): Promise<R[]> {
    try {
      const result = await this.db.query(sql, params);
      return result as R[];
    } catch (error) {
      logger.error(`Failed to execute custom query on ${this.tableName}`, { sql, params, error });
      throw error;
    }
  }

  /**
   * Batch create multiple records
   */
  async createMany(dataArray: Partial<T>[]): Promise<T[]> {
    try {
      const results: T[] = [];
      
      for (const data of dataArray) {
        const result = await this.create(data);
        results.push(result);
      }
      
      logger.database(`Batch created ${dataArray.length} ${this.tableName} records`);
      return results;
    } catch (error) {
      logger.error(`Failed to batch create ${this.tableName} records`, { count: dataArray.length, error });
      throw error;
    }
  }

  /**
   * Batch update multiple records
   */
  async updateMany(updates: Array<{ id: string; data: Partial<T> }>): Promise<T[]> {
    try {
      const results: T[] = [];
      
      for (const { id, data } of updates) {
        const result = await this.update(id, data);
        results.push(result);
      }
      
      logger.database(`Batch updated ${updates.length} ${this.tableName} records`);
      return results;
    } catch (error) {
      logger.error(`Failed to batch update ${this.tableName} records`, { count: updates.length, error });
      throw error;
    }
  }

  /**
   * Find records with pagination
   */
  async findWithPagination(
    page: number = 1,
    pageSize: number = 10,
    filters?: Record<string, any>,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<{ data: T[]; total: number; page: number; pageSize: number; totalPages: number }> {
    try {
      const offset = (page - 1) * pageSize;
      
      // Get total count
      const total = await this.count(filters);
      
      // Build query
      let query = `SELECT * FROM ${this.tableName}`;
      const params: Record<string, any> = {};

      // Add WHERE clause if filters provided
      if (filters && Object.keys(filters).length > 0) {
        const conditions = Object.keys(filters).map((key, index) => {
          const paramKey = `filter_${index}`;
          params[paramKey] = filters[key];
          return `${key} = $${paramKey}`;
        });
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      // Add ORDER BY
      const orderField = sortBy || 'createdAt';
      query += ` ORDER BY ${orderField} ${sortOrder}`;

      // Add LIMIT and OFFSET
      query += ` LIMIT ${pageSize} START ${offset}`;

      const result = await this.db.query(query, params);
      const data = (result[0] as T[]) || [];
      
      const totalPages = Math.ceil(total / pageSize);
      
      return {
        data,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      logger.error(`Failed to find ${this.tableName} with pagination`, { page, pageSize, filters, error });
      throw error;
    }
  }

  /**
   * Search records by text in specified fields
   */
  async search(
    searchTerm: string,
    searchFields: string[],
    limit: number = 10
  ): Promise<T[]> {
    try {
      const conditions = searchFields.map((field, index) => {
        return `string::lowercase(${field}) CONTAINS string::lowercase($searchTerm)`;
      });
      
      const query = `
        SELECT * FROM ${this.tableName} 
        WHERE ${conditions.join(' OR ')}
        ORDER BY createdAt DESC 
        LIMIT ${limit}
      `;
      
      const result = await this.db.query(query, { searchTerm });
      return (result[0] as T[]) || [];
    } catch (error) {
      logger.error(`Failed to search ${this.tableName}`, { searchTerm, searchFields, error });
      throw error;
    }
  }

  /**
   * Format record ID with table name if needed
   */
  protected formatRecordId(id: string): string {
    if (id.includes(':')) {
      return id; // Already formatted
    }
    return `${this.tableName}:${id}`;
  }

  /**
   * Extract ID from record ID
   */
  protected extractId(recordId: string): string {
    if (recordId.includes(':')) {
      return recordId.split(':')[1];
    }
    return recordId;
  }

  /**
   * Validate required fields
   */
  protected validateRequiredFields(data: Partial<T>, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => !(field in data) || data[field as keyof T] === undefined);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Get database statistics for the table
   */
  async getStats(): Promise<{
    totalRecords: number;
    activeRecords?: number;
    createdToday: number;
    createdThisWeek: number;
    createdThisMonth: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const [total, createdToday, createdThisWeek, createdThisMonth] = await Promise.all([
        this.count(),
        this.count({ createdAt: { $gte: today.toISOString() } }),
        this.count({ createdAt: { $gte: weekAgo.toISOString() } }),
        this.count({ createdAt: { $gte: monthAgo.toISOString() } }),
      ]);

      const stats: any = {
        totalRecords: total,
        createdToday,
        createdThisWeek,
        createdThisMonth,
      };

      // Add active records count if the table has isActive field
      try {
        const activeRecords = await this.count({ isActive: true });
        stats.activeRecords = activeRecords;
      } catch {
        // Table doesn't have isActive field, skip
      }

      return stats;
    } catch (error) {
      logger.error(`Failed to get stats for ${this.tableName}`, { error });
      throw error;
    }
  }
}