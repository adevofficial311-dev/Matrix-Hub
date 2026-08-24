import { Router } from 'express';
import { fetchChannelVideos } from '../services/youtubeService.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await fetchChannelVideos();
    res.setHeader('Cache-Control', 'public, max-age=15'); // Cache for 15 seconds for live stats
    res.json({
      videos: result.videos,
      channelUrl: 'https://youtube.com/@cokeboysclient',
      source: result.source,
      lastUpdated: result.lastUpdated
    });
  } catch (error) {
    res.status(500).json({
      error: 'Unable to load videos right now.',
      channelUrl: 'https://youtube.com/@cokeboysclient'
    });
  }
});

export default router;
