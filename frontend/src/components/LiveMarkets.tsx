import { motion, useTransform, type MotionValue } from "framer-motion";

interface LiveMarketsProps {
  scrollProgress: MotionValue<number>;
}

const PROTOCOLS = [
  { name: "Aave V3", risk: 13, short: 420000, long: 2800000 },
  { name: "Uniswap V4", risk: 45, short: 1800000, long: 2200000 },
  { name: "EigenLayer", risk: 72, short: 3400000, long: 1300000 },
  { name: "Lido", risk: 8, short: 120000, long: 1400000 },
  { name: "Curve", risk: 34, short: 890000, long: 1700000 },
  { name: "Compound", risk: 21, short: 310000, long: 1200000 },
];

export function LiveMarkets({ scrollProgress }: LiveMarketsProps) {
  const sectionOpacity = useTransform(scrollProgress, [0.72, 0.76, 0.82, 0.86], [0, 1, 1, 0]);
  const sectionY = useTransform(scrollProgress, [0.72, 0.76, 0.82, 0.86], [40, 0, 0, -40]);

  return (
    <motion.div
      className="fixed inset-0 z-[7] flex items-center justify-center px-6 pointer-events-none"
      style={{ opacity: sectionOpacity, y: sectionY }}
    >
      <div className="max-w-4xl w-full pointer-events-auto">
        {/* Header */}
        <div className="mb-6 md:mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full animate-pulse-glow" style={{ background: "var(--accent)" }} />
            <span className="text-xs font-bold tracking-widest" style={{ color: "var(--accent)" }}>LIVE FEED</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter" style={{ color: "var(--text-primary)" }}>
            Real-Time Risk<br />Signals
          </h2>
          <p className="text-sm mt-3 max-w-lg" style={{ color: "var(--text-tertiary)" }}>
            Live exploit probability feeds powering the next generation of DeFi risk infrastructure.
          </p>
        </div>

        {/* Protocol list */}
        <div className="flex flex-col gap-3">
          {PROTOCOLS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className="relative group"
            >
              <div className="glass-panel flex items-center justify-between px-4 md:px-5 py-3 md:py-4 cursor-pointer relative overflow-hidden rounded-xl border border-[var(--glass-border)] hover:border-[#FF5A36] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(255,90,54,0.15)] transition-all duration-300">
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="text-xs font-data font-bold w-5" style={{ color: "var(--text-tertiary)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="relative flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse-glow"
                      style={{ background: p.risk > 65 ? "var(--negative)" : p.risk > 30 ? "var(--accent)" : "var(--positive)" }}
                    />
                    <span className="text-sm font-medium text-white transition-colors group-hover:text-white">
                      {p.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-6">
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5" style={{ background: "rgba(255,59,92,0.08)", color: "var(--negative)" }}>
                      S ${(p.short / 1e6).toFixed(1)}M
                    </span>
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5" style={{ background: "rgba(0,212,170,0.08)", color: "var(--positive)" }}>
                      L ${(p.long / 1e6).toFixed(1)}M
                    </span>
                  </div>
                  <div className="w-20 md:w-32 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: p.risk > 65 ? "var(--negative)" : p.risk > 30 ? "var(--accent)" : "var(--positive)",
                        boxShadow: `0 0 10px ${p.risk > 65 ? "var(--negative)" : p.risk > 30 ? "var(--accent)" : "var(--positive)"}`,
                      }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${p.risk}%` }}
                      viewport={{ once: false }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <span
                    className="text-sm font-data font-bold w-8 text-right"
                    style={{ color: p.risk > 65 ? "var(--negative)" : p.risk > 30 ? "var(--accent)" : "var(--positive)" }}
                  >
                    {p.risk}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
