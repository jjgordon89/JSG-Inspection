/**
 * Form Template Repository
 * Data access layer for FormTemplate entity operations
 */

import { BaseRepository } from '../database/base.repository';
import { FormTemplate, QueryOptions } from '../types/entities';
import { CreateFormTemplateDTO, UpdateFormTemplateDTO } from '../types/dtos';
import { NotFoundError, ConflictError, DatabaseError } from '../types/errors';
import { logger } from '../utils/logger';

export class FormTemplateRepository extends BaseRepository<FormTemplate> {
  constructor() {
    super('form_templates');
  }

  /**
   * Create a new form template
   */
  async createFormTemplate(templateData: CreateFormTemplateDTO): Promise<FormTemplate> {
    try {
      // Check if template name already exists
      const existingTemplate = await this.findByName(templateData.name);
      if (existingTemplate) {
        throw new ConflictError('Form template name already exists', 'DUPLICATE_TEMPLATE_NAME', {
          name: templateData.name
        });
      }

      // Prepare template data
      const templateToCreate: Partial<FormTemplate> = {
        ...templateData,
        isActive: true,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const template = await this.create(templateToCreate);
      
      logger.audit('Form template created', {
        templateId: template.id,
        name: template.name,
        category: template.category,
        fieldCount: template.fields?.length || 0
      });

      return template;
    } catch (error) {
      logger.error('Failed to create form template', {
        error: error.message,
        templateData
      });
      throw error;
    }
  }

  /**
   * Find form template by name
   */
  async findByName(name: string): Promise<FormTemplate | null> {
    try {
      const templates = await this.findByField('name', name);
      return templates.length > 0 ? templates[0] : null;
    } catch (error) {
      logger.error('Failed to find form template by name', {
        error: error.message,
        name
      });
      throw new DatabaseError('Failed to find form template by name');
    }
  }

  /**
   * Find form templates by category
   */
  async findByCategory(category: string): Promise<FormTemplate[]> {
    try {
      return await this.findByField('category', category);
    } catch (error) {
      logger.error('Failed to find form templates by category', {
        error: error.message,
        category
      });
      throw new DatabaseError('Failed to find form templates by category');
    }
  }

  /**
   * Find active form templates
   */
  async findActiveTemplates(options?: QueryOptions): Promise<FormTemplate[]> {
    try {
      const query = `
        SELECT * FROM form_templates 
        WHERE isActive = true
        ${options?.search ? `AND (name CONTAINS $search OR description CONTAINS $search OR category CONTAINS $search)` : ''}
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
      logger.error('Failed to find active form templates', {
        error: error.message,
        options
      });
      throw new DatabaseError('Failed to find active form templates');
    }
  }

  /**
   * Find templates by creator
   */
  async findByCreator(creatorId: string, options?: QueryOptions): Promise<FormTemplate[]> {
    try {
      const query = `
        SELECT * FROM form_templates 
        WHERE createdBy = $creatorId
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
      logger.error('Failed to find form templates by creator', {
        error: error.message,
        creatorId
      });
      throw new DatabaseError('Failed to find form templates by creator');
    }
  }

  /**
   * Update form template
   */
  async updateFormTemplate(templateId: string, updateData: UpdateFormTemplateDTO): Promise<FormTemplate> {
    try {
      const existingTemplate = await this.findById(templateId);
      if (!existingTemplate) {
        throw new NotFoundError('Form template not found', 'form_templates', templateId);
      }

      // If name is being updated, check for duplicates
      if (updateData.name && updateData.name !== existingTemplate.name) {
        const duplicateTemplate = await this.findByName(updateData.name);
        if (duplicateTemplate && duplicateTemplate.id !== templateId) {
          throw new ConflictError('Form template name already exists', 'DUPLICATE_TEMPLATE_NAME', {
            name: updateData.name
          });
        }
      }

      // Increment version if fields are updated
      const finalUpdateData: any = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      if (updateData.fields) {
        finalUpdateData.version = (existingTemplate.version || 1) + 1;
      }

      const template = await this.update(templateId, finalUpdateData);

      logger.audit('Form template updated', {
        templateId,
        name: template.name,
        version: template.version,
        updatedFields: Object.keys(updateData)
      });

      return template;
    } catch (error) {
      logger.error('Failed to update form template', {
        error: error.message,
        templateId,
        updateData
      });
      throw error;
    }
  }

  /**
   * Deactivate form template
   */
  async deactivateTemplate(templateId: string): Promise<void> {
    try {
      await this.update(templateId, {
        isActive: false,
        updatedAt: new Date().toISOString()
      });

      logger.audit('Form template deactivated', { templateId });
    } catch (error) {
      logger.error('Failed to deactivate form template', {
        error: error.message,
        templateId
      });
      throw error;
    }
  }

  /**
   * Activate form template
   */
  async activateTemplate(templateId: string): Promise<void> {
    try {
      await this.update(templateId, {
        isActive: true,
        updatedAt: new Date().toISOString()
      });

      logger.audit('Form template activated', { templateId });
    } catch (error) {
      logger.error('Failed to activate form template', {
        error: error.message,
        templateId
      });
      throw error;
    }
  }

  /**
   * Clone form template
   */
  async cloneTemplate(templateId: string, newName: string, createdBy: string): Promise<FormTemplate> {
    try {
      const originalTemplate = await this.findById(templateId);
      if (!originalTemplate) {
        throw new NotFoundError('Form template not found', 'form_templates', templateId);
      }

      // Check if new name already exists
      const existingTemplate = await this.findByName(newName);
      if (existingTemplate) {
        throw new ConflictError('Form template name already exists', 'DUPLICATE_TEMPLATE_NAME', {
          name: newName
        });
      }

      // Create cloned template
      const clonedTemplateData: Partial<FormTemplate> = {
        name: newName,
        description: `${originalTemplate.description} (Copy)`,
        category: originalTemplate.category,
        fields: originalTemplate.fields,
        settings: originalTemplate.settings,
        tags: originalTemplate.tags,
        createdBy,
        isActive: true,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const clonedTemplate = await this.create(clonedTemplateData);

      logger.audit('Form template cloned', {
        originalTemplateId: templateId,
        clonedTemplateId: clonedTemplate.id,
        newName,
        createdBy
      });

      return clonedTemplate;
    } catch (error) {
      logger.error('Failed to clone form template', {
        error: error.message,
        templateId,
        newName,
        createdBy
      });
      throw error;
    }
  }

  /**
   * Search form templates with advanced filters
   */
  async searchTemplates(searchTerm: string, filters: any = {}, options: QueryOptions = {}): Promise<{ templates: FormTemplate[], total: number }> {
    try {
      let whereClause = 'WHERE isActive = true';
      const params: any = {};

      // Add search term
      if (searchTerm) {
        whereClause += ` AND (name CONTAINS $search OR description CONTAINS $search OR category CONTAINS $search)`;
        params.search = searchTerm;
      }

      // Add filters
      if (filters.category) {
        whereClause += ` AND category = $category`;
        params.category = filters.category;
      }

      if (filters.createdBy) {
        whereClause += ` AND createdBy = $createdBy`;
        params.createdBy = filters.createdBy;
      }

      if (filters.tags && filters.tags.length > 0) {
        whereClause += ` AND tags CONTAINSANY $tags`;
        params.tags = filters.tags;
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
      const countQuery = `SELECT count() as total FROM form_templates ${whereClause}`;
      const countResult = await this.db.query(countQuery, params);
      const total = countResult[0]?.total || 0;

      // Data query
      let dataQuery = `SELECT * FROM form_templates ${whereClause}`;
      
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
      const templates = dataResult[0] || [];

      return { templates, total };
    } catch (error) {
      logger.error('Failed to search form templates', {
        error: error.message,
        searchTerm,
        filters
      });
      throw new DatabaseError('Failed to search form templates');
    }
  }

  /**
   * Get template usage statistics
   */
  async getTemplateUsageStats(templateId: string): Promise<any> {
    try {
      const query = `
        SELECT 
          (SELECT count() FROM inspections WHERE formTemplateId = $templateId) as totalUsage,
          (SELECT count() FROM inspections WHERE formTemplateId = $templateId AND status = 'completed') as completedUsage,
          (SELECT count() FROM inspections WHERE formTemplateId = $templateId AND createdAt >= time::now() - 30d) as usageLast30Days,
          (SELECT avg(score.percentage) FROM inspections WHERE formTemplateId = $templateId AND score IS NOT NONE) as avgScore
      `;

      const result = await this.db.query(query, { templateId });
      return result[0] || {};
    } catch (error) {
      logger.error('Failed to get template usage statistics', {
        error: error.message,
        templateId
      });
      throw new DatabaseError('Failed to get template usage statistics');
    }
  }

  /**
   * Get popular templates
   */
  async getPopularTemplates(limit: number = 10): Promise<any[]> {
    try {
      const query = `
        SELECT 
          ft.*,
          count(i.id) as usageCount,
          avg(i.score.percentage) as avgScore
        FROM form_templates ft
        LEFT JOIN inspections i ON ft.id = i.formTemplateId
        WHERE ft.isActive = true
        GROUP BY ft.id, ft.name, ft.description, ft.category, ft.fields, ft.settings, ft.tags, ft.createdBy, ft.isActive, ft.version, ft.createdAt, ft.updatedAt
        ORDER BY usageCount DESC
        LIMIT $limit
      `;

      const result = await this.db.query(query, { limit });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get popular templates', {
        error: error.message,
        limit
      });
      throw new DatabaseError('Failed to get popular templates');
    }
  }

  /**
   * Get template categories
   */
  async getTemplateCategories(): Promise<string[]> {
    try {
      const query = `
        SELECT DISTINCT category FROM form_templates 
        WHERE isActive = true 
        AND category IS NOT NONE
        ORDER BY category
      `;

      const result = await this.db.query(query);
      return (result[0] || []).map((row: any) => row.category);
    } catch (error) {
      logger.error('Failed to get template categories', {
        error: error.message
      });
      throw new DatabaseError('Failed to get template categories');
    }
  }

  /**
   * Get template tags
   */
  async getTemplateTags(): Promise<string[]> {
    try {
      const query = `
        SELECT DISTINCT array::flatten(tags) as tag FROM form_templates 
        WHERE isActive = true 
        AND tags IS NOT NONE
        AND array::len(tags) > 0
      `;

      const result = await this.db.query(query);
      const tags = new Set<string>();
      
      (result[0] || []).forEach((row: any) => {
        if (row.tag) {
          tags.add(row.tag);
        }
      });

      return Array.from(tags).sort();
    } catch (error) {
      logger.error('Failed to get template tags', {
        error: error.message
      });
      throw new DatabaseError('Failed to get template tags');
    }
  }

  /**
   * Validate template fields
   */
  async validateTemplateFields(fields: any[]): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const errors: string[] = [];
      const fieldIds = new Set<string>();

      for (const field of fields) {
        // Check required properties
        if (!field.id) {
          errors.push('Field ID is required');
        } else if (fieldIds.has(field.id)) {
          errors.push(`Duplicate field ID: ${field.id}`);
        } else {
          fieldIds.add(field.id);
        }

        if (!field.type) {
          errors.push(`Field type is required for field: ${field.id}`);
        }

        if (!field.label) {
          errors.push(`Field label is required for field: ${field.id}`);
        }

        // Validate field type specific properties
        if (field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') {
          if (!field.options || !Array.isArray(field.options) || field.options.length === 0) {
            errors.push(`Options are required for ${field.type} field: ${field.id}`);
          }
        }

        if (field.type === 'number') {
          if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
            errors.push(`Min value cannot be greater than max value for field: ${field.id}`);
          }
        }

        // Validate conditional logic
        if (field.conditionalLogic) {
          for (const condition of field.conditionalLogic) {
            if (!condition.fieldId || !condition.operator || condition.value === undefined) {
              errors.push(`Invalid conditional logic for field: ${field.id}`);
            }
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      logger.error('Failed to validate template fields', {
        error: error.message,
        fieldCount: fields.length
      });
      return {
        isValid: false,
        errors: ['Failed to validate template fields']
      };
    }
  }

  /**
   * Get template versions
   */
  async getTemplateVersions(templateName: string): Promise<FormTemplate[]> {
    try {
      const query = `
        SELECT * FROM form_templates 
        WHERE name = $templateName
        ORDER BY version DESC
      `;

      const result = await this.db.query(query, { templateName });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get template versions', {
        error: error.message,
        templateName
      });
      throw new DatabaseError('Failed to get template versions');
    }
  }

  /**
   * Bulk update templates
   */
  async bulkUpdateTemplates(templateIds: string[], updateData: Partial<FormTemplate>): Promise<void> {
    try {
      const query = `
        UPDATE form_templates SET 
        ${Object.keys(updateData).map(key => `${key} = $${key}`).join(', ')},
        updatedAt = $updatedAt
        WHERE id IN $templateIds
      `;

      const params = {
        ...updateData,
        updatedAt: new Date().toISOString(),
        templateIds
      };

      await this.db.query(query, params);

      logger.audit('Bulk template update', {
        templateIds,
        updatedFields: Object.keys(updateData)
      });
    } catch (error) {
      logger.error('Failed to bulk update templates', {
        error: error.message,
        templateIds,
        updateData
      });
      throw new DatabaseError('Failed to bulk update templates');
    }
  }

  /**
   * Export template
   */
  async exportTemplate(templateId: string): Promise<any> {
    try {
      const template = await this.findById(templateId);
      if (!template) {
        throw new NotFoundError('Form template not found', 'form_templates', templateId);
      }

      // Remove internal fields for export
      const exportData = {
        name: template.name,
        description: template.description,
        category: template.category,
        fields: template.fields,
        settings: template.settings,
        tags: template.tags,
        version: template.version,
        exportedAt: new Date().toISOString()
      };

      logger.audit('Template exported', {
        templateId,
        name: template.name
      });

      return exportData;
    } catch (error) {
      logger.error('Failed to export template', {
        error: error.message,
        templateId
      });
      throw error;
    }
  }

  /**
   * Import template
   */
  async importTemplate(templateData: any, createdBy: string): Promise<FormTemplate> {
    try {
      // Validate imported data
      if (!templateData.name || !templateData.fields) {
        throw new ConflictError('Invalid template data', 'INVALID_IMPORT_DATA');
      }

      // Check if template name already exists
      const existingTemplate = await this.findByName(templateData.name);
      if (existingTemplate) {
        throw new ConflictError('Form template name already exists', 'DUPLICATE_TEMPLATE_NAME', {
          name: templateData.name
        });
      }

      // Validate fields
      const validation = await this.validateTemplateFields(templateData.fields);
      if (!validation.isValid) {
        throw new ConflictError('Invalid template fields', 'INVALID_TEMPLATE_FIELDS', {
          errors: validation.errors
        });
      }

      // Create imported template
      const importedTemplateData: Partial<FormTemplate> = {
        name: templateData.name,
        description: templateData.description || '',
        category: templateData.category || 'Imported',
        fields: templateData.fields,
        settings: templateData.settings || {},
        tags: templateData.tags || [],
        createdBy,
        isActive: true,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const importedTemplate = await this.create(importedTemplateData);

      logger.audit('Template imported', {
        templateId: importedTemplate.id,
        name: importedTemplate.name,
        createdBy
      });

      return importedTemplate;
    } catch (error) {
      logger.error('Failed to import template', {
        error: error.message,
        templateName: templateData?.name,
        createdBy
      });
      throw error;
    }
  }
}