/**
 * Team Repository
 * Data access layer for Team entity operations
 */

import { BaseRepository } from '../database/base.repository';
import { Team, QueryOptions } from '../types/entities';
import { CreateTeamDTO, UpdateTeamDTO } from '../types/dtos';
import { DatabaseError, ValidationError } from '../types/errors';
import { logger } from '../utils/logger';

export class TeamRepository extends BaseRepository<Team> {
  constructor() {
    super('teams');
  }

  /**
   * Create a new team
   */
  async createTeam(teamData: CreateTeamDTO): Promise<Team> {
    try {
      // Check for duplicate team name
      const existingTeam = await this.findByName(teamData.name);
      if (existingTeam) {
        throw new ValidationError('Team name already exists');
      }

      const teamToCreate: Partial<Team> = {
        ...teamData,
        isActive: true,
        memberCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const team = await this.create(teamToCreate);
      
      logger.audit('Team created', {
        teamId: team.id,
        teamName: team.name,
        createdBy: teamData.createdBy
      });

      return team;
    } catch (error) {
      logger.error('Failed to create team', {
        error: error.message,
        teamData
      });
      throw error;
    }
  }

  /**
   * Find team by name
   */
  async findByName(name: string): Promise<Team | null> {
    try {
      return await this.findOneByField('name', name);
    } catch (error) {
      logger.error('Failed to find team by name', {
        error: error.message,
        name
      });
      throw new DatabaseError('Failed to find team by name');
    }
  }

  /**
   * Find teams by department
   */
  async findByDepartment(department: string, options?: QueryOptions): Promise<Team[]> {
    try {
      const query = `
        SELECT * FROM teams 
        WHERE department = $department
        ORDER BY ${options?.sortBy || 'name'} ${options?.sortOrder || 'ASC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { department };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find teams by department', {
        error: error.message,
        department
      });
      throw new DatabaseError('Failed to find teams by department');
    }
  }

  /**
   * Find teams by manager
   */
  async findByManager(managerId: string, options?: QueryOptions): Promise<Team[]> {
    try {
      const query = `
        SELECT * FROM teams 
        WHERE managerId = $managerId
        ORDER BY ${options?.sortBy || 'name'} ${options?.sortOrder || 'ASC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = { managerId };
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find teams by manager', {
        error: error.message,
        managerId
      });
      throw new DatabaseError('Failed to find teams by manager');
    }
  }

