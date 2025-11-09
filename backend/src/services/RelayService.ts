/**
 * Relay Service
 * Manages FFmpeg processes for relaying streams to multiple destinations
 */

import { RelayProcess, RelayStats, StartRelayOptions, RelayManager } from '../types/relay';
import { spawnFFmpegRelay, killFFmpegProcess } from '../utils/ffmpeg';
import logger from '../utils/logger';

class RelayServiceClass implements RelayManager {
  public activeRelays: Map<string, RelayProcess>;

  constructor() {
    this.activeRelays = new Map();
    
    // Cleanup on process exit
    process.on('SIGINT', () => this.stopAllRelays());
    process.on('SIGTERM', () => this.stopAllRelays());
  }

  /**
   * Start a new relay to a destination
   */
  async startRelay(options: StartRelayOptions): Promise<RelayProcess> {
    const { destinationId, inputUrl, outputUrl } = options;

    // Check if relay already exists
    if (this.activeRelays.has(destinationId)) {
      logger.warn('Relay already exists for destination', { destinationId });
      throw new Error('Relay already running for this destination');
    }

    try {
      logger.info('Starting relay', {
        destinationId,
        inputUrl,
        outputUrl: outputUrl.replace(/\/[^/]+$/, '/***'), // Hide stream key
      });

      // Spawn FFmpeg process
      const ffmpegProcess = spawnFFmpegRelay({
        input: inputUrl,
        output: outputUrl,
        videoCopyCodec: true,
        audioCopyCodec: true,
        format: 'flv',
      });

      if (!ffmpegProcess.pid) {
        throw new Error('Failed to start FFmpeg process');
      }

      // Create relay record
      const relay: RelayProcess = {
        destinationId,
        process: ffmpegProcess,
        pid: ffmpegProcess.pid,
        startedAt: new Date(),
        inputUrl,
        outputUrl,
      };

      // Handle process exit
      ffmpegProcess.on('exit', (code, signal) => {
        logger.info('Relay process exited', {
          destinationId,
          pid: ffmpegProcess.pid,
          code,
          signal,
        });
        this.activeRelays.delete(destinationId);
      });

      // Handle process error
      ffmpegProcess.on('error', (error) => {
        logger.error('Relay process error', {
          destinationId,
          pid: ffmpegProcess.pid,
          error: error.message,
        });
        this.activeRelays.delete(destinationId);
      });

      // Store relay
      this.activeRelays.set(destinationId, relay);

      logger.info('Relay started successfully', {
        destinationId,
        pid: ffmpegProcess.pid,
      });

      return relay;
    } catch (error) {
      logger.error('Failed to start relay', {
        destinationId,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Stop a relay
   */
  async stopRelay(destinationId: string): Promise<boolean> {
    const relay = this.activeRelays.get(destinationId);

    if (!relay) {
      logger.warn('Relay not found', { destinationId });
      return false;
    }

    try {
      logger.info('Stopping relay', {
        destinationId,
        pid: relay.pid,
      });

      const killed = await killFFmpegProcess(relay.process);

      if (killed) {
        this.activeRelays.delete(destinationId);
        logger.info('Relay stopped successfully', { destinationId });
      }

      return killed;
    } catch (error) {
      logger.error('Failed to stop relay', {
        destinationId,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Get relay status
   */
  getRelayStatus(destinationId: string): RelayStats | null {
    const relay = this.activeRelays.get(destinationId);

    if (!relay) {
      return null;
    }

    const uptime = Math.floor((Date.now() - relay.startedAt.getTime()) / 1000);

    return {
      destinationId: relay.destinationId,
      isRunning: !relay.process.killed,
      pid: relay.pid,
      startedAt: relay.startedAt,
      uptime,
    };
  }

  /**
   * Get all active relays
   */
  getAllRelays(): RelayProcess[] {
    return Array.from(this.activeRelays.values());
  }

  /**
   * Stop all relays
   */
  async stopAllRelays(): Promise<void> {
    logger.info('Stopping all relays', {
      count: this.activeRelays.size,
    });

    const stopPromises = Array.from(this.activeRelays.keys()).map((destinationId) =>
      this.stopRelay(destinationId).catch((error) => {
        logger.error('Error stopping relay', {
          destinationId,
          error: (error as Error).message,
        });
      })
    );

    await Promise.all(stopPromises);
    logger.info('All relays stopped');
  }

  /**
   * Check if relay is running
   */
  isRelayRunning(destinationId: string): boolean {
    const relay = this.activeRelays.get(destinationId);
    return relay ? !relay.process.killed : false;
  }

  /**
   * Get active relay count
   */
  getActiveRelayCount(): number {
    return this.activeRelays.size;
  }
}

// Export singleton instance
export const RelayService = new RelayServiceClass();

