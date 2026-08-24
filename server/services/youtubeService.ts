import { config } from '../config/env.js';

export interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  videoUrl: string;
  description?: string;
}

/*
 * YouTube channel RSS feed.
 *
 * This channel ID is public and does not require
 * YouTube Data API authentication.
 */
const YOUTUBE_RSS_URL =
  `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(
    config.youtubeChannelId || 'UCQkZM4HnzC6PJOs7WQZwAEA'
  )}`;

/*
 * Server-side cache.
 *
 * The frontend can request /api/videos every 15 seconds,
 * but the server only fetches YouTube RSS every 5 minutes.
 */
let cachedVideos: VideoItem[] = [];
let cachedAt = 0;

const CACHE_DURATION = 5 * 60 * 1000;

/*
 * Simple XML entity decoder.
 */
function decodeXml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

/*
 * Extract the contents of an XML tag.
 */
function getTag(
  xml: string,
  tag: string
): string {
  const regex = new RegExp(
    `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`,
    'i'
  );

  const match = xml.match(regex);

  return match
    ? decodeXml(match[1].trim())
    : '';
}

/*
 * Extract all <entry>...</entry> blocks.
 */
function getEntries(xml: string): string[] {
  return xml.match(
    /<entry\b[\s\S]*?<\/entry>/gi
  ) || [];
}

/*
 * Extract the YouTube video ID from an entry.
 */
function getVideoId(entry: string): string {
  const videoId = getTag(entry, 'yt:videoId');

  if (videoId) {
    return videoId;
  }

  const linkMatch = entry.match(
    /<link[^>]+href=["']https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^"&']+)/i
  );

  return linkMatch?.[1] || '';
}

/*
 * Extract thumbnail URL.
 */
function getThumbnail(
  entry: string,
  videoId: string
): string {
  const mediaMatch = entry.match(
    /<media:thumbnail[^>]+url=["']([^"']+)["']/i
  );

  if (mediaMatch?.[1]) {
    return mediaMatch[1];
  }

  /*
   * YouTube's standard thumbnail URL.
   */
  return videoId
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : '';
}

/*
 * Fetch latest videos from YouTube RSS.
 */
async function fetchFromRSS(): Promise<VideoItem[]> {
  const response = await fetch(YOUTUBE_RSS_URL, {
    headers: {
      'User-Agent':
        'CokeBoysClient/1.0 YouTubeRSSReader',
      Accept:
        'application/atom+xml, application/xml, text/xml',
    },
  });

  if (!response.ok) {
    throw new Error(
      `YouTube RSS returned HTTP ${response.status}`
    );
  }

  const xml = await response.text();

  if (!xml || !xml.includes('<feed')) {
    throw new Error(
      'YouTube RSS returned an invalid feed.'
    );
  }

  const entries = getEntries(xml);

  const videos: VideoItem[] = entries
    .map((entry): VideoItem | null => {
      const id = getVideoId(entry);

      if (!id) {
        return null;
      }

      const title =
        getTag(entry, 'title') ||
        'YouTube Video';

      const publishedAt =
        getTag(entry, 'published') ||
        getTag(entry, 'updated') ||
        new Date().toISOString();

      const description =
        getTag(entry, 'media:description') ||
        getTag(entry, 'summary') ||
        '';

      return {
        id,
        title,
        thumbnailUrl: getThumbnail(
          entry,
          id
        ),
        publishedAt,
        videoUrl:
          `https://www.youtube.com/watch?v=${id}`,
        description,
      };
    })
    .filter(
      (video): video is VideoItem =>
        video !== null
    );

  /*
   * RSS normally returns newest uploads first.
   * Sort again to guarantee newest → oldest.
   */
  videos.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() -
      new Date(a.publishedAt).getTime()
  );

  return videos;
}

export async function fetchChannelVideos(): Promise<{
  videos: VideoItem[];
  source: 'rss' | 'cache' | 'fallback';
  lastUpdated: string;
}> {
  const now = Date.now();

  /*
   * Return cached videos if they are still fresh.
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
    console.log(
      `[YouTube RSS] Fetching latest videos from ${YOUTUBE_RSS_URL}`
    );

    const videos = await fetchFromRSS();

    if (videos.length === 0) {
      throw new Error(
        'YouTube RSS returned zero videos.'
      );
    }

    /*
     * Store successful result.
     */
    cachedVideos = videos;
    cachedAt = Date.now();

    console.log(
      `[YouTube RSS] Loaded ${videos.length} videos.`
    );

    return {
      videos,
      source: 'rss',
      lastUpdated:
        new Date(cachedAt).toISOString(),
    };

  } catch (error) {
    console.error(
      '[YouTube RSS] Failed to fetch feed:',
      error
    );

    /*
     * If YouTube temporarily fails but we have an older
     * cache, continue serving the old videos.
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
     * No API and no cached data.
     *
     * Return an empty array instead of inventing fake videos.
     */
    return {
      videos: [],
      source: 'fallback',
      lastUpdated: new Date().toISOString(),
    };
  }
}
