import { config } from '../config/env.js';

export interface VideoItem {
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

export function parseISO8601Duration(
  durationString?: string
): string | undefined {
  if (!durationString) return undefined;

  if (!durationString.startsWith('PT')) {
    return durationString;
  }

  const match = durationString.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
  );

  if (!match) return durationString;

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;

  const formattedSeconds = seconds
    .toString()
    .padStart(2, '0');

  if (hours > 0) {
    const formattedMinutes = minutes
      .toString()
      .padStart(2, '0');

    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  }

  return `${minutes}:${formattedSeconds}`;
}

export function formatViewCount(views: number): string {
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M views`;
  }

  if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}K views`;
  }

  return `${views.toLocaleString()} views`;
}

export async function fetchChannelVideos(): Promise<{
  videos: VideoItem[];
  source: 'api' | 'fallback';
  lastUpdated: string;
}> {
  const lastUpdated = new Date().toISOString();

  /*
   * Make sure the required Railway variables exist.
   */
  if (!config.youtubeApiKey) {
    console.error(
      '[YouTube] YOUTUBE_API_KEY is missing.'
    );

    return {
      videos: [],
      source: 'fallback',
      lastUpdated,
    };
  }

  if (!config.youtubeChannelId) {
    console.error(
      '[YouTube] YOUTUBE_CHANNEL_ID is missing.'
    );

    return {
      videos: [],
      source: 'fallback',
      lastUpdated,
    };
  }

  try {
    /*
     * STEP 1
     *
     * Get the newest videos from ONLY the configured channel.
     *
     * This replaces the old:
     *
     * q=CokeBoys Client Roblox
     *
     * search.
     */
    const searchUrl = new URL(
      'https://www.googleapis.com/youtube/v3/search'
    );

    searchUrl.searchParams.set(
      'key',
      config.youtubeApiKey
    );

    searchUrl.searchParams.set(
      'channelId',
      config.youtubeChannelId
    );

    searchUrl.searchParams.set(
      'part',
      'snippet,id'
    );

    searchUrl.searchParams.set(
      'order',
      'date'
    );

    searchUrl.searchParams.set(
      'maxResults',
      '8'
    );

    searchUrl.searchParams.set(
      'type',
      'video'
    );

    const searchRes = await fetch(searchUrl);

    if (!searchRes.ok) {
      const errorText = await searchRes.text();

      console.error(
        `[YouTube] Search API returned ${searchRes.status}:`,
        errorText
      );

      return {
        videos: [],
        source: 'fallback',
        lastUpdated,
      };
    }

    const searchData = await searchRes.json();

    if (
      !Array.isArray(searchData.items) ||
      searchData.items.length === 0
    ) {
      console.warn(
        `[YouTube] No videos found for channel ${config.youtubeChannelId}`
      );

      return {
        videos: [],
        source: 'fallback',
        lastUpdated,
      };
    }

    /*
     * Extract the video IDs.
     */
    const videoIds = searchData.items
      .map((item: any) => item.id?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      console.warn(
        '[YouTube] No valid video IDs returned.'
      );

      return {
        videos: [],
        source: 'fallback',
        lastUpdated,
      };
    }

    /*
     * STEP 2
     *
     * Fetch statistics and duration for those videos.
     */
    const statsUrl = new URL(
      'https://www.googleapis.com/youtube/v3/videos'
    );

    statsUrl.searchParams.set(
      'key',
      config.youtubeApiKey
    );

    statsUrl.searchParams.set(
      'id',
      videoIds.join(',')
    );

    statsUrl.searchParams.set(
      'part',
      'snippet,statistics,contentDetails'
    );

    const statsRes = await fetch(statsUrl);

    if (!statsRes.ok) {
      const errorText = await statsRes.text();

      console.error(
        `[YouTube] Videos API returned ${statsRes.status}:`,
        errorText
      );

      return {
        videos: [],
        source: 'fallback',
        lastUpdated,
      };
    }

    const statsData = await statsRes.json();

    /*
     * Create a map:
     *
     * video ID → video details
     */
    const statsMap = new Map<string, any>();

    if (Array.isArray(statsData.items)) {
      for (const item of statsData.items) {
        statsMap.set(item.id, item);
      }
    }

    /*
     * Convert the YouTube response into the
     * structure expected by VideosSection.tsx.
     */
    const videos: VideoItem[] = searchData.items
      .map((item: any) => {
        const videoId = item.id?.videoId;

        if (!videoId) {
          return null;
        }

        const detail = statsMap.get(videoId);

        const rawViews = Number(
          detail?.statistics?.viewCount || 0
        );

        return {
          id: videoId,

          title:
            item.snippet?.title ||
            'YouTube Video',

          thumbnailUrl:
            item.snippet?.thumbnails?.high?.url ||
            item.snippet?.thumbnails?.medium?.url ||
            item.snippet?.thumbnails?.default?.url ||
            '',

          publishedAt:
            item.snippet?.publishedAt ||
            new Date().toISOString(),

          duration:
            parseISO8601Duration(
              detail?.contentDetails?.duration
            ),

          rawViews,

          viewCount:
            rawViews > 0
              ? formatViewCount(rawViews)
              : '0 views',

          videoUrl:
            `https://www.youtube.com/watch?v=${videoId}`,

          description:
            item.snippet?.description || '',
        };
      })
      .filter(Boolean) as VideoItem[];

    console.log(
      `[YouTube] Successfully fetched ${videos.length} videos from ${config.youtubeChannelId}`
    );

    return {
      videos,
      source: 'api',
      lastUpdated,
    };

  } catch (error) {
    console.error(
      '[YouTube] API request failed:',
      error
    );

    return {
      videos: [],
      source: 'fallback',
      lastUpdated,
    };
  }
      }
