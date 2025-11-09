/**
 * FFmpeg Utilities
 * Helper functions for working with FFmpeg
 */

import { spawn, ChildProcess } from 'child_process';
import logger from './logger';

export interface FFmpegOptions {
  input: string;
  output: string;
  videoCopyCodec?: boolean;
  audioCopyCodec?: boolean;
  format?: string;
}

/**
 * Spawn FFmpeg process to relay RTMP stream
 */
export function spawnFFmpegRelay(options: FFmpegOptions): ChildProcess {
  const {
    input,
    output,
    videoCopyCodec = true,
    audioCopyCodec = true,
    format = 'flv',
  } = options;

  // Build FFmpeg arguments
  const args: string[] = [
    '-i', input,                    // Input URL
    '-c:v', videoCopyCodec ? 'copy' : 'libx264', // Video codec
    '-c:a', audioCopyCodec ? 'copy' : 'aac',     // Audio codec
    '-f', format,                   // Output format
    '-reconnect', '1',              // Reconnect if connection is lost
    '-reconnect_streamed', '1',     // Reconnect for streamed inputs
    '-reconnect_delay_max', '5',    // Max reconnect delay
    output,                         // Output URL
  ];

  logger.info('Spawning FFmpeg process', {
    input,
    output: output.replace(/\/[^/]+$/, '/***'), // Hide stream key
    args: args.slice(0, -1).concat(['***']),
  });

  // Spawn FFmpeg
  const ffmpeg = spawn('ffmpeg', args, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Log FFmpeg output
  ffmpeg.stdout?.on('data', (data: Buffer) => {
    logger.debug('FFmpeg stdout', { output: data.toString().trim() });
  });

  ffmpeg.stderr?.on('data', (data: Buffer) => {
    const output = data.toString().trim();
    logger.debug('FFmpeg stderr', { output });
    
    // Parse for errors
    if (output.includes('error') || output.includes('Error')) {
      logger.warn('FFmpeg error detected', { output });
    }
  });

  ffmpeg.on('error', (error: Error) => {
    logger.error('FFmpeg process error', error);
  });

  ffmpeg.on('exit', (code: number | null, signal: string | null) => {
    logger.info('FFmpeg process exited', { code, signal });
  });

  return ffmpeg;
}

/**
 * Kill FFmpeg process gracefully
 */
export function killFFmpegProcess(process: ChildProcess): Promise<boolean> {
  return new Promise((resolve) => {
    if (!process || process.killed) {
      resolve(false);
      return;
    }

    // Try graceful shutdown first
    process.kill('SIGTERM');

    // Force kill after timeout
    const forceKillTimeout = setTimeout(() => {
      if (!process.killed) {
        logger.warn('Force killing FFmpeg process');
        process.kill('SIGKILL');
      }
    }, 5000);

    process.on('exit', () => {
      clearTimeout(forceKillTimeout);
      resolve(true);
    });
  });
}

/**
 * Check if FFmpeg is available
 */
export function checkFFmpegAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', ['-version']);
    
    ffmpeg.on('error', () => {
      logger.error('FFmpeg not found! Make sure FFmpeg is installed and in PATH');
      resolve(false);
    });

    ffmpeg.on('exit', (code) => {
      resolve(code === 0);
    });
  });
}

/**
 * Parse FFmpeg stats from stderr output
 */
export function parseFFmpegStats(output: string): {
  bitrate?: string;
  fps?: number;
  quality?: string;
} {
  const stats: any = {};

  // Extract bitrate (e.g., "bitrate= 2456.7kbits/s")
  const bitrateMatch = output.match(/bitrate=\s*(\S+)/);
  if (bitrateMatch) {
    stats.bitrate = bitrateMatch[1];
  }

  // Extract fps (e.g., "fps=30")
  const fpsMatch = output.match(/fps=\s*(\d+)/);
  if (fpsMatch) {
    stats.fps = parseInt(fpsMatch[1], 10);
  }

  // Extract quality (e.g., "q=28.0")
  const qualityMatch = output.match(/q=\s*(\S+)/);
  if (qualityMatch) {
    stats.quality = qualityMatch[1];
  }

  return stats;
}

