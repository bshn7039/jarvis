export default function RelationshipChips({ links = [], onRemove, emptyLabel = 'No links' }) {
  if (!links.length) {
    return <p className="text-xs text-jarvis-muted">{emptyLabel}</p>;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {links.map((link) => (
        <span
          key={link.id}
          className="inline-flex items-center gap-1 rounded-full border border-jarvis-border bg-black/20 px-2 py-0.5 text-[11px] text-jarvis-text"
        >
          {link.title}
          {onRemove ? (
            <button
              type="button"
              onClick={() => onRemove(link.id)}
              className="text-jarvis-muted transition hover:text-jarvis-text"
              aria-label={`Remove ${link.title}`}
            >
              x
            </button>
          ) : null}
        </span>
      ))}
    </div>
  );
}
