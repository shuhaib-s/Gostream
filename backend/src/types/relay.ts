/**
 * Relay Types
 * Types for FFmpeg relay/restreaming functionality
 */

import { ChildProcess } from 'child_process';

export interface RelayProcess {
  destinationId: string;
  process: ChildProcess;
  pid: number;
  startedAt: Date;
  inputUrl: string;
  outputUrl: string;
}

export interface RelayStats {
  destinationId: string;
  isRunning: boolean;
  pid?: number;
  startedAt?: Date;
  uptime?: number; // in seconds
  bitrate?: string;
  fps?: number;
  quality?: string;
}

export interface FFmpegLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
}

export interface StartRelayOptions {
  destinationId: string;
  inputUrl: string; // rtmp://localhost/live/{streamKey}
  outputUrl: string; // rtmp://platform.com/live2/{platformKey}
  streamKey?: string;
}

export interface RelayManager {
  activeRelays: Map<string, RelayProcess>;
  startRelay(options: StartRelayOptions): Promise<RelayProcess>;
  stopRelay(destinationId: string): Promise<boolean>;
  getRelayStatus(destinationId: string): RelayStats | null;
  getAllRelays(): RelayProcess[];
  stopAllRelays(): Promise<void>;
}

