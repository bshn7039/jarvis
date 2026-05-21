const moodClass = (mood) => {
  if (mood >= 8) return 'bg-jarvis-accent/70';
  if (mood >= 6) return 'bg-white/70';
  return 'bg-jarvis-muted/70';
};

export default function JournalTimeline({ entries, selectedEntryId, onSelectEntry }) {
  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <button
          key={entry.id}
          type="button"
          onClick={() => onSelectEntry(entry.id)}
          className={[
            'w-full rounded-xl border p-3 text-left transition',
            selectedEntryId === entry.id
              ? 'border-jarvis-accent/40 bg-jarvis-accent/10'
              : 'border-jarvis-border bg-black/20 hover:border-jarvis-muted/40',
          ].join(' ')}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm text-jarvis-text">{entry.title}</p>
            <span className={['h-2.5 w-2.5 rounded-full', moodClass(entry.mood)].join(' ')} />
          </div>
          <p className="mt-1 text-xs text-jarvis-muted">{entry.type}</p>
          <p className="mt-1 text-[11px] text-jarvis-muted">
            {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </button>
      ))}
    </div>
  );
}
