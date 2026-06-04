import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMarkets } from "../hooks/useMarkets";
import { RiskBadge } from "../components/RiskBadge";
import { RiskGauge } from "../components/RiskGauge";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { Ticker } from "../components/Ticker";
import { formatUnits } from "viem";
import { ForexChart } from "../components/ForexChart";



export function Dashboard() {
  const { markets, isLoading } = useMarkets();

  const totalStaked = markets.reduce(
    (acc, m) => acc + Number(formatUnits(m.totalShort + m.totalLong, 6)),
    0
  );
  const topRisk = [...markets].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

  // Featured market: highest TVL
  const featured = [...markets].sort((a, b) =>
    Number(b.totalShort + b.totalLong) - Number(a.totalShort + a.totalLong)
  )[0];

  return (
    <div className="space-y-6">
      <Ticker />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "var(--border)" }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-5"
          style={{ background: "var(--surface)" }}
        >
          <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "var(--text-tertiary)" }}>
            ACTIVE MARKETS
          </div>
          <div className="text-3xl font-data font-bold" style={{ color: "var(--text-primary)" }}>
            <AnimatedCounter value={markets.length} />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-5"
          style={{ background: "var(--surface)" }}
        >
          <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "var(--text-tertiary)" }}>
            TOTAL STAKED
          </div>
          <div className="text-3xl font-data font-bold" style={{ color: "var(--text-primary)" }}>
            <AnimatedCounter value={totalStaked} prefix="$" suffix="" decimals={2} />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-5"
          style={{ background: "var(--surface)" }}
        >
          <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "var(--text-tertiary)" }}>
            PEAK RISK
          </div>
          <div
            className="text-3xl font-data font-bold"
            style={{ color: topRisk[0]?.riskScore > 65 ? "var(--negative)" : "var(--accent)" }}
          >
            <AnimatedCounter value={topRisk[0]?.riskScore ?? 0} suffix="%" decimals={1} />
          </div>
        </motion.div>
      </div>

      {/* Featured Market */}
      {featured && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <div>
              <span className="text-[10px] font-bold tracking-widest" style={{ color: "var(--accent)" }}>
                FEATURED MARKET
              </span>
              <h2 className="text-lg font-black tracking-tight mt-1" style={{ color: "var(--text-primary)" }}>
                {featured.name}
              </h2>
            </div>
            <RiskGauge score={featured.riskScore} />
          </div>

          <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Forex Chart */}
            <div className="lg:col-span-2 h-56">
              <ForexChart riskScore={featured.riskScore} address={featured.address} />
            </div>

            {/* Stats */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-px" style={{ background: "var(--border)" }}>
              <div className="p-4" style={{ background: "var(--bg)" }}>
                <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: "var(--text-tertiary)" }}>
                  TOTAL SHORT
                </div>
                <div className="text-lg font-data font-bold" style={{ color: "var(--negative)" }}>
                  ${Number(formatUnits(featured.totalShort, 6)).toFixed(2)}
                </div>
              </div>
              <div className="p-4" style={{ background: "var(--bg)" }}>
                <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: "var(--text-tertiary)" }}>
                  TOTAL LONG
                </div>
                <div className="text-lg font-data font-bold" style={{ color: "var(--positive)" }}>
                  ${Number(formatUnits(featured.totalLong, 6)).toFixed(2)}
                </div>
              </div>
              <div className="p-4" style={{ background: "var(--bg)" }}>
                <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: "var(--text-tertiary)" }}>
                  RISK SCORE
                </div>
                <div className="text-lg font-data font-bold" style={{ color: featured.riskScore > 65 ? "var(--negative)" : featured.riskScore > 30 ? "var(--accent)" : "var(--positive)" }}>
                  {featured.riskScore.toFixed(1)}%
                </div>
              </div>
              <div className="p-4" style={{ background: "var(--bg)" }}>
                <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: "var(--text-tertiary)" }}>
                  STATUS
                </div>
                <div className="text-lg font-data font-bold" style={{ color: "var(--text-primary)" }}>
                  {["OPEN", "EXPIRED", "EXPLOITED"][featured.status]}
                </div>
              </div>
            </div>

            {/* Risk bar */}
            <div className="lg:col-span-2 flex items-center gap-4">
              <span className="text-[10px] font-bold tracking-widest shrink-0" style={{ color: "var(--text-tertiary)" }}>
                SHORT / LONG RATIO
              </span>
              <div className="flex-1 h-3 flex overflow-hidden" style={{ background: "var(--border)" }}>
                {featured.totalShort + featured.totalLong > 0 ? (
                  <>
                    <motion.div
                      className="h-full"
                      style={{ background: "var(--negative)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(Number(featured.totalShort) / Number(featured.totalShort + featured.totalLong)) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                    <motion.div
                      className="h-full"
                      style={{ background: "var(--positive)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(Number(featured.totalLong) / Number(featured.totalShort + featured.totalLong)) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </>
                ) : null}
              </div>
            </div>

            {/* CTA */}
            <div className="lg:col-span-2 flex justify-end">
              <Link
                to={`/market/${featured.address}`}
                className="px-5 py-2 text-[10px] font-bold tracking-widest transition-all"
                style={{ background: "var(--accent)", color: "var(--bg)" }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; }}
              >
                VIEW MARKET →
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      <div>
        <div className="px-1 py-3 flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-widest" style={{ color: "var(--text-secondary)" }}>
            RISK HEATMAP
          </h2>
          <span className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
            <span className="w-1 h-1 rounded-full animate-pulse-glow" style={{ background: "var(--positive)" }} />
            LIVE
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-px" style={{ background: "var(--border)" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-shimmer" style={{ background: "var(--surface)" }} />
            ))}
          </div>
        ) : markets.length === 0 ? (
          <div className="p-10 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>
              No active markets found.
            </p>
            <Link
              to="/docs"
              className="px-4 py-2 text-xs font-bold tracking-widest inline-block"
              style={{ background: "var(--accent)", color: "var(--bg)" }}
            >
              LEARN MORE
            </Link>
          </div>
        ) : (
          <div className="space-y-px" style={{ background: "var(--border)" }}>
            {markets.map((m, i) => {
              const short = Number(formatUnits(m.totalShort, 6));
              const long = Number(formatUnits(m.totalLong, 6));
              return (
                <motion.div
                  key={m.address}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={`/market/${m.address}`}
                    className="flex items-center justify-between p-4 transition-colors duration-200 group"
                    style={{ background: "var(--surface)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-raised)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface)"; }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xs font-data font-bold w-5" style={{ color: "var(--text-tertiary)" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {m.name}
                      </span>
                      <span className="text-[10px] font-data truncate" style={{ color: "var(--text-tertiary)" }}>
                        {m.address.slice(0, 6)}...{m.address.slice(-4)}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden sm:flex items-center gap-3">
                        <span className="text-xs font-data" style={{ color: "var(--negative)" }}>
                          S ${short.toFixed(0)}
                        </span>
                        <span className="text-xs font-data" style={{ color: "var(--positive)" }}>
                          L ${long.toFixed(0)}
                        </span>
                      </div>
                      <div className="w-24">
                        <RiskBadge score={m.riskScore} />
                        <div className="h-px mt-1.5 overflow-hidden" style={{ background: "var(--border)" }}>
                          <motion.div
                            className="h-full"
                            style={{
                              background: m.riskScore > 65
                                ? "var(--negative)"
                                : m.riskScore > 30
                                ? "var(--accent)"
                                : "var(--positive)",
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(m.riskScore, 100)}%` }}
                            transition={{ duration: 0.8, delay: i * 0.05 }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div className="px-1 py-3">
          <h2 className="text-xs font-bold tracking-widest" style={{ color: "var(--text-secondary)" }}>
            TOP RISK PROTOCOLS
          </h2>
        </div>
        <div className="space-y-px" style={{ background: "var(--border)" }}>
          {topRisk.length === 0 ? (
            <div className="px-4 py-3 text-xs" style={{ color: "var(--text-tertiary)", background: "var(--surface)" }}>
              No data
            </div>
          ) : (
            topRisk.map((m, i) => (
              <motion.div
                key={m.address}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="px-4 py-3 flex items-center justify-between"
                style={{ background: "var(--surface)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-data w-4" style={{ color: "var(--text-tertiary)" }}>
                    {i + 1}
                  </span>
                  <Link
                    to={`/market/${m.address}`}
                    className="text-sm font-medium transition-colors"
                    style={{ color: "var(--text-primary)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-primary)"; }}
                  >
                    {m.name}
                  </Link>
                </div>
                <RiskBadge score={m.riskScore} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
