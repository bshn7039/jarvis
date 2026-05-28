import { AlertTriangle, RefreshCcw } from 'lucide-react';
import CinematicLoader from '../ui/CinematicLoader';

const severityStyles = {
  low: 'border-jarvis-border/80',
  medium: 'border-jarvis-muted/30',
  high: 'border-red-900/30 text-red-400 bg-red-950/10'
};

export default function WarningPanel({ warnings, onRefresh, isGenerating }) {
  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-jarvis-muted">
          System Warnings
        </h2>
        <button
          onClick={onRefresh}
          disabled={isGenerating}
          className="rounded-lg border border-jarvis-border p-1.5 text-jarvis-muted hover:border-jarvis-muted/50 hover:text-jarvis-text transition-all duration-300 disabled:opacity-50"
          title="Refresh AI Warnings"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : 'hover:rotate-45 transition-transform duration-300'}`} />
        </button>
      </div>
      {isGenerating ? (
        <CinematicLoader size="sm" message="Analyzing potential warnings..." />
      ) : (
        <ul className="flex flex-col gap-2">
          {warnings.length > 0 ? (
            warnings.filter(Boolean).map((warning, index) => (
              <li
                key={warning.id || `warning-${index}`}
                className={[
                  'flex items-start gap-3 rounded-lg border bg-jarvis-bg/30 px-3 py-3 transition-colors duration-200 hover:bg-white/[0.02]',
                  severityStyles[warning.severity] || severityStyles.medium,
                ].join(' ')}
              >
                <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${warning.severity === 'high' ? 'text-red-400' : 'text-jarvis-muted/70'}`} strokeWidth={1.75} />
                <span className="text-sm">{warning.text}</span>
              </li>
            ))
          ) : (
            <li className="py-4 text-center text-xs text-jarvis-muted italic border border-jarvis-dashed rounded-lg bg-black/10">
              No system warnings detected.
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

