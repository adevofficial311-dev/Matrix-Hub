import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { AtmosphericBackground } from './components/AtmosphericBackground';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { KeySystemSection } from './components/KeySystemSection';
import { ExecutorSection } from './components/ExecutorSection';
import { VideosSection } from './components/VideosSection';
import { PikachuEasterEgg } from './components/PikachuEasterEgg';
import { Footer } from './components/Footer';
import { soundEngine } from './utils/audioEngine';

export default function App() {
  useEffect(() => {
    // 1. Web Protection
    const protectSite = (e: any) => {
      if (e.type === 'contextmenu') e.preventDefault();
      
      if (e.type === 'keydown') {
        if (
          e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
          (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
        ) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('contextmenu', protectSite);
    document.addEventListener('keydown', protectSite);

    // 2. Auto-run default Kalaido song seamlessly
    soundEngine.startBgm().catch(() => {});

    // Attach to user gesture in case browser requires an interaction to begin audio
    const handleFirstInteraction = () => {
      soundEngine.startBgm().catch(() => {});
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('mousemove', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
    
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('mousemove', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('contextmenu', protectSite);
      document.removeEventListener('keydown', protectSite);
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('mousemove', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToKeys = () => {
    handleNavigate('keys-section');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Dynamic Animated Background with Comets */}
      <AtmosphericBackground />

      {/* Main Website Structure */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col min-h-screen"
      >
        {/* Top Navbar */}
        <Navbar onNavigate={handleNavigate} />

        {/* Main Content Sections */}
        <main className="flex-1 space-y-4">
          <HeroSection onScrollToKeys={handleScrollToKeys} />
          <KeySystemSection />
          <ExecutorSection />
          <VideosSection />
        </main>

        {/* Floating Pikachu Easter Egg with Catch Mechanic */}
        <PikachuEasterEgg />

        {/* Branded Footer */}
        <Footer />
      </motion.div>
    </div>
  );
}
