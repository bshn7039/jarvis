import { useMemo, useState } from 'react';
import RelationshipChips from './RelationshipChips';

function formatDate(dateStr) {
  if (!dateStr || dateStr === 'No Date') return 'No Date';
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[parseInt(month, 10) - 1] || month;
    return `${parseInt(day, 10)} ${monthName} ${year}`;
  } catch (e) {
    return dateStr;
  }
}

export default function EntityLinkSelector({
  label,
  entities = [],
  value = [],
  onChange,
  placeholder = 'Search entities',
  groupByDate = false,
}) {
  const [query, setQuery] = useState('');

  const selected = useMemo(() => {
    const selectedSet = new Set(value);
    return entities.filter((entity) => selectedSet.has(entity.id));
  }, [entities, value]);

  const filtered = useMemo(() => {
    const selectedSet = new Set(value);
    const q = query.trim().toLowerCase();
    return entities
      .filter((entity) => !selectedSet.has(entity.id))
      .filter((entity) => !q || entity.title.toLowerCase().includes(q))
      .slice(0, 50);
  }, [entities, query, value]);

  const grouped = useMemo(() => {
    if (!groupByDate) return null;
    
    const groups = {};
    filtered.forEach((entity) => {
      const d = entity.date || 'No Date';
      if (!groups[d]) {
        groups[d] = [];
      }
      groups[d].push(entity);
    });

    const counts = {};
    entities.forEach((entity) => {
      const d = entity.date || 'No Date';
      counts[d] = (counts[d] || 0) + 1;
    });

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => ({
        date,
        formattedDate: formatDate(date),
        totalCount: counts[date] || 0,
        items: groups[date],
      }));
  }, [filtered, entities, groupByDate]);

  const addLink = (entityId) => {
    if (value.includes(entityId)) return;
    onChange([...value, entityId]);
  };

  const removeLink = (entityId) => {
    onChange(value.filter((id) => id !== entityId));
  };

  return (
    <div className="space-y-2 rounded-lg border border-jarvis-border bg-black/20 p-2.5">
      <p className="text-xs uppercase tracking-wide text-jarvis-muted">{label}</p>

      <RelationshipChips links={selected} onRemove={removeLink} emptyLabel="No linked entities" />

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-jarvis-border bg-black/25 px-2 py-1.5 text-xs text-jarvis-text placeholder:text-jarvis-muted focus:outline-none"
      />

      {filtered.length > 0 ? (
        <div className={`overflow-auto pr-1 ${groupByDate ? 'max-h-44 space-y-2.5' : 'max-h-28 space-y-1'}`}>
          {groupByDate && grouped ? (
            grouped.map((group) => (
              <div key={group.date} className="space-y-1">
                <div className="flex items-center justify-between bg-white/5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider text-jarvis-accent font-semibold select-none border-l-2 border-jarvis-accent/60">
                  <span>{group.formattedDate}</span>
                  <span className="text-jarvis-muted font-normal normal-case">
                    {group.totalCount} {group.totalCount === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
                <div className="space-y-0.5 pl-1">
                  {group.items.map((entity) => (
                    <button
                      key={entity.id}
                      type="button"
                      onClick={() => addLink(entity.id)}
                      className="block w-full rounded border border-jarvis-border/40 hover:border-jarvis-accent/40 px-2.5 py-1 text-left text-xs text-jarvis-text transition hover:bg-white/5"
                    >
                      {entity.title}
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            filtered.map((entity) => (
              <button
                key={entity.id}
                type="button"
                onClick={() => addLink(entity.id)}
                className="block w-full rounded border border-jarvis-border px-2 py-1 text-left text-xs text-jarvis-text transition hover:bg-white/5"
              >
                {entity.title}
              </button>
            ))
          )}
        </div>
      ) : (
        <p className="text-[11px] text-jarvis-muted">No entities match.</p>
      )}
    </div>
  );
}
