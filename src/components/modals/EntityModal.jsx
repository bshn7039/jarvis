import React from 'react';
import BaseModal from './BaseModal';
import EntityForm from '../forms/EntityForm';

export default function EntityModal({ open, onClose, entityType, initialData = {}, onSubmit, formConfig = [] }) {
  return (
    <BaseModal open={open} onClose={onClose} size="md" ariaLabel={`${entityType} modal`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{initialData.id ? `Edit ${entityType}` : `New ${entityType}`}</h3>
          <button onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: 'none', color: '#bbb', cursor: 'pointer' }}>✕</button>
        </header>
        <div>
          <EntityForm entityType={entityType} initialData={initialData} onSubmit={(data) => { onSubmit?.(data); onClose?.(); }} formConfig={formConfig} />
        </div>
      </div>
    </BaseModal>
  );
}
