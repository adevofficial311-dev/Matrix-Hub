import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Youtube, ExternalLink, Key, Code, Check, X } from 'lucide-react';
import { OFFICIAL_LINKS } from '../data/fallbackData';
import { soundEngine } from '../utils/audioEngine';

interface HeroSectionProps {
  onScrollToKeys: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToKeys }) => {
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const scriptCode = 'loadstring(game:HttpGet("https://raw.githubusercontent.com/cokeboysclient/CokeboysClient0/main/script.lua"))()';

  const handleCopy = () => {
    soundEngine.playClick();
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="hero-section" className="relative pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Central High Density Hero Block */}
      <div className="bg-gradient-to-br from-[#140b00] via-[#0d0700] to-[#0a0500] border border-amber-500/20 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6 relative overflow-hidden">
        
        {/* Subtle grid accent inside banner */}
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Tracking tag */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center gap-2"
        >
          <span className="text-[10px] text-amber-500/60 uppercase tracking-[0.3em] font-semibold">
            Blox Fruits PvP Script
          </span>
        </motion.div>

        {/* High Density Main Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight leading-tight"
        >
          Superior <span className="font-bold italic">Performance.</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm sm:text-base text-white/50 leading-relaxed max-w-2xl mx-auto"
        >
          CokeBoys Client delivers a smooth, competitive Blox Fruits PvP Script experience with zero bloat. Engineered for precision and peak execution speed.
        </motion.p>

        {/* High Density Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          {/* JOIN DISCORD */}
          <a
            href={OFFICIAL_LINKS.discord}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEngine.playClick()}
            id="hero-btn-join-us"
            className="bg-amber-500 text-[#0a0700] px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-amber-400 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm shadow-amber-500/20"
          >
            <span>Join Discord</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* GET SCRIPT */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setShowScriptModal(true);
            }}
            id="hero-btn-get-script"
            className="border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Get Script</span>
          </button>

          {/* GET KEY Quick Scroll */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onScrollToKeys();
            }}
            id="hero-btn-get-key"
            className="border border-amber-500/20 bg-black/40 hover:bg-amber-500/10 text-amber-500/90 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Get Key</span>
          </button>
        </motion.div>
      </div>

      {/* Script Modal */}
      <AnimatePresence>
        {showScriptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => {
                soundEngine.playClick();
                setShowScriptModal(false);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-lg bg-[#0a0700] border border-amber-500/20 rounded-2xl shadow-2xl p-6"
            >
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowScriptModal(false);
                }}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">CokeBoys Script</h3>
                    <p className="text-xs text-white/50">Copy and paste this into your executor</p>
                  </div>
                </div>

                <div className="relative group">
                  <pre className="p-4 rounded-xl bg-black/60 border border-white/5 text-xs text-white/80 overflow-x-auto whitespace-pre-wrap break-all font-mono">
                    {scriptCode}
                  </pre>
                  <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors backdrop-blur-md flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Code className="w-4 h-4" />}
                    <span className="text-xs font-bold uppercase tracking-wider">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
