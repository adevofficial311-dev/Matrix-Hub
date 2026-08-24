import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, RotateCcw, Volume2, AlertTriangle, Zap } from 'lucide-react';
import { soundEngine } from '../utils/audioEngine';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  const [declined, setDeclined] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  const handleAccept = () => {
    setIsEntering(true);
    soundEngine.playClick();
    soundEngine.playTrack('main', true);
    setTimeout(() => {
      onEnter();
    }, 550);
  };

  const handleDecline = () => {
    soundEngine.playClick();
    soundEngine.playCatchEscape();
    setDeclined(true);
  };

  const handleReset = () => {
    soundEngine.playClick();
    setDeclined(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0a0700]/98 backdrop-blur-2xl text-white select-none"
      id="coke-boys-welcome-screen"
    >
      {/* Background dot matrix */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Main High Density Container */}
      <div className="relative w-full max-w-lg p-8 rounded-2xl bg-[#140b00] border border-amber-500/20 shadow-2xl shadow-black/80 backdrop-blur-xl text-center">
        
        <AnimatePresence mode="wait">
          {!declined ? (
            <motion.div
              key="welcome-prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Crest Badge */}
              <div className="mx-auto w-12 h-12 rounded-xl bg-amber-500 text-[#0a0700] flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Zap className="w-6 h-6 fill-current" />
              </div>

              {/* Title & Prompt */}
              <div className="space-y-2">
                <span className="text-[10px] text-amber-500/60 uppercase tracking-[0.3em] font-semibold">
                  Blox Fruits PvP Script Suite
                </span>

                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase">
                  Welcome to CokeBoys Client
                </h1>

                <p className="text-amber-500/60 text-sm leading-relaxed max-w-sm mx-auto">
                  Are you ready for the ultimate Blox Fruits execution and PvP experience?
                </p>
              </div>

              {/* Audio notice */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-500/40">
                <Volume2 className="w-3.5 h-3.5 text-amber-500/50" />
                <span>Atmospheric audio initializes upon entry</span>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAccept}
                  disabled={isEntering}
                  id="welcome-btn-yes"
                  className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0a0700] font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{isEntering ? 'Entering...' : 'Enter Client'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleDecline}
                  id="welcome-btn-no"
                  className="py-3 px-4 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 text-amber-500/60 hover:text-amber-500 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer"
                >
                  Decline
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="access-denied"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="space-y-5 py-2"
            >
              <div className="mx-auto w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-white uppercase tracking-wide">
                  Access Suspended
                </h2>
                <p className="text-white/60 text-xs max-w-sm mx-auto">
                  You selected <strong className="text-red-400">Decline</strong>. The CokeBoys Client private PvP network requires execution authorization.
                </p>
              </div>

              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#0a0700]/40 hover:bg-amber-500/5 border border-amber-500/10 text-amber-500/70 hover:text-amber-500 text-xs font-medium transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Return</span>
                </button>

                <button
                  onClick={handleAccept}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0a0700] text-xs font-bold uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <span>Authorize & Enter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
};
