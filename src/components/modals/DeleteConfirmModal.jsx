import React, { useState } from 'react';
import BaseModal from './BaseModal';

export default function DeleteConfirmModal({ open, onClose, onConfirm, title = 'Delete item', description = 'Are you sure?' }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onConfirm?.();
      onClose?.();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <BaseModal open={open} onClose={onClose} size="sm" ariaLabel="Confirm delete">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h4 style={{ margin: 0 }}>{title}</h4>
        <p style={{ margin: 0, color: '#bbb' }}>{description}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button disabled={isDeleting} onClick={onClose} style={{ background: 'transparent', border: '1px solid #333', color: '#ddd', padding: '8px 12px', borderRadius: 6, opacity: isDeleting ? 0.6 : 1 }}>Cancel</button>
          <button disabled={isDeleting} onClick={handleConfirm} style={{ background: '#b91c1c', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: 6, opacity: isDeleting ? 0.8 : 1 }}>{isDeleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </div>
    </BaseModal>
  );
}
