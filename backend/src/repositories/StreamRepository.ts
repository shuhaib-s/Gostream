import { Stream } from '@prisma/client';
import prisma from '../config/database';
import { BaseRepository } from './BaseRepository';

export type CreateStreamData = {
  projectId: string;
  status?: string;
};

export type UpdateStreamData = {
  status?: string;
  endedAt?: Date;
};

/**
 * Stream Repository
 * Handles all stream-related database operations
 */
export class StreamRepository extends BaseRepository {
  constructor() {
    super(prisma, 'Stream');
  }

  /**
   * Create a new stream
   */
  async create(data: CreateStreamData): Promise<Stream> {
    try {
      this.logOperation('CREATE', { projectId: data.projectId });
      
      const stream = await this.prisma.stream.create({
        data: {
          projectId: data.projectId,
          status: data.status || 'live',
        },
      });

      return stream;
    } catch (error) {
      this.handleError('CREATE', error);
    }
  }

  /**
   * Find stream by ID
   */
  async findById(id: string): Promise<Stream | null> {
    try {
      this.logOperation('FIND_BY_ID', { id });
      
      const stream = await this.prisma.stream.findUnique({
        where: { id },
      });

      return stream;
    } catch (error) {
      this.handleError('FIND_BY_ID', error);
    }
  }

  /**
   * Find active streams for a project
   */
  async findActiveByProjectId(projectId: string): Promise<Stream[]> {
    try {
      this.logOperation('FIND_ACTIVE_BY_PROJECT_ID', { projectId });
      
      const streams = await this.prisma.stream.findMany({
        where: {
          projectId,
          status: 'live',
        },
        orderBy: { startedAt: 'desc' },
      });

      return streams;
    } catch (error) {
      this.handleError('FIND_ACTIVE_BY_PROJECT_ID', error);
    }
  }

  /**
   * Find all streams for a project
   */
  async findByProjectId(projectId: string): Promise<Stream[]> {
    try {
      this.logOperation('FIND_BY_PROJECT_ID', { projectId });
      
      const streams = await this.prisma.stream.findMany({
        where: { projectId },
        orderBy: { startedAt: 'desc' },
      });

      return streams;
    } catch (error) {
      this.handleError('FIND_BY_PROJECT_ID', error);
    }
  }

  /**
   * Update stream
   */
  async update(id: string, data: UpdateStreamData): Promise<Stream> {
    try {
      this.logOperation('UPDATE', { id });
      
      const stream = await this.prisma.stream.update({
        where: { id },
        data,
      });

      return stream;
    } catch (error) {
      this.handleError('UPDATE', error);
    }
  }

  /**
   * End all active streams for a project
   */
  async endActiveStreams(projectId: string): Promise<void> {
    try {
      this.logOperation('END_ACTIVE_STREAMS', { projectId });
      
      await this.prisma.stream.updateMany({
        where: {
          projectId,
          status: 'live',
        },
        data: {
          status: 'ended',
          endedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleError('END_ACTIVE_STREAMS', error);
    }
  }

  /**
   * Delete stream
   */
  async delete(id: string): Promise<void> {
    try {
      this.logOperation('DELETE', { id });
      
      await this.prisma.stream.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError('DELETE', error);
    }
  }
}

// Export singleton instance
export default new StreamRepository();


