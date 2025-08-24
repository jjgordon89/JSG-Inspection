/**
 * Team Service
 * Handles team management operations, member management, and team-related business logic
 */

import { TeamRepository } from '../repositories/team.repository';
import { UserRepository } from '../repositories/user.repository';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AppError, ErrorCodes } from '../types/errors';
import { logger } from '../utils/logger';
import { Team, CreateTeamDTO, UpdateTeamDTO } from '../types/team';
import { User, UserRole } from '../types/auth';
import { PaginationOptions, PaginatedResult } from '../types/common';

export interface TeamSearchFilters {
  search?: string;
  department?: string;
  managerId?: string;
  isActive?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  memberCountMin?: number;
  memberCountMax?: number;
}

export interface TeamStatistics {
  total: number;
  active: number;
  inactive: number;
  byDepartment: Record<string, number>;
  averageMemberCount: number;
  totalMembers: number;
  teamsWithoutManager: number;
  teamsRequiringAttention: number;
}

export interface TeamPerformanceMetrics {
  teamId: string;
  teamName: string;
  memberCount: number;
  completedInspections: number;
  averageInspectionScore: number;
  onTimeCompletionRate: number;
  activeMembers: number;
  lastActivityDate: Date;
}

export interface TeamMemberWithRole {
  user: User;
  role: 'manager' | 'member';
  joinedAt: Date;
  isActive: boolean;
}

export interface BulkTeamOperation {
  teamIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'updateDepartment' | 'assignManager';
  data?: {
    department?: string;
    managerId?: string;
  };
}

export class TeamService {
  private teamRepository: TeamRepository;
  private userRepository: UserRepository;
  private auditLogRepository: AuditLogRepository;

  constructor(
    teamRepository: TeamRepository,
    userRepository: UserRepository,
    auditLogRepository: AuditLogRepository
  ) {
    this.teamRepository = teamRepository;
    this.userRepository = userRepository;
    this.auditLogRepository = auditLogRepository;
  }

