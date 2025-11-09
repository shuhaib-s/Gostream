import { Project, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { BaseRepository } from './BaseRepository';
import { NotFoundError } from '../utils/errors';

export type CreateProjectData = {
  name: string;
  userId: string;
};

export type UpdateProjectData = {
  name?: string;
};

export type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    streams: true;
    destinations: true;
  };
}>;

/**
 * Project Repository
 * Handles all project-related database operations
 */
export class ProjectRepository extends BaseRepository {
  constructor() {
    super(prisma, 'Project');
  }

  /**
   * Create a new project
   */
  async create(data: CreateProjectData): Promise<Project> {
    try {
      this.logOperation('CREATE', { name: data.name, userId: data.userId });
      
      const project = await this.prisma.project.create({
        data,
      });

      return project;
    } catch (error) {
      this.handleError('CREATE', error);
    }
  }

  /**
   * Find project by ID
   */
  async findById(id: string): Promise<Project | null> {
    try {
      this.logOperation('FIND_BY_ID', { id });
      
      const project = await this.prisma.project.findUnique({
        where: { id },
      });

      return project;
    } catch (error) {
      this.handleError('FIND_BY_ID', error);
    }
  }

  /**
   * Find project by ID with relations
   */
  async findByIdWithRelations(id: string): Promise<ProjectWithRelations | null> {
    try {
      this.logOperation('FIND_BY_ID_WITH_RELATIONS', { id });
      
      const project = await this.prisma.project.findUnique({
        where: { id },
        include: {
          streams: {
            orderBy: { startedAt: 'desc' },
            take: 1,
          },
          destinations: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      return project;
    } catch (error) {
      this.handleError('FIND_BY_ID_WITH_RELATIONS', error);
    }
  }

  /**
   * Find project by stream key
   */
  async findByStreamKey(streamKey: string): Promise<Project | null> {
    try {
      this.logOperation('FIND_BY_STREAM_KEY');
      
      const project = await this.prisma.project.findUnique({
        where: { streamKey },
      });

      return project;
    } catch (error) {
      this.handleError('FIND_BY_STREAM_KEY', error);
    }
  }

  /**
   * Find project by ID and user ID (for authorization)
   */
  async findByIdAndUserId(id: string, userId: string): Promise<Project | null> {
    try {
      this.logOperation('FIND_BY_ID_AND_USER_ID', { id, userId });
      
      const project = await this.prisma.project.findFirst({
        where: {
          id,
          userId,
        },
      });

      return project;
    } catch (error) {
      this.handleError('FIND_BY_ID_AND_USER_ID', error);
    }
  }

  /**
   * Find project by ID and user ID with relations
   */
  async findByIdAndUserIdWithRelations(id: string, userId: string): Promise<ProjectWithRelations | null> {
    try {
      this.logOperation('FIND_BY_ID_AND_USER_ID_WITH_RELATIONS', { id, userId });
      
      const project = await this.prisma.project.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          streams: {
            orderBy: { startedAt: 'desc' },
            take: 1,
          },
          destinations: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      return project;
    } catch (error) {
      this.handleError('FIND_BY_ID_AND_USER_ID_WITH_RELATIONS', error);
    }
  }

  /**
   * Find all projects for a user
   */
  async findByUserId(userId: string): Promise<ProjectWithRelations[]> {
    try {
      this.logOperation('FIND_BY_USER_ID', { userId });
      
      const projects = await this.prisma.project.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          streams: {
            where: { status: 'live' },
            orderBy: { startedAt: 'desc' },
            take: 1,
          },
          destinations: true,
        },
      });

      return projects;
    } catch (error) {
      this.handleError('FIND_BY_USER_ID', error);
    }
  }

  /**
   * Update project
   */
  async update(id: string, data: UpdateProjectData): Promise<Project> {
    try {
      this.logOperation('UPDATE', { id });
      
      const project = await this.prisma.project.update({
        where: { id },
        data,
      });

      return project;
    } catch (error) {
      this.handleError('UPDATE', error);
    }
  }

  /**
   * Delete project
   */
  async delete(id: string): Promise<void> {
    try {
      this.logOperation('DELETE', { id });
      
      await this.prisma.project.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError('DELETE', error);
    }
  }

  /**
   * Check if project exists by ID and user ID
   */
  async existsByIdAndUserId(id: string, userId: string): Promise<boolean> {
    try {
      const count = await this.prisma.project.count({
        where: {
          id,
          userId,
        },
      });

      return count > 0;
    } catch (error) {
      this.handleError('EXISTS_BY_ID_AND_USER_ID', error);
    }
  }
}

// Export singleton instance
export default new ProjectRepository();

