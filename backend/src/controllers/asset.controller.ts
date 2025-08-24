/**
 * Asset Controller
 * Handles HTTP requests for asset management operations
 */

import { Request, Response, NextFunction } from 'express';
import { AssetService } from '../services/asset.service';
import { FileService } from '../services/file.service';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import {
  CreateAssetDTO,
  UpdateAssetDTO,
  AssetFilters,
  AssetType,
  AssetStatus,
  AssetLocation,
  BulkAssetOperation,
  AssetMaintenanceRequest
} from '../types/asset';
import { PaginationQuery, SortQuery } from '../types/common';
import { UploadedFile } from '../types/file';

export class AssetController {
  constructor(
    private assetService: AssetService,
    private fileService: FileService
  ) {}

  /**
   * Get assets with filtering and pagination
   * GET /api/assets
   */
  getAssets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const sort: SortQuery = {
        field: req.query.sortBy as string || 'createdAt',
        order: req.query.sortOrder as 'asc' | 'desc' || 'desc'
      };

      const filters: AssetFilters = {
        search: req.query.search as string,
        type: req.query.type as AssetType,
        status: req.query.status as AssetStatus,
        location: req.query.location as string,
        building: req.query.building as string,
        floor: req.query.floor as string,
        room: req.query.room as string,
        department: req.query.department as string,
        category: req.query.category as string,
        manufacturer: req.query.manufacturer as string,
        model: req.query.model as string,
        serialNumber: req.query.serialNumber as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        hasQRCode: req.query.hasQRCode === 'true' ? true : req.query.hasQRCode === 'false' ? false : undefined,
        hasGPS: req.query.hasGPS === 'true' ? true : req.query.hasGPS === 'false' ? false : undefined,
        createdAfter: req.query.createdAfter ? new Date(req.query.createdAfter as string) : undefined,
        createdBefore: req.query.createdBefore ? new Date(req.query.createdBefore as string) : undefined,
        lastInspectionAfter: req.query.lastInspectionAfter ? new Date(req.query.lastInspectionAfter as string) : undefined,
        lastInspectionBefore: req.query.lastInspectionBefore ? new Date(req.query.lastInspectionBefore as string) : undefined,
        nextMaintenanceAfter: req.query.nextMaintenanceAfter ? new Date(req.query.nextMaintenanceAfter as string) : undefined,
        nextMaintenanceBefore: req.query.nextMaintenanceBefore ? new Date(req.query.nextMaintenanceBefore as string) : undefined
      };

      const result = await this.assetService.getAssets(filters, pagination, sort);