  /**
   * Create a new team
   */
  async createTeam(
    teamData: CreateTeamDTO,
    createdBy: string,
    ipAddress?: string
  ): Promise<Team> {
    try {
      // Validate manager exists and has appropriate role
      if (teamData.managerId) {
        const manager = await this.userRepository.findById(teamData.managerId);
        if (!manager) {
          throw new AppError(
            'Manager not found',
            400,
            ErrorCodes.VALIDATION_FAILED
          );
        }
        
        if (!manager.isActive) {
          throw new AppError(
            'Manager account is inactive',
            400,
            ErrorCodes.VALIDATION_FAILED
          );
        }

        // Check if manager has appropriate role
        const managerRoles: UserRole[] = ['admin', 'manager', 'supervisor'];
        if (!managerRoles.includes(manager.role)) {
          throw new AppError(
            'User does not have manager privileges',
            400,
            ErrorCodes.VALIDATION_FAILED
          );
        }
      }

      // Create team
      const team = await this.teamRepository.create({
        ...teamData,
        createdBy
      });

      // Update manager's team assignment if specified
      if (teamData.managerId) {
        await this.userRepository.update(teamData.managerId, {
          teamId: team.id,
          updatedBy: createdBy
        });
        
        // Update team member count
        await this.teamRepository.updateMemberCount(team.id);
      }

      // Log audit event
      await this.auditLogRepository.create({
        userId: createdBy,
        action: 'TEAM_CREATED',
        entityType: 'team',
        entityId: team.id,
        details: {
          teamName: team.name,
          department: team.department,
          managerId: team.managerId
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Team created successfully', {
        teamId: team.id,
        teamName: team.name,
        department: team.department,
        createdBy
      });

      return team;
    } catch (error) {
      logger.error('Team creation failed', {
        teamName: teamData.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get team by ID
   */
  async getTeamById(teamId: string): Promise<Team> {
    const team = await this.teamRepository.findById(teamId);
    if (!team) {
      throw new AppError(
        'Team not found',
        404,
        ErrorCodes.TEAM_NOT_FOUND
      );
    }
    return team;
  }

  /**
   * Update team
   */
  async updateTeam(
    teamId: string,
    updateData: UpdateTeamDTO,
    updatedBy: string,
    ipAddress?: string
  ): Promise<Team> {
    try {
      // Check if team exists
      const existingTeam = await this.getTeamById(teamId);

      // Validate new manager if being updated
      if (updateData.managerId && updateData.managerId !== existingTeam.managerId) {
        const newManager = await this.userRepository.findById(updateData.managerId);
        if (!newManager) {
          throw new AppError(
            'New manager not found',
            400,
            ErrorCodes.VALIDATION_FAILED
          );
        }
        
        if (!newManager.isActive) {
          throw new AppError(
            'New manager account is inactive',
            400,
            ErrorCodes.VALIDATION_FAILED
          );
        }

        const managerRoles: UserRole[] = ['admin', 'manager', 'supervisor'];
        if (!managerRoles.includes(newManager.role)) {
          throw new AppError(
            'User does not have manager privileges',
            400,
            ErrorCodes.VALIDATION_FAILED
          );
        }
      }

      // Update team
      const updatedTeam = await this.teamRepository.update(teamId, {
        ...updateData,
        updatedBy
      });

      // Handle manager changes
      if (updateData.managerId && updateData.managerId !== existingTeam.managerId) {
        // Remove old manager from team if exists
        if (existingTeam.managerId) {
          await this.userRepository.update(existingTeam.managerId, {
            teamId: null,
            updatedBy
          });
        }
        
        // Assign new manager to team
        await this.userRepository.update(updateData.managerId, {
          teamId,
          updatedBy
        });
        
        // Update member count
        await this.teamRepository.updateMemberCount(teamId);
      }

      // Log audit event
      await this.auditLogRepository.create({
        userId: updatedBy,
        action: 'TEAM_UPDATED',
        entityType: 'team',
        entityId: teamId,
        details: {
          updatedFields: Object.keys(updateData),
          previousValues: this.getChangedFields(existingTeam, updateData),
          newValues: updateData
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Team updated successfully', {
        teamId,
        updatedFields: Object.keys(updateData),
        updatedBy
      });

      return updatedTeam;
    } catch (error) {
      logger.error('Team update failed', {
        teamId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Delete team (soft delete)
   */
  async deleteTeam(
    teamId: string,
    deletedBy: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      // Check if team exists
      const team = await this.getTeamById(teamId);

      // Check if team has active members
      const members = await this.userRepository.findByTeam(teamId);
      if (members.data.length > 0) {
        throw new AppError(
          'Cannot delete team with active members. Please reassign or remove members first.',
          400,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Soft delete team
      await this.teamRepository.delete(teamId);

      // Log audit event
      await this.auditLogRepository.create({
        userId: deletedBy,
        action: 'TEAM_DELETED',
        entityType: 'team',
        entityId: teamId,
        details: {
          teamName: team.name,
          department: team.department,
          memberCount: team.memberCount
        },
        ipAddress,
        userAgent: '',
        severity: 'warning'
      });

      logger.info('Team deleted successfully', {
        teamId,
        teamName: team.name,
        deletedBy
      });
    } catch (error) {
      logger.error('Team deletion failed', {
        teamId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Activate team
   */
  async activateTeam(
    teamId: string,
    activatedBy: string,
    ipAddress?: string
  ): Promise<Team> {
    return this.updateTeamStatus(teamId, true, activatedBy, ipAddress);
  }

  /**
   * Deactivate team
   */
  async deactivateTeam(
    teamId: string,
    deactivatedBy: string,
    ipAddress?: string
  ): Promise<Team> {
    return this.updateTeamStatus(teamId, false, deactivatedBy, ipAddress);
  }

  /**
   * Update team status (active/inactive)
   */
  private async updateTeamStatus(
    teamId: string,
    isActive: boolean,
    updatedBy: string,
    ipAddress?: string
  ): Promise<Team> {
    try {
      const team = await this.getTeamById(teamId);
      
      if (team.isActive === isActive) {
        return team; // No change needed
      }

      // If deactivating, check for active members
      if (!isActive) {
        const activeMembers = await this.userRepository.findByTeam(teamId, {
          page: 1,
          limit: 1
        });
        
        if (activeMembers.data.length > 0) {
          throw new AppError(
            'Cannot deactivate team with active members. Please reassign or deactivate members first.',
            400,
            ErrorCodes.VALIDATION_FAILED
          );
        }
      }

      const updatedTeam = await this.teamRepository.update(teamId, {
        isActive,
        updatedBy
      });

      // Log audit event
      await this.auditLogRepository.create({
        userId: updatedBy,
        action: isActive ? 'TEAM_ACTIVATED' : 'TEAM_DEACTIVATED',
        entityType: 'team',
        entityId: teamId,
        details: {
          teamName: team.name,
          previousStatus: team.isActive,
          newStatus: isActive
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info(`Team ${isActive ? 'activated' : 'deactivated'} successfully`, {
        teamId,
        teamName: team.name,
        updatedBy
      });

      return updatedTeam;
    } catch (error) {
      logger.error(`Team ${isActive ? 'activation' : 'deactivation'} failed`, {
        teamId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Add member to team
   */
  async addMemberToTeam(
    teamId: string,
    userId: string,
    addedBy: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      // Validate team exists and is active
      const team = await this.getTeamById(teamId);
      if (!team.isActive) {
        throw new AppError(
          'Cannot add members to inactive team',
          400,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Validate user exists and is active
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppError(
          'User not found',
          404,
          ErrorCodes.USER_NOT_FOUND
        );
      }
      
      if (!user.isActive) {
        throw new AppError(
          'Cannot add inactive user to team',
          400,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Check if user is already in a team
      if (user.teamId && user.teamId !== teamId) {
        throw new AppError(
          'User is already assigned to another team',
          400,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      if (user.teamId === teamId) {
        return; // User already in this team
      }

      // Add user to team
      await this.userRepository.update(userId, {
        teamId,
        updatedBy: addedBy
      });

      // Update team member count
      await this.teamRepository.updateMemberCount(teamId);

      // Log audit event
      await this.auditLogRepository.create({
        userId: addedBy,
        action: 'TEAM_MEMBER_ADDED',
        entityType: 'team',
        entityId: teamId,
        details: {
          teamName: team.name,
          addedUserId: userId,
          addedUserEmail: user.email
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Member added to team successfully', {
        teamId,
        teamName: team.name,
        userId,
        userEmail: user.email,
        addedBy
      });
    } catch (error) {
      logger.error('Add member to team failed', {
        teamId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Remove member from team
   */
  async removeMemberFromTeam(
    teamId: string,
    userId: string,
    removedBy: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      // Validate team exists
      const team = await this.getTeamById(teamId);

      // Validate user exists and is in this team
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new AppError(
          'User not found',
          404,
          ErrorCodes.USER_NOT_FOUND
        );
      }

      if (user.teamId !== teamId) {
        throw new AppError(
          'User is not a member of this team',
          400,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Check if user is the team manager
      if (team.managerId === userId) {
        throw new AppError(
          'Cannot remove team manager. Please assign a new manager first.',
          400,
          ErrorCodes.VALIDATION_FAILED
        );
      }

      // Remove user from team
      await this.userRepository.update(userId, {
        teamId: null,
        updatedBy: removedBy
      });

      // Update team member count
      await this.teamRepository.updateMemberCount(teamId);

      // Log audit event
      await this.auditLogRepository.create({
        userId: removedBy,
        action: 'TEAM_MEMBER_REMOVED',
        entityType: 'team',
        entityId: teamId,
        details: {
          teamName: team.name,
          removedUserId: userId,
          removedUserEmail: user.email
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Member removed from team successfully', {
        teamId,
        teamName: team.name,
        userId,
        userEmail: user.email,
        removedBy
      });
    } catch (error) {
      logger.error('Remove member from team failed', {
        teamId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get team members with roles
   */
  async getTeamMembers(teamId: string): Promise<TeamMemberWithRole[]> {
    try {
      const team = await this.getTeamById(teamId);
      const members = await this.userRepository.findByTeam(teamId);

      const teamMembers: TeamMemberWithRole[] = members.data.map(user => ({
        user,
        role: user.id === team.managerId ? 'manager' : 'member',
        joinedAt: user.createdAt, // This could be enhanced with actual join date
        isActive: user.isActive
      }));

      logger.debug('Team members retrieved', {
        teamId,
        memberCount: teamMembers.length
      });

      return teamMembers;
    } catch (error) {
      logger.error('Get team members failed', {
        teamId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Search teams with filters and pagination
   */
  async searchTeams(
    filters: TeamSearchFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Team>> {
    try {
      const result = await this.teamRepository.search(filters, pagination);
      
      logger.debug('Team search completed', {
        filters,
        pagination,
        resultCount: result.data.length,
        totalCount: result.total
      });

      return result;
    } catch (error) {
      logger.error('Team search failed', {
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get teams by department
   */
  async getTeamsByDepartment(
    department: string,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Team>> {
    try {
      const result = await this.teamRepository.findByDepartment(department, pagination);
      
      logger.debug('Teams by department retrieved', {
        department,
        teamCount: result.data.length
      });

      return result;
    } catch (error) {
      logger.error('Get teams by department failed', {
        department,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get team statistics
   */
  async getTeamStatistics(): Promise<TeamStatistics> {
    try {
      const stats = await this.teamRepository.getStatistics();
      
      logger.debug('Team statistics retrieved', {
        totalTeams: stats.total,
        activeTeams: stats.active
      });

      return stats;
    } catch (error) {
      logger.error('Get team statistics failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get team performance metrics
   */
  async getTeamPerformanceMetrics(teamId: string): Promise<TeamPerformanceMetrics> {
    try {
      const team = await this.getTeamById(teamId);
      const metrics = await this.teamRepository.getPerformanceMetrics(teamId);
      
      logger.debug('Team performance metrics retrieved', {
        teamId,
        teamName: team.name
      });

      return {
        teamId,
        teamName: team.name,
        ...metrics
      };
    } catch (error) {
      logger.error('Get team performance metrics failed', {
        teamId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Bulk team operations
   */
  async bulkTeamOperation(
    operation: BulkTeamOperation,
    performedBy: string,
    ipAddress?: string
  ): Promise<{ success: string[]; failed: { teamId: string; error: string }[] }> {
    const results = {
      success: [] as string[],
      failed: [] as { teamId: string; error: string }[]
    };

    try {
      for (const teamId of operation.teamIds) {
        try {
          switch (operation.operation) {
            case 'activate':
              await this.activateTeam(teamId, performedBy, ipAddress);
              break;
            case 'deactivate':
              await this.deactivateTeam(teamId, performedBy, ipAddress);
              break;
            case 'delete':
              await this.deleteTeam(teamId, performedBy, ipAddress);
              break;
            case 'updateDepartment':
              if (operation.data?.department) {
                await this.updateTeam(
                  teamId,
                  { department: operation.data.department },
                  performedBy,
                  ipAddress
                );
              }
              break;
            case 'assignManager':
              if (operation.data?.managerId) {
                await this.updateTeam(
                  teamId,
                  { managerId: operation.data.managerId },
                  performedBy,
                  ipAddress
                );
              }
              break;
            default:
              throw new Error(`Unknown operation: ${operation.operation}`);
          }
          results.success.push(teamId);
        } catch (error) {
          results.failed.push({
            teamId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Log bulk operation
      await this.auditLogRepository.create({
        userId: performedBy,
        action: 'BULK_TEAM_OPERATION',
        entityType: 'team',
        entityId: null,
        details: {
          operation: operation.operation,
          totalTeams: operation.teamIds.length,
          successCount: results.success.length,
          failedCount: results.failed.length,
          data: operation.data
        },
        ipAddress,
        userAgent: '',
        severity: 'info'
      });

      logger.info('Bulk team operation completed', {
        operation: operation.operation,
        totalTeams: operation.teamIds.length,
        successCount: results.success.length,
        failedCount: results.failed.length,
        performedBy
      });

      return results;
    } catch (error) {
      logger.error('Bulk team operation failed', {
        operation: operation.operation,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get teams requiring attention
   */
  async getTeamsRequiringAttention(): Promise<Team[]> {
    try {
      const teams = await this.teamRepository.getTeamsRequiringAttention();
      
      logger.debug('Teams requiring attention retrieved', {
        count: teams.length
      });

      return teams;
    } catch (error) {
      logger.error('Get teams requiring attention failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get distinct departments
   */
  async getDistinctDepartments(): Promise<string[]> {
    try {
      const departments = await this.teamRepository.getDistinctDepartments();
      
      logger.debug('Distinct departments retrieved', {
        count: departments.length
      });

      return departments;
    } catch (error) {
      logger.error('Get distinct departments failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get changed fields for audit logging
   */
  private getChangedFields(original: Team, updates: UpdateTeamDTO): Record<string, any> {
    const changed: Record<string, any> = {};
    
    Object.keys(updates).forEach(key => {
      const typedKey = key as keyof UpdateTeamDTO;
      if (original[typedKey as keyof Team] !== updates[typedKey]) {
        changed[key] = original[typedKey as keyof Team];
      }
    });
    
    return changed;
  }
}