/**
 * Folder Repository
 * Data access layer for Folder entity operations
 */

import { BaseRepository } from '../database/base.repository';
import { Folder, QueryOptions } from '../types/entities';
import { CreateFolderDTO, UpdateFolderDTO } from '../types/dtos';
import { NotFoundError, ConflictError, DatabaseError } from '../types/errors';
import { logger } from '../utils/logger';

export class FolderRepository extends BaseRepository<Folder> {
  constructor() {
    super('folders');
  }

  /**
   * Create a new folder
   */
  async createFolder(folderData: CreateFolderDTO): Promise<Folder> {
    try {
      // Check if folder name already exists in the same parent
      const existingFolder = await this.findByNameAndParent(folderData.name, folderData.parentId);
      if (existingFolder) {
        throw new ConflictError('Folder name already exists in this location', 'DUPLICATE_FOLDER_NAME', {
          name: folderData.name,
          parentId: folderData.parentId
        });
      }

      // Prepare folder data
      const folderToCreate: Partial<Folder> = {
        ...folderData,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const folder = await this.create(folderToCreate);
      
      logger.audit('Folder created', {
        folderId: folder.id,
        name: folder.name,
        type: folder.type,
        parentId: folder.parentId,
        createdBy: folder.createdBy
      });

      return folder;
    } catch (error) {
      logger.error('Failed to create folder', {
        error: error.message,
        folderData
      });
      throw error;
    }
  }

  /**
   * Find folder by name and parent
   */
  async findByNameAndParent(name: string, parentId?: string): Promise<Folder | null> {
    try {
      const query = `
        SELECT * FROM folders 
        WHERE name = $name 
        AND ${parentId ? 'parentId = $parentId' : 'parentId IS NONE'}
        AND isActive = true
        LIMIT 1
      `;

      const params: any = { name };
      if (parentId) {
        params.parentId = parentId;
      }

      const result = await this.db.query(query, params);
      return result[0]?.[0] || null;
    } catch (error) {
      logger.error('Failed to find folder by name and parent', {
        error: error.message,
        name,
        parentId
      });
      throw new DatabaseError('Failed to find folder by name and parent');
    }
  }

  /**
   * Find folders by parent
   */
  async findByParent(parentId?: string, options?: QueryOptions): Promise<Folder[]> {
    try {
      const query = `
        SELECT * FROM folders 
        WHERE ${parentId ? 'parentId = $parentId' : 'parentId IS NONE'}
        AND isActive = true
        ORDER BY ${options?.sortBy || 'name'} ${options?.sortOrder || 'ASC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = {};
      if (parentId) {
        params.parentId = parentId;
      }
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find folders by parent', {
        error: error.message,
        parentId
      });
      throw new DatabaseError('Failed to find folders by parent');
    }
  }

  /**
   * Find folders by type
   */
  async findByType(type: string): Promise<Folder[]> {
    try {
      return await this.findByField('type', type);
    } catch (error) {
      logger.error('Failed to find folders by type', {
        error: error.message,
        type
      });
      throw new DatabaseError('Failed to find folders by type');
    }
  }

  /**
   * Find folders by creator
   */
  async findByCreator(creatorId: string, options?: QueryOptions): Promise<Folder[]> {
    try {
      const query = `
        SELECT * FROM folders 
        WHERE createdBy = $creatorId
        AND isActive = true
        ORDER BY ${options?.sortBy || 'createdAt'} ${options?.sortOrder || 'DESC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { creatorId };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find folders by creator', {
        error: error.message,
        creatorId
      });
      throw new DatabaseError('Failed to find folders by creator');
    }
  }

  /**
   * Get folder hierarchy (folder with all its children)
   */
  async getFolderHierarchy(folderId?: string): Promise<any[]> {
    try {
      const query = `
        WITH RECURSIVE folder_tree AS (
          SELECT 
            id, name, type, parentId, description, settings, 
            createdBy, isActive, createdAt, updatedAt,
            0 as level,
            CAST(name AS STRING) as path
          FROM folders 
          WHERE ${folderId ? 'id = $folderId' : 'parentId IS NONE'}
          AND isActive = true
          
          UNION ALL
          
          SELECT 
            f.id, f.name, f.type, f.parentId, f.description, f.settings,
            f.createdBy, f.isActive, f.createdAt, f.updatedAt,
            ft.level + 1,
            CONCAT(ft.path, ' > ', f.name)
          FROM folders f
          INNER JOIN folder_tree ft ON f.parentId = ft.id
          WHERE f.isActive = true
        )
        SELECT * FROM folder_tree
        ORDER BY level, name
      `;

      const params = folderId ? { folderId } : {};
      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get folder hierarchy', {
        error: error.message,
        folderId
      });
      throw new DatabaseError('Failed to get folder hierarchy');
    }
  }

  /**
   * Get folder path (breadcrumb)
   */
  async getFolderPath(folderId: string): Promise<Folder[]> {
    try {
      const query = `
        WITH RECURSIVE folder_path AS (
          SELECT 
            id, name, type, parentId, description, settings,
            createdBy, isActive, createdAt, updatedAt,
            0 as level
          FROM folders 
          WHERE id = $folderId
          
          UNION ALL
          
          SELECT 
            f.id, f.name, f.type, f.parentId, f.description, f.settings,
            f.createdBy, f.isActive, f.createdAt, f.updatedAt,
            fp.level + 1
          FROM folders f
          INNER JOIN folder_path fp ON f.id = fp.parentId
        )
        SELECT * FROM folder_path
        ORDER BY level DESC
      `;

      const result = await this.db.query(query, { folderId });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get folder path', {
        error: error.message,
        folderId
      });
      throw new DatabaseError('Failed to get folder path');
    }
  }

  /**
   * Update folder
   */
  async updateFolder(folderId: string, updateData: UpdateFolderDTO): Promise<Folder> {
    try {
      const existingFolder = await this.findById(folderId);
      if (!existingFolder) {
        throw new NotFoundError('Folder not found', 'folders', folderId);
      }

      // If name is being updated, check for duplicates in the same parent
      if (updateData.name && updateData.name !== existingFolder.name) {
        const duplicateFolder = await this.findByNameAndParent(
          updateData.name, 
          updateData.parentId || existingFolder.parentId
        );
        if (duplicateFolder && duplicateFolder.id !== folderId) {
          throw new ConflictError('Folder name already exists in this location', 'DUPLICATE_FOLDER_NAME', {
            name: updateData.name,
            parentId: updateData.parentId || existingFolder.parentId
          });
        }
      }

      // Prevent moving folder to be its own child
      if (updateData.parentId) {
        const isChildFolder = await this.isChildFolder(folderId, updateData.parentId);
        if (isChildFolder) {
          throw new ConflictError('Cannot move folder to its own child', 'INVALID_PARENT_FOLDER');
        }
      }

      const finalUpdateData = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      const folder = await this.update(folderId, finalUpdateData);

      logger.audit('Folder updated', {
        folderId,
        name: folder.name,
        updatedFields: Object.keys(updateData)
      });

      return folder;
    } catch (error) {
      logger.error('Failed to update folder', {
        error: error.message,
        folderId,
        updateData
      });
      throw error;
    }
  }

  /**
   * Check if a folder is a child of another folder
   */
  async isChildFolder(parentId: string, childId: string): Promise<boolean> {
    try {
      const query = `
        WITH RECURSIVE folder_children AS (
          SELECT id, parentId
          FROM folders 
          WHERE id = $parentId
          
          UNION ALL
          
          SELECT f.id, f.parentId
          FROM folders f
          INNER JOIN folder_children fc ON f.parentId = fc.id
        )
        SELECT count() as count FROM folder_children
        WHERE id = $childId
      `;

      const result = await this.db.query(query, { parentId, childId });
      return (result[0]?.count || 0) > 0;
    } catch (error) {
      logger.error('Failed to check if folder is child', {
        error: error.message,
        parentId,
        childId
      });
      return false;
    }
  }

  /**
   * Move folder to new parent
   */
  async moveFolder(folderId: string, newParentId?: string): Promise<void> {
    try {
      const folder = await this.findById(folderId);
      if (!folder) {
        throw new NotFoundError('Folder not found', 'folders', folderId);
      }

      // Check if new parent exists (if provided)
      if (newParentId) {
        const parentFolder = await this.findById(newParentId);
        if (!parentFolder) {
          throw new NotFoundError('Parent folder not found', 'folders', newParentId);
        }

        // Prevent moving folder to be its own child
        const isChildFolder = await this.isChildFolder(folderId, newParentId);
        if (isChildFolder) {
          throw new ConflictError('Cannot move folder to its own child', 'INVALID_PARENT_FOLDER');
        }
      }

      // Check for name conflicts in new location
      const duplicateFolder = await this.findByNameAndParent(folder.name, newParentId);
      if (duplicateFolder && duplicateFolder.id !== folderId) {
        throw new ConflictError('Folder name already exists in destination', 'DUPLICATE_FOLDER_NAME', {
          name: folder.name,
          parentId: newParentId
        });
      }

      await this.update(folderId, {
        parentId: newParentId,
        updatedAt: new Date().toISOString()
      });

      logger.audit('Folder moved', {
        folderId,
        name: folder.name,
        oldParentId: folder.parentId,
        newParentId
      });
    } catch (error) {
      logger.error('Failed to move folder', {
        error: error.message,
        folderId,
        newParentId
      });
      throw error;
    }
  }

  /**
   * Delete folder (soft delete)
   */
  async deleteFolder(folderId: string, deleteChildren: boolean = false): Promise<void> {
    try {
      const folder = await this.findById(folderId);
      if (!folder) {
        throw new NotFoundError('Folder not found', 'folders', folderId);
      }

      // Check if folder has children
      const children = await this.findByParent(folderId);
      if (children.length > 0 && !deleteChildren) {
        throw new ConflictError('Folder has children and cannot be deleted', 'FOLDER_HAS_CHILDREN', {
          childrenCount: children.length
        });
      }

      // Check if folder has inspections
      const inspectionCount = await this.getFolderInspectionCount(folderId);
      if (inspectionCount > 0) {
        throw new ConflictError('Folder contains inspections and cannot be deleted', 'FOLDER_HAS_INSPECTIONS', {
          inspectionCount
        });
      }

      // Soft delete folder
      await this.update(folderId, {
        isActive: false,
        updatedAt: new Date().toISOString()
      });

      // Recursively delete children if requested
      if (deleteChildren) {
        for (const child of children) {
          await this.deleteFolder(child.id, true);
        }
      }

      logger.audit('Folder deleted', {
        folderId,
        name: folder.name,
        deleteChildren,
        childrenCount: children.length
      });
    } catch (error) {
      logger.error('Failed to delete folder', {
        error: error.message,
        folderId,
        deleteChildren
      });
      throw error;
    }
  }

  /**
   * Get folder inspection count
   */
  async getFolderInspectionCount(folderId: string): Promise<number> {
    try {
      const query = `
        SELECT count() as count FROM inspections 
        WHERE folderId = $folderId
      `;

      const result = await this.db.query(query, { folderId });
      return result[0]?.count || 0;
    } catch (error) {
      logger.error('Failed to get folder inspection count', {
        error: error.message,
        folderId
      });
      return 0;
    }
  }

  /**
   * Search folders with advanced filters
   */
  async searchFolders(searchTerm: string, filters: any = {}, options: QueryOptions = {}): Promise<{ folders: Folder[], total: number }> {
    try {
      let whereClause = 'WHERE isActive = true';
      const params: any = {};

      // Add search term
      if (searchTerm) {
        whereClause += ` AND (name CONTAINS $search OR description CONTAINS $search)`;
        params.search = searchTerm;
      }

      // Add filters
      if (filters.type) {
        whereClause += ` AND type = $type`;
        params.type = filters.type;
      }

      if (filters.createdBy) {
        whereClause += ` AND createdBy = $createdBy`;
        params.createdBy = filters.createdBy;
      }

      if (filters.parentId !== undefined) {
        if (filters.parentId === null) {
          whereClause += ` AND parentId IS NONE`;
        } else {
          whereClause += ` AND parentId = $parentId`;
          params.parentId = filters.parentId;
        }
      }

      if (filters.startDate) {
        whereClause += ` AND createdAt >= $startDate`;
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        whereClause += ` AND createdAt <= $endDate`;
        params.endDate = filters.endDate;
      }

      // Count query
      const countQuery = `SELECT count() as total FROM folders ${whereClause}`;
      const countResult = await this.db.query(countQuery, params);
      const total = countResult[0]?.total || 0;

      // Data query
      let dataQuery = `SELECT * FROM folders ${whereClause}`;
      
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
      const folders = dataResult[0] || [];

      return { folders, total };
    } catch (error) {
      logger.error('Failed to search folders', {
        error: error.message,
        searchTerm,
        filters
      });
      throw new DatabaseError('Failed to search folders');
    }
  }

  /**
   * Get folder statistics
   */
  async getFolderStats(folderId: string): Promise<any> {
    try {
      const query = `
        SELECT 
          (SELECT count() FROM folders WHERE parentId = $folderId AND isActive = true) as subfolderCount,
          (SELECT count() FROM inspections WHERE folderId = $folderId) as inspectionCount,
          (SELECT count() FROM inspections WHERE folderId = $folderId AND status = 'completed') as completedInspections,
          (SELECT count() FROM inspections WHERE folderId = $folderId AND status = 'pending') as pendingInspections,
          (SELECT count() FROM inspections WHERE folderId = $folderId AND status = 'in_progress') as inProgressInspections,
          (SELECT avg(score.percentage) FROM inspections WHERE folderId = $folderId AND score IS NOT NONE) as avgScore
      `;

      const result = await this.db.query(query, { folderId });
      return result[0] || {};
    } catch (error) {
      logger.error('Failed to get folder statistics', {
        error: error.message,
        folderId
      });
      throw new DatabaseError('Failed to get folder statistics');
    }
  }

  /**
   * Get folder activity summary
   */
  async getFolderActivity(folderId: string, days: number = 30): Promise<any[]> {
    try {
      const query = `
        SELECT 
          time::format(createdAt, '%Y-%m-%d') as date,
          count() as inspectionCount,
          count(CASE WHEN status = 'completed' THEN 1 END) as completedCount
        FROM inspections 
        WHERE folderId = $folderId
        AND createdAt >= time::now() - duration::from::days($days)
        GROUP BY time::format(createdAt, '%Y-%m-%d')
        ORDER BY date DESC
      `;

      const result = await this.db.query(query, { folderId, days });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get folder activity', {
        error: error.message,
        folderId,
        days
      });
      throw new DatabaseError('Failed to get folder activity');
    }
  }

  /**
   * Copy folder structure
   */
  async copyFolder(sourceFolderId: string, targetParentId?: string, newName?: string, createdBy?: string): Promise<Folder> {
    try {
      const sourceFolder = await this.findById(sourceFolderId);
      if (!sourceFolder) {
        throw new NotFoundError('Source folder not found', 'folders', sourceFolderId);
      }

      // Generate new name if not provided
      const folderName = newName || `${sourceFolder.name} (Copy)`;

      // Check for name conflicts
      const duplicateFolder = await this.findByNameAndParent(folderName, targetParentId);
      if (duplicateFolder) {
        throw new ConflictError('Folder name already exists in destination', 'DUPLICATE_FOLDER_NAME', {
          name: folderName,
          parentId: targetParentId
        });
      }

      // Create new folder
      const newFolderData: Partial<Folder> = {
        name: folderName,
        type: sourceFolder.type,
        description: sourceFolder.description,
        parentId: targetParentId,
        settings: sourceFolder.settings,
        createdBy: createdBy || sourceFolder.createdBy,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newFolder = await this.create(newFolderData);

      // Copy child folders recursively
      const childFolders = await this.findByParent(sourceFolderId);
      for (const childFolder of childFolders) {
        await this.copyFolder(childFolder.id, newFolder.id, undefined, createdBy);
      }

      logger.audit('Folder copied', {
        sourceFolderId,
        newFolderId: newFolder.id,
        newName: folderName,
        targetParentId,
        createdBy
      });

      return newFolder;
    } catch (error) {
      logger.error('Failed to copy folder', {
        error: error.message,
        sourceFolderId,
        targetParentId,
        newName,
        createdBy
      });
      throw error;
    }
  }

  /**
   * Get folder types
   */
  async getFolderTypes(): Promise<string[]> {
    try {
      const query = `
        SELECT DISTINCT type FROM folders 
        WHERE isActive = true 
        AND type IS NOT NONE
        ORDER BY type
      `;

      const result = await this.db.query(query);
      return (result[0] || []).map((row: any) => row.type);
    } catch (error) {
      logger.error('Failed to get folder types', {
        error: error.message
      });
      throw new DatabaseError('Failed to get folder types');
    }
  }

  /**
   * Bulk update folders
   */
  async bulkUpdateFolders(folderIds: string[], updateData: Partial<Folder>): Promise<void> {
    try {
      const query = `
        UPDATE folders SET 
        ${Object.keys(updateData).map(key => `${key} = $${key}`).join(', ')},
        updatedAt = $updatedAt
        WHERE id IN $folderIds
      `;

      const params = {
        ...updateData,
        updatedAt: new Date().toISOString(),
        folderIds
      };

      await this.db.query(query, params);

      logger.audit('Bulk folder update', {
        folderIds,
        updatedFields: Object.keys(updateData)
      });
    } catch (error) {
      logger.error('Failed to bulk update folders', {
        error: error.message,
        folderIds,
        updateData
      });
      throw new DatabaseError('Failed to bulk update folders');
    }
  }
}