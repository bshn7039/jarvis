import React, { useEffect, useState, useRef } from 'react';
import BaseModal from '../modals/BaseModal';
import { useCommandPaletteStore } from '../../store/commandPaletteStore';

function fuzzyMatch(q, s) {
  if (!q) return true;
  q = q.toLowerCase(); s = (s||'').toLowerCase();
  return s.includes(q);
}

export default function CommandPalette() {
  const { isOpen, open, close, actions, entities } = useCommandPaletteStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 60);
  }, [isOpen]);

  useEffect(() => {
    const a = actions || [];
    const ent = (entities || []).map(e => ({ type: 'entity', id: e.id, title: e.title }));
    const pool = [
      ...a.map(x => ({ ...x, category: x.category || 'action' })),
      ...ent
    ];
    setResults(pool.filter(p => fuzzyMatch(query, p.title || p.id)).slice(0, 20));
  }, [query, actions, entities]);

  return (
    <BaseModal open={isOpen} onClose={close} size="lg" ariaLabel="Command palette">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type to search..." style={{ padding: 12, borderRadius: 8, border: '1px solid #222', background: '#070707', color: '#fff' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 360, overflow: 'auto' }}>
          {results.map(r => (
            <button key={(r.id||r.title)} onClick={() => { r.onTrigger?.(); }} style={{ textAlign: 'left', padding: 10, borderRadius: 6, background: '#090909', border: '1px solid #111', color: '#eee' }}>{r.title || r.id}</button>
          ))}
        </div>
      </div>
    </BaseModal>
  );
}
