export default function JournalEditor({ entry, onContentChange, onMoodChange }) {
  if (!entry) {
    return (
      <div className="rounded-2xl border border-dashed border-jarvis-border p-6 text-sm text-jarvis-muted">
        Select an entry from the timeline.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-jarvis-muted">{entry.type}</p>
          <h3 className="text-base text-jarvis-text md:text-lg">{entry.title}</h3>
        </div>
        <label className="flex items-center gap-2 text-xs text-jarvis-muted">
          Mood
          <input
            type="range"
            min={1}
            max={10}
            value={entry.mood}
            onChange={(event) => onMoodChange(entry.id, Number(event.target.value))}
            className="accent-jarvis-accent"
          />
          <span className="rounded border border-jarvis-border px-2 py-0.5 text-xs text-jarvis-text">
            {entry.mood}/10
          </span>
        </label>
      </div>
      <p className="mt-1 text-xs text-jarvis-muted">
        {new Date(entry.date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {entry.tags.map((tag) => (
          <span key={tag} className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[11px] text-jarvis-muted">
            #{tag}
          </span>
        ))}
      </div>
      <textarea
        value={entry.content}
        onChange={(event) => onContentChange(entry.id, event.target.value)}
        className="mt-4 h-56 w-full rounded-xl border border-jarvis-border bg-black/20 p-3 text-sm text-jarvis-text placeholder:text-jarvis-muted focus:outline-none md:h-72"
      />
    </div>
  );
}
