import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy } from 'lucide-react';
import { soundEngine } from '../utils/audioEngine';

interface ToastState {
  id: number;
  text: string;
  type: 'success' | 'escape';
}

export const PikachuEasterEgg: React.FC = () => {
  const [position, setPosition] = useState({ x: 120, y: 220 });
  const [catchState, setCatchState] = useState<'idle' | 'hit' | 'throwing' | 'shaking' | 'caught' | 'escaped'>('idle');
  const [caughtCount, setCaughtCount] = useState(0);
  const [hp, setHp] = useState(3);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [facingRight, setFacingRight] = useState(true);

  const posRef = useRef(position);
  posRef.current = position;

  const velRef = useRef({ vx: 0.6, vy: 0.4 });
  const targetRef = useRef({ x: 150, y: 200 });

  // Floating & wandering physics
  useEffect(() => {
    let animId: number;
    let lastDirChange = Date.now();

    const updatePosition = () => {
      if (catchState === 'throwing' || catchState === 'shaking') {
        animId = requestAnimationFrame(updatePosition);
        return;
      }

      const now = Date.now();
      const maxX = Math.max(200, window.innerWidth - 90);
      const maxY = Math.max(300, window.innerHeight - 90);

      // Periodically update target waypoint
      if (now - lastDirChange > 3000 - (caughtCount * 200)) {
        lastDirChange = now;
        targetRef.current = {
          x: Math.random() * (maxX - 80) + 40,
          y: Math.random() * (maxY - 80) + 40,
        };
      }

      // Smooth steering toward target
      const current = posRef.current;
      const dx = targetRef.current.x - current.x;
      const dy = targetRef.current.y - current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 5) {
        velRef.current.vx += (dx / dist) * (0.05 + caughtCount * 0.01);
        velRef.current.vy += (dy / dist) * (0.05 + caughtCount * 0.01);
      }

      // Damping & speed cap
      const baseSpeed = 1.4 + (caughtCount * 0.4);
      const maxSpeed = catchState === 'escaped' || catchState === 'hit' ? baseSpeed * 3.5 : baseSpeed;
      const speed = Math.hypot(velRef.current.vx, velRef.current.vy);
      if (speed > maxSpeed) {
        velRef.current.vx = (velRef.current.vx / speed) * maxSpeed;
        velRef.current.vy = (velRef.current.vy / speed) * maxSpeed;
      }

      let newX = current.x + velRef.current.vx;
      let newY = current.y + velRef.current.vy;

      // Bounce off screen boundaries
      if (newX < 20) {
        newX = 20;
        velRef.current.vx *= -1;
      } else if (newX > maxX) {
        newX = maxX;
        velRef.current.vx *= -1;
      }

      if (newY < 60) {
        newY = 60;
        velRef.current.vy *= -1;
      } else if (newY > maxY) {
        newY = maxY;
        velRef.current.vy *= -1;
      }

      if (Math.abs(velRef.current.vx) > 0.1) {
        setFacingRight(velRef.current.vx > 0);
      }

      setPosition({ x: newX, y: newY });
      animId = requestAnimationFrame(updatePosition);
    };

    animId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animId);
  }, [catchState, caughtCount]);

  const addToast = (text: string, type: 'success' | 'escape') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const handlePikachuClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (catchState !== 'idle') return;

    if (hp > 1) {
      // Hit but not caught yet
      setHp(h => h - 1);
      setCatchState('hit');
      soundEngine.playCatchEscape();
      
      // Dash away
      velRef.current = {
        vx: (Math.random() > 0.5 ? 1 : -1) * (5 + caughtCount),
        vy: (Math.random() > 0.5 ? 1 : -1) * (5 + caughtCount),
      };

      setTimeout(() => {
        setCatchState('idle');
      }, 800);
      return;
    }

    soundEngine.playPokeballThrow();
    setCatchState('throwing');

    // 60% catch rate on final hit, slightly less as level goes up
    const catchRate = Math.max(0.3, 0.7 - (caughtCount * 0.05));
    const isSuccess = Math.random() <= catchRate;

    setTimeout(() => {
      if (isSuccess) {
        setCatchState('shaking');
        setTimeout(() => {
          setCatchState('caught');
          setCaughtCount((c) => c + 1);
          soundEngine.playCatchSuccess();
          addToast(`Gotcha! Pikachu caught! (Streak: ${caughtCount + 1}) ⭐`, 'success');

          // Release after brief stay, reset HP for next level
          setTimeout(() => {
            setHp(3 + caughtCount); // Next one is harder
            setCatchState('idle');
          }, 2600);
        }, 1600);
      } else {
        // Escaped!
        soundEngine.playCatchEscape();
        setCatchState('escaped');
        addToast('Pikachu broke free! Try again! ⚡', 'escape');
        setHp(1); // Keep it at 1 HP so you can try catching again
        
        // Fast dash away
        velRef.current = {
          vx: (Math.random() > 0.5 ? 1 : -1) * 6,
          vy: (Math.random() > 0.5 ? 1 : -1) * 6,
        };

        setTimeout(() => {
          setCatchState('idle');
        }, 1800);
      }
    }, 500);
  };

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed top-20 right-6 z-50 pointer-events-none space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`px-3.5 py-2 rounded-xl shadow-2xl backdrop-blur-xl border text-xs font-medium flex items-center gap-2 ${
                toast.type === 'success'
                  ? 'bg-black/90 border-green-500/40 text-green-300'
                  : 'bg-black/90 border-white/20 text-white/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-white/70" />
              <span>{toast.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Pikachu Target Container */}
      <div
        className="fixed z-40 select-none cursor-pointer transition-transform"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          touchAction: 'none',
        }}
        onClick={handlePikachuClick}
        title="Click to catch Pikachu!"
        id="pikachu-easter-egg"
      >
        <div className="relative group">
          
          {/* HP and Level UI */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col items-center gap-1">
            {caughtCount > 0 && (
              <div className="flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                <Trophy className="w-2.5 h-2.5 text-amber-500" />
                <span className="text-[9px] font-mono font-bold text-amber-500">{caughtCount}</span>
              </div>
            )}
            <div className="flex gap-0.5">
              {Array.from({ length: 3 + caughtCount }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full border border-black/50 ${
                    i < hp ? 'bg-green-400' : 'bg-red-500/30'
                  }`}
                />
              ))}
            </div>
          </div>

                    {/* Poké Ball Animation Layer */}
          {catchState === 'throwing' && (
            <motion.div
              initial={{ scale: 0.2, y: 100, x: -60, rotate: -180, opacity: 0 }}
              animate={{ scale: 1.2, y: 0, x: 0, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.45, type: 'spring', bounce: 0.4 }}
              className="absolute -top-6 -left-6 z-50 w-16 h-16"
            >
              <PokeBallSvg />
            </motion.div>
          )}
          {catchState === 'shaking' && (
            <motion.div
              animate={{ 
                rotate: [0, -20, 20, -20, 20, 0],
                x: [0, -5, 5, -5, 5, 0]
              }}
              transition={{ duration: 1.2, ease: 'easeInOut', repeat: Infinity }}
              className="absolute -top-4 -left-4 z-50 w-14 h-14 origin-bottom"
            >
              <PokeBallSvg isShaking />
            </motion.div>
          )}
          {catchState === 'caught' && (
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="absolute -top-4 -left-4 z-50 w-14 h-14 flex items-center justify-center"
            >
              <PokeBallSvg isCaught />
              <div className="absolute inset-0 rounded-full bg-green-400/30 animate-ping pointer-events-none" />
              {/* Star bursts */}
              <motion.div 
                className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 1, scale: 0 }}
                animate={{ opacity: 0, scale: 3 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Sparkles className="w-20 h-20 text-green-300 drop-shadow-xl" />
              </motion.div>
            </motion.div>
          )}

          {/* Pikachu SVG Avatar */}
          <motion.div
            animate={{ 
              scaleX: facingRight ? 1 : -1,
              scaleY: catchState === 'caught' ? 0.2 : 1,
              scale: catchState === 'caught' ? 0.3 : 1,
              opacity: catchState === 'caught' ? 0 : 1,
              y: catchState === 'escaped' ? -30 : 0
            }}
            transition={{ duration: 0.2 }}
            className={`w-14 h-14 transition-transform origin-bottom`}
          >
            <PikachuSvg isDodging={catchState === 'escaped'} isHit={catchState === 'hit'} />
          </motion.div>
          {/* Electric sparks on hover */}
          <div className="absolute -inset-1 rounded-full border border-amber-400/0 group-hover:border-amber-400/40 pointer-events-none transition-colors" />
        </div>
      </div>
    </>
  );
};

