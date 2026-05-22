import React, { useState } from 'react';
import FieldRenderer from './FieldRenderer';

export default function EntityForm({ entityType, initialData = {}, onSubmit, formConfig = [] }) {
  const [state, setState] = useState({ ...initialData });

  function handleChange(fieldName, val) {
    setState(s => ({ ...s, [fieldName]: val }));
  }

  function submit(e) {
    e?.preventDefault();
    onSubmit?.(state);
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {formConfig.map((f) => (
        <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, color: '#bbb' }}>{f.label || f.name}</label>
          <FieldRenderer field={f} value={state[f.name]} onChange={(v) => handleChange(f.name, v)} options={f.options || []} />
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => { if (onSubmit) onSubmit(null); }} style={{ background: 'transparent', border: '1px solid #333', color: '#ddd', padding: '8px 12px', borderRadius: 6 }}>Cancel</button>
        <button type="submit" style={{ background: '#0ea5a4', border: 'none', color: '#000', padding: '8px 12px', borderRadius: 6 }}>Save</button>
      </div>
    </form>
  );
}
