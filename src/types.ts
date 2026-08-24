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

  // Optional compatibility fields
  duration?: string;
  viewCount?: string;
  rawViews?: number;
}

export interface VideoResponse {
  videos: YouTubeVideo[];
  channelUrl: string;

  // RSS + server-side cache
  source: 'rss' | 'cache' | 'fallback';

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
