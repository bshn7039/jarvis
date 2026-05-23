import { Edit2, Trash2, Clock, Star, Archive } from 'lucide-react';

export default function JournalDayPanel({ date, entries, onEdit, onDelete, selectedEntryId }) {
  if (!date) return (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-jarvis-border bg-jarvis-panel/20 text-sm text-jarvis-muted">
      Select a date to view entries
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-jarvis-text">
          Entries for {new Date(date).toLocaleDateString(undefined, { dateStyle: 'long' })}
        </h3>
        <span className="text-xs text-jarvis-muted">{entries.length} items</span>
      </div>

      <div className="grid gap-3">
        {entries.length === 0 ? (
          <p className="py-8 text-center text-xs text-jarvis-muted">No entries for this day.</p>
        ) : (
          entries.map((entry) => (
            <article
              key={entry.id}
              onClick={() => onEdit(entry.id)}
              className={[
                'group flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-all duration-200',
                selectedEntryId === entry.id 
                  ? 'border-jarvis-accent/40 bg-jarvis-accent/5' 
                  : 'border-jarvis-border bg-jarvis-panel hover:border-jarvis-muted/30 hover:bg-white/[0.02]'
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-jarvis-text">{entry.title}</h4>
                    {entry.favorite && <Star className="h-3 w-3 fill-jarvis-accent text-jarvis-accent" />}
                    {entry.archived && <Archive className="h-3 w-3 text-jarvis-muted" />}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-jarvis-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="uppercase tracking-wider">{entry.type}</span>
                    {entry.mood !== null && (
                      <span className={['font-medium', entry.mood >= 7 ? 'text-jarvis-accent' : 'text-jarvis-text'].join(' ')}>
                        Mood: {entry.mood}/10
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                    className="rounded-lg p-1.5 text-jarvis-muted hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="line-clamp-2 text-xs leading-relaxed text-jarvis-muted">
                {entry.content || 'No content...'}
              </p>

              {entry.tags?.length > 0 && entry.tags[0] !== 'undefined' && (
                <div className="flex flex-wrap gap-1.5">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-jarvis-bg/60 px-2 py-0.5 text-[9px] text-jarvis-muted border border-jarvis-border">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
