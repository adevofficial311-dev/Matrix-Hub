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

/**
 * Build the RSS URL from the configured channel ID.
 */
function getRSSUrl(): string {
  const channelId =
    config.youtubeChannelId?.trim() ||
    DEFAULT_CHANNEL_ID;

  return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(
    channelId
  )}`;
}

/**
 * Decode common XML entities.
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

/**
 * Extract the contents of an XML tag.
 */
function getTag(
  xml: string,
  tag: string
): string {
  const escapedTag = tag.replace(
    /[-/\\^$*+?.()|[\]{}]/g,
    '\\$&'
  );

  const regex = new RegExp(
    `<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)</${escapedTag}>`,
    'i'
  );

  const match = xml.match(regex);

  return match
    ? decodeXml(match[1].trim())
    : '';
}

/**
 * Extract every YouTube <entry>.
 */
function getEntries(xml: string): string[] {
  return (
    xml.match(
      /<entry\b[\s\S]*?<\/entry>/gi
    ) || []
  );
}

/**
 * Extract YouTube video ID.
 */
function getVideoId(entry: string): string {
  const videoId = getTag(
    entry,
    'yt:videoId'
  );

  if (videoId) {
    return videoId;
  }

  const linkMatch = entry.match(
    /<link[^>]+href=["']https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^"&']+)/i
  );

  return linkMatch?.[1] || '';
}

/**
 * Get YouTube thumbnail.
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

  return videoId
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : '';
}

/**
 * Fetch videos directly from YouTube RSS.
 */
async function fetchFromRSS(): Promise<VideoItem[]> {
  const rssUrl = getRSSUrl();

  const response = await fetch(rssUrl, {
    headers: {
      'User-Agent':
        'CokeBoysClient/1.0 RSS Reader',
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

  if (
    !xml ||
    !/<feed\b/i.test(xml)
  ) {
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
        getTag(
          entry,
          'media:description'
        ) ||
        getTag(entry, 'summary') ||
        '';

      return {
        id,
        title,
        thumbnailUrl:
          getThumbnail(entry, id),
        publishedAt,
        videoUrl:
          `https://www.youtube.com/watch?v=${id}`,
        description,
      };
    })
    .filter(
      (
        video
      ): video is VideoItem =>
        video !== null
    );

  /*
   * Newest videos first.
   */
  videos.sort(
    (a, b) =>
      new Date(
        b.publishedAt
      ).getTime() -
      new Date(
        a.publishedAt
      ).getTime()
  );

  return videos;
}

/**
 * Main video service.
 */
export async function fetchChannelVideos(): Promise<{
  videos: VideoItem[];
  source: 'rss' | 'cache' | 'fallback';
  lastUpdated: string;
}> {
  const now = Date.now();

  /*
   * Serve cache for 5 minutes.
   */
  if (
    cachedVideos.length > 0 &&
    now - cachedAt < CACHE_DURATION
  ) {
    return {
      videos: cachedVideos,
      source: 'cache',
      lastUpdated:
        new Date(
          cachedAt
        ).toISOString(),
    };
  }

  try {
    const rssUrl = getRSSUrl();

    console.log(
      `[YouTube RSS] Fetching: ${rssUrl}`
    );

    const videos =
      await fetchFromRSS();

    if (videos.length === 0) {
      throw new Error(
        'YouTube RSS returned zero videos.'
      );
    }

    /*
     * Save successful result.
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
        new Date(
          cachedAt
        ).toISOString(),
    };

  } catch (error) {
    console.error(
      '[YouTube RSS] Fetch failed:',
      error
    );

    /*
     * Serve old cache if YouTube temporarily fails.
     */
    if (cachedVideos.length > 0) {
      return {
        videos: cachedVideos,
        source: 'cache',
        lastUpdated:
          new Date(
            cachedAt
          ).toISOString(),
      };
    }

    /*
     * Do NOT generate fake videos.
     */
    return {
      videos: [],
      source: 'fallback',
      lastUpdated:
        new Date().toISOString(),
    };
  }
        }
