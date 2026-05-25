import { useMemo, useState } from 'react';
import { taskEntityFormConfig } from '../../config/entityForms';
import EntityLinkSelector from '../relationships/EntityLinkSelector';
import { useGoalStore } from '../../store/goalStore';
import { useAcademicStore } from '../../store/academicStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { useJournalStore } from '../../store/journalStore';
import { useEntityStore } from '../../store/entityStore';
import RepetitiveTaskForm from './RepetitiveTaskForm';

const defaultTaskValues = {
  title: '',
  description: '',
  bucket: 'undefined',
  priority: 'medium',
  category: 'System',
  progress: 0,
  dueDate: '',
  subTags: [],
  completionNotes: '',
  linkedGoalIds: [],
  linkedAcademicIds: [],
  linkedScheduleIds: [],
  linkedJournalIds: [],
};

function normalizeFormState(data = {}) {
  return {
    ...defaultTaskValues,
    ...data,
    progress: Number(data.progress ?? defaultTaskValues.progress),
    subTags: Array.isArray(data.subTags) ? data.subTags : [],
    linkedGoalIds: Array.from(new Set(data.linkedGoalIds || [])),
    linkedAcademicIds: Array.from(new Set(data.linkedAcademicIds || data.linkedSubjectIds || [])),
    linkedScheduleIds: Array.from(new Set(data.linkedScheduleIds || [])),
    linkedJournalIds: Array.from(new Set(data.linkedJournalIds || [])),
    dueDate: data.dueDate ? String(data.dueDate).slice(0, 10) : '',
  };
}

function Field({ field, value, onChange }) {
  if (field.type === 'textarea') {
    return (
      <textarea
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text placeholder:text-jarvis-muted focus:outline-none"
      />
    );
  }

  if (field.type === 'select') {
    return (
      <select
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
      >
        {field.options.map((option) => (
          <option key={option.value} value={option.value} className="bg-jarvis-panel text-jarvis-text">
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'number') {
    return (
      <input
        type="number"
        value={value ?? 0}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        min={0}
        max={100}
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
        className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text placeholder:text-jarvis-muted focus:outline-none"
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

export default function EntityForm({ initialData = {}, onSubmit, onCancel, isSubmitting = false }) {
  const activeType = useEntityStore((state) => state.activeType);
  const [formData, setFormData] = useState(() => normalizeFormState(initialData));

  const goals = useGoalStore((state) => state.goals);
  const subjects = useAcademicStore((state) => state.subjects);
  const schedules = useScheduleStore((state) => state.schedules);
  const journals = useJournalStore((state) => state.entries);

  const relationshipOptions = useMemo(() => {
    // Helper to build a title with hierarchical context
    const getGoalPath = (goal, allGoals) => {
      const parts = [goal.title];
      let current = goal;
      while (current.parentId) {
        const parent = allGoals.find((g) => g.id === current.parentId);
        if (!parent) break;
        parts.unshift(parent.title);
        current = parent;
      }
      return parts.join(' → ');
    };

    return {
      linkedGoalIds: goals.map((goal) => ({
        id: goal.id,
        title: getGoalPath(goal, goals),
      })),
      linkedSubjectIds: subjects.map((subject) => ({
        id: subject.id,
        title: subject.name || subject.title || subject.id,
      })),
      linkedScheduleIds: schedules.map((schedule) => ({
        id: schedule.id,
        title: schedule.label || schedule.title || schedule.id,
      })),
      linkedJournalIds: journals.map((entry) => ({
        id: entry.id,
        title: entry.title || entry.date || entry.id,
      })),
    };
  }, [goals, journals, schedules, subjects]);

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    if (activeType === 'repetitiveTask') {
       await onSubmit?.(event); // For repetitiveTaskForm, event IS the data
       return;
    }
    event.preventDefault();
    if (isSubmitting) return;
    await onSubmit?.(formData);
  };

  if (activeType === 'repetitiveTask') {
    return (
      <RepetitiveTaskForm 
        initialData={initialData} 
        onSubmit={onSubmit} 
        onCancel={onCancel} 
        isSubmitting={isSubmitting} 
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {taskEntityFormConfig.map((field) => (
        <label key={field.name} className="block space-y-1">
          <span className="text-xs uppercase tracking-wide text-jarvis-muted">{field.label}</span>
          <Field field={field} value={formData[field.name]} onChange={(value) => setField(field.name, value)} />
        </label>
      ))}

      <div className="grid gap-2 lg:grid-cols-2">
        <EntityLinkSelector
          label="Goals"
          entities={relationshipOptions.linkedGoalIds}
          value={formData.linkedGoalIds}
          onChange={(value) => setField('linkedGoalIds', value)}
          placeholder="Link goals"
        />
        <EntityLinkSelector
          label="Academics"
          entities={relationshipOptions.linkedSubjectIds}
          value={formData.linkedAcademicIds}
          onChange={(value) => setField('linkedAcademicIds', value)}
          placeholder="Link subjects"
        />
        <EntityLinkSelector
          label="Schedules"
          entities={relationshipOptions.linkedScheduleIds}
          value={formData.linkedScheduleIds}
          onChange={(value) => setField('linkedScheduleIds', value)}
          placeholder="Link schedules"
        />
        <EntityLinkSelector
          label="Journal"
          entities={relationshipOptions.linkedJournalIds}
          value={formData.linkedJournalIds}
          onChange={(value) => setField('linkedJournalIds', value)}
          placeholder="Link journal entries"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded border border-jarvis-border px-3 py-1.5 text-xs text-jarvis-muted transition hover:text-jarvis-text"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded border border-jarvis-border bg-white/10 px-3 py-1.5 text-xs text-jarvis-text transition hover:bg-white/15"
        >
          {isSubmitting ? 'Saving...' : 'Save Task'}
        </button>
      </div>
    </form>
  );
}
