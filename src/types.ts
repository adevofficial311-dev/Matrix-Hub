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
  videoUrl: string;
  description?: string;

  // Optional fields kept for compatibility
  duration?: string;
  viewCount?: string;
  rawViews?: number;
}

export interface VideoResponse {
  videos: YouTubeVideo[];
  channelUrl: string;

  // RSS is now the primary source
  source: 'rss' | 'fallback';

  lastUpdated?: string;
}

export type MusicTrack =
  | 'welcome'
  | 'main'
  | 'status'
  | 'videos';

export interface AudioSettings {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  activeTrack: MusicTrack;
  synthMode: boolean;
}
