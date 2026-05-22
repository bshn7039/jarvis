// Declarative form configs. Extend per-entity in app code without editing UI.

export const taskForm = [
  { name: 'title', label: 'Title', type: 'text', placeholder: 'Task title' },
  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Notes' },
  { name: 'priority', label: 'Priority', type: 'select', options: [{ value: 'low', label: 'Low' }, { value: 'med', label: 'Medium' }, { value: 'high', label: 'High' }] },
  { name: 'dueDate', label: 'Due date', type: 'date' },
  { name: 'linkedGoalIds', label: 'Goals', type: 'entityLink' },
  { name: 'tags', label: 'Tags', type: 'tags' },
];

export const goalForm = [
  { name: 'title', label: 'Title', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
  { name: 'targetDate', label: 'Target date', type: 'date' },
  { name: 'priority', label: 'Priority', type: 'select', options: [{ value: 'low', label: 'Low' }, { value: 'med', label: 'Medium' }, { value: 'high', label: 'High' }] },
];

export default { taskForm, goalForm };
