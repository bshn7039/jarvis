export default function ProgressCard({ item }) {
  const ringRadius = 28;
  const circumference = 2 * Math.PI * ringRadius;
  const offset = circumference - (item.percent / 100) * circumference;

  return (
    <article className="rounded-xl border border-jarvis-border bg-jarvis-panel p-4 transition-colors duration-200 hover:border-jarvis-muted/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm text-jarvis-text">{item.label}</h3>
          <p className="mt-1 text-lg font-medium text-jarvis-text">{item.value}</p>
          {item.target && <p className="mt-0.5 text-xs text-jarvis-muted">Target: {item.target}</p>}
        </div>
        <div className="relative h-16 w-16 shrink-0">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r={ringRadius}
              fill="none"
              stroke="#2a2a2a"
              strokeWidth="4"
            />
            <circle
              cx="32"
              cy="32"
              r={ringRadius}
              fill="none"
              stroke="rgba(125, 211, 252, 0.5)"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs text-jarvis-muted">
            {item.percent}%
          </span>
        </div>
      </div>
      <div className="mt-4 flex h-12 items-end gap-1">
        {item.bars.map((height, index) => (
          <span
            key={index}
            className="flex-1 rounded-t-sm bg-jarvis-muted/25 transition-all duration-200 hover:bg-jarvis-accent/40"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </article>
  );
}
