/**
 * Relay Controller
 * Handles starting and stopping stream relays to destinations
 */

import { Request, Response, NextFunction } from 'express';
import { RelayService } from '../services/RelayService';
import { destinationRepository, projectRepository } from '../repositories';
import { AuthorizationError, NotFoundError, ValidationError } from '../utils/errors';
import { isValidUUID } from '../utils/validation';
import logger from '../utils/logger';
import config from '../config';

interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Start Relay Controller
 * Starts FFmpeg relay to push stream to a destination
 */
export const startRelay = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();

  try {
    const { destinationId } = req.params;
    const userId = req.userId;

    if (!userId) {
      throw new AuthorizationError('User not authenticated');
    }

    if (!isValidUUID(destinationId)) {
      throw new ValidationError('Invalid destination ID format');
    }

    // Get destination with project info
    const destination = await destinationRepository.findByIdWithProject(destinationId);

    if (!destination) {
      throw new NotFoundError('Destination');
    }

    // Verify ownership
    if (destination.project.userId !== userId) {
      throw new AuthorizationError('Access denied');
    }

    // Check if destination is enabled
    if (!destination.enabled) {
      throw new ValidationError('Destination is disabled. Enable it first.');
    }

    // Check if relay is already running
    if (RelayService.isRelayRunning(destinationId)) {
      throw new ValidationError('Stream is already running to this destination');
    }

    // Build RTMP URLs
    const inputUrl = `${config.rtmp.serverUrl}/${destination.project.streamKey}`;
    const outputUrl = `${destination.rtmpUrl}/${destination.streamKey}`;

    // Start relay
    const relay = await RelayService.startRelay({
      destinationId,
      inputUrl,
      outputUrl,
      streamKey: destination.streamKey,
    });

    const duration = Date.now() - startTime;
    logger.info('Relay started via API', {
      destinationId,
      projectId: destination.project.id,
      userId,
      pid: relay.pid,
      duration: `${duration}ms`,
    });

    res.json({
      success: true,
      message: 'Stream relay started successfully',
      data: {
        destinationId,
        pid: relay.pid,
        startedAt: relay.startedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Stop Relay Controller
 * Stops FFmpeg relay for a destination
 */
export const stopRelay = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();

  try {
    const { destinationId } = req.params;
    const userId = req.userId;

    if (!userId) {
      throw new AuthorizationError('User not authenticated');
    }

    if (!isValidUUID(destinationId)) {
      throw new ValidationError('Invalid destination ID format');
    }

    // Get destination with project info
    const destination = await destinationRepository.findByIdWithProject(destinationId);

    if (!destination) {
      throw new NotFoundError('Destination');
    }

    // Verify ownership
    if (destination.project.userId !== userId) {
      throw new AuthorizationError('Access denied');
    }

    // Check if relay is running
    if (!RelayService.isRelayRunning(destinationId)) {
      throw new ValidationError('Stream is not running to this destination');
    }

    // Stop relay
    const stopped = await RelayService.stopRelay(destinationId);

    if (!stopped) {
      throw new Error('Failed to stop relay');
    }

    const duration = Date.now() - startTime;
    logger.info('Relay stopped via API', {
      destinationId,
      projectId: destination.project.id,
      userId,
      duration: `${duration}ms`,
    });

    res.json({
      success: true,
      message: 'Stream relay stopped successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Relay Status Controller
 * Returns status of relay for a destination
 */
export const getRelayStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { destinationId } = req.params;
    const userId = req.userId;

    if (!userId) {
      throw new AuthorizationError('User not authenticated');
    }

    if (!isValidUUID(destinationId)) {
      throw new ValidationError('Invalid destination ID format');
    }

    // Get destination with project info
    const destination = await destinationRepository.findByIdWithProject(destinationId);

    if (!destination) {
      throw new NotFoundError('Destination');
    }

    // Verify ownership
    if (destination.project.userId !== userId) {
      throw new AuthorizationError('Access denied');
    }

    // Get relay status
    const status = RelayService.getRelayStatus(destinationId);

    res.json({
      success: true,
      data: status || {
        destinationId,
        isRunning: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Relays Controller
 * Returns all active relays for user's projects
 */
export const getAllRelays = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new AuthorizationError('User not authenticated');
    }

    // Get all active relays
    const allRelays = RelayService.getAllRelays();

    // Filter to only user's destinations (need to verify ownership)
    const relayStatuses = await Promise.all(
      allRelays.map(async (relay) => {
        const destination = await destinationRepository.findByIdWithProject(relay.destinationId);
        
        if (destination && destination.project.userId === userId) {
          return RelayService.getRelayStatus(relay.destinationId);
        }
        
        return null;
      })
    );

    const userRelays = relayStatuses.filter((status) => status !== null);

    res.json({
      success: true,
      data: userRelays,
      count: userRelays.length,
    });
  } catch (error) {
    next(error);
  }
};

