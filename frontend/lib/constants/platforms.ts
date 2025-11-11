/**
 * Streaming Platforms Configuration
 * Contains platform-specific data, URLs, and metadata
 */

export interface PlatformConfig {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  rtmpUrl: string;
  streamKeyLabel: string;
  docsUrl: string;
  enabled: boolean;
  category: 'social' | 'streaming' | 'professional' | 'custom';
}

export const STREAMING_PLATFORMS: Record<string, PlatformConfig> = {
  youtube: {
    id: 'youtube',
    name: 'youtube',
    displayName: 'YouTube Live',
    icon: '🔴',
    color: '#FF0000',
    rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
    streamKeyLabel: 'YouTube Stream Key',
    docsUrl: 'https://support.google.com/youtube/answer/2907883',
    enabled: true,
    category: 'streaming',
  },
  twitch: {
    id: 'twitch',
    name: 'twitch',
    displayName: 'Twitch',
    icon: '🎮',
    color: '#9146FF',
    rtmpUrl: 'rtmp://live.twitch.tv/app',
    streamKeyLabel: 'Twitch Stream Key',
    docsUrl: 'https://help.twitch.tv/s/article/broadcast-guidelines',
    enabled: true,
    category: 'streaming',
  },
  facebook: {
    id: 'facebook',
    name: 'facebook',
    displayName: 'Facebook Live',
    icon: '📘',
    color: '#1877F2',
    rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp/',
    streamKeyLabel: 'Facebook Stream Key',
    docsUrl: 'https://www.facebook.com/help/587160588142067',
    enabled: true,
    category: 'social',
  },
  linkedin: {
    id: 'linkedin',
    name: 'linkedin',
    displayName: 'LinkedIn Live',
    icon: '💼',
    color: '#0077B5',
    rtmpUrl: 'rtmps://ingest.linkedin.com:443/live',
    streamKeyLabel: 'LinkedIn Stream Key',
    docsUrl: 'https://www.linkedin.com/help/linkedin/answer/a549933',
    enabled: true,
    category: 'professional',
  },
  tiktok: {
    id: 'tiktok',
    name: 'tiktok',
    displayName: 'TikTok Live',
    icon: '🎵',
    color: '#000000',
    rtmpUrl: 'rtmp://live.tiktok.com/live',
    streamKeyLabel: 'TikTok Stream Key',
    docsUrl: 'https://www.tiktok.com/live',
    enabled: true,
    category: 'social',
  },
  instagram: {
    id: 'instagram',
    name: 'instagram',
    displayName: 'Instagram Live',
    icon: '📷',
    color: '#E4405F',
    rtmpUrl: 'rtmps://live-upload.instagram.com:443/rtmp',
    streamKeyLabel: 'Instagram Stream Key',
    docsUrl: 'https://help.instagram.com/478364128980103',
    enabled: true,
    category: 'social',
  },
  twitter: {
    id: 'twitter',
    name: 'twitter',
    displayName: 'X (Twitter)',
    icon: '🐦',
    color: '#000000',
    rtmpUrl: 'rtmp://ingest.pscp.tv:80/x',
    streamKeyLabel: 'X Stream Key',
    docsUrl: 'https://help.twitter.com/en/using-twitter/twitter-live',
    enabled: true,
    category: 'social',
  },
  kick: {
    id: 'kick',
    name: 'kick',
    displayName: 'Kick',
    icon: '⚡',
    color: '#53FC18',
    rtmpUrl: 'rtmp://stream.kick.com/live',
    streamKeyLabel: 'Kick Stream Key',
    docsUrl: 'https://kick.com/docs',
    enabled: true,
    category: 'streaming',
  },
  rumble: {
    id: 'rumble',
    name: 'rumble',
    displayName: 'Rumble',
    icon: '🔊',
    color: '#85C742',
    rtmpUrl: 'rtmp://stream.rumble.com/live',
    streamKeyLabel: 'Rumble Stream Key',
    docsUrl: 'https://rumble.com/help',
    enabled: true,
    category: 'streaming',
  },
  trovo: {
    id: 'trovo',
    name: 'trovo',
    displayName: 'Trovo',
    icon: '🎪',
    color: '#20E592',
    rtmpUrl: 'rtmp://livepush.trovo.live/live',
    streamKeyLabel: 'Trovo Stream Key',
    docsUrl: 'https://trovo.live/policy/being-a-streamer.html',
    enabled: true,
    category: 'streaming',
  },
  custom: {
    id: 'custom',
    name: 'custom',
    displayName: 'Custom RTMP',
    icon: '🔧',
    color: '#6366F1',
    rtmpUrl: '',
    streamKeyLabel: 'Stream Key',
    docsUrl: '',
    enabled: true,
    category: 'custom',
  },
};

export const PLATFORM_CATEGORIES = {
  social: {
    label: 'Social Media',
    platforms: ['facebook', 'instagram', 'twitter', 'tiktok'],
  },
  streaming: {
    label: 'Streaming Platforms',
    platforms: ['youtube', 'twitch', 'kick', 'rumble', 'trovo'],
  },
  professional: {
    label: 'Professional',
    platforms: ['linkedin'],
  },
  custom: {
    label: 'Custom',
    platforms: ['custom'],
  },
};

export const getPlatformConfig = (platformId: string): PlatformConfig => {
  return STREAMING_PLATFORMS[platformId] || STREAMING_PLATFORMS.custom;
};

export const getAllPlatforms = (): PlatformConfig[] => {
  return Object.values(STREAMING_PLATFORMS);
};

export const getPlatformsByCategory = (category: string): PlatformConfig[] => {
  return Object.values(STREAMING_PLATFORMS).filter(p => p.category === category);
};



