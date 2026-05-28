import { useMemo, useState, useEffect } from 'react';
import { 
  taskEntityFormConfig, 
  crmEntityFormConfig, 
  journalEntityFormConfig,
  academicSkillFormConfig,
  academicProjectFormConfig,
  academicTechStackFormConfig,
  academicLearningFormConfig,
  academicDsaFormConfig,
  academicDsaProgressFormConfig,
  academicCertificationFormConfig,
  academicPortfolioFormConfig,
  academicSubjectFormConfig,
  profileEntityFormConfig,
  selfCareFormConfig,
  communicationFormConfig,
  socialGrowthFormConfig,
  publicPersonaFormConfig,
  musicFormConfig,
  writingFormConfig,
  readingFormConfig,
  vaultFormConfig
} from '../../config/entityForms';
import EntityLinkSelector from '../relationships/EntityLinkSelector';
import { useGoalStore } from '../../store/goalStore';
import { useAcademicStore } from '../../store/academicStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { useJournalStore } from '../../store/journalStore';
import { useCrmStore } from '../../store/crmStore';
import { useEntityStore } from '../../store/entityStore';
import { usePersonalStore } from '../../store/personalStore';
import RepetitiveTaskForm from './RepetitiveTaskForm';

const configs = {
  task: taskEntityFormConfig,
  crm: crmEntityFormConfig,
  journal: journalEntityFormConfig,
  skill: academicSkillFormConfig,
  project: academicProjectFormConfig,
  techStack: academicTechStackFormConfig,
  activeLearning: academicLearningFormConfig,
  dsa: academicDsaFormConfig,
  dsaProgress: academicDsaProgressFormConfig,
  certification: academicCertificationFormConfig,
  portfolio: academicPortfolioFormConfig,
  subject: academicSubjectFormConfig,
  profile: profileEntityFormConfig,
  selfCare: selfCareFormConfig,
  communication: communicationFormConfig,
  socialGrowth: socialGrowthFormConfig,
  publicPersona: publicPersonaFormConfig,
  music: musicFormConfig,
  writing: writingFormConfig,
  reading: readingFormConfig,
  vault: vaultFormConfig,
};

const defaultValues = {
  task: {
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
    linkedJournalIds: [],
  },
  crm: {
    name: '',
    nickname: '',
    relationshipType: 'professional',
    phone: '',
    email: '',
    socialLinks: [],
    birthday: '',
    location: '',
    notes: '',
    tags: [],
    priority: 'medium',
    lastInteraction: '',
    linkedGoalIds: [],
    linkedAcademicIds: [],
    linkedScheduleIds: [],
    linkedJournalIds: [],
  },
  journal: {
    title: '',
    entryDate: new Date().toISOString().slice(0, 10),
    type: 'Reflection',
    mood: 5,
    tags: [],
    aspects: [],
    linkedGoalIds: [],
    linkedAcademicIds: [],
    linkedScheduleIds: [],
    linkedJournalIds: [],
  },
  skill: { name: '', category: 'General', progress: 0, difficulty: 'Medium', status: 'Learning', notes: '' },
  project: { name: '', description: '', stack: '', status: 'idea', progress: 0, github: '', link: '', roadmap: '', notes: '' },
  techStack: { name: '', category: 'General', proficiency: 'Beginner', currentlyLearning: true, notes: '' },
  activeLearning: { topic: '', source: '', progress: 0, consistency: 0, notes: '' },
  dsa: { title: '', platform: 'LeetCode', difficulty: 'Easy', notes: '', date: new Date().toISOString().slice(0, 10) },
  dsaProgress: { targetProblems: 0, currentTopic: '', weakTopics: [] },
  certification: { course: '', platform: '', progress: 0, status: 'In Progress', certificateLink: '', notes: '' },
  portfolio: { title: '', link: '', notes: '' },
  subject: { name: '', code: '', credits: 3, instructor: 'TBD', category: 'Core', status: 'Ongoing', syllabus: '', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [], internalMarks: '', practicals: '', vivaPrep: '' },
  profile: {},
  selfCare: { title: '', description: '', frequency: 'Daily', status: 'pending', notes: '', tags: [] },
  communication: { title: '', subType: 'practice', duration: '', difficulty: 'Medium', progress: 0, notes: [] },
  socialGrowth: { title: '', reflection: '', confidenceRating: 5, outcome: '', tags: [] },
  publicPersona: { platform: 'LinkedIn', objective: '', status: 'Planning', links: [], notes: '' },
  music: { title: '', subType: 'Singing', duration: '', difficulty: 'Medium', progress: 0, notes: '' },
  writing: { title: '', content: '', mood: '', tags: [] },
  reading: { title: '', author: '', status: 'Want to Read', progress: 0, rating: 0, summary: '', notes: '', startedAt: '', completedAt: '' },
  vault: { title: '', content: '', priority: 'medium', tags: [] },
};


