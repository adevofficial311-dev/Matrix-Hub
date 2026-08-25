import { config } from '../config/env.js';

export interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  videoUrl: string;
  description?: string;
}

const DEFAULT_CHANNEL_ID = 'UCQkZM4HnzC6PJOs7WQZwAEA';
const CACHE_DURATION = 5 * 60 * 1000;

let cachedVideos: VideoItem[] = [];
let cachedAt = 0;

function getChannelUrl(): string {
  const channelId =
    config.youtubeChannelId?.trim() ||
    DEFAULT_CHANNEL_ID;

  return `https://www.youtube.com/channel/${encodeURIComponent(
    channelId
  )}/videos`;
}

/**
 * Extract ytInitialData from YouTube's HTML.
 */
function extractInitialData(html: string): any {
  const marker = 'var ytInitialData = ';

  const start = html.indexOf(marker);

  if (start === -1) {
    throw new Error('ytInitialData was not found.');
  }

  const jsonStart = start + marker.length;
  const end = html.indexOf(';</script>', jsonStart);

  if (end === -1) {
    throw new Error('Could not locate ytInitialData ending.');
  }

  const json = html.slice(jsonStart, end).trim();

  return JSON.parse(json);
}

/**
 * Recursively search YouTube's initial data for video renderers.
 */
function findVideos(
  value: any,
  results: VideoItem[] = []
): VideoItem[] {
  if (!value || typeof value !== 'object') {
    return results;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      findVideos(item, results);
    }

    return results;
  }

  /*
   * Standard video renderer.
   */
  if (value.videoRenderer) {
    const renderer = value.videoRenderer;

    const videoId = renderer.videoId;

    if (videoId) {
      const title =
        renderer.title?.runs
          ?.map((run: any) => run.text)
          .join('') ||
        renderer.title?.simpleText ||
        'YouTube Video';

      const publishedText =
        renderer.publishedTimeText?.simpleText ||
        '';

      const thumbnail =
        renderer.thumbnail?.thumbnails?.[
          renderer.thumbnail.thumbnails.length - 1
        ]?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      /*
       * YouTube doesn't always expose an ISO publication date
       * in ytInitialData. Keep the text if available and use
       * current time as a safe fallback.
       */
      results.push({
        id: videoId,
        title,
        thumbnailUrl: thumbnail,
        publishedAt: publishedText || new Date().toISOString(),
        videoUrl:
          `https://www.youtube.com/watch?v=${videoId}`,
      });
    }
  }

  /*
   * Rich video renderer.
   */
  if (value.richItemRenderer?.content?.videoRenderer) {
    const renderer =
      value.richItemRenderer.content.videoRenderer;

    const videoId = renderer.videoId;

    if (videoId) {
      const title =
        renderer.title?.runs
          ?.map((run: any) => run.text)
          .join('') ||
        renderer.title?.simpleText ||
        'YouTube Video';

      const thumbnail =
        renderer.thumbnail?.thumbnails?.[
          renderer.thumbnail.thumbnails.length - 1
        ]?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      results.push({
        id: videoId,
        title,
        thumbnailUrl: thumbnail,
        publishedAt:
          renderer.publishedTimeText?.simpleText ||
          new Date().toISOString(),
        videoUrl:
          `https://www.youtube.com/watch?v=${videoId}`,
      });
    }
  }

  /*
   * Continue recursively through the entire object.
   */
  for (const key of Object.keys(value)) {
    findVideos(value[key], results);
  }

  return results;
}

/**
 * Remove duplicate videos.
 */
function removeDuplicates(
  videos: VideoItem[]
): VideoItem[] {
  const seen = new Set<string>();

  return videos.filter((video) => {
    if (seen.has(video.id)) {
      return false;
    }

    seen.add(video.id);
    return true;
  });
}

/**
 * Fetch videos from the public YouTube channel page.
 *
 * No YouTube Data API.
 * No API key.
 * No RSS.
 */
async function fetchFromYouTubePage(): Promise<VideoItem[]> {
  const channelUrl = getChannelUrl();

  console.log(
    `[YouTube] Fetching channel page: ${channelUrl}`
  );

  const response = await fetch(channelUrl, {
    headers: {
      /*
       * Browser-like headers help prevent YouTube from
       * returning an unexpected response.
       */
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',

      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',

      'Accept-Language':
        'en-US,en;q=0.9',
    },

    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(
      `YouTube channel page returned HTTP ${response.status}`
    );
  }

  const html = await response.text();

  if (!html || html.length < 1000) {
    throw new Error(
      'YouTube returned an empty or incomplete page.'
    );
  }

  const initialData =
    extractInitialData(html);

  const videos =
    removeDuplicates(
      findVideos(initialData)
    );

  /*
   * Limit the response so we don't send hundreds of
   * videos to the frontend.
   */
  const latestVideos =
    videos.slice(0, 12);

  if (latestVideos.length === 0) {
    throw new Error(
      'No videos were found in YouTube page data.'
    );
  }

  console.log(
    `[YouTube] Loaded ${latestVideos.length} videos.`
  );

  return latestVideos;
}

/**
 * Main video service.
 */
export async function fetchChannelVideos(): Promise<{
  videos: VideoItem[];
  source: 'page' | 'cache' | 'fallback';
  lastUpdated: string;
}> {
  const now = Date.now();

  /*
   * Serve cached data for 5 minutes.
   */
  if (
    cachedVideos.length > 0 &&
    now - cachedAt < CACHE_DURATION
  ) {
    return {
      videos: cachedVideos,
      source: 'cache',
      lastUpdated:
        new Date(cachedAt).toISOString(),
    };
  }

  try {
    const videos =
      await fetchFromYouTubePage();

    cachedVideos = videos;
    cachedAt = Date.now();

    return {
      videos,
      source: 'page',
      lastUpdated:
        new Date(cachedAt).toISOString(),
    };
  } catch (error) {
    console.error(
      '[YouTube] Fetch failed:',
      error
    );

    /*
     * If we have old data, continue serving it.
     */
    if (cachedVideos.length > 0) {
      return {
        videos: cachedVideos,
        source: 'cache',
        lastUpdated:
          new Date(cachedAt).toISOString(),
      };
    }

    /*
     * Never generate fake videos.
     */
    return {
      videos: [],
      source: 'fallback',
      lastUpdated:
        new Date().toISOString(),
    };
  }
}
