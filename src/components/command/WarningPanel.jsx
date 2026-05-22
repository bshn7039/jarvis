import { AlertTriangle } from 'lucide-react';

const severityStyles = {
  low: 'border-jarvis-border/80',
  medium: 'border-jarvis-muted/30',
};

export default function WarningPanel({ warnings }) {
  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-5 md:p-6">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-jarvis-muted">
        System Warnings
      </h2>
      <ul className="flex flex-col gap-2">
        {warnings.filter(Boolean).map((warning, index) => (
          <li
            key={warning.id || `warning-${index}`}
            className={[
              'flex items-start gap-3 rounded-lg border bg-jarvis-bg/30 px-3 py-3 transition-colors duration-200 hover:bg-white/[0.02]',
              severityStyles[warning.severity],
            ].join(' ')}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-jarvis-muted/70" strokeWidth={1.75} />
            <span className="text-sm text-jarvis-text/80">{warning.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
