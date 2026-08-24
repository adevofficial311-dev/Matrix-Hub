import React, { useEffect, useRef } from 'react';

export const AtmosphericBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Subtle atmospheric dust particles
    const particleCount = Math.min(25, Math.floor((width * height) / 35000));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.2 + 0.4,
      alpha: Math.random() * 0.25 + 0.05,
      speedX: (Math.random() - 0.5) * 0.18,
      speedY: (Math.random() - 0.5) * 0.18,
    }));

    // Comets / Shooting Stars
    const comets = Array.from({ length: 5 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 80 + 40,
      speed: Math.random() * 3 + 2.5,
      angle: Math.PI / 4, // 45 degrees moving down-left
      opacity: 0,
      state: 'waiting', 
      waitTimer: Math.random() * 200,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha})`;
        ctx.fill();
      });

      // Draw comets
      comets.forEach(c => {
        if (c.state === 'waiting') {
          c.waitTimer--;
          if (c.waitTimer <= 0) {
            c.state = 'active';
            // Start from top-right area
            c.x = Math.random() * width * 1.5;
            c.y = Math.random() * -100 - 50;
            c.opacity = 0;
          }
        } else if (c.state === 'active') {
          c.x -= Math.cos(c.angle) * c.speed;
          c.y += Math.sin(c.angle) * c.speed;
          
          if (c.opacity < 0.8 && c.y < height / 2) {
            c.opacity += 0.04;
          } else if (c.y > height / 2) {
            c.opacity -= 0.02;
          }

          if (c.opacity <= 0 || c.x < -100 || c.y > height + 100) {
            c.state = 'waiting';
            c.waitTimer = Math.random() * 300 + 100;
            c.opacity = 0;
          }

          if (c.opacity > 0) {
            ctx.beginPath();
            const grad = ctx.createLinearGradient(c.x, c.y, c.x + Math.cos(c.angle) * c.length, c.y - Math.sin(c.angle) * c.length);
            grad.addColorStop(0, `rgba(251, 191, 36, ${Math.max(0, c.opacity)})`);
            grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
            
            ctx.moveTo(c.x, c.y);
            ctx.lineTo(c.x + Math.cos(c.angle) * c.length, c.y - Math.sin(c.angle) * c.length);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Comet head
            ctx.beginPath();
            ctx.arc(c.x, c.y, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, c.opacity)})`;
            ctx.fill();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" id="atmospheric-background">
      <div className="absolute inset-0 bg-[#0a0700]" />
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0a0700]/90 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0700]/90 to-transparent pointer-events-none" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
    </div>
  );
};
