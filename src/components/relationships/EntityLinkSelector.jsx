import React, { useMemo, useState } from 'react';
import RelationshipChips from './RelationshipChips';

export default function EntityLinkSelector({ entities = [], value = [], onChange, placeholder = 'Search entities' }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entities.slice(0, 50);
    return entities.filter(e => (e.title || e.id || '').toLowerCase().includes(q)).slice(0, 50);
  }, [entities, query]);

  const selected = (value || []).map(id => entities.find(e => e.id === id) || { id });

  function add(id) {
    if ((value || []).includes(id)) return;
    onChange?.([...(value || []), id]);
  }
  function remove(item) {
    onChange?.((value || []).filter(i => i !== (item.id || item)));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <RelationshipChips items={selected} onRemove={remove} />
      <input value={query} placeholder={placeholder} onChange={(e) => setQuery(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #222', background: '#070707', color: '#fff' }} />
      <div style={{ maxHeight: 220, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map(e => (
          <button key={e.id} onClick={() => add(e.id)} style={{ textAlign: 'left', padding: '8px 10px', border: '1px solid #111', background: '#090909', color: '#ddd', borderRadius: 6 }}>{e.title || e.id}</button>
        ))}
      </div>
    </div>
  );
}
