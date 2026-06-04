import { useEffect, useState } from "react";

export function RiskGauge({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timeout);
  }, [score]);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  let color = "var(--positive)";
  if (score > 30) color = "var(--accent)";
  if (score > 65) color = "var(--negative)";

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="transform -rotate-90 w-28 h-28">
        <circle
          cx="56" cy="56" r={radius}
          stroke="var(--border)" strokeWidth="3" fill="none"
        />
        <circle
          cx="56" cy="56" r={radius}
          stroke={color} strokeWidth="3" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-data font-bold" style={{ color }}>
          {score.toFixed(1)}
        </span>
        <span className="text-[9px] font-bold tracking-widest" style={{ color: "var(--text-tertiary)" }}>
          RISK
        </span>
      </div>
    </div>
  );
}
