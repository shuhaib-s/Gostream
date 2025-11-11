'use client';

import React from 'react';
import { Card } from './ui';

export interface StreamStatsProps {
  stats?: {
    viewers?: number;
    duration?: string;
    bitrate?: string;
    fps?: number;
    destinations?: number;
  };
}

export const StreamStats: React.FC<StreamStatsProps> = ({ stats }) => {
  const defaultStats = {
    viewers: 0,
    duration: '00:00:00',
    bitrate: '0 kbps',
    fps: 0,
    destinations: 0,
  };

  const currentStats = { ...defaultStats, ...stats };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        }
        label="Viewers"
        value={currentStats.viewers.toLocaleString()}
      />
      <StatCard
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        label="Duration"
        value={currentStats.duration}
      />
      <StatCard
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
        label="Bitrate"
        value={currentStats.bitrate}
      />
      <StatCard
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        }
        label="FPS"
        value={`${currentStats.fps}`}
      />
      <StatCard
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        }
        label="Destinations"
        value={`${currentStats.destinations}`}
      />
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => {
  return (
    <Card className="text-center" noPadding>
      <div className="p-4">
        <div className="flex justify-center mb-2 text-primary-400">{icon}</div>
        <div className="text-2xl font-bold text-dark-text-primary mb-1">{value}</div>
        <div className="text-xs text-dark-text-tertiary">{label}</div>
      </div>
    </Card>
  );
};



