import { useMemo, useState } from 'react';
import { journalEntityFormConfig } from '../../config/entityForms';
import EntityLinkSelector from '../relationships/EntityLinkSelector';
import { useGoalStore } from '../../store/goalStore';
import { useTaskStore } from '../../store/taskStore';
import { formatDateKey } from '../../utils/dateUtils';

const defaultValues = {
  title: '',
  entryDate: formatDateKey(),
  type: 'Reflection',
  mood: 7,
  tags: [],
  aspects: [],
  content: '',
  favorite: false,
  archived: false,
  linkedGoalIds: [],
  linkedTaskIds: [],
};

function Field({ field, value, onChange }) {
  if (field.type === 'textarea') {
    return (
      <textarea
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text placeholder:text-jarvis-muted focus:outline-none"
      />
    );
  }

  if (field.type === 'number') {
    return (
      <input
        type="number"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value === '' ? null : Number(event.target.value))}
        min={1}
        max={10}
        className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text placeholder:text-jarvis-muted focus:outline-none"
      />
    );
  }

  if (field.type === 'date') {
    return (
      <input
        type="date"
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
      />
    );
  }

  if (field.type === 'tags') {
    return (
      <input
        value={(value || []).join(', ')}
        onChange={(event) =>
          onChange(
            event.target.value
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
          )
        }
        placeholder={field.placeholder}
        className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text placeholder:text-jarvis-muted focus:outline-none"
      />
    );
  }

  return (
    <input
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      placeholder={field.placeholder}
      className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text placeholder:text-jarvis-muted focus:outline-none"
    />
  );
}

export default function JournalEntryForm({ initialData = {}, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({ ...defaultValues, ...initialData });

  const goals = useGoalStore((s) => s.goals);
  const tasks = useTaskStore((s) => s.tasks);

  const relationshipOptions = useMemo(() => ({
    linkedGoalIds: goals.map((g) => ({ id: g.id, title: g.title })),
    linkedTaskIds: tasks.map((t) => ({ id: t.id, title: t.title })),
  }), [goals, tasks]);

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {journalEntityFormConfig.map((field) => (
          <label key={field.name} className="block space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-jarvis-muted">{field.label}</span>
            <Field 
              field={field} 
              value={formData[field.name]} 
              onChange={(value) => setField(field.name, value)} 
            />
          </label>
        ))}
      </div>

      <div className="flex items-center gap-6 py-2">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={formData.favorite} 
            onChange={(e) => setField('favorite', e.target.checked)}
            className="rounded border-jarvis-border bg-black/20 text-jarvis-accent focus:ring-0"
          />
          <span className="text-xs text-jarvis-muted group-hover:text-jarvis-text transition-colors">Favorite Entry</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={formData.archived} 
            onChange={(e) => setField('archived', e.target.checked)}
            className="rounded border-jarvis-border bg-black/20 text-jarvis-accent focus:ring-0"
          />
          <span className="text-xs text-jarvis-muted group-hover:text-jarvis-text transition-colors">Archive Immediately</span>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <EntityLinkSelector
          label="Link Goals"
          entities={relationshipOptions.linkedGoalIds}
          value={formData.linkedGoalIds}
          onChange={(val) => setField('linkedGoalIds', val)}
          placeholder="Select goals..."
        />
        <EntityLinkSelector
          label="Link Tasks"
          entities={relationshipOptions.linkedTaskIds}
          value={formData.linkedTaskIds}
          onChange={(val) => setField('linkedTaskIds', val)}
          placeholder="Select tasks..."
        />
      </div>

      <label className="block space-y-1">
        <span className="text-[10px] uppercase tracking-wider text-jarvis-muted">Content</span>
        <Field 
          field={{ type: 'textarea' }} 
          value={formData.content} 
          onChange={(value) => setField('content', value)} 
        />
      </label>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-jarvis-border px-4 py-2 text-xs text-jarvis-muted transition hover:bg-white/5 hover:text-jarvis-text"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg border border-jarvis-accent/40 bg-jarvis-accent/10 px-4 py-2 text-xs text-jarvis-accent transition hover:bg-jarvis-accent/20"
        >
          Create Entry
        </button>
      </div>
    </form>
  );
}
