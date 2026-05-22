import EntityForm from '../components/forms/EntityForm';

export const taskEntityFormConfig = [
  { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Task title' },
  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What needs to be done?' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'backlog', label: 'Backlog' },
      { value: 'planned', label: 'Planned' },
      { value: 'active', label: 'Active' },
      { value: 'paused', label: 'Paused' },
      { value: 'completed', label: 'Completed' },
      { value: 'archived', label: 'Archived' },
    ],
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ],
  },
  {
    name: 'energy',
    label: 'Energy',
    type: 'select',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'deep', label: 'Deep' },
    ],
  },
  { name: 'category', label: 'Category', type: 'text', placeholder: 'System' },
  { name: 'progress', label: 'Progress', type: 'number' },
  { name: 'estimatedTime', label: 'Estimated Time', type: 'text', placeholder: '30m' },
  { name: 'deadline', label: 'Due Date', type: 'date' },
  { name: 'tags', label: 'Tags', type: 'tags', placeholder: 'comma,separated,tags' },
];

export const entityForms = {
  task: EntityForm,
};