      res.json({
        success: true,
        data: result.assets,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
          pages: Math.ceil(result.total / pagination.limit)
        },
        filters: filters
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get asset by ID
   * GET /api/assets/:id
   */
  getAssetById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const includeHistory = req.query.includeHistory === 'true';
      const includeInspections = req.query.includeInspections === 'true';
      const includeMaintenanceRecords = req.query.includeMaintenanceRecords === 'true';
      
      const asset = await this.assetService.getAssetById(id, {
        includeHistory,
        includeInspections,
        includeMaintenanceRecords
      });

      if (!asset) {
        throw new AppError('Asset not found', 404);
      }

      res.json({
        success: true,
        data: asset
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get asset by QR code
   * GET /api/assets/qr/:qrCode
   */
  getAssetByQRCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { qrCode } = req.params;
      const asset = await this.assetService.getAssetByQRCode(qrCode);

      if (!asset) {
        throw new AppError('Asset not found', 404);
      }

      res.json({
        success: true,
        data: asset
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new asset
   * POST /api/assets
   */
  createAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assetData: CreateAssetDTO = req.body;
      const createdBy = req.user?.id;

      if (!createdBy) {
        throw new AppError('User not authenticated', 401);
      }

      const asset = await this.assetService.createAsset({
        ...assetData,
        createdBy
      });

      res.status(201).json({
        success: true,
        data: asset,
        message: 'Asset created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update asset
   * PUT /api/assets/:id
   */
  updateAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateAssetDTO = req.body;
      const updatedBy = req.user?.id;

      if (!updatedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const asset = await this.assetService.updateAsset(id, updateData, updatedBy);

      res.json({
        success: true,
        data: asset,
        message: 'Asset updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete asset
   * DELETE /api/assets/:id
   */
  deleteAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deletedBy = req.user?.id;

      if (!deletedBy) {
        throw new AppError('User not authenticated', 401);
      }

      await this.assetService.deleteAsset(id, deletedBy);

      res.json({
        success: true,
        message: 'Asset deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload asset photos
   * POST /api/assets/:id/photos
   */
  uploadPhotos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const files = req.files as UploadedFile[];
      const uploadedBy = req.user?.id;

      if (!uploadedBy) {
        throw new AppError('User not authenticated', 401);
      }

      if (!files || files.length === 0) {
        throw new AppError('No files uploaded', 400);
      }

      const photos = await this.assetService.addPhotos(id, files, uploadedBy);

      res.json({
        success: true,
        data: photos,
        message: `${photos.length} photos uploaded successfully`
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete asset photo
   * DELETE /api/assets/:id/photos/:photoId
   */
  deletePhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, photoId } = req.params;
      const deletedBy = req.user?.id;

      if (!deletedBy) {
        throw new AppError('User not authenticated', 401);
      }

      await this.assetService.removePhoto(id, photoId, deletedBy);

      res.json({
        success: true,
        message: 'Photo deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate QR code for asset
   * POST /api/assets/:id/qr-code
   */
  generateQRCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { size, format } = req.body;
      const generatedBy = req.user?.id;

      if (!generatedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const qrCode = await this.assetService.generateQRCode(id, {
        size: size || 256,
        format: format || 'png'
      });

      res.json({
        success: true,
        data: qrCode,
        message: 'QR code generated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update asset location
   * PUT /api/assets/:id/location
   */
  updateLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const location: AssetLocation = req.body;
      const updatedBy = req.user?.id;

      if (!updatedBy) {
        throw new AppError('User not authenticated', 401);
      }

      const asset = await this.assetService.updateLocation(id, location, updatedBy);

      res.json({
        success: true,
        data: asset,
        message: 'Asset location updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get asset inspection history
   * GET /api/assets/:id/inspections
   */
  getAssetInspections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const sort: SortQuery = {
        field: req.query.sortBy as string || 'createdAt',
        order: req.query.sortOrder as 'asc' | 'desc' || 'desc'
      };

      const inspections = await this.assetService.getAssetInspections(id, pagination, sort);

      res.json({
        success: true,
        data: inspections.inspections,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: inspections.total,
          pages: Math.ceil(inspections.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get asset maintenance records
   * GET /api/assets/:id/maintenance
   */
  getMaintenanceRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const records = await this.assetService.getMaintenanceRecords(id, pagination);

      res.json({
        success: true,
        data: records.records,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: records.total,
          pages: Math.ceil(records.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Schedule asset maintenance
   * POST /api/assets/:id/maintenance
   */
  scheduleMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const maintenanceData: AssetMaintenanceRequest = req.body;
      const scheduledBy = req.user?.id;

      if (!scheduledBy) {
        throw new AppError('User not authenticated', 401);
      }

      const maintenance = await this.assetService.scheduleMaintenance(id, {
        ...maintenanceData,
        scheduledBy
      });

      res.status(201).json({
        success: true,
        data: maintenance,
        message: 'Maintenance scheduled successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get asset analytics
   * GET /api/assets/analytics
   */
  getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: AssetFilters = {
        type: req.query.type as AssetType,
        status: req.query.status as AssetStatus,
        location: req.query.location as string,
        department: req.query.department as string,
        createdAfter: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        createdBefore: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };

      const analytics = await this.assetService.getAnalytics(filters);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get asset statistics
   * GET /api/assets/stats
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const period = req.query.period as string || '30d';
      const groupBy = req.query.groupBy as string || 'day';
      const filters: AssetFilters = {
        type: req.query.type as AssetType,
        status: req.query.status as AssetStatus,
        location: req.query.location as string,
        department: req.query.department as string
      };

      const stats = await this.assetService.getStatistics(period, groupBy, filters);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Bulk operations on assets
   * POST /api/assets/bulk
   */
  bulkOperation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const operation: BulkAssetOperation = req.body;
      const performedBy = req.user?.id;

      if (!performedBy) {
        throw new AppError('User not authenticated', 401);
      }

      if (!Array.isArray(operation.assetIds) || operation.assetIds.length === 0) {
        throw new AppError('Asset IDs array is required', 400);
      }

      const result = await this.assetService.bulkOperation({
        ...operation,
        performedBy
      });

      res.json({
        success: true,
        data: result,
        message: `Bulk ${operation.action} completed successfully`
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Export assets
   * GET /api/assets/export
   */
  exportAssets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const format = req.query.format as string || 'csv';
      const filters: AssetFilters = {
        search: req.query.search as string,
        type: req.query.type as AssetType,
        status: req.query.status as AssetStatus,
        location: req.query.location as string,
        department: req.query.department as string,
        createdAfter: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        createdBefore: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };

      const exportData = await this.assetService.exportAssets(filters, format);

      // Set appropriate headers based on format
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=assets.csv');
      } else if (format === 'xlsx') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=assets.xlsx');
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=assets.json');
      }

      res.send(exportData);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Import assets from file
   * POST /api/assets/import
   */
  importAssets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = req.file as UploadedFile;
      const importedBy = req.user?.id;

      if (!importedBy) {
        throw new AppError('User not authenticated', 401);
      }

      if (!file) {
        throw new AppError('Import file is required', 400);
      }

      const result = await this.assetService.importAssets(file, importedBy);

      res.json({
        success: true,
        data: result,
        message: `${result.imported} assets imported successfully`
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get asset history
   * GET /api/assets/:id/history
   */
  getAssetHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const history = await this.assetService.getAssetHistory(id, pagination);

      res.json({
        success: true,
        data: history.entries,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: history.total,
          pages: Math.ceil(history.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Search assets by location
   * GET /api/assets/search/location
   */
  searchByLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { latitude, longitude, radius } = req.query;
      
      if (!latitude || !longitude) {
        throw new AppError('Latitude and longitude are required', 400);
      }

      const searchRadius = radius ? parseFloat(radius as string) : 1000; // Default 1km
      
      const assets = await this.assetService.searchByLocation({
        latitude: parseFloat(latitude as string),
        longitude: parseFloat(longitude as string),
        radius: searchRadius
      });

      res.json({
        success: true,
        data: assets
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get assets requiring maintenance
   * GET /api/assets/maintenance-due
   */
  getMaintenanceDue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const daysAhead = parseInt(req.query.daysAhead as string) || 30;
      const pagination: PaginationQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const assets = await this.assetService.getMaintenanceDue(daysAhead, pagination);

      res.json({
        success: true,
        data: assets.assets,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: assets.total,
          pages: Math.ceil(assets.total / pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get asset categories
   * GET /api/assets/categories
   */
  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.assetService.getCategories();

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get asset locations
   * GET /api/assets/locations
   */
  getLocations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const locations = await this.assetService.getLocations();

      res.json({
        success: true,
        data: locations
      });
    } catch (error) {
      next(error);
    }
  };
}

// Validation schemas for request bodies
export const assetValidationSchemas = {
  createAsset: {
    name: { required: true, type: 'string', minLength: 1 },
    description: { required: false, type: 'string' },
    type: { required: true, type: 'string', enum: Object.values(AssetType) },
    category: { required: false, type: 'string' },
    manufacturer: { required: false, type: 'string' },
    model: { required: false, type: 'string' },
    serialNumber: { required: false, type: 'string' },
    location: { required: false, type: 'object' },
    status: { required: false, type: 'string', enum: Object.values(AssetStatus) },
    tags: { required: false, type: 'array' },
    customFields: { required: false, type: 'object' }
  },
  updateAsset: {
    name: { required: false, type: 'string', minLength: 1 },
    description: { required: false, type: 'string' },
    type: { required: false, type: 'string', enum: Object.values(AssetType) },
    category: { required: false, type: 'string' },
    manufacturer: { required: false, type: 'string' },
    model: { required: false, type: 'string' },
    serialNumber: { required: false, type: 'string' },
    location: { required: false, type: 'object' },
    status: { required: false, type: 'string', enum: Object.values(AssetStatus) },
    tags: { required: false, type: 'array' },
    customFields: { required: false, type: 'object' }
  },
  updateLocation: {
    building: { required: false, type: 'string' },
    floor: { required: false, type: 'string' },
    room: { required: false, type: 'string' },
    coordinates: { required: false, type: 'object' },
    address: { required: false, type: 'string' }
  },
  scheduleMaintenance: {
    type: { required: true, type: 'string' },
    description: { required: true, type: 'string' },
    scheduledDate: { required: true, type: 'date' },
    assignedTo: { required: false, type: 'string' },
    priority: { required: false, type: 'string' },
    estimatedDuration: { required: false, type: 'number' },
    cost: { required: false, type: 'number' }
  },
  generateQRCode: {
    size: { required: false, type: 'number', min: 64, max: 1024 },
    format: { required: false, type: 'string', enum: ['png', 'svg', 'pdf'] }
  },
  bulkOperation: {
    action: { required: true, type: 'string', enum: ['update', 'delete', 'activate', 'deactivate', 'move'] },
    assetIds: { required: true, type: 'array', minItems: 1 },
    data: { required: false, type: 'object' }
  }
};