import { useState, useEffect } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Bar,
  ReferenceLine,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface DataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

async function fetchHistory(address: string): Promise<DataPoint[] | null> {
  try {
    const res = await fetch(`${API_BASE}/markets/${address}/history?hours=24`);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.candles || json.candles.length < 3) return null;
    return json.candles as DataPoint[];
  } catch {
    return null;
  }
}

export function ForexChart({ riskScore, address }: { riskScore: number; address: string }) {
  const [data, setData] = useState<DataPoint[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchHistory(address).then((real) => {
      if (cancelled) return;
      setData(real);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [address, riskScore]);

  const latest = data?.[data.length - 1];
  const prev = data?.[data.length - 2];
  const isUp = latest && prev ? latest.close >= prev.open : true;
  const dataLength = data?.length ?? 0;

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-xs font-bold tracking-widest animate-pulse" style={{ color: "var(--text-tertiary)" }}>
          LOADING CHART...
        </span>
      </div>
    );
  }

  if (!data || data.length < 3) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="M18 17V9" />
          <path d="M13 17V5" />
          <path d="M8 17v-3" />
        </svg>
        <span className="text-xs font-bold tracking-widest" style={{ color: "var(--text-tertiary)" }}>
          GRAPH NOT AVAILABLE YET
        </span>
        <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>
          Risk data will appear after oracle updates begin
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Price header */}
      <div className="flex items-baseline gap-3 mb-2 px-1">
        <span className="text-2xl font-data font-bold" style={{ color: isUp ? "var(--positive)" : "var(--negative)" }}>
          {latest?.close.toFixed(2) ?? "--"}
        </span>
        {latest && prev && (
          <span className="text-xs font-data" style={{ color: isUp ? "var(--positive)" : "var(--negative)" }}>
            {isUp ? "+" : ""}{(latest.close - prev.open).toFixed(2)} ({((latest.close - prev.open) / prev.open * 100).toFixed(2)}%)
          </span>
        )}
        <span className="text-[10px] font-bold tracking-widest ml-auto flex items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--positive)" }} />
          LIVE — 1H
        </span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isUp ? "#00D4AA" : "#FF3B5C"} stopOpacity={0.15} />
              <stop offset="100%" stopColor={isUp ? "#00D4AA" : "#FF3B5C"} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            opacity={0.5}
            vertical={false}
          />

          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "var(--text-tertiary)", fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            interval={Math.floor(dataLength / 6)}
          />

          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "var(--text-tertiary)", fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
            width={35}
          />

          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const d = payload[0].payload as DataPoint;
              const candleUp = d.close >= d.open;
              return (
                <div
                  className="px-3 py-2 text-xs font-data"
                  style={{
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    color: "var(--text-primary)",
                  }}
                >
                  <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: "var(--text-tertiary)" }}>
                    {d.time}
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                    <span style={{ color: "var(--text-secondary)" }}>O</span>
                    <span style={{ color: candleUp ? "var(--positive)" : "var(--negative)" }}>{d.open.toFixed(2)}</span>
                    <span style={{ color: "var(--text-secondary)" }}>H</span>
                    <span>{d.high.toFixed(2)}</span>
                    <span style={{ color: "var(--text-secondary)" }}>L</span>
                    <span>{d.low.toFixed(2)}</span>
                    <span style={{ color: "var(--text-secondary)" }}>C</span>
                    <span style={{ color: candleUp ? "var(--positive)" : "var(--negative)" }}>{d.close.toFixed(2)}</span>
                    <span style={{ color: "var(--text-secondary)" }}>Vol</span>
                    <span>{d.volume.toLocaleString()}</span>
                  </div>
                </div>
              );
            }}
          />

          <Bar
            dataKey="volume"
            fill="var(--text-tertiary)"
            opacity={0.15}
            yAxisId="volume"
          />

          <YAxis
            yAxisId="volume"
            orientation="right"
            domain={[0, "auto"]}
            hide
          />

          <Area
            type="monotone"
            dataKey="close"
            stroke="none"
            fill="url(#riskGradient)"
          />

          <Line
            type="monotone"
            dataKey="close"
            stroke={isUp ? "var(--positive)" : "var(--negative)"}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: isUp ? "var(--positive)" : "var(--negative)", stroke: "var(--surface)", strokeWidth: 2 }}
          />

          {latest && (
            <ReferenceLine
              y={latest.close}
              stroke={isUp ? "var(--positive)" : "var(--negative)"}
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
