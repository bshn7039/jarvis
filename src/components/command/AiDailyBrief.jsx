import { RefreshCcw, Sparkles } from 'lucide-react';
import CinematicLoader from '../ui/CinematicLoader';

export default function AiDailyBrief({ brief, onRefresh, isGenerating = false }) {
  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-5 transition-colors duration-200 hover:border-jarvis-muted/30 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-jarvis-muted">
          AI Daily Brief
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isGenerating}
            className={`flex items-center gap-1.5 rounded-lg border border-jarvis-border px-2.5 py-1 text-xs text-jarvis-muted transition-colors hover:border-jarvis-muted/50 hover:text-jarvis-text ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCcw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} strokeWidth={1.75} />
            {isGenerating ? 'Analyzing...' : 'Refresh Brief'}
          </button>
          <span className="text-xs text-jarvis-muted">Direction Layer</span>
        </div>
      </div>

      {isGenerating ? (
        <CinematicLoader message="Syncing daily brief..." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-jarvis-accent/20 bg-jarvis-accent/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-jarvis-accent">
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
              <span className="text-xs font-medium uppercase tracking-wider">Primary Priority</span>
            </div>
            <p className="text-sm font-medium text-jarvis-text">{brief.primary}</p>
          </div>

          <div className="rounded-xl border border-jarvis-border/60 bg-jarvis-bg/40 p-4">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-jarvis-muted/80">
              Secondary Priority
            </h3>
            <p className="text-sm text-jarvis-text/90">{brief.secondary}</p>
          </div>

          <div className="rounded-xl border border-jarvis-border/40 bg-white/[0.02] p-4">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-jarvis-muted/80">
              Watch-outs
            </h3>
            <p className="text-sm text-jarvis-text/80">{brief.watchOuts}</p>
          </div>
        </div>
      )}
    </section>
  );
}