// Poké Ball SVG
const PokeBallSvg: React.FC<{ isShaking?: boolean; isCaught?: boolean }> = ({ isShaking, isCaught }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]">
    <defs>
      <radialGradient id="ballGlow" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#ff5555" />
        <stop offset="100%" stopColor="#cc0000" />
      </radialGradient>
      <radialGradient id="ballShade" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </radialGradient>
    </defs>
    
    <circle cx="50" cy="50" r="46" fill="#1e293b" stroke="#0f172a" strokeWidth="4" />
    <path d="M 4 50 A 46 46 0 0 1 96 50 Z" fill="url(#ballGlow)" />
    <path d="M 4 50 A 46 46 0 0 0 96 50 Z" fill="url(#ballShade)" />
    <rect x="4" y="46" width="92" height="8" fill="#0f172a" />
    
    <circle cx="50" cy="50" r="15" fill="#0f172a" />
    <circle cx="50" cy="50" r="10" fill="#ffffff" />
    
    {/* Glowing button */}
    <motion.circle 
      cx="50" cy="50" r="6" 
      fill={isCaught ? "#4ade80" : isShaking ? "#ef4444" : "#e2e8f0"} 
      animate={isShaking ? { opacity: [1, 0.4, 1] } : {}}
      transition={isShaking ? { duration: 0.4, repeat: Infinity } : {}}
      className={isCaught ? "filter drop-shadow-[0_0_10px_rgba(74,222,128,1)]" : isShaking ? "filter drop-shadow-[0_0_10px_rgba(239,68,68,1)]" : ""}
    />
    
    <path d="M 25 15 Q 45 3 70 15" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.3" />
  </svg>
);

