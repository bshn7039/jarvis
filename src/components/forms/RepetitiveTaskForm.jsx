import { useState } from 'react';
import { useGoalStore } from '../../store/goalStore';

export default function RepetitiveTaskForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const safeData = initialData || {};
  const [formData, setFormData] = useState({
    title: safeData.title || '',
    description: safeData.description || '',
    priority: safeData.priority || 'medium',
    category: safeData.category || 'Routine',
    tags: (safeData.tags || []).join(', '),
    subTags: (safeData.subTags || []).join(', '),
    linkedGoalIds: safeData.linkedGoalIds || [],
    notes: safeData.notes || '',
  });

  const goals = useGoalStore(s => s.goals);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    await onSubmit?.({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      subTags: formData.subTags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block space-y-1">
        <span className="text-xs uppercase tracking-wide text-jarvis-muted">Title</span>
        <input
          type="text"
          required
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
          placeholder="Drink 3L Water, Study DSA, etc."
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs uppercase tracking-wide text-jarvis-muted">Description</span>
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none h-20"
          placeholder="Details about the routine..."
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-wide text-jarvis-muted">Priority</span>
          <select
            value={formData.priority}
            onChange={e => setFormData({ ...formData, priority: e.target.value })}
            className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
          >
            <option value="low" className="bg-jarvis-panel">Low</option>
            <option value="medium" className="bg-jarvis-panel">Medium</option>
            <option value="high" className="bg-jarvis-panel">High</option>
            <option value="critical" className="bg-jarvis-panel">Critical</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-wide text-jarvis-muted">Category</span>
          <input
            type="text"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
            placeholder="Routine, Health, Study..."
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-wide text-jarvis-muted">Tags</span>
          <input
            type="text"
            value={formData.tags}
            onChange={e => setFormData({ ...formData, tags: e.target.value })}
            className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
            placeholder="daily, habit..."
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-wide text-jarvis-muted">Sub-tags</span>
          <input
            type="text"
            value={formData.subTags}
            onChange={e => setFormData({ ...formData, subTags: e.target.value })}
            className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
            placeholder="morning, night..."
          />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-xs uppercase tracking-wide text-jarvis-muted">Linked Goals</span>
        <select
          multiple
          value={formData.linkedGoalIds}
          onChange={e => setFormData({ ...formData, linkedGoalIds: Array.from(e.target.selectedOptions, o => o.value) })}
          className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none h-24"
        >
          {goals.map(g => (
            <option key={g.id} value={g.id} className="bg-jarvis-panel">{g.title}</option>
          ))}
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-xs uppercase tracking-wide text-jarvis-muted">Notes</span>
        <textarea
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none h-20"
          placeholder="Any extra notes..."
        />
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-jarvis-border px-3 py-1.5 text-xs text-jarvis-muted transition hover:text-jarvis-text"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded border border-jarvis-border bg-white/10 px-3 py-1.5 text-xs text-jarvis-text transition hover:bg-white/15 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Confirm Repetitive Task'}
        </button>
      </div>
    </form>
  );
}
