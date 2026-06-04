import { useEffect, useRef, useCallback, useState } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  prevX: number;
  prevY: number;
  angle: number;
  speed: number;
  brightness: number;
}

interface WarpJumpProps {
  active: boolean;
  onComplete: () => void;
}

export function WarpJump({ active, onComplete }: WarpJumpProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const phaseRef = useRef<"idle" | "accelerating" | "warping" | "flash" | "done">("idle");
  const progressRef = useRef(0);
  const rafRef = useRef(0);
  const [opacity, setOpacity] = useState(0);
  const runningRef = useRef(false);

  const initStars = useCallback((w: number, h: number) => {
    const stars: Star[] = [];
    const count = 800;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * Math.max(w, h) * 0.8;
      stars.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        z: Math.random() * 2000,
        prevX: Math.cos(angle) * dist,
        prevY: Math.sin(angle) * dist,
        angle,
        speed: 0.5 + Math.random(),
        brightness: Math.random() * 0.5 + 0.5,
      });
    }
    starsRef.current = stars;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    initStars(w, h);
    window.addEventListener("resize", resize);

    const cx = w / 2;
    const cy = h / 2;

    const draw = () => {
      const phase = phaseRef.current;
      const progress = progressRef.current;

      // Background with trail persistence for motion blur
      if (phase === "flash" || phase === "done") {
        const flashAmount = phase === "flash" ? Math.min(progress * 4, 1) : Math.max(0, 1 - progress * 3);
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAmount})`;
        ctx.fillRect(0, 0, w, h);
      } else if (phase !== "idle") {
        ctx.fillStyle = "rgba(6, 6, 10, 0.2)";
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      if (phase === "idle") {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      // Center glow during warp
      if (phase === "warping" || phase === "accelerating") {
        const glowSize = 50 + (phase === "warping" ? progress * 500 : progress * 100);
        const glowAlpha = phase === "warping" ? 0.3 + progress * 0.5 : 0.1 + progress * 0.2;
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize);
        glow.addColorStop(0, `rgba(255, 255, 255, ${glowAlpha})`);
        glow.addColorStop(0.2, `rgba(255, 90, 54, ${glowAlpha * 0.5})`);
        glow.addColorStop(1, "rgba(255, 90, 54, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }

      const stars = starsRef.current;
      const speedMult = phase === "accelerating"
        ? 2 + progress * 20
        : phase === "warping"
        ? 20 + progress * 200
        : 250;

      for (const star of stars) {
        star.prevX = star.x;
        star.prevY = star.y;

        const dx = Math.cos(star.angle);
        const dy = Math.sin(star.angle);

        if (phase === "accelerating" || phase === "warping") {
          star.x += dx * star.speed * speedMult;
          star.y += dy * star.speed * speedMult;
          star.speed += 0.15;
        }

        const distFromCenter = Math.sqrt(star.x * star.x + star.y * star.y);
        const maxDist = Math.max(w, h) * 1.5;

        if (distFromCenter > maxDist) {
          const newDist = Math.random() * 30 + 5;
          star.x = Math.cos(star.angle) * newDist;
          star.y = Math.sin(star.angle) * newDist;
          star.prevX = star.x;
          star.prevY = star.y;
          star.speed = 0.5 + Math.random();
        }

        const sx = cx + star.x;
        const sy = cy + star.y;
        const psx = cx + star.prevX;
        const psy = cy + star.prevY;

        const velX = sx - psx;
        const velY = sy - psy;
        const vel = Math.sqrt(velX * velX + velY * velY);

        if (vel > 2) {
          const stretch = Math.min(vel * 1.2, 300);
          const nx = velX / vel;
          const ny = velY / vel;

          const tailX = sx - nx * stretch;
          const tailY = sy - ny * stretch;

          const gradient = ctx.createLinearGradient(tailX, tailY, sx, sy);

          const baseAlpha = star.brightness;
          const warpAlpha = phase === "warping" ? 0.5 + progress * 0.5 : 0.3 + progress * 0.4;
          const alpha = Math.min(baseAlpha * warpAlpha, 1);

          gradient.addColorStop(0, `rgba(6, 6, 10, 0)`);
          gradient.addColorStop(0.15, `rgba(100, 200, 255, ${alpha * 0.2})`);
          gradient.addColorStop(0.5, `rgba(200, 230, 255, ${alpha * 0.7})`);
          gradient.addColorStop(0.85, `rgba(255, 255, 255, ${alpha})`);
          gradient.addColorStop(1, `rgba(255, 90, 54, ${alpha})`);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = Math.max(0.8, Math.min(vel * 0.15, 4));
          ctx.lineCap = "round";
          ctx.stroke();
        } else {
          const alpha = star.brightness * 0.6;
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(0.8, star.speed * 0.4), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();
        }
      }

      // Phase transitions
      progressRef.current += 0.012;

      if (phase === "accelerating" && progressRef.current > 0.4) {
        phaseRef.current = "warping";
        progressRef.current = 0;
      } else if (phase === "warping" && progressRef.current > 0.8) {
        phaseRef.current = "flash";
        progressRef.current = 0;
      } else if (phase === "flash" && progressRef.current > 0.5) {
        phaseRef.current = "done";
        progressRef.current = 0;
        setOpacity(0);
        onComplete();
      }

      if (phase !== "done") {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [initStars]);

  // Trigger warp when active changes
  useEffect(() => {
    if (active && !runningRef.current) {
      runningRef.current = true;
      setOpacity(1);
      phaseRef.current = "accelerating";
      progressRef.current = 0;
    }
  }, [active]);

  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{
        opacity,
        transition: "opacity 0.2s ease-out",
      }}
    >
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