// High-fidelity custom Pikachu SVG
const PikachuSvg: React.FC<{ isDodging?: boolean; isHit?: boolean }> = ({ isDodging, isHit }) => (
  <svg
    viewBox="0 0 100 100"
    className={`w-full h-full drop-shadow-xl filter ${isDodging ? 'animate-bounce' : ''}`}
  >
    <defs>
      <radialGradient id="cheekGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
      </radialGradient>
      <radialGradient id="sparkGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
      </radialGradient>
    </defs>
    
    {/* Electric Aura / Sparks when hit */}
    {isHit && (
       <motion.circle 
         cx="50" cy="50" r="45" 
         fill="url(#sparkGlow)" 
         animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0] }}
         transition={{ duration: 0.3, repeat: Infinity }}
       />
    )}

    {/* Tail (Lightning Bolt) */}
    <motion.g 
      style={{ originX: '20px', originY: '60px' }}
      animate={{ rotate: [-5, 15, -5] }}
      transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
    >
      <path
        d="M 24 64 L 14 54 L 20 50 L 10 40 L 16 34 L 6 22 L 18 20 L 26 38 L 20 44 L 28 54 Z"
        fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" strokeLinejoin="miter"
      />
      <path d="M 24 64 L 14 54 L 18 50 L 28 54 Z" fill="#78350F" />
    </motion.g>

    {/* Left Ear */}
    <motion.g
      style={{ originX: '28px', originY: '35px' }}
      animate={{ rotate: [0, -12, 0, -6, 0] }}
      transition={{ duration: 3.5, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M 28 35 Q 12 10 18 4 Q 28 12 36 28 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
      <path d="M 18 4 Q 14 8 20 16 Q 24 10 18 4 Z" fill="#0F172A" />
    </motion.g>

    {/* Right Ear */}
    <motion.g
      style={{ originX: '72px', originY: '35px' }}
      animate={{ rotate: [0, 12, 0, 6, 0] }}
      transition={{ duration: 3.5, delay: 1.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M 68 32 Q 86 8 82 4 Q 72 14 62 26 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
      <path d="M 82 4 Q 86 8 80 16 Q 76 10 82 4 Z" fill="#0F172A" />
    </motion.g>

    {/* Body & Head */}
    <motion.g
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <ellipse cx="50" cy="58" rx="28" ry="26" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
      
      {/* Cheeks */}
      <motion.circle cx="31" cy="62" r="6" fill="url(#cheekGlow)" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.2, repeat: Infinity }} />
      <motion.circle cx="69" cy="62" r="6" fill="url(#cheekGlow)" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.2, repeat: Infinity }} />
      
      {/* Eyes */}
      <circle cx="38" cy="52" r="4.5" fill="#0F172A" />
      <circle cx="36.5" cy="50.5" r="1.5" fill="#FFFFFF" />
      <circle cx="62" cy="52" r="4.5" fill="#0F172A" />
      <circle cx="60.5" cy="50.5" r="1.5" fill="#FFFFFF" />
      
      {/* Nose */}
      <polygon points="49,57 51,57 50,59" fill="#0F172A" />
      
      {/* Mouth */}
      <path d="M 46 62 Q 50 65 54 62" fill="none" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Paws */}
      <ellipse cx="40" cy="74" rx="4" ry="3" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
      <ellipse cx="60" cy="74" rx="4" ry="3" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
    </motion.g>

    {/* Feet */}
    <ellipse cx="36" cy="83" rx="6" ry="3" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
    <ellipse cx="64" cy="83" rx="6" ry="3" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
  </svg>
);
