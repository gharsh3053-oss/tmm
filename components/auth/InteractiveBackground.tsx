"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

const COLORS = {
  orange: "211, 84, 0",
  light: "243, 156, 18",
  dark: "180, 70, 0",
};

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const canvas: HTMLCanvasElement = canvasEl;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles(width, height);
    }

    function initParticles(w: number, h: number) {
      const count = reducedMotion ? 24 : Math.floor((w * h) / 18000);
      particlesRef.current = Array.from({ length: Math.min(count, 90) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * (reducedMotion ? 0.15 : 0.35),
        vy: (Math.random() - 0.5) * (reducedMotion ? 0.15 : 0.35),
        radius: Math.random() * 1.5 + 0.8,
      }));
    }

    function drawSpotlight(w: number, h: number) {
      const { x, y, active } = mouseRef.current;
      if (!active) return;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, Math.max(w, h) * 0.35);
      gradient.addColorStop(0, `rgba(${COLORS.orange}, 0.14)`);
      gradient.addColorStop(0.4, `rgba(${COLORS.light}, 0.06)`);
      gradient.addColorStop(1, "rgba(10, 13, 18, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    function draw() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      drawSpotlight(w, h);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const linkDistance = reducedMotion ? 100 : 140;

      for (const p of particles) {
        if (!reducedMotion) {
          if (mouse.active) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.hypot(dx, dy) || 1;
            if (dist < 180) {
              const force = (180 - dist) / 18000;
              p.vx -= (dx / dist) * force;
              p.vy -= (dy / dist) * force;
            }
          }
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          p.vx *= 0.999;
          p.vy *= 0.999;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${COLORS.orange}, 0.55)`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDistance) {
            const alpha = (1 - dist / linkDistance) * 0.22;
            const nearMouse =
              mouse.active &&
              (Math.hypot(mouse.x - a.x, mouse.y - a.y) < 160 ||
                Math.hypot(mouse.x - b.x, mouse.y - b.y) < 160);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = nearMouse
              ? `rgba(${COLORS.light}, ${alpha + 0.12})`
              : `rgba(${COLORS.orange}, ${alpha})`;
            ctx.lineWidth = nearMouse ? 1 : 0.6;
            ctx.stroke();
          }
        }
      }

      if (mouse.active && !reducedMotion) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${COLORS.light}, 0.9)`;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    }

    function onMouseLeave() {
      mouseRef.current.active = false;
    }

    resize();
    draw();

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="pointer-events-auto absolute inset-0 h-full w-full"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[#0a0d12]/55" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 50% 40% at 20% 20%, rgba(99, 102, 241, 0.2), transparent),
            radial-gradient(ellipse 45% 35% at 80% 70%, rgba(20, 184, 166, 0.12), transparent),
            radial-gradient(ellipse 30% 25% at 60% 10%, rgba(201, 162, 39, 0.08), transparent)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}
