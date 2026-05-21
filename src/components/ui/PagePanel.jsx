export default function PagePanel({ title, subtitle, actions, children, className = '' }) {
  return (
    <section
      className={[
        'rounded-2xl border border-jarvis-border bg-jarvis-panel/95 p-4 md:p-5',
        className,
      ].join(' ')}
    >
      {(title || subtitle || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-medium text-jarvis-text md:text-base">{title}</h2>}
            {subtitle && <p className="mt-1 text-xs text-jarvis-muted md:text-sm">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
