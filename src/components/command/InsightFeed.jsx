import { RefreshCcw } from 'lucide-react';

const typeStyles = {
  neutral: 'border-jarvis-border text-jarvis-muted',
  accent: 'border-jarvis-accent/25 text-jarvis-accent/90',
  warning: 'border-jarvis-muted/40 text-jarvis-text/80',
};

export default function InsightFeed({ insights, onRefresh, isGenerating }) {
  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-jarvis-muted">
          AI Insights
        </h2>
        <button
          onClick={onRefresh}
          disabled={isGenerating}
          className="rounded-lg border border-jarvis-border p-1.5 text-jarvis-muted hover:border-jarvis-muted/50 hover:text-jarvis-text transition-all duration-300 disabled:opacity-50"
          title="Refresh AI Insights"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : 'hover:rotate-45 transition-transform duration-300'}`} />
        </button>
      </div>
      <div className="flex flex-col gap-2 font-mono text-[13px]">
        {insights.length > 0 ? (
          insights.filter(Boolean).map((insight, index) => (
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
          ))
        ) : (
          <div className="py-4 text-center text-xs text-jarvis-muted italic">
            No insights available. Click refresh to generate.
          </div>
        )}
      </div>
    </section>
  );
}

