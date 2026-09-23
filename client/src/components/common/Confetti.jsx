import React, { useEffect, useRef } from 'react';

const Confetti = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const handleTrigger = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
      const particles = [];
      const particleCount = 80;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * 200,
          y: canvas.height / 3 + (Math.random() - 0.5) * 100,
          w: Math.random() * 8 + 4,
          h: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 10,
          vy: Math.random() * -8 - 4,
          gravity: 0.25,
          rotation: Math.random() * 360,
          vr: (Math.random() - 0.5) * 12,
          opacity: 1
        });
      }

      let animationFrameId;

      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let activeCount = 0;

        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.rotation += p.vr;
          p.opacity -= 0.008;

          if (p.opacity > 0 && p.y < canvas.height) {
            activeCount++;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
          }
        });

        if (activeCount > 0) {
          animationFrameId = requestAnimationFrame(render);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

      render();

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    };

    window.addEventListener('trigger-confetti', handleTrigger);
    return () => window.removeEventListener('trigger-confetti', handleTrigger);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
};

export default Confetti;
