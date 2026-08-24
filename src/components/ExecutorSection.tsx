import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, RefreshCw, Sparkles } from 'lucide-react';
import { ExecutorData } from '../types';
import { INITIAL_EXECUTORS } from '../data/fallbackData';
import { soundEngine } from '../utils/audioEngine';

export const ExecutorSection: React.FC = () => {
  const [executorData, setExecutorData] = useState<ExecutorData>(INITIAL_EXECUTORS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'working' | 'notWorking'>('all');

  const fetchExecutors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/executors');
      if (res.ok) {
        const data = await res.json();
        if (data.working && data.notWorking) {
          setExecutorData(data);
        }
      }
    } catch {
      setExecutorData(INITIAL_EXECUTORS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutors();
  }, []);

  const handleRefresh = () => {
    soundEngine.playClick();
    fetchExecutors();
  };

  const filteredWorking = executorData.working.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotWorking = executorData.notWorking.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="executors-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
        <span className="text-[10px] text-amber-500/60 uppercase tracking-[0.3em] font-semibold">
          Compatibility Matrix
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
          Executor Support
        </h2>
        <p className="text-white/45 text-xs sm:text-sm">
          Check live executor compatibility and execution status for Blox Fruits PvP.
        </p>
      </div>

      {/* Main High Density Container */}
      <div className="max-w-4xl mx-auto bg-[#140b00] border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md shadow-2xl shadow-black/80">
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-amber-500/10">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-amber-500/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter executor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-amber-500/20 text-amber-500 placeholder-amber-500/30 text-xs focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-amber-500/10 text-[10px] uppercase font-bold tracking-wider">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeFilter === 'all' ? 'bg-amber-500/20 text-amber-500' : 'text-amber-500/40 hover:text-amber-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('working')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeFilter === 'working' ? 'bg-green-500/20 text-green-400' : 'text-amber-500/40 hover:text-amber-500'
                }`}
              >
                Online ({executorData.working.length})
              </button>
              <button
                onClick={() => setActiveFilter('notWorking')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeFilter === 'notWorking' ? 'bg-red-500/20 text-red-400' : 'text-amber-500/40 hover:text-amber-500'
                }`}
              >
                Offline ({executorData.notWorking.length})
              </button>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-1.5 rounded-lg bg-black/40 hover:bg-amber-500/10 border border-amber-500/10 text-amber-500/60 hover:text-amber-500 transition-colors cursor-pointer"
              title="Refresh status"
              aria-label="Refresh status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* High Density Grid Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {/* Working Executors */}
          {(activeFilter === 'all' || activeFilter === 'working') &&
            filteredWorking.map((name, idx) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                className="bg-[#110a00] hover:bg-[#1a0f00] p-3 rounded-xl border border-amber-500/10 hover:border-amber-500/30 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-amber-500">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-wider text-green-400 font-mono">Working</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                </div>
              </motion.div>
            ))}

          {/* Not Working Executors */}
          {(activeFilter === 'all' || activeFilter === 'notWorking') &&
            filteredNotWorking.map((name, idx) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                className="bg-[#110a00] hover:bg-[#1a0f00] p-3 rounded-xl border border-amber-500/5 hover:border-amber-500/10 flex items-center justify-between opacity-75 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-amber-500/70">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-wider text-red-400 font-mono">Offline</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                </div>
              </motion.div>
            ))}
        </div>

        {filteredWorking.length === 0 && filteredNotWorking.length === 0 && (
          <div className="p-8 text-center text-white/40 text-xs">
            No executors matching &quot;{searchQuery}&quot;
          </div>
        )}

      </div>
    </section>
  );
};
