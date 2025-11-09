import { Response, NextFunction } from 'express';
import { projectRepository, destinationRepository } from '../repositories';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ValidationError, AuthorizationError, NotFoundError } from '../utils/errors';
import { isValidUUID, isValidRtmpUrl, sanitizeString } from '../utils/validation';
import logger from '../utils/logger';

/**
 * Create Project Controller
 */
export const createProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();
  
  try {
    const { name } = req.body;
    const userId = req.userId;

    if (!userId) {
      throw new AuthorizationError('User not authenticated');
    }

    if (!name || name.trim().length === 0) {
      throw new ValidationError('Project name is required');
    }

    const sanitizedName = sanitizeString(name);

    const project = await projectRepository.create({
      name: sanitizedName,
      userId,
    });

    const duration = Date.now() - startTime;
    logger.info('Project created', { projectId: project.id, userId, duration: `${duration}ms` });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Projects Controller
 */
export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();
  
  try {
    const userId = req.userId;

    if (!userId) {
      throw new AuthorizationError('User not authenticated');
    }

    const projects = await projectRepository.findByUserId(userId);

    const duration = Date.now() - startTime;
    logger.info('Projects retrieved', { userId, count: projects.length, duration: `${duration}ms` });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Project By ID Controller
 */
export const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      throw new AuthorizationError('User not authenticated');
    }

    if (!isValidUUID(id)) {
      throw new ValidationError('Invalid project ID format');
    }

    const project = await projectRepository.findByIdAndUserIdWithRelations(id, userId);

    if (!project) {
      throw new NotFoundError('Project');
    }

    const duration = Date.now() - startTime;
    logger.info('Project retrieved', { projectId: id, userId, duration: `${duration}ms` });

    res.json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Project Controller
 */
export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      throw new AuthorizationError('User not authenticated');
    }

    if (!isValidUUID(id)) {
      throw new ValidationError('Invalid project ID format');
    }

    const project = await projectRepository.findByIdAndUserId(id, userId);

    if (!project) {
      throw new NotFoundError('Project');
    }

    await projectRepository.delete(id);

    const duration = Date.now() - startTime;
    logger.info('Project deleted', { projectId: id, userId, duration: `${duration}ms` });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Destination Controller
 */
export const createDestination = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();
  
  try {
    const { projectId } = req.params;
    const { platform, name, rtmpUrl, streamKey } = req.body;
    const userId = req.userId;

    if (!userId) {
      throw new AuthorizationError('User not authenticated');
    }

    if (!isValidUUID(projectId)) {
      throw new ValidationError('Invalid project ID format');
    }

    if (!platform || !name || !rtmpUrl || !streamKey) {
      throw new ValidationError('Platform, name, rtmpUrl, and streamKey are required');
    }

    if (!isValidRtmpUrl(rtmpUrl)) {
      throw new ValidationError('Invalid RTMP URL format');
    }

    // Verify project ownership
    const project = await projectRepository.findByIdAndUserId(projectId, userId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    const sanitizedName = sanitizeString(name);
    const sanitizedPlatform = sanitizeString(platform);

    const destination = await destinationRepository.create({
      projectId,
      platform: sanitizedPlatform,
      name: sanitizedName,
      rtmpUrl,
      streamKey,
    });

    const duration = Date.now() - startTime;
    logger.info('Destination created', { 
      destinationId: destination.id, 
      projectId, 
      userId, 
      duration: `${duration}ms` 
    });

    res.status(201).json(destination);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Destination Controller
 */
export const updateDestination = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const { platform, name, rtmpUrl, streamKey, enabled } = req.body;
    const userId = req.userId;

    if (!userId) {
      throw new AuthorizationError('User not authenticated');
    }

    if (!isValidUUID(id)) {
      throw new ValidationError('Invalid destination ID format');
    }

    if (rtmpUrl && !isValidRtmpUrl(rtmpUrl)) {
      throw new ValidationError('Invalid RTMP URL format');
    }

    // Verify ownership
    const destination = await destinationRepository.findByIdWithProject(id);
    if (!destination) {
      throw new NotFoundError('Destination');
    }

    if (destination.project.userId !== userId) {
      throw new AuthorizationError('Access denied');
    }

    const updateData: any = {};
    if (platform) updateData.platform = sanitizeString(platform);
    if (name) updateData.name = sanitizeString(name);
    if (rtmpUrl) updateData.rtmpUrl = rtmpUrl;
    if (streamKey) updateData.streamKey = streamKey;
    if (enabled !== undefined) updateData.enabled = enabled;

    const updatedDestination = await destinationRepository.update(id, updateData);

    const duration = Date.now() - startTime;
    logger.info('Destination updated', { destinationId: id, userId, duration: `${duration}ms` });

    res.json(updatedDestination);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Destination Controller
 */
export const deleteDestination = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      throw new AuthorizationError('User not authenticated');
    }

    if (!isValidUUID(id)) {
      throw new ValidationError('Invalid destination ID format');
    }

    // Verify ownership
    const destination = await destinationRepository.findByIdWithProject(id);
    if (!destination) {
      throw new NotFoundError('Destination');
    }

    if (destination.project.userId !== userId) {
      throw new AuthorizationError('Access denied');
    }

    await destinationRepository.delete(id);

    const duration = Date.now() - startTime;
    logger.info('Destination deleted', { destinationId: id, userId, duration: `${duration}ms` });

    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    next(error);
  }
};
