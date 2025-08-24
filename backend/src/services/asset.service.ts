/**
 * Asset Service
 * Handles asset management operations, QR code generation, GPS tracking, and asset-related business logic
 */

import { AssetRepository } from '../repositories/asset.repository';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AppError, ErrorCodes } from '../types/errors';
import { logger } from '../utils/logger';
import { Asset, CreateAssetDTO, UpdateAssetDTO, AssetType, AssetStatus } from '../types/asset';
import { PaginationOptions, PaginatedResult } from '../types/common';
import { generateQRCode } from '../utils/qr-code';
import { calculateDistance, validateGPSCoordinates } from '../utils/gps';
import { generateAssetId } from '../utils/id-generator';

export interface AssetSearchFilters {
  search?: string;
  type?: AssetType;
  status?: AssetStatus;
  location?: string;
  department?: string;
  assignedTo?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  lastInspectedAfter?: Date;
  lastInspectedBefore?: Date;
  hasQRCode?: boolean;
  hasGPS?: boolean;
  nearLocation?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
}

export interface AssetStatistics {
  total: number;
  byType: Record<AssetType, number>;
  byStatus: Record<AssetStatus, number>;
  byLocation: Record<string, number>;
  byDepartment: Record<string, number>;
  withQRCode: number;
  withGPS: number;
  assignedAssets: number;
  unassignedAssets: number;
  recentlyInspected: number; // last 30 days
  overdueInspections: number;
}

export interface AssetMaintenanceInfo {
  assetId: string;
  assetName: string;
  lastInspectionDate?: Date;
  nextInspectionDue?: Date;
  inspectionFrequency?: number; // days
  isOverdue: boolean;
  daysSinceLastInspection?: number;
  daysUntilNextInspection?: number;
  maintenanceHistory: {
    date: Date;
    type: 'inspection' | 'maintenance' | 'repair';
    description: string;
    performedBy: string;
  }[];
}

export interface AssetLocationHistory {
  assetId: string;
  locations: {
    location: string;
    gpsCoordinates?: {
      latitude: number;
      longitude: number;
    };
    timestamp: Date;
    updatedBy: string;
    reason?: string;
  }[];
}

export interface BulkAssetOperation {
  assetIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'updateStatus' | 'updateLocation' | 'assign' | 'generateQR';
  data?: {
    status?: AssetStatus;
    location?: string;
    gpsCoordinates?: {
      latitude: number;
      longitude: number;
    };
    assignedTo?: string;
  };
}

export interface AssetQRCodeData {
  assetId: string;
  assetName: string;
  type: AssetType;
  location: string;
  qrCodeUrl: string;
  qrCodeData: string;
}

export class AssetService {
  private assetRepository: AssetRepository;
  private auditLogRepository: AuditLogRepository;

  constructor(
    assetRepository: AssetRepository,
    auditLogRepository: AuditLogRepository
  ) {
    this.assetRepository = assetRepository;
    this.auditLogRepository = auditLogRepository;
  }