  /**
   * Find active teams
   */
  async findActiveTeams(options?: QueryOptions): Promise<Team[]> {
    try {
      const query = `
        SELECT * FROM teams 
        WHERE isActive = true
        ORDER BY ${options?.sortBy || 'name'} ${options?.sortOrder || 'ASC'}
        ${options?.pageSize ? `LIMIT $limit` : ''}
        ${options?.page && options?.pageSize ? `START $start` : ''}
      `;

      const params: any = {};
      if (options?.pageSize) params.limit = options.pageSize;
      if (options?.page && options?.pageSize) {
        params.start = (options.page - 1) * options.pageSize;
      }

      const result = await this.db.query(query, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to find active teams', {
        error: error.message
      });
      throw new DatabaseError('Failed to find active teams');
    }
  }

  /**
   * Update team
   */
  async updateTeam(id: string, updateData: UpdateTeamDTO): Promise<Team> {
    try {
      // Check if team exists
      const existingTeam = await this.findById(id);
      if (!existingTeam) {
        throw new ValidationError('Team not found');
      }

      // Check for duplicate name if name is being updated
      if (updateData.name && updateData.name !== existingTeam.name) {
        const duplicateTeam = await this.findByName(updateData.name);
        if (duplicateTeam && duplicateTeam.id !== id) {
          throw new ValidationError('Team name already exists');
        }
      }

      const updatePayload = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      const updatedTeam = await this.update(id, updatePayload);
      
      logger.audit('Team updated', {
        teamId: id,
        changes: updateData
      });

      return updatedTeam;
    } catch (error) {
      logger.error('Failed to update team', {
        error: error.message,
        teamId: id,
        updateData
      });
      throw error;
    }
  }

  /**
   * Deactivate team
   */
  async deactivateTeam(id: string): Promise<Team> {
    try {
      // Check if team has active members
      const memberCount = await this.getTeamMemberCount(id);
      if (memberCount > 0) {
        throw new ValidationError('Cannot deactivate team with active members');
      }

      const updatedTeam = await this.update(id, {
        isActive: false,
        updatedAt: new Date().toISOString()
      });
      
      logger.audit('Team deactivated', {
        teamId: id
      });

      return updatedTeam;
    } catch (error) {
      logger.error('Failed to deactivate team', {
        error: error.message,
        teamId: id
      });
      throw error;
    }
  }

  /**
   * Activate team
   */
  async activateTeam(id: string): Promise<Team> {
    try {
      const updatedTeam = await this.update(id, {
        isActive: true,
        updatedAt: new Date().toISOString()
      });
      
      logger.audit('Team activated', {
        teamId: id
      });

      return updatedTeam;
    } catch (error) {
      logger.error('Failed to activate team', {
        error: error.message,
        teamId: id
      });
      throw error;
    }
  }

  /**
   * Get team member count
   */
  async getTeamMemberCount(teamId: string): Promise<number> {
    try {
      const query = `
        SELECT count() as memberCount 
        FROM users 
        WHERE teamId = $teamId AND isActive = true
      `;

      const result = await this.db.query(query, { teamId });
      return result[0]?.memberCount || 0;
    } catch (error) {
      logger.error('Failed to get team member count', {
        error: error.message,
        teamId
      });
      throw new DatabaseError('Failed to get team member count');
    }
  }

  /**
   * Update team member count
   */
  async updateTeamMemberCount(teamId: string): Promise<void> {
    try {
      const memberCount = await this.getTeamMemberCount(teamId);
      
      await this.update(teamId, {
        memberCount,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to update team member count', {
        error: error.message,
        teamId
      });
      throw new DatabaseError('Failed to update team member count');
    }
  }

  /**
   * Search teams with advanced filters
   */
  async searchTeams(searchTerm: string, filters: any = {}, options: QueryOptions = {}): Promise<{ teams: Team[], total: number }> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any = {};

      // Add search term
      if (searchTerm) {
        whereClause += ` AND (name CONTAINS $search OR description CONTAINS $search OR department CONTAINS $search)`;
        params.search = searchTerm;
      }

      // Add filters
      if (filters.department) {
        whereClause += ` AND department = $department`;
        params.department = filters.department;
      }

      if (filters.managerId) {
        whereClause += ` AND managerId = $managerId`;
        params.managerId = filters.managerId;
      }

      if (filters.isActive !== undefined) {
        whereClause += ` AND isActive = $isActive`;
        params.isActive = filters.isActive;
      }

      if (filters.minMemberCount !== undefined) {
        whereClause += ` AND memberCount >= $minMemberCount`;
        params.minMemberCount = filters.minMemberCount;
      }

      if (filters.maxMemberCount !== undefined) {
        whereClause += ` AND memberCount <= $maxMemberCount`;
        params.maxMemberCount = filters.maxMemberCount;
      }

      if (filters.createdAfter) {
        whereClause += ` AND createdAt >= $createdAfter`;
        params.createdAfter = filters.createdAfter;
      }

      if (filters.createdBefore) {
        whereClause += ` AND createdAt <= $createdBefore`;
        params.createdBefore = filters.createdBefore;
      }

      if (filters.departments && filters.departments.length > 0) {
        whereClause += ` AND department IN $departments`;
        params.departments = filters.departments;
      }

      // Count query
      const countQuery = `SELECT count() as total FROM teams ${whereClause}`;
      const countResult = await this.db.query(countQuery, params);
      const total = countResult[0]?.total || 0;

      // Data query
      let dataQuery = `SELECT * FROM teams ${whereClause}`;
      
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
      const teams = dataResult[0] || [];

      return { teams, total };
    } catch (error) {
      logger.error('Failed to search teams', {
        error: error.message,
        searchTerm,
        filters
      });
      throw new DatabaseError('Failed to search teams');
    }
  }

  /**
   * Get team statistics
   */
  async getTeamStats(): Promise<any> {
    try {
      const query = `
        SELECT 
          count() as totalTeams,
          count(CASE WHEN isActive = true THEN 1 END) as activeTeams,
          count(CASE WHEN isActive = false THEN 1 END) as inactiveTeams,
          avg(memberCount) as avgMemberCount,
          max(memberCount) as maxMemberCount,
          min(memberCount) as minMemberCount,
          count(DISTINCT department) as uniqueDepartments,
          count(DISTINCT managerId) as uniqueManagers
        FROM teams
      `;

      const result = await this.db.query(query);
      return result[0] || {};
    } catch (error) {
      logger.error('Failed to get team statistics', {
        error: error.message
      });
      throw new DatabaseError('Failed to get team statistics');
    }
  }

  /**
   * Get teams by department with stats
   */
  async getTeamsByDepartmentWithStats(): Promise<any[]> {
    try {
      const query = `
        SELECT 
          department,
          count() as teamCount,
          count(CASE WHEN isActive = true THEN 1 END) as activeTeamCount,
          sum(memberCount) as totalMembers,
          avg(memberCount) as avgMemberCount
        FROM teams 
        GROUP BY department
        ORDER BY teamCount DESC
      `;

      const result = await this.db.query(query);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get teams by department with stats', {
        error: error.message
      });
      throw new DatabaseError('Failed to get teams by department with stats');
    }
  }

  /**
   * Get team hierarchy
   */
  async getTeamHierarchy(): Promise<any[]> {
    try {
      const query = `
        SELECT 
          t.*,
          u.firstName as managerFirstName,
          u.lastName as managerLastName,
          u.email as managerEmail
        FROM teams t
        LEFT JOIN users u ON t.managerId = u.id
        WHERE t.isActive = true
        ORDER BY t.department, t.name
      `;

      const result = await this.db.query(query);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get team hierarchy', {
        error: error.message
      });
      throw new DatabaseError('Failed to get team hierarchy');
    }
  }

  /**
   * Get team performance metrics
   */
  async getTeamPerformanceMetrics(teamId: string, days: number = 30): Promise<any> {
    try {
      const query = `
        SELECT 
          count(i.id) as totalInspections,
          count(CASE WHEN i.status = 'completed' THEN 1 END) as completedInspections,
          count(CASE WHEN i.status = 'pending' THEN 1 END) as pendingInspections,
          count(CASE WHEN i.status = 'in_progress' THEN 1 END) as inProgressInspections,
          avg(i.score.percentage) as avgScore,
          count(CASE WHEN i.priority = 'high' THEN 1 END) as highPriorityInspections,
          count(CASE WHEN i.priority = 'critical' THEN 1 END) as criticalPriorityInspections
        FROM inspections i
        JOIN users u ON i.inspectorId = u.id
        WHERE u.teamId = $teamId
        AND i.createdAt >= time::now() - duration::from::days($days)
      `;

      const result = await this.db.query(query, { teamId, days });
      return result[0] || {};
    } catch (error) {
      logger.error('Failed to get team performance metrics', {
        error: error.message,
        teamId,
        days
      });
      throw new DatabaseError('Failed to get team performance metrics');
    }
  }

  /**
   * Get team members with roles
   */
  async getTeamMembersWithRoles(teamId: string): Promise<any[]> {
    try {
      const query = `
        SELECT 
          u.id,
          u.firstName,
          u.lastName,
          u.email,
          u.role,
          u.isActive,
          u.lastLoginAt,
          u.createdAt
        FROM users u
        WHERE u.teamId = $teamId
        ORDER BY u.role, u.lastName, u.firstName
      `;

      const result = await this.db.query(query, { teamId });
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get team members with roles', {
        error: error.message,
        teamId
      });
      throw new DatabaseError('Failed to get team members with roles');
    }
  }

  /**
   * Get teams requiring attention
   */
  async getTeamsRequiringAttention(): Promise<any[]> {
    try {
      const query = `
        SELECT 
          t.*,
          u.firstName as managerFirstName,
          u.lastName as managerLastName,
          CASE 
            WHEN t.memberCount = 0 THEN 'No members'
            WHEN t.managerId IS NONE THEN 'No manager assigned'
            WHEN NOT u.isActive THEN 'Inactive manager'
            ELSE 'OK'
          END as issue
        FROM teams t
        LEFT JOIN users u ON t.managerId = u.id
        WHERE t.isActive = true
        AND (
          t.memberCount = 0 
          OR t.managerId IS NONE 
          OR NOT u.isActive
        )
        ORDER BY t.name
      `;

      const result = await this.db.query(query);
      return result[0] || [];
    } catch (error) {
      logger.error('Failed to get teams requiring attention', {
        error: error.message
      });
      throw new DatabaseError('Failed to get teams requiring attention');
    }
  }

  /**
   * Get distinct departments
   */
  async getDistinctDepartments(): Promise<string[]> {
    try {
      const query = `
        SELECT DISTINCT department FROM teams 
        WHERE department IS NOT NONE
        ORDER BY department
      `;

      const result = await this.db.query(query);
      return (result[0] || []).map((row: any) => row.department);
    } catch (error) {
      logger.error('Failed to get distinct departments', {
        error: error.message
      });
      throw new DatabaseError('Failed to get distinct departments');
    }
  }

  /**
   * Bulk update teams
   */
  async bulkUpdateTeams(updates: Array<{ id: string; data: Partial<Team> }>): Promise<Team[]> {
    try {
      const updatedTeams: Team[] = [];
      
      for (const update of updates) {
        const updatedTeam = await this.updateTeam(update.id, update.data);
        updatedTeams.push(updatedTeam);
      }

      logger.audit('Teams bulk updated', {
        teamCount: updates.length,
        teamIds: updates.map(u => u.id)
      });

      return updatedTeams;
    } catch (error) {
      logger.error('Failed to bulk update teams', {
        error: error.message,
        updateCount: updates.length
      });
      throw new DatabaseError('Failed to bulk update teams');
    }
  }

  /**
   * Get team activity summary
   */
  async getTeamActivitySummary(teamId: string, days: number = 30): Promise<any> {
    try {
      const query = `
        SELECT 
          count(DISTINCT u.id) as activeMemberCount,
          count(DISTINCT CASE WHEN u.lastLoginAt >= time::now() - duration::from::days($days) THEN u.id END) as recentlyActiveMemberCount,
          count(i.id) as totalInspections,
          count(CASE WHEN i.createdAt >= time::now() - duration::from::days($days) THEN i.id END) as recentInspections,
          count(r.id) as totalReports,
          count(CASE WHEN r.createdAt >= time::now() - duration::from::days($days) THEN r.id END) as recentReports
        FROM teams t
        LEFT JOIN users u ON t.id = u.teamId AND u.isActive = true
        LEFT JOIN inspections i ON u.id = i.inspectorId
        LEFT JOIN reports r ON u.id = r.generatedBy
        WHERE t.id = $teamId
      `;

      const result = await this.db.query(query, { teamId, days });
      return result[0] || {};
    } catch (error) {
      logger.error('Failed to get team activity summary', {
        error: error.message,
        teamId,
        days
      });
      throw new DatabaseError('Failed to get team activity summary');
    }
  }
}