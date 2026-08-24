import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Youtube,
  Play,
  Calendar,
  ExternalLink,
  RefreshCw,
  Activity,
} from 'lucide-react';

import { YouTubeVideo } from '../types';
import { OFFICIAL_LINKS } from '../data/fallbackData';
import { soundEngine } from '../utils/audioEngine';

export const VideosSection: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Waiting...');

  const fetchVideos = useCallback(async (silent: boolean = false) => {
    if (!silent) {
      setLoading(true);
    }

    setIsRefreshing(true);

    try {
      const res = await fetch('/api/videos', {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Videos API returned ${res.status}`);
      }

      const data = await res.json();

      if (
        data.videos &&
        Array.isArray(data.videos)
      ) {
        setVideos(data.videos);

        const now = new Date();

        setLastSyncTime(
          now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        );
      }
    } catch (error) {
      console.error(
        '[VideosSection] Failed to load videos:',
        error
      );

      // Keep existing videos if the request fails.
    } finally {
      if (!silent) {
        setLoading(false);
      }

      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  }, []);

  /*
   * Initial load + automatic refresh.
   *
   * The backend has a 5-minute RSS cache, so requesting
   * this endpoint every 15 seconds does NOT hammer YouTube.
   */
  useEffect(() => {
    fetchVideos(false);

    const intervalId = setInterval(() => {
      fetchVideos(true);
    }, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchVideos]);

  const handleManualRefresh = () => {
    soundEngine.playClick();
    fetchVideos(false);
  };

  return (
    <section
      id="videos-section"
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
        <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-semibold">
          Media Hub
        </span>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
          Recent Showcases
        </h2>

        <p className="text-white/45 text-xs sm:text-sm">
          Blox Fruits PvP montages, combo setups, and
          script updates from @cokeboysclient.
        </p>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto bg-[#140b00] border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-2xl shadow-black/80">

        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-500/10">

          <div className="flex items-center gap-2.5">
            <Youtube className="w-4 h-4 text-amber-500/70" />

            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500/80">
              Official Uploads
            </h3>

            {/* RSS Auto-Update Badge */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>RSS Auto-Sync</span>
            </div>
          </div>

          <div className="flex items-center gap-3">

            {/* Manual Refresh */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              title="Sync latest videos from YouTube"
              className="text-[10px] text-amber-500/50 hover:text-amber-400 uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-amber-500/5 hover:bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-2.5 h-2.5 ${
                  isRefreshing
                    ? 'animate-spin text-amber-400'
                    : ''
                }`}
              />

              <span>
                {isRefreshing
                  ? 'Syncing...'
                  : 'Sync Videos'}
              </span>
            </button>

            {/* YouTube Channel */}
            <a
              href={OFFICIAL_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundEngine.playClick()}
              id="videos-view-channel-btn"
              className="text-[10px] text-amber-500/40 hover:text-amber-500 uppercase tracking-wider font-semibold flex items-center gap-1 transition-colors"
            >
              <span>All Videos</span>

              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Loading State */}
        {loading && videos.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />

            <span className="text-[10px] text-amber-500/50 uppercase tracking-[0.2em] font-mono">
              Loading official uploads...
            </span>
          </div>
        )}

        {/* Empty State */}
        {!loading && videos.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
            <Youtube className="w-7 h-7 text-amber-500/30" />

            <div>
              <p className="text-xs text-white/60">
                No videos available right now.
              </p>

              <p className="text-[10px] text-white/30 mt-1">
                Try refreshing in a moment.
              </p>
            </div>

            <button
              onClick={handleManualRefresh}
              className="mt-2 text-[10px] text-amber-500 hover:text-amber-400 uppercase tracking-wider font-semibold flex items-center gap-1.5 bg-amber-500/5 hover:bg-amber-500/10 px-3 py-1.5 rounded-md border border-amber-500/10 transition-colors"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              Retry
            </button>
          </div>
        )}

        {/* Video Cards Grid */}
        {videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">

            {videos.map((video, idx) => (
              <motion.div
                key={video.id}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.3,
                  delay: idx * 0.05,
                }}
                className="group bg-[#110a00] border border-amber-500/10 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all flex flex-col justify-between shadow-md relative"
              >

                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-black">

                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85 group-hover:opacity-100"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#080500]">
                      <Youtube className="w-8 h-8 text-amber-500/20" />
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundEngine.playClick()}
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center"
                    aria-label={`Watch ${video.title}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all">
                      <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                    </div>
                  </a>

                  {/* RSS Tag */}
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[8px] font-mono text-amber-400/90 flex items-center gap-1 border border-amber-500/20">
                    <Activity className="w-2 h-2 text-emerald-400 animate-pulse" />
                    <span>RSS SYNC</span>
                  </div>
                </div>

                {/* Title & Info */}
                <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">

                  <h4 className="text-xs font-semibold text-white/90 group-hover:text-white transition-colors line-clamp-2 leading-tight">
                    {video.title}
                  </h4>

                  <div className="pt-2 border-t border-amber-500/10 flex items-center justify-between text-[10px] text-white/50">

                    {/* Published Date */}
                    <div className="flex items-center gap-1.5 font-mono min-w-0">

                      <Calendar className="w-3 h-3 text-amber-500/70 flex-shrink-0" />

                      <span className="text-amber-500/90 font-semibold truncate">
                        {video.publishedAt
                          ? new Date(
                              video.publishedAt
                            ).toLocaleDateString(
                              [],
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            )
                          : 'Recent'}
                      </span>
                    </div>

                    {/* Watch */}
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => soundEngine.playClick()}
                      className="text-[10px] font-bold uppercase tracking-wider text-amber-500/60 hover:text-amber-500 flex items-center gap-1 ml-2 flex-shrink-0"
                    >
                      <span>Watch</span>

                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-amber-500/10 flex flex-wrap items-center justify-between gap-2 text-[10px] text-amber-500/40">

          <div className="flex items-center gap-2">

            <svg
              className="w-3.5 h-3.5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />

              <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>

            <span>
              @cokeboysclient — Official Blox Fruits PvP Channel
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[9px]">

            <span className="text-amber-500/40">
              Last Synced: {lastSyncTime}
            </span>

            <span className="text-emerald-500 flex items-center gap-1">

              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />

              <span>
                RSS Updates Active
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
