import { Request, Response, NextFunction } from 'express';
import { projectRepository, streamRepository } from '../repositories';
import { AuthorizationError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * On Publish Controller
 * Called by Nginx RTMP when a stream starts publishing
 */
export const onPublish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();
  
  try {
    // Nginx RTMP sends form data, extract stream key from 'name' parameter
    const streamKey = req.body.name || req.query.name;

    if (!streamKey) {
      logger.warn('Stream publish attempt without stream key', { 
        body: req.body, 
        query: req.query 
      });
      throw new AuthorizationError('No stream key provided');
    }

    logger.info('Stream publish attempt', { streamKey });

    // Verify stream key exists
    const project = await projectRepository.findByStreamKey(streamKey as string);

    if (!project) {
      logger.warn('Stream publish attempt with invalid key', { streamKey });
      throw new AuthorizationError('Invalid stream key');
    }

    // Create stream record
    const stream = await streamRepository.create({
      projectId: project.id,
      status: 'live',
    });

    const duration = Date.now() - startTime;
    logger.info('Stream started', { 
      streamId: stream.id,
      projectId: project.id, 
      projectName: project.name,
      duration: `${duration}ms`
    });

    // Return 200 to allow stream
    res.status(200).send('OK');
  } catch (error) {
    // For stream authorization errors, return 403 to Nginx
    if (error instanceof AuthorizationError) {
      logger.warn('Stream authorization failed', { error: (error as Error).message });
      res.status(403).send('Forbidden');
      return;
    }
    
    next(error);
  }
};

/**
 * On Publish Done Controller
 * Called by Nginx RTMP when a stream stops publishing
 */
export const onPublishDone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();
  
  try {
    const streamKey = req.body.name || req.query.name;

    if (!streamKey) {
      logger.debug('Stream end notification without stream key');
      res.status(200).send('OK');
      return;
    }

    logger.info('Stream end notification', { streamKey });

    // Find project
    const project = await projectRepository.findByStreamKey(streamKey as string);

    if (!project) {
      logger.debug('Stream end for unknown stream key', { streamKey });
      res.status(200).send('OK');
      return;
    }

    // Mark active streams as ended
    await streamRepository.endActiveStreams(project.id);

    const duration = Date.now() - startTime;
    logger.info('Stream ended', { 
      projectId: project.id, 
      projectName: project.name,
      duration: `${duration}ms`
    });

    res.status(200).send('OK');
  } catch (error) {
    // Always return OK to nginx to avoid issues
    logger.error('Error in onPublishDone', error as Error);
    res.status(200).send('OK');
  }
};
