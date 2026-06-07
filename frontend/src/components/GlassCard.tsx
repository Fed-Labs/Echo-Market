import { motion } from "framer-motion";
import { ReactNode, useState } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverGlow?: boolean;
  delay?: number;
}

export function GlassCard({ children, className = "", hoverGlow = true, delay = 0 }: GlassCardProps) {
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSpotlight({ x, y });

    const tiltX = (y / 100 - 0.5) * -6;
    const tiltY = (x / 100 - 0.5) * 6;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setSpotlight({ x: 50, y: 50 });
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative group overflow-hidden rounded-2xl ${className}`}
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative w-full h-full p-6 rounded-2xl transition-all duration-300"
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(24px)",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.2s ease-out, box-shadow 0.3s ease-out, border-color 0.3s ease-out",
          boxShadow: tilt.x !== 0 ? "0 20px 60px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {hoverGlow && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl"
            style={{
              background: `radial-gradient(600px circle at ${spotlight.x}% ${spotlight.y}%, rgba(255, 107, 0, 0.08), transparent 40%)`,
            }}
          />
        )}

        {/* Orange border glow on hover */}
        {hoverGlow && (
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(255, 107, 0, 0.2), 0 0 30px rgba(255, 107, 0, 0.08)",
            }}
          />
        )}

        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  );
}

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className = "" }: BentoGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {children}
    </div>
  );
}

interface IntegrationCardProps {
  title: string;
  subtitle: string;
  status: "connected" | "pending" | "live";
  metric: string;
  metricLabel: string;
  chartBars?: number[];
  delay?: number;
}

export function IntegrationCard({
  title,
  subtitle,
  status,
  metric,
  metricLabel,
  chartBars = [40, 65, 45, 80, 55, 90, 70],
  delay = 0,
}: IntegrationCardProps) {
  const statusColors = {
    connected: { bg: "rgba(0, 212, 170, 0.1)", text: "#00D4AA", dot: "#00D4AA" },
    pending: { bg: "rgba(255, 107, 0, 0.1)", text: "#FF6B00", dot: "#FF6B00" },
    live: { bg: "rgba(255, 90, 54, 0.1)", text: "#FF5A36", dot: "#FF5A36" },
  };
  const sc = statusColors[status];

  return (
    <GlassCard delay={delay} className="min-h-[220px]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-white mb-0.5">{title}</h4>
          <p className="text-[11px] text-[var(--text-tertiary)]">{subtitle}</p>
        </div>
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold tracking-wider"
          style={{ background: sc.bg, color: sc.text }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sc.dot }} />
          {status.toUpperCase()}
        </div>
      </div>

      {/* Mini chart */}
      <div className="flex items-end gap-1 h-16 mb-4 px-1">
        {chartBars.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              background: i === chartBars.length - 1 ? "rgba(255, 107, 0, 0.7)" : "rgba(255, 255, 255, 0.08)",
            }}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: delay + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-black font-data text-white">{metric}</div>
          <div className="text-[10px] font-bold tracking-widest text-[var(--text-tertiary)] uppercase">
            {metricLabel}
          </div>
        </div>
        <button
          className="px-3 py-1.5 text-[10px] font-bold tracking-widest rounded transition-all duration-300 hover:scale-105"
          style={{
            background: "rgba(255, 107, 0, 0.12)",
            color: "#FF8C69",
            border: "1px solid rgba(255, 107, 0, 0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 107, 0, 0.25)";
            e.currentTarget.style.borderColor = "rgba(255, 107, 0, 0.5)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 107, 0, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 107, 0, 0.12)";
            e.currentTarget.style.borderColor = "rgba(255, 107, 0, 0.2)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          CONFIGURE
        </button>
      </div>
    </GlassCard>
  );
}
