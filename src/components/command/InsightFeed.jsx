const typeStyles = {
  neutral: 'border-jarvis-border text-jarvis-muted',
  accent: 'border-jarvis-accent/25 text-jarvis-accent/90',
  warning: 'border-jarvis-muted/40 text-jarvis-text/80',
};

export default function InsightFeed({ insights }) {
  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-5 md:p-6">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-jarvis-muted">
        AI Insights
      </h2>
      <div className="flex flex-col gap-2 font-mono text-[13px]">
        {insights.filter(Boolean).map((insight, index) => (
          <div
            key={insight.id || `insight-${index}`}
            className={[
              'rounded-lg border bg-jarvis-bg/40 px-3 py-2.5 transition-colors duration-200 hover:bg-white/[0.02]',
              typeStyles[insight.type],
            ].join(' ')}
          >
            <span className="text-jarvis-accent/60">&gt;</span>{' '}
            <span className="text-jarvis-text/90">{insight.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
