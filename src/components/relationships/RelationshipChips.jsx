import React from 'react';

export default function RelationshipChips({ items = [], onRemove }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {items.map(i => (
        <div key={i.id || i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', background: '#111', borderRadius: 999 }}>
          <span style={{ color: '#fff' }}>{i.title || i}</span>
          <button onClick={() => onRemove?.(i)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>✕</button>
        </div>
      ))}
    </div>
  );
}
