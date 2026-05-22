import { useMemo, useState } from 'react';
import RelationshipChips from './RelationshipChips';

export default function EntityLinkSelector({
  label,
  entities = [],
  value = [],
  onChange,
  placeholder = 'Search entities',
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
        <div className="max-h-28 space-y-1 overflow-auto pr-1">
          {filtered.map((entity) => (
            <button
              key={entity.id}
              type="button"
              onClick={() => addLink(entity.id)}
              className="block w-full rounded border border-jarvis-border px-2 py-1 text-left text-xs text-jarvis-text transition hover:bg-white/5"
            >
              {entity.title}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-jarvis-muted">No entities match.</p>
      )}
    </div>
  );
}
