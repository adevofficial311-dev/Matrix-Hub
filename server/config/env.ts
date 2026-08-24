import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',

  youtubeChannelId:
    process.env.YOUTUBE_CHANNEL_ID || '',

  corsOrigin: process.env.CORS_ORIGIN || '*',
};
