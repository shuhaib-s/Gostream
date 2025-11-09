import { User } from '@prisma/client';
import prisma from '../config/database';
import { BaseRepository } from './BaseRepository';
import { NotFoundError } from '../utils/errors';

export type CreateUserData = {
  email: string;
  name?: string;
  passwordHash?: string;
  googleId?: string;
};

export type UserWithoutPassword = Omit<User, 'passwordHash'>;

/**
 * User Repository
 * Handles all user-related database operations
 */
export class UserRepository extends BaseRepository {
  constructor() {
    super(prisma, 'User');
  }

  /**
   * Create a new user
   */
  async create(data: CreateUserData): Promise<User> {
    try {
      this.logOperation('CREATE', { email: data.email });
      
      const createData: any = {
        email: data.email,
      };
      
      if (data.name) createData.name = data.name;
      if (data.passwordHash) createData.passwordHash = data.passwordHash;
      if (data.googleId) createData.googleId = data.googleId;
      
      const user = await this.prisma.user.create({
        data: createData,
      });

      return user;
    } catch (error) {
      this.handleError('CREATE', error);
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      this.logOperation('FIND_BY_ID', { id });
      
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      return user;
    } catch (error) {
      this.handleError('FIND_BY_ID', error);
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      this.logOperation('FIND_BY_EMAIL', { email });
      
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      return user;
    } catch (error) {
      this.handleError('FIND_BY_EMAIL', error);
    }
  }

  /**
   * Find user by Google ID
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      this.logOperation('FIND_BY_GOOGLE_ID', { googleId });
      
      const user = await this.prisma.user.findFirst({
        where: { googleId: googleId } as any,
      });

      return user;
    } catch (error) {
      this.handleError('FIND_BY_GOOGLE_ID', error);
    }
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({
        where: { email },
      });

      return count > 0;
    } catch (error) {
      this.handleError('EXISTS_BY_EMAIL', error);
    }
  }

  /**
   * Get user without password hash
   */
  async findByIdSafe(id: string): Promise<UserWithoutPassword> {
    try {
      const user = await this.findById(id);
      
      if (!user) {
        throw new NotFoundError('User');
      }

      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.handleError('FIND_BY_ID_SAFE', error);
    }
  }

  /**
   * Update user
   */
  async update(id: string, data: Partial<CreateUserData>): Promise<User> {
    try {
      this.logOperation('UPDATE', { id });
      
      const user = await this.prisma.user.update({
        where: { id },
        data,
      });

      return user;
    } catch (error) {
      this.handleError('UPDATE', error);
    }
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    try {
      this.logOperation('DELETE', { id });
      
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError('DELETE', error);
    }
  }
}

// Export singleton instance
export default new UserRepository();

