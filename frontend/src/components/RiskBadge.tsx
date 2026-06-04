export function RiskBadge({ score }: { score: number }) {
  let color = "var(--positive)";
  let label = "LOW";
  if (score > 30) {
    color = "var(--accent)";
    label = "MED";
  }
  if (score > 65) {
    color = "var(--negative)";
    label = "HIGH";
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-data font-bold" style={{ color }}>
        {score.toFixed(1)}
      </span>
      <span
        className="text-[10px] font-bold tracking-wider px-1.5 py-0.5"
        style={{
          color,
          border: `1px solid ${color}`,
          opacity: 0.6,
        }}
      >
        {label}
      </span>
    </div>
  );
}
