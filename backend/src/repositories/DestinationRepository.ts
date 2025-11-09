import { Destination, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { BaseRepository } from './BaseRepository';

export type CreateDestinationData = {
  projectId: string;
  platform: string;
  name: string;
  rtmpUrl: string;
  streamKey: string;
  enabled?: boolean;
};

export type UpdateDestinationData = {
  platform?: string;
  name?: string;
  rtmpUrl?: string;
  streamKey?: string;
  enabled?: boolean;
};

/**
 * Destination Repository
 * Handles all destination-related database operations
 */
export class DestinationRepository extends BaseRepository {
  constructor() {
    super(prisma, 'Destination');
  }

  /**
   * Create a new destination
   */
  async create(data: CreateDestinationData): Promise<Destination> {
    try {
      this.logOperation('CREATE', { projectId: data.projectId, platform: data.platform });
      
      const destination = await this.prisma.destination.create({
        data,
      });

      return destination;
    } catch (error) {
      this.handleError('CREATE', error);
    }
  }

  /**
   * Find destination by ID
   */
  async findById(id: string): Promise<Destination | null> {
    try {
      this.logOperation('FIND_BY_ID', { id });
      
      const destination = await this.prisma.destination.findUnique({
        where: { id },
      });

      return destination;
    } catch (error) {
      this.handleError('FIND_BY_ID', error);
    }
  }

  /**
   * Find destination by ID with project relation (for authorization)
   */
  async findByIdWithProject(id: string): Promise<Destination & { project: { id: string; userId: string; streamKey: string } } | null> {
    try {
      this.logOperation('FIND_BY_ID_WITH_PROJECT', { id });
      
      const destination = await this.prisma.destination.findUnique({
        where: { id },
        include: {
          project: {
            select: {
              id: true,
              userId: true,
              streamKey: true,
            },
          },
        },
      });

      return destination;
    } catch (error) {
      this.handleError('FIND_BY_ID_WITH_PROJECT', error);
    }
  }

  /**
   * Find all destinations for a project
   */
  async findByProjectId(projectId: string): Promise<Destination[]> {
    try {
      this.logOperation('FIND_BY_PROJECT_ID', { projectId });
      
      const destinations = await this.prisma.destination.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
      });

      return destinations;
    } catch (error) {
      this.handleError('FIND_BY_PROJECT_ID', error);
    }
  }

  /**
   * Find enabled destinations for a project
   */
  async findEnabledByProjectId(projectId: string): Promise<Destination[]> {
    try {
      this.logOperation('FIND_ENABLED_BY_PROJECT_ID', { projectId });
      
      const destinations = await this.prisma.destination.findMany({
        where: {
          projectId,
          enabled: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return destinations;
    } catch (error) {
      this.handleError('FIND_ENABLED_BY_PROJECT_ID', error);
    }
  }

  /**
   * Update destination
   */
  async update(id: string, data: UpdateDestinationData): Promise<Destination> {
    try {
      this.logOperation('UPDATE', { id });
      
      const destination = await this.prisma.destination.update({
        where: { id },
        data,
      });

      return destination;
    } catch (error) {
      this.handleError('UPDATE', error);
    }
  }

  /**
   * Delete destination
   */
  async delete(id: string): Promise<void> {
    try {
      this.logOperation('DELETE', { id });
      
      await this.prisma.destination.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError('DELETE', error);
    }
  }

  /**
   * Verify destination ownership by user
   */
  async verifyOwnership(id: string, userId: string): Promise<boolean> {
    try {
      const count = await this.prisma.destination.count({
        where: {
          id,
          project: {
            userId,
          },
        },
      });

      return count > 0;
    } catch (error) {
      this.handleError('VERIFY_OWNERSHIP', error);
    }
  }
}

// Export singleton instance
export default new DestinationRepository();

