export interface ExecutorData {
  working: string[];
  notWorking: string[];
  lastUpdated?: string;
  source?: 'api' | 'fallback';
}

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  rawViews?: number;
  videoUrl: string;
  description?: string;
}

export interface VideoResponse {
  videos: YouTubeVideo[];
  channelUrl: string;
  source: 'api' | 'fallback';
  lastUpdated?: string;
}

export type MusicTrack = 'welcome' | 'main' | 'status' | 'videos';

export interface AudioSettings {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  activeTrack: MusicTrack;
  synthMode: boolean;
}
