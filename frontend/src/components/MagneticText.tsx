import { useRef, useEffect, useState, useCallback } from "react";

interface MagneticTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  charClassName?: string;
  charStyle?: React.CSSProperties;
}

interface CharState {
  x: number;
  y: number;
  rotateX: number;
  rotateY: number;
  scale: number;
  glow: number;
}

export function MagneticText({ text, className = "", style, charClassName = "", charStyle }: MagneticTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chars, setChars] = useState<CharState[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(0);
  const statesRef = useRef<CharState[]>([]);

  const initChars = useCallback(() => {
    const newChars = text.split("").map(() => ({
      x: 0, y: 0, rotateX: 0, rotateY: 0, scale: 1, glow: 0,
    }));
    statesRef.current = newChars;
    setChars(newChars);
  }, [text]);

  useEffect(() => {
    initChars();
  }, [initChars]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    const charElements = container.querySelectorAll(".magnetic-char");
    const charRects: DOMRect[] = [];

    const updateRects = () => {
      charRects.length = 0;
      charElements.forEach((el) => charRects.push(el.getBoundingClientRect()));
    };

    updateRects();
    window.addEventListener("resize", updateRects);

    const animate = () => {
      const containerRect = container.getBoundingClientRect();
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      statesRef.current = statesRef.current.map((state, i) => {
        const el = charElements[i];
        if (!el) return state;

        const rect = el.getBoundingClientRect();
        const cx = rect.left - containerRect.left + rect.width / 2;
        const cy = rect.top - containerRect.top + rect.height / 2;

        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 250;

        if (dist < maxDist && dist > 0) {
          const force = (1 - dist / maxDist) * 25;
          const targetX = -(dx / dist) * force;
          const targetY = -(dy / dist) * force;
          const targetRotX = -(dy / dist) * 15 * (1 - dist / maxDist);
          const targetRotY = (dx / dist) * 15 * (1 - dist / maxDist);
          const targetScale = 1 + (1 - dist / maxDist) * 0.15;
          const targetGlow = (1 - dist / maxDist) * 1;

          return {
            x: state.x + (targetX - state.x) * 0.12,
            y: state.y + (targetY - state.y) * 0.12,
            rotateX: state.rotateX + (targetRotX - state.rotateX) * 0.12,
            rotateY: state.rotateY + (targetRotY - state.rotateY) * 0.12,
            scale: state.scale + (targetScale - state.scale) * 0.12,
            glow: state.glow + (targetGlow - state.glow) * 0.12,
          };
        } else {
          return {
            x: state.x * 0.92,
            y: state.y * 0.92,
            rotateX: state.rotateX * 0.92,
            rotateY: state.rotateY * 0.92,
            scale: state.scale + (1 - state.scale) * 0.12,
            glow: state.glow * 0.92,
          };
        }
      });

      setChars([...statesRef.current]);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", updateRects);
    };
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={`inline-block ${className}`}
      style={{ perspective: "800px", ...style }}
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          className={`magnetic-char inline-block ${charClassName}`}
          style={{
            transform: `
              translate3d(${chars[i]?.x || 0}px, ${chars[i]?.y || 0}px, 0)
              rotateX(${chars[i]?.rotateX || 0}deg)
              rotateY(${chars[i]?.rotateY || 0}deg)
              scale(${chars[i]?.scale || 1})
            `,
            textShadow: chars[i]?.glow
              ? `0 0 ${20 + chars[i].glow * 40}px rgba(255, 90, 54, ${0.3 + chars[i].glow * 0.5}), 0 0 ${60 + chars[i].glow * 80}px rgba(255, 90, 54, ${0.1 + chars[i].glow * 0.2})`
              : "0 0 40px rgba(255, 90, 54, 0.15)",
            transition: "text-shadow 0.1s ease-out",
            willChange: "transform",
            ...charStyle,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );
}
