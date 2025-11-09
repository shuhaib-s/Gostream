'use client';

import React from 'react';
import { PlatformConfig, getAllPlatforms, getPlatformsByCategory, PLATFORM_CATEGORIES } from '@/lib/constants';
import { Card } from './ui';
import { PlatformLogo } from './PlatformLogos';

export interface PlatformSelectorProps {
  onSelect: (platform: PlatformConfig) => void;
  selectedPlatforms?: string[];
  groupByCategory?: boolean;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  onSelect,
  selectedPlatforms = [],
  groupByCategory = true,
}) => {
  if (groupByCategory) {
    return (
      <div className="space-y-6">
        {Object.entries(PLATFORM_CATEGORIES).map(([categoryId, category]) => {
          const platforms = getPlatformsByCategory(categoryId);
          if (platforms.length === 0) return null;

          return (
            <div key={categoryId}>
              <h3 className="text-sm font-medium text-dark-text-secondary mb-3">
                {category.label}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {platforms.map((platform) => (
                  <PlatformCard
                    key={platform.id}
                    platform={platform}
                    isSelected={selectedPlatforms.includes(platform.id)}
                    onClick={() => onSelect(platform)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const platforms = getAllPlatforms();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {platforms.map((platform) => (
        <PlatformCard
          key={platform.id}
          platform={platform}
          isSelected={selectedPlatforms.includes(platform.id)}
          onClick={() => onSelect(platform)}
        />
      ))}
    </div>
  );
};

interface PlatformCardProps {
  platform: PlatformConfig;
  isSelected: boolean;
  onClick: () => void;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ platform, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-5 rounded-xl border-2 transition-all duration-300 group
        ${isSelected
          ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/20 scale-105'
          : 'border-dark-border-secondary bg-dark-bg-elevated hover:border-dark-border-accent hover:bg-dark-bg-card hover:scale-105'
        }
      `}
    >
      <div className="flex flex-col items-center space-y-3">
        <div className="transform transition-transform duration-300 group-hover:scale-110">
          <PlatformLogo platform={platform.id} size={40} />
        </div>
        <span className="text-sm font-semibold text-dark-text-primary text-center">
          {platform.displayName}
        </span>
      </div>
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-subtle">
          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  );
};

