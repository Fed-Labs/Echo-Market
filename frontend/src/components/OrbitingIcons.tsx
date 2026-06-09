import { motion, useTransform, type MotionValue } from "framer-motion";
import { useMemo } from "react";

interface OrbitingIconsProps {
  scrollProgress: MotionValue<number>;
}

interface OrbitalBrand {
  label: string;
  color: string;
  glow: string;
  size: number;
  orbitSize: number;
  duration: number;
  direction: "normal" | "reverse";
  startAngle: number;
  depth: number;
}

const BRANDS_DESKTOP: OrbitalBrand[] = [
  { label: "C", color: "#0052FF", glow: "rgba(0,82,255,0.4)", size: 44, orbitSize: 38, duration: 24, direction: "normal", startAngle: 0, depth: 2 },
  { label: "B", color: "#F0B90B", glow: "rgba(240,185,11,0.4)", size: 40, orbitSize: 46, duration: 32, direction: "reverse", startAngle: 35, depth: 1 },
  { label: "L", color: "#2D2D2D", glow: "rgba(255,255,255,0.2)", size: 38, orbitSize: 30, duration: 20, direction: "normal", startAngle: 72, depth: 3 },
  { label: "M", color: "#1AAB9B", glow: "rgba(26,171,155,0.4)", size: 42, orbitSize: 52, duration: 28, direction: "reverse", startAngle: 110, depth: 2 },
  { label: "U", color: "#FF007A", glow: "rgba(255,0,122,0.4)", size: 40, orbitSize: 42, duration: 22, direction: "normal", startAngle: 145, depth: 1 },
  { label: "A", color: "#B6509E", glow: "rgba(182,80,158,0.4)", size: 38, orbitSize: 56, duration: 36, direction: "reverse", startAngle: 180, depth: 0 },
  { label: "C", color: "#00E0FF", glow: "rgba(0,224,255,0.35)", size: 36, orbitSize: 34, duration: 18, direction: "normal", startAngle: 215, depth: 1 },
  { label: "Ch", color: "#375BD2", glow: "rgba(55,91,210,0.4)", size: 42, orbitSize: 48, duration: 30, direction: "reverse", startAngle: 250, depth: 3 },
  { label: "Li", color: "#00A3FF", glow: "rgba(0,163,255,0.4)", size: 38, orbitSize: 44, duration: 26, direction: "normal", startAngle: 290, depth: 0 },
  { label: "E", color: "#3D3D3D", glow: "rgba(255,255,255,0.15)", size: 40, orbitSize: 58, duration: 34, direction: "reverse", startAngle: 325, depth: 2 },
  { label: "Co", color: "#00D395", glow: "rgba(0,211,149,0.4)", size: 36, orbitSize: 32, duration: 19, direction: "normal", startAngle: 55, depth: 1 },
];

const BRANDS_MOBILE: OrbitalBrand[] = [
  { label: "C", color: "#0052FF", glow: "rgba(0,82,255,0.4)", size: 30, orbitSize: 28, duration: 24, direction: "normal", startAngle: 0, depth: 2 },
  { label: "B", color: "#F0B90B", glow: "rgba(240,185,11,0.4)", size: 28, orbitSize: 34, duration: 32, direction: "reverse", startAngle: 45, depth: 1 },
  { label: "M", color: "#1AAB9B", glow: "rgba(26,171,155,0.4)", size: 30, orbitSize: 40, duration: 28, direction: "reverse", startAngle: 120, depth: 2 },
  { label: "U", color: "#FF007A", glow: "rgba(255,0,122,0.4)", size: 28, orbitSize: 32, duration: 22, direction: "normal", startAngle: 165, depth: 1 },
  { label: "Ch", color: "#375BD2", glow: "rgba(55,91,210,0.4)", size: 30, orbitSize: 36, duration: 30, direction: "reverse", startAngle: 240, depth: 3 },
  { label: "Li", color: "#00A3FF", glow: "rgba(0,163,255,0.4)", size: 28, orbitSize: 38, duration: 26, direction: "normal", startAngle: 300, depth: 0 },
  { label: "Co", color: "#00D395", glow: "rgba(0,211,149,0.4)", size: 26, orbitSize: 30, duration: 19, direction: "normal", startAngle: 75, depth: 1 },
];

function BrandPill({ brand }: { brand: OrbitalBrand }) {
  const delay = -(brand.duration * brand.startAngle) / 360;

  return (
    <div
      className="absolute left-1/2 top-1/2 pointer-events-auto"
      style={{
        width: `${brand.orbitSize}vmin`,
        height: `${brand.orbitSize}vmin`,
        marginLeft: `-${brand.orbitSize / 2}vmin`,
        marginTop: `-${brand.orbitSize / 2}vmin`,
        animation: `orbit-rotate ${brand.duration}s linear infinite ${brand.direction}`,
        animationDelay: `${delay}s`,
      }}
    >
      <div
        className="absolute flex items-center justify-center rounded-full font-bold select-none transition-transform duration-300 hover:scale-125 cursor-default"
        style={{
          width: brand.size,
          height: brand.size,
          left: "50%",
          top: 0,
          marginLeft: -brand.size / 2,
          marginTop: -brand.size / 2,
          background: brand.color,
          color: "#fff",
          fontSize: brand.size * 0.4,
          boxShadow: `0 0 ${brand.size * 0.5}px ${brand.glow}, inset 0 0 ${brand.size * 0.2}px rgba(255,255,255,0.15)`,
          animation: `orbit-counter ${brand.duration}s linear infinite ${brand.direction}`,
          animationDelay: `${delay}s`,
          zIndex: 10 + brand.depth,
        }}
      >
        {brand.label}
      </div>
    </div>
  );
}

function isMobile() {
  return window.innerWidth < 768;
}

export function OrbitingIcons({ scrollProgress }: OrbitingIconsProps) {
  const opacity = useTransform(scrollProgress, [0.12, 0.18, 0.22, 0.30], [0, 1, 1, 0]);
  const brands = useMemo(() => (isMobile() ? BRANDS_MOBILE : BRANDS_DESKTOP), []);

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none"
      style={{ opacity, zIndex: 7 }}
    >
      {/* Center text */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20">
        <p className="text-3xl md:text-5xl font-medium tracking-tight">
          <span style={{ color: "var(--text-primary)" }}>Trusted by </span>
          <span
            className="font-black"
            style={{
              background: "linear-gradient(135deg, #f0f0f5 0%, #FF8C69 50%, #FF5A36 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% 200%",
              animation: "gradient-shift 4s ease infinite",
            }}
          >
            Leaders
          </span>
        </p>
      </div>

      {/* Orbiting brand icons */}
      {brands.map((brand, i) => (
        <BrandPill key={i} brand={brand} />
      ))}

      <style>{`
        @keyframes orbit-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-counter {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </motion.div>
  );
}
