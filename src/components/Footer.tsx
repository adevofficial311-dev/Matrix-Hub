import React from 'react';
import { ArrowUp, ExternalLink, Youtube, Zap } from 'lucide-react';
import { OFFICIAL_LINKS } from '../data/fallbackData';
import { soundEngine } from '../utils/audioEngine';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    soundEngine.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-amber-500/10 bg-[#0a0700] py-8 px-6 sm:px-8 text-amber-500/40 text-xs relative">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-6 h-6 rounded bg-amber-500 text-[#0a0700] flex items-center justify-center shadow-md shadow-amber-500/20">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-500">
                CokeBoys Client
              </div>
              <div className="text-[10px] text-amber-500/50">
                Premium Blox Fruits PvP Script Suite
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            <a
              href={OFFICIAL_LINKS.discord}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundEngine.playClick()}
              className="px-3 py-1.5 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 text-amber-500/70 hover:text-amber-500 flex items-center gap-1.5 text-xs transition-colors"
            >
              <span>Discord</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={OFFICIAL_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundEngine.playClick()}
              className="px-3 py-1.5 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 text-amber-500/70 hover:text-amber-500 flex items-center gap-1.5 text-xs transition-colors"
            >
              <Youtube className="w-3 h-3" />
              <span>YouTube</span>
            </a>

            <a
              href={OFFICIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundEngine.playClick()}
              className="px-3 py-1.5 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 text-amber-500/70 hover:text-amber-500 flex items-center gap-1.5 text-xs transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 text-amber-500/50 hover:text-amber-500 transition-colors cursor-pointer"
              title="Scroll to top"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-4 border-t border-amber-500/10 flex flex-col sm:flex-row items-center justify-between text-[10px] text-amber-500/30 uppercase tracking-[0.2em] gap-3 text-center sm:text-left">
          <span>&copy; {new Date().getFullYear()} CokeBoys Client. All Rights Reserved.</span>
          <div className="flex gap-6">
            <span>Powered By FaceBook & Telegr4m</span>
            <span className="flex items-center gap-2">
              <span className="w-1 h-1 bg-amber-500/40 rounded-full" />
              Blox Fruits PvP Script
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