  /**
   * Create a new asset
   */
  async createAsset(
    assetData: CreateAssetDTO,
    createdBy: string,
    ipAddress?: string
  ): Promise<Asset> {
    try {
      // Validate GPS coordinates if provided
      if (assetData.gpsCoordinates) {
        if (!validateGPSCoordinates(assetData.gpsCoordinates.latitude, assetData.gpsCoordinates.longitude)) {
          throw new AppError(
            'Invalid GPS coordinates',
            400,
            ErrorCodes.VALIDATION_FAILED
          );
        }
      }

      // Generate unique asset ID if not provided
      const assetId = assetData.assetId || generateAssetId(assetData.type);

      // Check if asset ID already exists
      const existingAsset = await this.assetRepository.findByAssetId(assetId);
      if (existingAsset) {
        throw new AppError(
          'Asset ID already exists',
          400,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Create asset
      const asset = await this.assetRepository.create({
        ...assetData,
        assetId,
        createdBy
      });

      // Generate QR code if requested
      if (assetData.generateQRCode !== false) {
        await this.generateQRCodeForAsset(asset.id, createdBy);
      }

      // Log audit event
      await this.auditLogRepository.create({
        userId: createdBy,
        action: 'ASSET_CREATED',
        entityType: 'asset',
        entityId: asset.id,
        details: {
          assetId: asset.assetId,
          assetName: asset.name,
          type: asset.type,
          location: asset.location
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Asset created successfully', {
        assetId: asset.id,
        assetName: asset.name,
        type: asset.type,
        createdBy
      });

      return asset;
    } catch (error) {
      logger.error('Asset creation failed', {
        assetName: assetData.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get asset by ID
   */
  async getAssetById(assetId: string): Promise<Asset> {
    const asset = await this.assetRepository.findById(assetId);
    if (!asset) {
      throw new AppError(
        'Asset not found',
        404,
        ErrorCodes.ASSET_NOT_FOUND
      );
    }
    return asset;
  }

  /**
   * Get asset by asset ID (unique identifier)
   */
  async getAssetByAssetId(assetId: string): Promise<Asset> {
    const asset = await this.assetRepository.findByAssetId(assetId);
    if (!asset) {
      throw new AppError(
        'Asset not found',
        404,
        ErrorCodes.ASSET_NOT_FOUND
      );
    }
    return asset;
  }

  /**
   * Update asset
   */
  async updateAsset(
    assetId: string,
    updateData: UpdateAssetDTO,
    updatedBy: string,
    ipAddress?: string
  ): Promise<Asset> {
    try {
      // Check if asset exists
      const existingAsset = await this.getAssetById(assetId);

      // Validate GPS coordinates if being updated
      if (updateData.gpsCoordinates) {
        if (!validateGPSCoordinates(updateData.gpsCoordinates.latitude, updateData.gpsCoordinates.longitude)) {
          throw new AppError(
            'Invalid GPS coordinates',
            400,
            ErrorCodes.VALIDATION_FAILED
          );
        }
      }

      // Check if asset ID is being changed and if it already exists
      if (updateData.assetId && updateData.assetId !== existingAsset.assetId) {
        const existingWithNewId = await this.assetRepository.findByAssetId(updateData.assetId);
        if (existingWithNewId) {
          throw new AppError(
            'Asset ID already exists',
            400,
            ErrorCodes.VALIDATION_FAILED
          );
        }
      }

      // Update asset
      const updatedAsset = await this.assetRepository.update(assetId, {
        ...updateData,
        updatedBy
      });

      // Track location changes
      if (updateData.location && updateData.location !== existingAsset.location) {
        await this.trackLocationChange(
          assetId,
          updateData.location,
          updateData.gpsCoordinates,
          updatedBy,
          'Manual update'
        );
      }

      // Log audit event
      await this.auditLogRepository.create({
        userId: updatedBy,
        action: 'ASSET_UPDATED',
        entityType: 'asset',
        entityId: assetId,
        details: {
          updatedFields: Object.keys(updateData),
          previousValues: this.getChangedFields(existingAsset, updateData),
          newValues: updateData
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Asset updated successfully', {
        assetId,
        updatedFields: Object.keys(updateData),
        updatedBy
      });

      return updatedAsset;
    } catch (error) {
      logger.error('Asset update failed', {
        assetId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Delete asset (soft delete)
   */
  async deleteAsset(
    assetId: string,
    deletedBy: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      // Check if asset exists
      const asset = await this.getAssetById(assetId);

      // Check if asset has active inspections
      // TODO: Add check for active inspections when inspection service is implemented

      // Soft delete asset
      await this.assetRepository.delete(assetId);

      // Log audit event
      await this.auditLogRepository.create({
        userId: deletedBy,
        action: 'ASSET_DELETED',
        entityType: 'asset',
        entityId: assetId,
        details: {
          assetId: asset.assetId,
          assetName: asset.name,
          type: asset.type,
          location: asset.location
        },
        ipAddress,
        userAgent: '',
        severity: 'warning'
      });

      logger.info('Asset deleted successfully', {
        assetId,
        assetName: asset.name,
        deletedBy
      });
    } catch (error) {
      logger.error('Asset deletion failed', {
        assetId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Generate QR code for asset
   */
  async generateQRCodeForAsset(
    assetId: string,
    generatedBy: string
  ): Promise<AssetQRCodeData> {
    try {
      const asset = await this.getAssetById(assetId);

      // Create QR code data
      const qrCodeData = JSON.stringify({
        assetId: asset.assetId,
        id: asset.id,
        name: asset.name,
        type: asset.type,
        location: asset.location,
        timestamp: new Date().toISOString()
      });

      // Generate QR code
      const qrCodeUrl = await generateQRCode(qrCodeData, {
        size: 256,
        margin: 2,
        errorCorrectionLevel: 'M'
      });

      // Update asset with QR code information
      await this.assetRepository.update(assetId, {
        qrCode: qrCodeUrl,
        qrCodeData,
        updatedBy: generatedBy
      });

      // Log audit event
      await this.auditLogRepository.create({
        userId: generatedBy,
        action: 'ASSET_QR_GENERATED',
        entityType: 'asset',
        entityId: assetId,
        details: {
          assetId: asset.assetId,
          assetName: asset.name,
          qrCodeGenerated: true
        },
        ipAddress: '',
        userAgent: '',
        severity: 'info'
      });

      logger.info('QR code generated for asset', {
        assetId,
        assetName: asset.name,
        generatedBy
      });

      return {
        assetId: asset.id,
        assetName: asset.name,
        type: asset.type,
        location: asset.location,
        qrCodeUrl,
        qrCodeData
      };
    } catch (error) {
      logger.error('QR code generation failed', {
        assetId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Update asset location with GPS tracking
   */
  async updateAssetLocation(
    assetId: string,
    location: string,
    gpsCoordinates?: { latitude: number; longitude: number },
    updatedBy: string,
    reason?: string,
    ipAddress?: string
  ): Promise<Asset> {
    try {
      // Validate GPS coordinates if provided
      if (gpsCoordinates) {
        if (!validateGPSCoordinates(gpsCoordinates.latitude, gpsCoordinates.longitude)) {
          throw new AppError(
            'Invalid GPS coordinates',
            400,
            ErrorCodes.VALIDATION_FAILED
          );
        }
      }

      const asset = await this.getAssetById(assetId);
      
      // Calculate distance if both old and new coordinates exist
      let distanceMoved = 0;
      if (asset.gpsCoordinates && gpsCoordinates) {
        distanceMoved = calculateDistance(
          asset.gpsCoordinates.latitude,
          asset.gpsCoordinates.longitude,
          gpsCoordinates.latitude,
          gpsCoordinates.longitude
        );
      }

      // Update asset location
      const updatedAsset = await this.assetRepository.update(assetId, {
        location,
        gpsCoordinates,
        updatedBy
      });

      // Track location change
      await this.trackLocationChange(
        assetId,
        location,
        gpsCoordinates,
        updatedBy,
        reason
      );

      // Log audit event
      await this.auditLogRepository.create({
        userId: updatedBy,
        action: 'ASSET_LOCATION_UPDATED',
        entityType: 'asset',
        entityId: assetId,
        details: {
          assetId: asset.assetId,
          assetName: asset.name,
          previousLocation: asset.location,
          newLocation: location,
          distanceMoved: distanceMoved > 0 ? `${distanceMoved.toFixed(2)} km` : undefined,
          reason
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Asset location updated', {
        assetId,
        assetName: asset.name,
        previousLocation: asset.location,
        newLocation: location,
        distanceMoved,
        updatedBy
      });

      return updatedAsset;
    } catch (error) {
      logger.error('Asset location update failed', {
        assetId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Track location change history
   */
  private async trackLocationChange(
    assetId: string,
    location: string,
    gpsCoordinates?: { latitude: number; longitude: number },
    updatedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      // This would typically be stored in a separate location history table
      // For now, we'll log it as an audit event
      await this.auditLogRepository.create({
        userId: updatedBy,
        action: 'ASSET_LOCATION_CHANGE',
        entityType: 'asset',
        entityId: assetId,
        details: {
          location,
          gpsCoordinates,
          reason,
          timestamp: new Date().toISOString()
        },
        ipAddress: '',
        userAgent: '',
        severity: 'info'
      });
    } catch (error) {
      logger.error('Failed to track location change', {
        assetId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw error as this is a secondary operation
    }
  }

  /**
   * Search assets with filters and pagination
   */
  async searchAssets(
    filters: AssetSearchFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Asset>> {
    try {
      const result = await this.assetRepository.search(filters, pagination);
      
      logger.debug('Asset search completed', {
        filters,
        pagination,
        resultCount: result.data.length,
        totalCount: result.total
      });

      return result;
    } catch (error) {
      logger.error('Asset search failed', {
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get assets by type
   */
  async getAssetsByType(
    type: AssetType,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Asset>> {
    try {
      const result = await this.assetRepository.findByType(type, pagination);
      
      logger.debug('Assets by type retrieved', {
        type,
        assetCount: result.data.length
      });

      return result;
    } catch (error) {
      logger.error('Get assets by type failed', {
        type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get assets by location
   */
  async getAssetsByLocation(
    location: string,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Asset>> {
    try {
      const result = await this.assetRepository.findByLocation(location, pagination);
      
      logger.debug('Assets by location retrieved', {
        location,
        assetCount: result.data.length
      });

      return result;
    } catch (error) {
      logger.error('Get assets by location failed', {
        location,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get assets near location (GPS-based)
   */
  async getAssetsNearLocation(
    latitude: number,
    longitude: number,
    radiusKm: number,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Asset>> {
    try {
      if (!validateGPSCoordinates(latitude, longitude)) {
        throw new AppError(
          'Invalid GPS coordinates',
          400,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      const result = await this.assetRepository.findNearLocation(
        latitude,
        longitude,
        radiusKm,
        pagination
      );
      
      logger.debug('Assets near location retrieved', {
        latitude,
        longitude,
        radiusKm,
        assetCount: result.data.length
      });

      return result;
    } catch (error) {
      logger.error('Get assets near location failed', {
        latitude,
        longitude,
        radiusKm,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get asset statistics
   */
  async getAssetStatistics(): Promise<AssetStatistics> {
    try {
      const stats = await this.assetRepository.getStatistics();
      
      logger.debug('Asset statistics retrieved', {
        totalAssets: stats.total,
        withQRCode: stats.withQRCode,
        withGPS: stats.withGPS
      });

      return stats;
    } catch (error) {
      logger.error('Get asset statistics failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get asset maintenance information
   */
  async getAssetMaintenanceInfo(assetId: string): Promise<AssetMaintenanceInfo> {
    try {
      const asset = await this.getAssetById(assetId);
      const maintenanceInfo = await this.assetRepository.getMaintenanceInfo(assetId);
      
      logger.debug('Asset maintenance info retrieved', {
        assetId,
        assetName: asset.name
      });

      return {
        assetId,
        assetName: asset.name,
        ...maintenanceInfo
      };
    } catch (error) {
      logger.error('Get asset maintenance info failed', {
        assetId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Bulk asset operations
   */
  async bulkAssetOperation(
    operation: BulkAssetOperation,
    performedBy: string,
    ipAddress?: string
  ): Promise<{ success: string[]; failed: { assetId: string; error: string }[] }> {
    const results = {
      success: [] as string[],
      failed: [] as { assetId: string; error: string }[]
    };

    try {
      for (const assetId of operation.assetIds) {
        try {
          switch (operation.operation) {
            case 'activate':
              await this.updateAsset(
                assetId,
                { status: AssetStatus.ACTIVE },
                performedBy,
                ipAddress
              );
              break;
            case 'deactivate':
              await this.updateAsset(
                assetId,
                { status: AssetStatus.INACTIVE },
                performedBy,
                ipAddress
              );
              break;
            case 'delete':
              await this.deleteAsset(assetId, performedBy, ipAddress);
              break;
            case 'updateStatus':
              if (operation.data?.status) {
                await this.updateAsset(
                  assetId,
                  { status: operation.data.status },
                  performedBy,
                  ipAddress
                );
              }
              break;
            case 'updateLocation':
              if (operation.data?.location) {
                await this.updateAssetLocation(
                  assetId,
                  operation.data.location,
                  operation.data.gpsCoordinates,
                  performedBy,
                  'Bulk operation',
                  ipAddress
                );
              }
              break;
            case 'assign':
              if (operation.data?.assignedTo) {
                await this.updateAsset(
                  assetId,
                  { assignedTo: operation.data.assignedTo },
                  performedBy,
                  ipAddress
                );
              }
              break;
            case 'generateQR':
              await this.generateQRCodeForAsset(assetId, performedBy);
              break;
            default:
              throw new Error(`Unknown operation: ${operation.operation}`);
          }
          results.success.push(assetId);
        } catch (error) {
          results.failed.push({
            assetId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Log bulk operation
      await this.auditLogRepository.create({
        userId: performedBy,
        action: 'BULK_ASSET_OPERATION',
        entityType: 'asset',
        entityId: null,
        details: {
          operation: operation.operation,
          totalAssets: operation.assetIds.length,
          successCount: results.success.length,
          failedCount: results.failed.length,
          data: operation.data
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Bulk asset operation completed', {
        operation: operation.operation,
        totalAssets: operation.assetIds.length,
        successCount: results.success.length,
        failedCount: results.failed.length,
        performedBy
      });

      return results;
    } catch (error) {
      logger.error('Bulk asset operation failed', {
        operation: operation.operation,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get changed fields for audit logging
   */
  private getChangedFields(original: Asset, updates: UpdateAssetDTO): Record<string, any> {
    const changed: Record<string, any> = {};
    
    Object.keys(updates).forEach(key => {
      const typedKey = key as keyof UpdateAssetDTO;
      if (original[typedKey as keyof Asset] !== updates[typedKey]) {
        changed[key] = original[typedKey as keyof Asset];
      }
    });
    
    return changed;
  }
}