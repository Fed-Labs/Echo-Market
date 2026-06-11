import { useEffect, useRef } from "react";

interface ParticleSphereProps {
  scrollProgressRef: React.MutableRefObject<number>;
}

function isMobile() {
  return window.innerWidth < 768;
}

const ORANGE_PALETTE = [
  { r: 255, g: 140, b: 105 }, // #FF8C69 — peach
  { r: 255, g: 90, b: 54 },   // #FF5A36 — brand
  { r: 255, g: 107, b: 0 },   // #FF6B00 — deep orange
  { r: 255, g: 180, b: 100 }, // #FFB464 — amber
  { r: 232, g: 93, b: 4 },    // #E85D04 — burnt orange
  { r: 255, g: 160, b: 80 },  // #FFA050 — warm gold
];

function buildParticles(count: number, radius: number) {
  // Layout: [bx, by, bz, dx, dy, dz, size, phase, colorIdx, vx, vy, vz]
  const particles = new Float32Array(count * 12);
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  for (let i = 0; i < count; i++) {
    const t = i / count;
    const phi = Math.acos(1 - 2 * t);
    const theta = 2 * Math.PI * goldenRatio * i;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    const explodeDist = 600 + Math.random() * 1200;
    const dirLen = Math.sqrt(x * x + y * y + z * z) || 1;
    const dx = (x / dirLen) * explodeDist + (Math.random() - 0.5) * 400;
    const dy = (y / dirLen) * explodeDist + (Math.random() - 0.5) * 400;
    const dz = (z / dirLen) * explodeDist + (Math.random() - 0.5) * 400;

    const idx = i * 12;
    particles[idx + 0] = x;
    particles[idx + 1] = y;
    particles[idx + 2] = z;
    particles[idx + 3] = dx;
    particles[idx + 4] = dy;
    particles[idx + 5] = dz;
    particles[idx + 6] = Math.random() * 0.8 + 0.3; // smaller size
    particles[idx + 7] = Math.random() * Math.PI * 2; // phase
    particles[idx + 8] = Math.floor(Math.random() * ORANGE_PALETTE.length); // colorIdx
    particles[idx + 9] = 0; // vx
    particles[idx + 10] = 0; // vy
    particles[idx + 11] = 0; // vz
  }

  return particles;
}

