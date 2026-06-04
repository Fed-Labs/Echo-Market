import { useState, useCallback, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

export function ScrambleText({ text, className = "", style }: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [display, setDisplay] = useState(text);
  const rafRef = useRef(0);

  const scramble = useCallback(() => {
    const original = text;
    let iteration = 0;
    const totalIterations = original.length * 3;

    const animate = () => {
      const progress = iteration / totalIterations;
      const revealedCount = Math.floor(progress * original.length);

      setDisplay(
        original
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < revealedCount) return original[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      iteration++;
      if (iteration <= totalIterations) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(original);
      }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [text]);

  return (
    <span
      className={className}
      style={style}
      onMouseEnter={scramble}
    >
      {display}
    </span>
  );
}
