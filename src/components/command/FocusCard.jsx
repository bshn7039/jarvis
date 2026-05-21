import { Sparkles } from 'lucide-react';
import { categoryStyles } from '../../data/mockCommandData';

export default function FocusCard({ focus }) {
  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-5 transition-colors duration-200 hover:border-jarvis-muted/30 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-jarvis-muted">
          Today&apos;s Focus
        </h2>
        <span className="text-xs text-jarvis-muted">Direction Layer</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-jarvis-muted/80">
            Deadlines
          </h3>
          <ul className="flex flex-col gap-2">
            {focus.deadlines.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-jarvis-border/60 bg-jarvis-bg/40 px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-jarvis-text">{item.label}</p>
                  <span
                    className={[
                      'shrink-0 rounded-full border px-2 py-0.5 text-[10px]',
                      categoryStyles[item.category] ?? categoryStyles.System,
                    ].join(' ')}
                  >
                    {item.category}
                  </span>
                </div>
                <p className="mt-1 text-xs text-jarvis-muted">{item.date}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-jarvis-accent/20 bg-jarvis-accent/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-jarvis-accent">
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            <span className="text-xs font-medium uppercase tracking-wider">
              AI Suggested Focus
            </span>
          </div>
          <p className="text-sm leading-relaxed text-jarvis-text/90">{focus.aiFocus}</p>
        </div>
      </div>
    </section>
  );
}
