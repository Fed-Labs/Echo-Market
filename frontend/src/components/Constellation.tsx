import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  pulsePhase: number;
  pulseSpeed: number;
}

export function Constellation({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const mouse = { x: -9999, y: -9999, active: false };
    const particles: Particle[] = [];
    const PARTICLE_COUNT = 60;
    const CONNECTION_DIST = 120;
    const MOUSE_RADIUS = 150;

    function resize() {
      const rect = container!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 1.5 + 0.5,
          baseRadius: Math.random() * 1.5 + 0.5,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.03,
        });
      }
    }

    resize();
    initParticles();

    window.addEventListener("resize", () => {
      resize();
      initParticles();
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    let frame = 0;
    let rafId: number;

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      frame++;

      // Update particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulsePhase += p.pulseSpeed;
        p.radius = p.baseRadius + Math.sin(p.pulsePhase) * 0.3;

        // Wrap around edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Mouse repulsion
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
            p.vx += (dx / dist) * force * 0.5;
            p.vy += (dy / dist) * force * 0.5;
          }
        }

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Min velocity
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed < 0.1) {
          p.vx += (Math.random() - 0.5) * 0.02;
          p.vy += (Math.random() - 0.5) * 0.02;
        }
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(255, 90, 54, ${opacity})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        const glow = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        glow.addColorStop(0, "rgba(255, 90, 54, 0.8)");
        glow.addColorStop(0.5, "rgba(255, 90, 54, 0.2)");
        glow.addColorStop(1, "rgba(255, 90, 54, 0)");

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        ctx!.fillStyle = glow;
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx!.fill();
      }

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className={`absolute inset-0 ${className}`}>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
