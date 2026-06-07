import { motion, useTransform, MotionValue } from "framer-motion";
import { ReactNode } from "react";

interface FloatingIconProps {
  children: ReactNode;
  scrollProgress: MotionValue<number>;
  x: string;
  y: string;
  delay?: number;
  size?: number;
  depth?: number;
}

export function FloatingIcon({
  children,
  scrollProgress,
  x,
  y,
  delay = 0,
  size = 48,
  depth = 0,
}: FloatingIconProps) {
  const opacity = useTransform(scrollProgress, [0.35, 0.5, 0.65, 0.8], [0, 1, 1, 0.3]);
  const scale = useTransform(scrollProgress, [0.35, 0.5, 0.65, 0.8], [0.5, 1, 1, 0.8]);

  return (
    <motion.div
      className="absolute pointer-events-auto"
      style={{
        left: x,
        top: y,
        opacity,
        scale,
        zIndex: 10 + depth,
      }}
      initial={{ opacity: 0 }}
      animate={{
        y: [0, -12 - depth * 4, 0],
      }}
      transition={{
        y: {
          duration: 4 + delay,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay * 0.5,
        },
      }}
    >
      <div
        className="group relative flex items-center justify-center rounded-2xl transition-all duration-500 cursor-pointer"
        style={{
          width: size,
          height: size,
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 107, 0, 0.15)",
          backdropFilter: "blur(12px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255, 107, 0, 0.6)";
          e.currentTarget.style.boxShadow = "0 0 40px rgba(255, 107, 0, 0.25), inset 0 0 20px rgba(255, 107, 0, 0.05)";
          e.currentTarget.style.background = "rgba(255, 107, 0, 0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255, 107, 0, 0.15)";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
        }}
      >
        {/* Halo */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            boxShadow: "0 0 60px rgba(255, 107, 0, 0.3)",
          }}
        />
        <div className="relative z-10 text-orange-400 group-hover:text-orange-300 transition-colors duration-300">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

// SVG Brand Icons
export function CoinbaseIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-3-6c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3z" />
    </svg>
  );
}

export function BinanceIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L9.5 4.5 12 7l2.5-2.5L12 2zM5.5 8.5L3 11l2.5 2.5L8 11 5.5 8.5zM18.5 8.5L16 11l2.5 2.5L21 11l-2.5-2.5zM12 10l-3 3 3 3 3-3-3-3zM5.5 15.5L3 18l2.5 2.5L8 18l-2.5-2.5zM18.5 15.5L16 18l2.5 2.5L21 18l-2.5-2.5zM12 17l-2.5 2.5L12 22l2.5-2.5L12 17z" />
    </svg>
  );
}

export function LedgerIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 2h20v20H2V2zm2 2v16h16V4H4zm2 2h12v4H6V6zm0 6h4v4H6v-4zm6 0h6v4h-6v-4z" />
    </svg>
  );
}

export function MakerDaoIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.5L18.5 8 12 11.5 5.5 8 12 4.5zM6 9.5l5 3v5.5l-5-3.125V9.5zm7 8.5v-5.5l5-3v5.375L13 18z" />
    </svg>
  );
}

export function UniswapIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3 0 1.3-.84 2.4-2 2.83V11h4v2h-4v4h-2v-4H7v-2h4V10.83A3.001 3.001 0 0 1 9 8c0-1.66 1.34-3 3-3z" />
    </svg>
  );
}

export function AaveIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L4 20h16L12 2zm0 3.5L17.5 18h-11L12 5.5z" />
    </svg>
  );
}

export function CurveIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17c0-3 3-5 6-5s5 2 7 2 3-2 5-2v4H3v1zm0-7c0-3 3-5 6-5s5 2 7 2 3-2 5-2v4H3z" />
    </svg>
  );
}

export function ChainlinkIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.5L18.5 8 12 11.5 5.5 8 12 4.5zM6 9.5l5 3v5.5l-5-3.125V9.5zm7 8.5v-5.5l5-3v5.375L13 18z" />
    </svg>
  );
}

export function LidoIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

export function EigenLayerIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l10 5v10l-10 5L2 17V7l10-5zM4 8v8l8 4 8-4V8l-8-4-8 4z" />
    </svg>
  );
}

export function CompoundIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  );
}
