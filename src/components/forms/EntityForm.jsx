import { useMemo, useState } from 'react';
import { taskEntityFormConfig } from '../../config/entityForms';
import EntityLinkSelector from '../relationships/EntityLinkSelector';
import { useGoalStore } from '../../store/goalStore';
import { useAcademicStore } from '../../store/academicStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { useJournalStore } from '../../store/journalStore';
import { useFinanceStore } from '../../store/financeStore';
import { useCrmStore } from '../../store/crmStore';

const defaultTaskValues = {
  title: '',
  description: '',
  status: 'planned',
  priority: 'medium',
  energy: 'medium',
  category: 'System',
  progress: 0,
  deadline: '',
  estimatedTime: '30m',
  tags: [],
  linkedGoalIds: [],
  linkedSubjectIds: [],
  linkedScheduleIds: [],
  linkedJournalIds: [],
  linkedFinanceIds: [],
  linkedContactIds: [],
};

function normalizeFormState(data = {}) {
  return {
    ...defaultTaskValues,
    ...data,
    progress: Number(data.progress ?? defaultTaskValues.progress),
    tags: Array.isArray(data.tags) ? data.tags : [],
    linkedGoalIds: Array.from(new Set(data.linkedGoalIds || [])),
    linkedSubjectIds: Array.from(new Set(data.linkedSubjectIds || [])),
    linkedScheduleIds: Array.from(new Set(data.linkedScheduleIds || [])),
    linkedJournalIds: Array.from(new Set(data.linkedJournalIds || [])),
    linkedFinanceIds: Array.from(new Set(data.linkedFinanceIds || [])),
    linkedContactIds: Array.from(new Set(data.linkedContactIds || [])),
    deadline: data.deadline ? String(data.deadline).slice(0, 10) : '',
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

export default function EntityForm({ initialData = {}, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(() => normalizeFormState(initialData));

  const goals = useGoalStore((state) => state.goals);
  const subjects = useAcademicStore((state) => state.subjects);
  const schedules = useScheduleStore((state) => state.schedules);
  const journals = useJournalStore((state) => state.entries);
  const financeEntries = useFinanceStore((state) => state.transactions);
  const contacts = useCrmStore((state) => state.contacts);

  const relationshipOptions = useMemo(
    () => ({
      linkedGoalIds: goals.map((goal) => ({ id: goal.id, title: goal.title || goal.name || goal.id })),
      linkedSubjectIds: subjects.map((subject) => ({ id: subject.id, title: subject.name || subject.title || subject.id })),
      linkedScheduleIds: schedules.map((schedule) => ({ id: schedule.id, title: schedule.label || schedule.title || schedule.id })),
      linkedJournalIds: journals.map((entry) => ({ id: entry.id, title: entry.title || entry.date || entry.id })),
      linkedFinanceIds: financeEntries.map((entry) => ({ id: entry.id, title: entry.note || entry.category || entry.id })),
      linkedContactIds: contacts.map((contact) => ({ id: contact.id, title: contact.name || contact.title || contact.id })),
    }),
    [contacts, financeEntries, goals, journals, schedules, subjects],
  );

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit?.(formData);
  };

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
          value={formData.linkedSubjectIds}
          onChange={(value) => setField('linkedSubjectIds', value)}
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
        <EntityLinkSelector
          label="Finance"
          entities={relationshipOptions.linkedFinanceIds}
          value={formData.linkedFinanceIds}
          onChange={(value) => setField('linkedFinanceIds', value)}
          placeholder="Link finance entries"
        />
        <EntityLinkSelector
          label="Contacts"
          entities={relationshipOptions.linkedContactIds}
          value={formData.linkedContactIds}
          onChange={(value) => setField('linkedContactIds', value)}
          placeholder="Link contacts"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-jarvis-border px-3 py-1.5 text-xs text-jarvis-muted transition hover:text-jarvis-text"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded border border-jarvis-border bg-white/10 px-3 py-1.5 text-xs text-jarvis-text transition hover:bg-white/15"
        >
          Save Task
        </button>
      </div>
    </form>
  );
}