function createGlowSprite(maxSize: number, dpr: number, color: { r: number; g: number; b: number }) {
  const size = Math.ceil((maxSize * 4 + 2) * dpr);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const center = size / 2;

  const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
  grad.addColorStop(0, `rgba(${color.r + 30}, ${color.g + 30}, ${color.b + 30}, 1)`);
  grad.addColorStop(0.2, `rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`);
  grad.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, 0.25)`);
  grad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

export function ParticleSphere({ scrollProgressRef }: ParticleSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const frozenRotYRef = useRef<number>(0);
  const frozenRotXRef = useRef<number>(0);
  const introProgressRef = useRef<number>(0);
  const introDoneRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let count = 0;
    let particles: Float32Array;
    const glowSprites: HTMLCanvasElement[] = [];

    // Mouse state
    let mouseX = -9999;
    let mouseY = -9999;
    let mouseActive = false;
    let mouseInfluence = 0;

    let frame = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      cx = w / 2;
      cy = h / 2;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mobile = isMobile();
      count = mobile ? 5000 : 12000;
      const radius = mobile ? Math.min(w, h) * 0.32 : Math.min(w, h) * 0.26;
      particles = buildParticles(count, radius);

      glowSprites.length = 0;
      for (const c of ORANGE_PALETTE) {
        glowSprites.push(createGlowSprite(1.1, dpr, c));
      }
    }

    resize();

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;
    };
    const onMouseLeave = () => {
      mouseActive = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    function draw() {
      const progress = scrollProgressRef.current;

      // Intro implosion: on first load, particles implode from exploded to formed
      let effectiveProgress = progress;
      if (!introDoneRef.current && progress < 0.02) {
        introProgressRef.current += 0.012;
        if (introProgressRef.current >= 1) {
          introProgressRef.current = 1;
          introDoneRef.current = true;
        }
        const ease = 1 - Math.pow(1 - introProgressRef.current, 3);
        effectiveProgress = 0.15 * (1 - ease);
      } else {
        introDoneRef.current = true;
      }

      const fadeOut = progress > 0.88 ? Math.max(0, 1 - (progress - 0.88) / 0.04) : 1;
      canvas!.style.opacity = String(fadeOut);
      if (fadeOut <= 0) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      frame++;

      let autoRotY: number;
      let autoRotX: number;
      if (progress >= 0.88) {
        autoRotY = frozenRotYRef.current;
        autoRotX = frozenRotXRef.current;
      } else {
        const time = frame * 0.0006;
        autoRotY = time;
        autoRotX = Math.sin(time * 0.35) * 0.06;
        frozenRotYRef.current = autoRotY;
        frozenRotXRef.current = autoRotX;
      }

      const mouseRotX = mouseActive ? (mouseY - cy) * 0.0002 : 0;
      const mouseRotY = mouseActive ? (mouseX - cx) * 0.0002 : 0;

      const rotY = autoRotY + mouseRotY;
      const rotX = autoRotX + mouseRotX;
      const cosRY = Math.cos(rotY);
      const sinRY = Math.sin(rotY);
      const cosRX = Math.cos(rotX);
      const sinRX = Math.sin(rotX);

      let explodePhase: number;
      if (effectiveProgress < 0.15) {
        explodePhase = effectiveProgress / 0.15;
      } else if (effectiveProgress < 0.78) {
        explodePhase = 1;
      } else if (effectiveProgress < 0.88) {
        explodePhase = 1 - (effectiveProgress - 0.78) / 0.1;
      } else {
        explodePhase = 0;
      }
      const easeExplode = 1 - Math.pow(1 - explodePhase, 3);

      mouseInfluence = mouseActive && explodePhase < 0.95 && explodePhase > 0.05 ? 1 - easeExplode : 0;
      const MOUSE_RADIUS = 180;
      const MOUSE_FORCE = 2.2;

      const perspective = 1200;

      ctx.globalCompositeOperation = "source-over";

      for (let i = 0; i < count; i++) {
        const idx = i * 12;
        const bx = particles[idx + 0];
        const by = particles[idx + 1];
        const bz = particles[idx + 2];
        const dxt = particles[idx + 3];
        const dyt = particles[idx + 4];
        const dzt = particles[idx + 5];
        const size = particles[idx + 6];
        let phase = particles[idx + 7];
        const colorIdx = particles[idx + 8];
        let vx = particles[idx + 9];
        let vy = particles[idx + 10];
        let vz = particles[idx + 11];

        phase += 0.012;
        particles[idx + 7] = phase;

        const breathe = 1 + Math.sin(phase) * 0.015;
        let tx: number, ty: number, tz: number;

        if (explodePhase < 1) {
          const inv = 1 - easeExplode;
          tx = bx * breathe * inv + dxt * easeExplode;
          ty = by * breathe * inv + dyt * easeExplode;
          tz = bz * breathe * inv + dzt * easeExplode;
        } else {
          const drift = frame * 0.5;
          tx = dxt + ((i % 3) - 1) * 0.08 * drift;
          ty = dyt + (((i + 1) % 3) - 1) * 0.08 * drift;
          tz = dzt + (((i + 2) % 3) - 1) * 0.05 * drift;

          const bound = 2000;
          tx = ((tx + bound) % (bound * 2));
          if (tx < 0) tx += bound * 2;
          tx -= bound;
          ty = ((ty + bound) % (bound * 2));
          if (ty < 0) ty += bound * 2;
          ty -= bound;
          tz = ((tz + bound) % (bound * 2));
          if (tz < 0) tz += bound * 2;
          tz -= bound;
        }

        // Cursor repulsion
        if (mouseInfluence > 0.01) {
          const rx1m = tx * cosRY - tz * sinRY;
          const rz1m = tx * sinRY + tz * cosRY;
          const ry2m = ty * cosRX - rz1m * sinRX;
          const rz2m = ty * sinRX + rz1m * cosRX;
          const scalem = perspective / (perspective + rz2m);
          const sx = cx + rx1m * scalem;
          const sy = cy + ry2m * scalem;

          const mdx = sx - mouseX;
          const mdy = sy - mouseY;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mDist < MOUSE_RADIUS && mDist > 1) {
            const force = (1 - mDist / MOUSE_RADIUS) * MOUSE_FORCE * mouseInfluence;
            const nx = -mdx / mDist;
            const ny = -mdy / mDist;
            vx += nx * force;
            vy += ny * force;
            vz += force * 0.5;
          }
        }

        vx *= 0.92;
        vy *= 0.92;
        vz *= 0.92;
        tx += vx;
        ty += vy;
        tz += vz;

        particles[idx + 9] = vx;
        particles[idx + 10] = vy;
        particles[idx + 11] = vz;

        const rx1 = tx * cosRY - tz * sinRY;
        const rz1 = tx * sinRY + tz * cosRY;
        const ry2 = ty * cosRX - rz1 * sinRX;
        const rz2 = ty * sinRX + rz1 * cosRX;

        const scale = perspective / (perspective + rz2);
        if (scale < 0) continue;

        const sx = cx + rx1 * scale;
        const sy = cy + ry2 * scale;

        const pulseSize = size * (1 + Math.sin(phase) * 0.2);
        const finalSize = pulseSize * scale;
        if (finalSize <= 0.15) continue;

        const depthFade = (scale + 0.3) / 1.3;
        if (depthFade <= 0) continue;

        const alpha = explodePhase > 0.9 ? 0.9 : 0.95;
        const color = ORANGE_PALETTE[colorIdx % ORANGE_PALETTE.length];

        ctx.globalAlpha = depthFade * alpha;
        ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
        ctx.beginPath();
        ctx.arc(sx, sy, finalSize * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [scrollProgressRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
}
