import { useEffect, useRef } from "react";

interface LogoDissolveProps {
  scrollProgressRef: React.MutableRefObject<number>;
}

export function LogoDissolve({ scrollProgressRef }: LogoDissolveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;

    const RES = 120;
    let pixelData: ImageData | null = null;
    let originalData: Uint8ClampedArray | null = null;
    let dissolveMap: Float32Array | null = null;
    let imgLoaded = false;

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
    }

    resize();

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/favicon.png";
    img.onload = () => {
      const off = document.createElement("canvas");
      off.width = RES;
      off.height = RES;
      const octx = off.getContext("2d")!;
      octx.drawImage(img, 0, 0, RES, RES);
      pixelData = octx.getImageData(0, 0, RES, RES);
      originalData = new Uint8ClampedArray(pixelData.data);

      dissolveMap = new Float32Array(RES * RES);
      for (let y = 0; y < RES; y++) {
        for (let x = 0; x < RES; x++) {
          const n1 = Math.sin(x * 0.15) * Math.cos(y * 0.15);
          const n2 = Math.sin(x * 0.07 + y * 0.13) * 0.5;
          const n3 = Math.cos(x * 0.03 - y * 0.05) * 0.25;
          const rand = ((x * 374761 + y * 668265) % 1000) / 1000 - 0.5;
          let val = (n1 + n2 + n3 + rand * 0.3) * 0.5 + 0.5;
          // CRITICAL: clamp to [0,1] so at dissolve=0 nothing erases
          val = Math.max(0.02, Math.min(0.98, val));
          dissolveMap[y * RES + x] = val;
        }
      }
      imgLoaded = true;
    };

    window.addEventListener("resize", resize);

    const tmp = document.createElement("canvas");
    tmp.width = RES;
    tmp.height = RES;
    const tmpCtx = tmp.getContext("2d")!;

    function draw() {
      const progress = scrollProgressRef.current;
      ctx.clearRect(0, 0, w, h);

      const dissolve = progress < 0.15 ? progress / 0.15 : 1;
      if (dissolve >= 1 || !imgLoaded || !pixelData || !originalData || !dissolveMap) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const logoSize = Math.min(w, h) * 0.18;
      const drawSize = logoSize * (1 - dissolve * 0.25);
      const dx = cx - drawSize / 2;
      const dy = cy - drawSize / 2;

      // Reset pixel data from original each frame, then apply dissolve
      const data = pixelData.data;
      for (let i = 0; i < RES * RES; i++) {
        const threshold = dissolveMap[i];
        // At dissolve=0: condition is always false (0 > threshold * 0.95 is false since threshold >= 0.02)
        // At dissolve=1: all pixels with threshold < ~1.05 get erased (almost all)
        if (dissolve > threshold * 0.95) {
          data[i * 4 + 3] = 0;
        } else {
          data[i * 4 + 3] = originalData[i * 4 + 3];
        }
      }

      tmpCtx.putImageData(pixelData, 0, 0);

      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.globalAlpha = 1 - dissolve * 0.85;

      // Glow shadow
      if (dissolve < 0.7) {
        ctx.shadowColor = "rgba(255, 90, 54, 0.35)";
        ctx.shadowBlur = 24 * (1 - dissolve);
      }

      ctx.drawImage(tmp, dx, dy, drawSize, drawSize);
      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
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
        zIndex: 5,
        pointerEvents: "none",
      }}
    />
  );
}
