
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(
    process.env.PORT || '3000',
    10
  ),

  nodeEnv:
    process.env.NODE_ENV ||
    'development',

  youtubeChannelId:
    process.env.YOUTUBE_CHANNEL_ID ||
    'UCQkZM4HnzC6PJOs7WQZwAEA',

  corsOrigin:
    process.env.CORS_ORIGIN || '*',
};
