import React from 'react';
import BaseModal from './BaseModal';

export default function DeleteConfirmModal({ open, onClose, onConfirm, title = 'Delete item', description = 'Are you sure?' }) {
  return (
    <BaseModal open={open} onClose={onClose} size="sm" ariaLabel="Confirm delete">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h4 style={{ margin: 0 }}>{title}</h4>
        <p style={{ margin: 0, color: '#bbb' }}>{description}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #333', color: '#ddd', padding: '8px 12px', borderRadius: 6 }}>Cancel</button>
          <button onClick={() => { onConfirm?.(); onClose?.(); }} style={{ background: '#b91c1c', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>Delete</button>
        </div>
      </div>
    </BaseModal>
  );
}
