/**
 * Asset Repository
 * Data access layer for Asset entity operations
 */

import { BaseRepository } from '../database/base.repository';
import { Asset, QueryOptions } from '../types/entities';
import { CreateAssetDTO, UpdateAssetDTO } from '../types/dtos';
import { NotFoundError, ConflictError, DatabaseError } from '../types/errors';
import { logger } from '../utils/logger';

export class AssetRepository extends BaseRepository<Asset> {
  constructor() {
    super('assets');
  }

  /**
   * Create a new asset
   */
  async createAsset(assetData: CreateAssetDTO): Promise<Asset> {
    try {
      // Check if asset code already exists
      if (assetData.assetCode) {
        const existingAsset = await this.findByAssetCode(assetData.assetCode);
        if (existingAsset) {
          throw new ConflictError('Asset code already exists', 'DUPLICATE_ASSET_CODE', {
            assetCode: assetData.assetCode
          });
        }
      }

      // Prepare asset data
      const assetToCreate: Partial<Asset> = {
        ...assetData,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const asset = await this.create(assetToCreate);
      
      logger.audit('Asset created', {
        assetId: asset.id,
        assetCode: asset.assetCode,
        name: asset.name,
        type: asset.type
      });

      return asset;
    } catch (error) {
      logger.error('Failed to create asset', {
        error: error.message,
        assetData
      });
      throw error;
    }
  }

  /**
   * Find asset by asset code
   */
  async findByAssetCode(assetCode: string): Promise<Asset | null> {
    try {
      const assets = await this.findByField('assetCode', assetCode);
      return assets.length > 0 ? assets[0] : null;
    } catch (error) {
      logger.error('Failed to find asset by code', {
        error: error.message,
        assetCode
      });
      throw new DatabaseError('Failed to find asset by code');
    }
  }

  /**
   * Find assets by type
   */
  async findByType(type: string): Promise<Asset[]> {
    try {
      return await this.findByField('type', type);
    } catch (error) {
      logger.error('Failed to find assets by type', {
        error: error.message,
        type
      });
      throw new DatabaseError('Failed to find assets by type');
    }
  }

  /**
   * Find assets by location
   */
  async findByLocation(location: string): Promise<Asset[]> {
    try {
      return await this.findByField('location', location);
    } catch (error) {
      logger.error('Failed to find assets by location', {
        error: error.message,
        location
      });
      throw new DatabaseError('Failed to find assets by location');
    }
  }

  /**
   * Find assets by department
   */
  async findByDepartment(department: string): Promise<Asset[]> {
    try {
      return await this.findByField('department', department);
    } catch (error) {
      logger.error('Failed to find assets by department', {
        error: error.message,
        department
      });
      throw new DatabaseError('Failed to find assets by department');
    }
  }

  /**
   * Find active assets
   */
  async findActiveAssets(options?: QueryOptions): Promise<Asset[]> {
    try {
      const query = `
        SELECT * FROM assets 
        WHERE isActive = true
        ${options?.search ? `AND (name CONTAINS $search OR assetCode CONTAINS $search OR description CONTAINS $search)` : ''}
        ORDER BY ${options?.sortBy || 'name'} ${options?.sortOrder || 'ASC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = {};
      if (options?.search) params.search = options.search;
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find active assets', {
        error: error.message,
        options
      });
      throw new DatabaseError('Failed to find active assets');
    }
  }

  /**
   * Find assets by QR code
   */
  async findByQRCode(qrCode: string): Promise<Asset | null> {
    try {
      const assets = await this.findByField('qrCode', qrCode);
      return assets.length > 0 ? assets[0] : null;
    } catch (error) {
      logger.error('Failed to find asset by QR code', {
        error: error.message,
        qrCode
      });
      throw new DatabaseError('Failed to find asset by QR code');
    }
  }

  /**
   * Find assets by barcode
   */
  async findByBarcode(barcode: string): Promise<Asset | null> {
    try {
      const assets = await this.findByField('barcode', barcode);
      return assets.length > 0 ? assets[0] : null;
    } catch (error) {
      logger.error('Failed to find asset by barcode', {
        error: error.message,
        barcode
      });
      throw new DatabaseError('Failed to find asset by barcode');
    }
  }

  /**
   * Update asset location
   */
  async updateLocation(assetId: string, location: string, coordinates?: { latitude: number; longitude: number }): Promise<Asset> {
    try {
      const updateData: any = {
        location,
        updatedAt: new Date().toISOString()
      };

      if (coordinates) {
        updateData.coordinates = coordinates;
      }

      const asset = await this.update(assetId, updateData);

      logger.audit('Asset location updated', {
        assetId,
        location,
        coordinates
      });

      return asset;
    } catch (error) {
      logger.error('Failed to update asset location', {
        error: error.message,
        assetId,
        location
      });
      throw error;
    }
  }

  /**
   * Update asset status
   */
  async updateStatus(assetId: string, status: string): Promise<Asset> {
    try {
      const asset = await this.update(assetId, {
        status,
        updatedAt: new Date().toISOString()
      });

      logger.audit('Asset status updated', {
        assetId,
        status
      });

      return asset;
    } catch (error) {
      logger.error('Failed to update asset status', {
        error: error.message,
        assetId,
        status
      });
      throw error;
    }
  }

  /**
   * Deactivate asset
   */
  async deactivateAsset(assetId: string): Promise<void> {
    try {
      await this.update(assetId, {
        isActive: false,
        updatedAt: new Date().toISOString()
      });

      logger.audit('Asset deactivated', { assetId });
    } catch (error) {
      logger.error('Failed to deactivate asset', {
        error: error.message,
        assetId
      });
      throw error;
    }
  }

  /**
   * Activate asset
   */
  async activateAsset(assetId: string): Promise<void> {
    try {
      await this.update(assetId, {
        isActive: true,
        updatedAt: new Date().toISOString()
      });

      logger.audit('Asset activated', { assetId });
    } catch (error) {
      logger.error('Failed to activate asset', {
        error: error.message,
        assetId
      });
      throw error;
    }
  }

  /**
   * Search assets with advanced filters
   */
  async searchAssets(searchTerm: string, filters: any = {}, options: QueryOptions = {}): Promise<{ assets: Asset[], total: number }> {
    try {
      let whereClause = 'WHERE isActive = true';
      const params: any = {};

      // Add search term
      if (searchTerm) {
        whereClause += ` AND (name CONTAINS $search OR assetCode CONTAINS $search OR description CONTAINS $search)`;
        params.search = searchTerm;
      }

      // Add filters
      if (filters.type) {
        whereClause += ` AND type = $type`;
        params.type = filters.type;
      }

      if (filters.location) {
        whereClause += ` AND location = $location`;
        params.location = filters.location;
      }

      if (filters.department) {
        whereClause += ` AND department = $department`;
        params.department = filters.department;
      }

      if (filters.status) {
        whereClause += ` AND status = $status`;
        params.status = filters.status;
      }

      if (filters.category) {
        whereClause += ` AND category = $category`;
        params.category = filters.category;
      }

      // Count query
      const countQuery = `SELECT count() as total FROM assets ${whereClause}`;
      const countResult = await this.db.query(countQuery, params);
      const total = countResult[0]?.total || 0;

      // Data query
      let dataQuery = `SELECT * FROM assets ${whereClause}`;
      
      // Add sorting
      const sortBy = options.sortBy || 'name';
      const sortOrder = options.sortOrder || 'ASC';
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
      const assets = dataResult[0] || [];

      return { assets, total };
    } catch (error) {
      logger.error('Failed to search assets', {
        error: error.message,
        searchTerm,
        filters
      });
      throw new DatabaseError('Failed to search assets');
    }
  }

  /**
   * Get asset inspection history
   */
  async getInspectionHistory(assetId: string, limit: number = 10): Promise<any[]> {
    try {
      const query = `
        SELECT 
          id,
          status,
          score,
          inspector,
          createdAt,
          completedAt,
          priority
        FROM inspections 
        WHERE assetId = $assetId
        ORDER BY createdAt DESC
        LIMIT $limit
      `;

      const result = await this.db.query(query, { assetId, limit });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get asset inspection history', {
        error: error.message,
        assetId
      });
      throw new DatabaseError('Failed to get asset inspection history');
    }
  }

  /**
   * Get asset statistics
   */
  async getAssetStats(assetId: string): Promise<any> {
    try {
      const query = `
        SELECT 
          (SELECT count() FROM inspections WHERE assetId = $assetId) as totalInspections,
          (SELECT count() FROM inspections WHERE assetId = $assetId AND status = 'completed') as completedInspections,
          (SELECT count() FROM inspections WHERE assetId = $assetId AND status = 'pending') as pendingInspections,
          (SELECT avg(score.percentage) FROM inspections WHERE assetId = $assetId AND score IS NOT NONE) as avgScore,
          (SELECT count() FROM inspections WHERE assetId = $assetId AND priority = 'high') as highPriorityInspections,
          (SELECT max(createdAt) FROM inspections WHERE assetId = $assetId) as lastInspectionDate
      `;

      const result = await this.db.query(query, { assetId });
      return result[0] || {};
    } catch (error) {
      logger.error('Failed to get asset statistics', {
        error: error.message,
        assetId
      });
      throw new DatabaseError('Failed to get asset statistics');
    }
  }

  /**
   * Find assets near location
   */
  async findNearLocation(latitude: number, longitude: number, radiusKm: number = 1): Promise<Asset[]> {
    try {
      const query = `
        SELECT * FROM assets 
        WHERE isActive = true 
        AND coordinates IS NOT NONE
        AND geo::distance(coordinates, {latitude: $lat, longitude: $lng}) <= $radius
        ORDER BY geo::distance(coordinates, {latitude: $lat, longitude: $lng})
      `;

      const result = await this.db.query(query, {
        lat: latitude,
        lng: longitude,
        radius: radiusKm * 1000 // Convert to meters
      });

      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find assets near location', {
        error: error.message,
        latitude,
        longitude,
        radiusKm
      });
      throw new DatabaseError('Failed to find assets near location');
    }
  }

  /**
   * Get assets requiring inspection
   */
  async getAssetsRequiringInspection(): Promise<Asset[]> {
    try {
      const query = `
        SELECT a.* FROM assets a
        WHERE a.isActive = true
        AND (
          a.lastInspectionDate IS NONE
          OR a.lastInspectionDate < time::now() - duration(a.inspectionFrequency || '30d')
        )
        ORDER BY a.lastInspectionDate ASC NULLS FIRST
      `;

      const result = await this.db.query(query);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get assets requiring inspection', {
        error: error.message
      });
      throw new DatabaseError('Failed to get assets requiring inspection');
    }
  }

  /**
   * Update asset maintenance info
   */
  async updateMaintenanceInfo(assetId: string, maintenanceData: any): Promise<Asset> {
    try {
      const asset = await this.update(assetId, {
        ...maintenanceData,
        updatedAt: new Date().toISOString()
      });

      logger.audit('Asset maintenance info updated', {
        assetId,
        maintenanceData
      });

      return asset;
    } catch (error) {
      logger.error('Failed to update asset maintenance info', {
        error: error.message,
        assetId,
        maintenanceData
      });
      throw error;
    }
  }

  /**
   * Bulk update assets
   */
  async bulkUpdateAssets(assetIds: string[], updateData: Partial<Asset>): Promise<void> {
    try {
      const query = `
        UPDATE assets SET 
        ${Object.keys(updateData).map(key => `${key} = $${key}`).join(', ')},
        updatedAt = $updatedAt
        WHERE id IN $assetIds
      `;

      const params = {
        ...updateData,
        updatedAt: new Date().toISOString(),
        assetIds
      };

      await this.db.query(query, params);

      logger.audit('Bulk asset update', {
        assetIds,
        updatedFields: Object.keys(updateData)
      });
    } catch (error) {
      logger.error('Failed to bulk update assets', {
        error: error.message,
        assetIds,
        updateData
      });
      throw new DatabaseError('Failed to bulk update assets');
    }
  }

  /**
   * Get asset utilization report
   */
  async getAssetUtilization(startDate: string, endDate: string): Promise<any[]> {
    try {
      const query = `
        SELECT 
          a.id,
          a.name,
          a.assetCode,
          a.type,
          a.location,
          count(i.id) as inspectionCount,
          avg(i.score.percentage) as avgScore,
          max(i.createdAt) as lastInspection
        FROM assets a
        LEFT JOIN inspections i ON a.id = i.assetId 
          AND i.createdAt >= $startDate 
          AND i.createdAt <= $endDate
        WHERE a.isActive = true
        GROUP BY a.id, a.name, a.assetCode, a.type, a.location
        ORDER BY inspectionCount DESC
      `;

      const result = await this.db.query(query, { startDate, endDate });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get asset utilization', {
        error: error.message,
        startDate,
        endDate
      });
      throw new DatabaseError('Failed to get asset utilization');
    }
  }

  /**
   * Get assets by custom field
   */
  async findByCustomField(fieldName: string, fieldValue: any): Promise<Asset[]> {
    try {
      const query = `
        SELECT * FROM assets 
        WHERE isActive = true 
        AND customFields.${fieldName} = $fieldValue
      `;

      const result = await this.db.query(query, { fieldValue });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find assets by custom field', {
        error: error.message,
        fieldName,
        fieldValue
      });
      throw new DatabaseError('Failed to find assets by custom field');
    }
  }
}