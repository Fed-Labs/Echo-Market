import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Researcher {
  rank: number;
  address: string;
  verifiedFinds: number;
  totalEarned: string;
  winRate: number;
  openPositions: number;
}

export function Leaderboard() {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setResearchers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h1 className="text-2xl font-black tracking-tighter mb-1" style={{ color: "var(--text-primary)" }}>
          Researcher Rankings
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Top security researchers by verified finds, earnings, and win rate.
        </p>
      </motion.div>

      <div>
        <div className="px-1 py-3 flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-widest" style={{ color: "var(--text-secondary)" }}>
            ALL TIME LEADERS
          </h2>
          <span className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
            <span className="w-1 h-1 rounded-full animate-pulse-glow" style={{ background: "var(--accent)" }} />
            LIVE
          </span>
        </div>

        {loading ? (
          <div className="space-y-px" style={{ background: "var(--border)" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 animate-shimmer" style={{ background: "var(--surface)" }} />
            ))}
          </div>
        ) : researchers.length === 0 ? (
          <div className="p-10 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              No researcher data indexed yet. Submissions will appear here after arbitration events are processed.
            </p>
          </div>
        ) : (
          <div className="space-y-px" style={{ background: "var(--border)" }}>
            <div className="flex items-center px-5 py-2" style={{ background: "var(--surface)" }}>
              <span className="text-[10px] font-bold tracking-wider w-12" style={{ color: "var(--text-tertiary)" }}>RANK</span>
              <span className="text-[10px] font-bold tracking-wider flex-1" style={{ color: "var(--text-tertiary)" }}>ADDRESS</span>
              <span className="text-[10px] font-bold tracking-wider w-20 text-right" style={{ color: "var(--text-tertiary)" }}>VERIFIED</span>
              <span className="text-[10px] font-bold tracking-wider w-24 text-right" style={{ color: "var(--text-tertiary)" }}>EARNED</span>
              <span className="text-[10px] font-bold tracking-wider w-20 text-right" style={{ color: "var(--text-tertiary)" }}>WIN RATE</span>
              <span className="text-[10px] font-bold tracking-wider w-16 text-right" style={{ color: "var(--text-tertiary)" }}>OPEN</span>
            </div>
            {researchers.map((r, i) => (
              <motion.div
                key={r.address}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center px-5 py-3 transition-colors"
                style={{ background: "var(--surface)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-raised)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface)"; }}
              >
                <span className="text-sm font-data font-bold w-12" style={{ color: r.rank <= 3 ? "var(--accent)" : "var(--text-tertiary)" }}>
                  {String(r.rank).padStart(2, "0")}
                </span>
                <span className="text-sm font-data flex-1 truncate" style={{ color: "var(--text-primary)" }}>
                  {r.address}
                </span>
                <span className="text-sm font-data w-20 text-right" style={{ color: "var(--text-primary)" }}>
                  {r.verifiedFinds}
                </span>
                <span className="text-sm font-data font-bold w-24 text-right" style={{ color: "var(--positive)" }}>
                  ${(Number(r.totalEarned) / 1e6).toFixed(2)}M
                </span>
                <span className="text-sm font-data w-20 text-right" style={{ color: "var(--text-primary)" }}>
                  {r.winRate}%
                </span>
                <span className="text-sm font-data w-16 text-right" style={{ color: "var(--text-primary)" }}>
                  {r.openPositions}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
