import React from 'react';
import { motion } from 'motion/react';
import { Clock, Key, Sparkles, ExternalLink } from 'lucide-react';
import { OFFICIAL_LINKS } from '../data/fallbackData';
import { soundEngine } from '../utils/audioEngine';

export const KeySystemSection: React.FC = () => {
  const keyTiers = [
    {
      category: 'Trial Access',
      title: '3 Hour Key',
      btnText: 'Get 3H Key',
      url: OFFICIAL_LINKS.key3h,
      icon: Clock,
      cardClass: 'bg-[#140b00] border border-amber-500/10 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/20 transition-all',
      tagColor: 'text-amber-500/40',
      btnClass: 'mt-5 text-[10px] font-bold uppercase tracking-wider text-center py-2.5 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500/80 rounded-lg border border-amber-500/10 flex items-center justify-center gap-1.5 transition-all active:scale-95',
    },
    {
      category: 'Daily Access',
      title: '24 Hour Key',
      btnText: 'Get 24H Key',
      url: OFFICIAL_LINKS.key24h,
      icon: Key,
      cardClass: 'bg-[#140b00] border border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/50 transition-all relative shadow-lg shadow-amber-900/20',
      tagColor: 'text-amber-500',
      featured: true,
      btnClass: 'mt-5 text-[10px] font-bold uppercase tracking-wider text-center py-2.5 bg-amber-500 text-[#0a0700] hover:bg-amber-400 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm shadow-amber-500/20',
    },
    {
      category: 'Elite Access',
      title: 'Permanent Key',
      btnText: 'Request Permanent',
      url: OFFICIAL_LINKS.discord,
      icon: Sparkles,
      cardClass: 'bg-[#140b00] border border-orange-500/20 bg-gradient-to-t from-orange-500/5 to-transparent rounded-2xl p-5 flex flex-col justify-between hover:border-orange-500/40 transition-all',
      tagColor: 'text-orange-500',
      btnClass: 'mt-5 text-[10px] font-bold uppercase tracking-wider text-center py-2.5 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 rounded-lg border border-orange-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95',
    },
  ];

  return (
    <section id="keys-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <span className="text-[10px] text-amber-500/60 uppercase tracking-[0.3em] font-semibold">
          Authentication Gateway
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
          Access Keys
        </h2>
        <p className="text-white/45 text-xs sm:text-sm">
          Choose the access duration that fits your Blox Fruits PvP play style.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {keyTiers.map((tier, idx) => {
          const Icon = tier.icon;
          return (
            <motion.div
              key={tier.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className={tier.cardClass}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`text-[10px] uppercase tracking-widest font-semibold ${tier.tagColor}`}>
                    {tier.category}
                  </h4>
                  <div className="w-7 h-7 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-500/80">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-lg font-bold text-white mb-2">
                  {tier.title}
                </p>
              </div>

              <a
                href={tier.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundEngine.playClick()}
                id={`key-btn-${tier.title.toLowerCase().replace(/\s+/g, '-')}`}
                className={tier.btnClass}
              >
                <span>{tier.btnText}</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