function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function setNestedValue(obj, path, value) {
  const parts = path.split('.');
  const lastPart = parts.pop();
  const target = parts.reduce((acc, part) => {
    if (!acc[part]) acc[part] = {};
    return acc[part];
  }, obj);
  target[lastPart] = value;
  return { ...obj };
}

function normalizeFormState(type, data) {
  const safeData = data || {};
  const defaults = defaultValues[type] || {};
  const normalized = {
    ...defaults,
    ...safeData,
  };

  // Type specific normalizations
  if (type === 'task') {
    normalized.progress = Number(safeData.progress ?? defaults.progress);
    normalized.subTags = Array.isArray(safeData.subTags) ? safeData.subTags : [];
    normalized.dueDate = safeData.dueDate ? String(safeData.dueDate).slice(0, 10) : '';
  }
  
  if (type === 'crm') {
    normalized.socialLinks = Array.isArray(safeData.socialLinks) ? safeData.socialLinks : [];
    normalized.tags = Array.isArray(safeData.tags) ? safeData.tags : [];
    normalized.birthday = safeData.birthday ? String(safeData.birthday).slice(0, 10) : '';
    normalized.lastInteraction = safeData.lastInteraction ? String(safeData.lastInteraction).slice(0, 10) : '';
  }

  // Common relationship normalization
  normalized.linkedGoalIds = Array.from(new Set(safeData.linkedGoalIds || []));
  normalized.linkedAcademicIds = Array.from(new Set(safeData.linkedAcademicIds || safeData.linkedSubjectIds || []));
  normalized.linkedScheduleIds = Array.from(new Set(safeData.linkedScheduleIds || []));
  normalized.linkedJournalIds = Array.from(new Set(safeData.linkedJournalIds || []));

  return normalized;
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

  if (field.type === 'checkbox') {
    return (
      <div className="flex h-10 items-center">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 rounded border-jarvis-border bg-black/25 text-jarvis-accent focus:ring-0 focus:ring-offset-0"
        />
        <span className="ml-2 text-xs text-jarvis-muted">{field.placeholder || ''}</span>
      </div>
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
  const mode = useEntityStore((state) => state.mode);
  const [formData, setFormData] = useState(() => normalizeFormState(activeType, initialData));

  useEffect(() => {
    setFormData(normalizeFormState(activeType, initialData));
  }, [activeType, initialData]);

  const goals = useGoalStore((state) => state.goals);
  const subjects = useAcademicStore((state) => state.subjects);
  const schedules = useScheduleStore((state) => state.schedules);
  const journals = useJournalStore((state) => state.entries);

  const relationshipOptions = useMemo(() => {
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
        date: entry.entryDate || entry.date,
      })),
    };
  }, [goals, journals, schedules, subjects]);

  const setField = (name, value) => {
    if (name.includes('.')) {
      setFormData((prev) => setNestedValue({ ...prev }, name, value));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event) => {
    if (activeType === 'repetitiveTask') {
       await onSubmit?.(event);
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

  if (mode === 'view') {
    return (
      <div className="space-y-4">
        <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-jarvis-border bg-black/20 p-4 text-sm leading-relaxed text-jarvis-text whitespace-pre-wrap">
          {formData.notes || <span className="italic text-jarvis-muted">No notes available.</span>}
        </div>
        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-jarvis-border px-3 py-1.5 text-xs text-jarvis-text transition hover:bg-white/5"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'notes') {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-wide text-jarvis-muted">Quick Notes / Relationship Log</span>
          <textarea
            value={formData.notes || ''}
            onChange={(event) => setField('notes', event.target.value)}
            rows={15}
            placeholder="Write detailed notes here..."
            className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text placeholder:text-jarvis-muted focus:outline-none"
            autoFocus
          />
        </label>
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
            {isSubmitting ? 'Saving...' : 'Update Notes'}
          </button>
        </div>
      </form>
    );
  }

  const config = configs[activeType] || taskEntityFormConfig;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-x-4 gap-y-3 md:grid-cols-2">
        {config.map((field) => (
          <label key={field.name} className={`block space-y-1 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
            <span className="text-xs uppercase tracking-wide text-jarvis-muted">{field.label}</span>
            <Field field={field} value={field.name.includes('.') ? getNestedValue(formData, field.name) : formData[field.name]} onChange={(value) => setField(field.name, value)} />
          </label>
        ))}
      </div>

      {['task', 'crm', 'journal'].includes(activeType) && (
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
            label="Journal"
            entities={relationshipOptions.linkedJournalIds}
            value={formData.linkedJournalIds}
            onChange={(value) => setField('linkedJournalIds', value)}
            placeholder="Link journal entries"
            groupByDate
          />
        </div>
      )}

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
          {isSubmitting ? 'Saving...' : `Save ${activeType.charAt(0).toUpperCase() + activeType.slice(1)}`}
        </button>
      </div>
    </form>
  );
}
