import React from 'react';
import BaseModal from '../modals/BaseModal';
import RelationshipChips from '../relationships/RelationshipChips';

export default function EntityDetailPanel({ open, onClose, entity = {}, linkedEntities = [], onEditInline, onAction }) {
  return (
    <BaseModal open={open} onClose={onClose} size="lg" ariaLabel="Entity detail">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0 }}>{entity.title || entity.name || 'Untitled'}</h3>
            <small style={{ color: '#999' }}>{entity.type}</small>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onAction?.('edit', entity)} style={{ background: 'transparent', border: '1px solid #333', color: '#ddd', padding: '8px 10px', borderRadius: 6 }}>Edit</button>
            <button onClick={() => onAction?.('more', entity)} style={{ background: 'transparent', border: '1px solid #333', color: '#ddd', padding: '8px 10px', borderRadius: 6 }}>•••</button>
          </div>
        </header>

        <section>
          <p style={{ color: '#ccc' }}>{entity.description}</p>
        </section>

        <section>
          <h4 style={{ margin: 0 }}>Linked</h4>
          <RelationshipChips items={linkedEntities} onRemove={(i) => onAction?.('unlink', i)} />
        </section>

        <section>
          <h4 style={{ margin: 0 }}>Activity</h4>
          <div style={{ color: '#999' }}>
            {entity.activity?.slice?.(0,8)?.map((a, idx) => <div key={idx} style={{ padding: '6px 0', borderBottom: '1px solid #111' }}>{a.text}</div>)}
          </div>
        </section>
      </div>
    </BaseModal>
  );
}
