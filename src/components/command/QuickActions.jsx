import { Dumbbell, PenLine, Plus, Wallet, Zap } from 'lucide-react';

const iconMap = {
  Wallet,
  Dumbbell,
  PenLine,
  Plus,
  Zap,
};

export default function QuickActions({ actions }) {
  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-5 md:p-6">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-jarvis-muted">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {actions.map((action) => {
          const Icon = iconMap[action.icon] ?? Plus;
          return (
            <button
              key={action.id}
              type="button"
              className={[
                'flex flex-col items-center justify-center gap-3 rounded-xl border border-jarvis-border bg-jarvis-bg/40 px-4 py-4 text-center text-xs text-jarvis-text',
                'transition-all duration-200 hover:border-jarvis-muted/40 hover:bg-white/[0.04] active:scale-[0.99]',
              ].join(' ')}
            >
              <span className="rounded-lg border border-jarvis-border p-2">
                <Icon className="h-4 w-4 text-jarvis-muted" strokeWidth={1.75} />
              </span>
              {action.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
