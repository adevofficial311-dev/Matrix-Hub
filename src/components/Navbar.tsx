import React, { useState } from 'react';
import { Menu, X, ExternalLink, Zap } from 'lucide-react';
import { OFFICIAL_LINKS } from '../data/fallbackData';
import { soundEngine } from '../utils/audioEngine';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', id: 'hero-section' },
    { label: 'Keys', id: 'keys-section' },
    { label: 'Status', id: 'executors-section' },
    { label: 'Showcase', id: 'videos-section' },
  ];

  const handleItemClick = (id: string) => {
    soundEngine.playClick();
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-black/40 border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
        
        {/* Brand with square "C" high-density mark */}
        <button
          onClick={() => handleItemClick('hero-section')}
          className="flex items-center gap-3 group cursor-pointer focus:outline-none text-left"
          id="nav-brand-logo"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-500 rounded-lg flex items-center justify-center text-[#0a0700] transition-transform group-hover:scale-105 shadow-sm shadow-amber-500/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tighter uppercase text-white">
              CokeBoys <span className="text-amber-500">Client</span>
            </h1>
          </div>
        </button>

        {/* Desktop Navigation Links with High Density tracking */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-8 text-[11px] uppercase tracking-[0.2em] font-medium text-white/60" aria-label="Main Navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className="hover:text-white transition-colors cursor-pointer py-1"
            >
              {item.label}
            </button>
          ))}
          <a
            href={OFFICIAL_LINKS.discord}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEngine.playClick()}
            className="hover:text-white transition-colors cursor-pointer py-1 text-white/80"
          >
            Discord
          </a>
        </nav>

        {/* System Online Status Badge */}
        <div className="hidden sm:flex items-center gap-3 bg-amber-500/5 px-4 py-2 rounded-full border border-amber-500/10 text-amber-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500/90">
            System Online
          </span>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#080808]/95 px-5 pt-3 pb-6 space-y-2 backdrop-blur-xl animate-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className="w-full text-left px-4 py-2.5 rounded-lg text-xs uppercase tracking-[0.15em] font-medium text-white/70 hover:text-white bg-white/5 border border-white/5"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2">
            <a
              href={OFFICIAL_LINKS.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-amber-500 text-[#0a0700] text-xs uppercase tracking-wider font-bold shadow-md hover:bg-amber-400 transition-colors shadow-amber-500/20"
            >
              <span>Join Discord</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
