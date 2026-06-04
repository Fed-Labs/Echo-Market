import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMarkets } from "../hooks/useMarkets";
import { RiskBadge } from "../components/RiskBadge";

export function Oracle() {
  const { markets, isLoading } = useMarkets();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <h1 className="text-2xl font-black tracking-tighter mb-2" style={{ color: "var(--text-primary)" }}>
          Risk Feed
        </h1>
        <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)" }}>
          Chainlink-compatible oracle aggregating short/long ratios into 0-100 risk scores.
          Consumed by lending protocols, yield aggregators, and insurers.
        </p>
      </motion.div>

      <div>
        <div className="px-1 py-3 flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-widest" style={{ color: "var(--text-secondary)" }}>
            LIVE FEEDS
          </h2>
          <span className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
            <span className="w-1 h-1 rounded-full animate-pulse-glow" style={{ background: "var(--positive)" }} />
            {new Date().toLocaleTimeString()}
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-px" style={{ background: "var(--border)" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-shimmer" style={{ background: "var(--surface)" }} />
            ))}
          </div>
        ) : markets.length === 0 ? (
          <div className="p-10 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              No active oracle feeds.
            </p>
          </div>
        ) : (
          <div className="space-y-px" style={{ background: "var(--border)" }}>
            {markets.map((f, i) => (
              <motion.div
                key={f.address}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between px-5 py-3"
                style={{ background: "var(--surface)" }}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-xs font-data font-bold w-6" style={{ color: "var(--text-tertiary)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Link
                    to={`/market/${f.address}`}
                    className="text-sm font-medium transition-colors"
                    style={{ color: "var(--text-primary)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-primary)"; }}
                  >
                    {f.protocol.slice(0, 10)}...{f.protocol.slice(-6)}
                  </Link>
                </div>
                <div className="flex items-center gap-6">
                  <RiskBadge score={f.riskScore} />
                  <span className="text-xs font-data hidden sm:inline" style={{ color: "var(--text-tertiary)" }}>
                    {f.address.slice(0, 8)}...{f.address.slice(-6)}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(f.address)}
                    className="text-[10px] font-bold tracking-wider px-2 py-1 transition-colors"
                    style={{ border: "1px solid var(--border)", color: "var(--text-tertiary)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-hover)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-tertiary)";
                    }}
                  >
                    COPY
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h3 className="text-[10px] font-bold tracking-widest mb-4" style={{ color: "var(--text-tertiary)" }}>
            SOLIDITY INTEGRATION
          </h3>
          <pre
            className="p-4 text-xs font-data overflow-x-auto"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
{`(, int256 answer, , , ) = echoOracle.latestRoundData(protocolAddress);
uint256 riskPercent = uint256(answer) / 1e18; // 0-100`}
          </pre>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h3 className="text-[10px] font-bold tracking-widest mb-4" style={{ color: "var(--text-tertiary)" }}>
            ETHERS.JS INTEGRATION
          </h3>
          <pre
            className="p-4 text-xs font-data overflow-x-auto"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
{`const oracle = new Contract(ORACLE_ADDRESS, ECHO_ORACLE_ABI, provider);
const { answer } = await oracle.latestRoundData(protocolAddress);
const riskPercent = Number(answer) / 1e18;`}
          </pre>
        </motion.div>
      </div>
    </div>
  );
}
