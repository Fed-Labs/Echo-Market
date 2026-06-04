import { useMarkets } from "../hooks/useMarkets";
import { formatUnits } from "viem";

export function Ticker() {
  const { markets } = useMarkets();

  const items = markets.slice(0, 8).flatMap((m) => [
    `${m.name} SHORT ${Number(formatUnits(m.totalShort, 6)).toFixed(0)}`,
    `${m.name} LONG ${Number(formatUnits(m.totalLong, 6)).toFixed(0)}`,
    `${m.name} RISK ${m.riskScore.toFixed(1)}%`,
  ]);

  const doubled = [...items, ...items];

  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden h-8 flex items-center" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
      <div className="animate-ticker whitespace-nowrap flex items-center gap-8 px-4">
        {doubled.map((item, i) => (
          <span key={i} className="text-[10px] font-data font-medium tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            <span style={{ color: "var(--accent)", marginRight: "8px" }}>◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
