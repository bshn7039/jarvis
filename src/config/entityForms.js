import EntityForm from '../components/forms/EntityForm';

export const taskEntityFormConfig = [
  { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Task title' },
  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What needs to be done?' },
  {
    name: 'bucket',
    label: 'Bucket',
    type: 'select',
    options: [
      { value: 'today', label: 'Today' },
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' },
      { value: 'undefined', label: 'Undefined' },
      { value: 'completed', label: 'Completed' },
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
  { name: 'category', label: 'Category', type: 'text', placeholder: 'System' },
  { name: 'progress', label: 'Progress', type: 'number' },
  { name: 'dueDate', label: 'Due Date', type: 'date' },
  { name: 'subTags', label: 'Subtags', type: 'tags', placeholder: 'jarvis,revision,gym' },
  { name: 'completionNotes', label: 'Completion Notes', type: 'textarea', placeholder: 'Lessons, blockers, outcomes...' },
];

export const entityForms = {
  task: EntityForm,
};
