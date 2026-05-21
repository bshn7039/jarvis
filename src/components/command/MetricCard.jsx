import {
  BookOpen,
  CheckSquare,
  Droplets,
  Dumbbell,
  Flame,
  Moon,
  Smile,
  TrendingDown,
  TrendingUp,
  Utensils,
} from 'lucide-react';

const iconMap = {
  Moon,
  Flame,
  Beef: Utensils,
  Droplets,
  BookOpen,
  Dumbbell,
  Smile,
  CheckSquare,
};

export default function MetricCard({ metric }) {
  const Icon = iconMap[metric.icon] ?? Flame;
  const TrendIcon = metric.trendUp ? TrendingUp : TrendingDown;

  return (
    <article className="rounded-xl border border-jarvis-border bg-jarvis-panel p-4 transition-all duration-200 hover:border-jarvis-muted/30 hover:bg-white/[0.02]">
      <div className="flex items-start justify-between gap-2">
        <div className="rounded-lg border border-jarvis-border bg-jarvis-bg/60 p-2">
          <Icon className="h-4 w-4 text-jarvis-muted" strokeWidth={1.75} />
        </div>
        <span
          className={[
            'flex items-center gap-0.5 text-[11px]',
            metric.trendUp ? 'text-jarvis-accent/80' : 'text-jarvis-muted',
          ].join(' ')}
        >
          <TrendIcon className="h-3 w-3" strokeWidth={1.75} />
          {metric.trend}
        </span>
      </div>
      <p className="mt-3 text-xs text-jarvis-muted">{metric.label}</p>
      <p className="mt-1 text-lg font-medium text-jarvis-text">{metric.value}</p>
      <div className="mt-3 flex h-8 items-end gap-0.5">
        {[35, 50, 42, 60, 48, 55, metric.trendUp ? 65 : 40].map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-sm bg-jarvis-border/80"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </article>
  );
}
