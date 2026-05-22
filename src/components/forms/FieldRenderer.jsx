import React from 'react';

export default function FieldRenderer({ field, value, onChange, entities = [], options = [] }) {
  const { type, name, label, placeholder } = field;
  switch (type) {
    case 'text':
      return <input name={name} placeholder={placeholder || ''} value={value || ''} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #222', background: '#070707', color: '#fff' }} />;
    case 'textarea':
      return <textarea name={name} placeholder={placeholder || ''} value={value || ''} onChange={(e) => onChange(e.target.value)} rows={4} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #222', background: '#070707', color: '#fff' }} />;
    case 'number':
      return <input type="number" name={name} value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #222', background: '#070707', color: '#fff' }} />;
    case 'select':
      return (
        <select name={name} value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #222', background: '#070707', color: '#fff' }}>
          <option value="">--</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    case 'multiselect':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {options.map((o) => (
            <label key={o.value} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={(value || []).includes(o.value)} onChange={(e) => {
                const next = new Set(value || []);
                if (e.target.checked) next.add(o.value); else next.delete(o.value);
                onChange(Array.from(next));
              }} />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      );
    case 'checkbox':
      return <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />;
    case 'date':
      return <input type="date" value={value ? value.split('T')[0] : ''} onChange={(e) => onChange(e.target.value)} style={{ padding: 8, borderRadius: 6 }} />;
    case 'tags':
      return (
        <input placeholder={placeholder || ''} value={(value || []).join(', ')} onChange={(e) => onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} style={{ width: '100%', padding: 8, borderRadius: 6 }} />
      );
    case 'entityLink':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <small style={{ color: '#999' }}>Linked entities</small>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(value || []).map(id => <span key={id} style={{ padding: '4px 8px', background: '#111', borderRadius: 6 }}>{id}</span>)}
          </div>
        </div>
      );
    default:
      return <input name={name} value={value || ''} onChange={(e) => onChange(e.target.value)} />;
  }
}
