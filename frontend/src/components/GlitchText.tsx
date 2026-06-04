export function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span
        className="absolute inset-0 text-echo-red opacity-70 animate-glitch"
        style={{ clipPath: "inset(20% 0 60% 0)" }}
        aria-hidden
      >
        {text}
      </span>
      <span
        className="absolute inset-0 text-echo-cyan opacity-70 animate-glitch"
        style={{ clipPath: "inset(60% 0 20% 0)", animationDelay: "0.1s" }}
        aria-hidden
      >
        {text}
      </span>
    </span>
  );
}
