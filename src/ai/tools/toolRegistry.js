import { useTaskStore } from '../../store/taskStore';
import { useGoalStore } from '../../store/goalStore';
import { useJournalStore } from '../../store/journalStore';
import { useFitnessStore } from '../../store/fitnessStore';
import { useCrmStore } from '../../store/crmStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { useFinanceStore } from '../../store/financeStore';
import { trashService } from '../../database/services/trashService';

export const PERMISSION_LEVELS = {
  READ_ONLY: 'READ_ONLY',
  SAFE_WRITE: 'SAFE_WRITE',
  CONFIRM_REQUIRED: 'CONFIRM_REQUIRED',
  SYSTEM_RESTRICTED: 'SYSTEM_RESTRICTED',
};

// Map of aliases to standard snake_case tool names
export const TOOL_ALIASES = {
  createTask: 'create_task',
  updateTask: 'update_task',
  completeTask: 'complete_task',
  createGoal: 'create_goal',
  createJournalEntry: 'create_journal_entry',
  addMeal: 'log_meal',
  logWorkout: 'log_workout',
  addTransaction: 'create_finance_transaction',
  createSchedule: 'create_schedule',
  createCRMContact: 'create_crm_entry',
};

export const TOOL_PERMISSIONS = {
  create_task: PERMISSION_LEVELS.SAFE_WRITE,
  update_task: PERMISSION_LEVELS.SAFE_WRITE,
  complete_task: PERMISSION_LEVELS.SAFE_WRITE,
  delete_task: PERMISSION_LEVELS.CONFIRM_REQUIRED,
  
  create_goal: PERMISSION_LEVELS.SAFE_WRITE,
  delete_goal: PERMISSION_LEVELS.CONFIRM_REQUIRED,
  
  create_journal_entry: PERMISSION_LEVELS.SAFE_WRITE,
  delete_journal_entry: PERMISSION_LEVELS.CONFIRM_REQUIRED,
  
  log_meal: PERMISSION_LEVELS.SAFE_WRITE,
  log_workout: PERMISSION_LEVELS.SAFE_WRITE,
  
  create_crm_entry: PERMISSION_LEVELS.SAFE_WRITE,
  delete_crm_entry: PERMISSION_LEVELS.CONFIRM_REQUIRED,
  
  create_schedule: PERMISSION_LEVELS.SAFE_WRITE,
  
  create_finance_transaction: PERMISSION_LEVELS.SAFE_WRITE,
  update_finance_transaction: PERMISSION_LEVELS.SAFE_WRITE,
  delete_finance_transaction: PERMISSION_LEVELS.CONFIRM_REQUIRED,
  
  purge_all_data: PERMISSION_LEVELS.SYSTEM_RESTRICTED,
};

export const TOOL_SCHEMAS = [
  {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Create a new task or study-todo in the system.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title of the task' },
          description: { type: 'string', description: 'Detailed explanation of the task' },
          bucket: { type: 'string', enum: ['today', 'week', 'month', 'undefined'], description: 'Due bucket' },
          dueDate: { type: 'string', description: 'Due date in YYYY-MM-DD format' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          category: { type: 'string', description: 'Category (e.g. Academics, Fitness, Finance, Career)' }
        },
        required: ['title']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_task',
      description: 'Update an existing task.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The unique task ID' },
          updates: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              bucket: { type: 'string', enum: ['today', 'week', 'month', 'undefined'] },
              dueDate: { type: 'string' },
              priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
              category: { type: 'string' },
              completed: { type: 'boolean' },
              progress: { type: 'number' }
            }
          }
        },
        required: ['id', 'updates']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'complete_task',
      description: 'Complete/Mark a task done in the system.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The task ID' },
          completionNotes: { type: 'string', description: 'Optional completion notes' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_task',
      description: 'Delete a task by ID. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Task ID' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_goal',
      description: 'Create a new goal or area/objective node in the system.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title of the goal' },
          description: { type: 'string', description: 'Detailed goal description' },
          type: { type: 'string', enum: ['area', 'goal', 'objective'] },
          parentId: { type: 'string', description: 'ID of parent node if building goal tree' }
        },
        required: ['title', 'type']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_goal',
      description: 'Delete a goal. Will recursively delete all descendants. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Goal ID' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_journal_entry',
      description: 'Create a new journal reflection entry.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Journal Title' },
          content: { type: 'string', description: 'Reflection content' },
          mood: { type: 'number', description: 'Mood rating from 1 (terrible) to 10 (amazing)' },
          tags: { type: 'array', items: { type: 'string' } },
          entryDate: { type: 'string', description: 'Date of the entry YYYY-MM-DD' }
        },
        required: ['title', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'log_meal',
      description: 'Log a meal under fitness tracking.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Meal item name, e.g. "Oats & Protein Powder"' },
          meal: { type: 'string', enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'] },
          calories: { type: 'number', description: 'Calorie count' },
          protein: { type: 'number', description: 'Protein content in grams' }
        },
        required: ['title', 'calories']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'log_workout',
      description: 'Log a workout under fitness tracking.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Name of the workout routine, e.g., "Leg Day"' },
          duration: { type: 'string', description: 'Workout duration, e.g. "45m" or "1h"' },
          intensity: { type: 'string', enum: ['Low', 'Medium', 'High'] },
          exercises: { type: 'array', items: { type: 'string' }, description: 'List of exercise names/sets' }
        },
        required: ['title']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_crm_entry',
      description: 'Log a contact connection in the CRM.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Full name' },
          nickname: { type: 'string' },
          relationshipType: { type: 'string', enum: ['professional', 'personal', 'mentor', 'peer'] },
          email: { type: 'string' },
          phone: { type: 'string' },
          notes: { type: 'string', description: 'Details about this connection' },
          tags: { type: 'array', items: { type: 'string' } }
        },
        required: ['name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_schedule',
      description: 'Create an event schedule.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Schedule / event title' },
          date: { type: 'string', description: 'YYYY-MM-DD' },
          startTime: { type: 'string', description: 'HH:MM format' },
          endTime: { type: 'string', description: 'HH:MM format' },
          taskIds: { type: 'array', items: { type: 'string' }, description: 'Linked task IDs' }
        },
        required: ['title', 'date', 'startTime', 'endTime']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_finance_transaction',
      description: 'Create a credit/debit transaction log.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Description of the transaction' },
          amount: { type: 'number', description: 'Financial amount' },
          type: { type: 'string', enum: ['credit', 'debit'] },
          category: { type: 'string', description: 'E.g. Food, Rent, Education, Dividend' },
          account: { type: 'string', description: 'Account source/destination, e.g. Cash, Savings, Credit Card' },
          transactionDate: { type: 'string', description: 'YYYY-MM-DD format' }
        },
        required: ['title', 'amount', 'type', 'category', 'account']
      }
    }
  }
];

export async function executeToolAction(name, args) {
  // Resolve alias if mapped
  const resolvedName = TOOL_ALIASES[name] || name;

  const perm = TOOL_PERMISSIONS[resolvedName];
  if (!perm) {
    throw new Error(`Tool '${name}' (resolved as '${resolvedName}') is not registered.`);
  }

  if (perm === PERMISSION_LEVELS.SYSTEM_RESTRICTED) {
    throw new Error(`Action '${name}' is restricted by system security policies.`);
  }

  const sanitizedArgs = sanitizeToolArgs(resolvedName, args);

  switch (resolvedName) {
    case 'create_task': {
      const store = useTaskStore.getState();
      const task = await store.createTask(sanitizedArgs);
      return { success: true, message: `Task '${task.title}' created successfully with ID ${task.id}`, entityId: task.id };
    }
    
    case 'update_task': {
      const store = useTaskStore.getState();
      const existing = store.tasks.find(t => t.id === sanitizedArgs.id);
      if (!existing) {
        return { success: false, message: `Task with ID ${sanitizedArgs.id} not found.` };
      }
      await trashService.createSnapshot('tasks', existing, 'modified');
      const updated = await store.updateTask(sanitizedArgs.id, sanitizedArgs.updates);
      return { success: true, message: `Task '${updated.title}' updated successfully.`, entityId: updated.id };
    }

    case 'complete_task': {
      const store = useTaskStore.getState();
      const existing = store.tasks.find(t => t.id === sanitizedArgs.id);
      if (!existing) {
        return { success: false, message: `Task with ID ${sanitizedArgs.id} not found.` };
      }
      await trashService.createSnapshot('tasks', existing, 'modified');
      const completed = await store.markTaskComplete(sanitizedArgs.id, sanitizedArgs.completionNotes || '');
      return { success: true, message: `Task '${completed.title}' marked as completed.`, entityId: completed.id };
    }

    case 'delete_task': {
      const store = useTaskStore.getState();
      const existing = store.tasks.find(t => t.id === sanitizedArgs.id);
      if (!existing) {
        return { success: false, message: `Task with ID ${sanitizedArgs.id} not found.` };
      }
      await trashService.moveToTrash('tasks', existing);
      await store.deleteTask(sanitizedArgs.id);
      return { success: true, message: `Task '${existing.title}' deleted successfully.` };
    }

    case 'create_goal': {
      const store = useGoalStore.getState();
      const goal = await store.addGoal(sanitizedArgs);
      return { success: true, message: `Goal '${goal.title}' created successfully with ID ${goal.id}`, entityId: goal.id };
    }

    case 'delete_goal': {
      const store = useGoalStore.getState();
      const existing = store.goals.find(g => g.id === sanitizedArgs.id);
      if (!existing) {
        return { success: false, message: `Goal with ID ${sanitizedArgs.id} not found.` };
      }
      await trashService.moveToTrash('goals', existing);
      await store.deleteGoal(sanitizedArgs.id);
      return { success: true, message: `Goal '${existing.title}' and descendants deleted.` };
    }

    case 'create_journal_entry': {
      const store = useJournalStore.getState();
      await store.addEntry(sanitizedArgs);
      const newEntry = store.entries[0];
      return { success: true, message: `Journal entry '${sanitizedArgs.title}' created successfully.`, entityId: newEntry?.id };
    }

    case 'log_meal': {
      const store = useFitnessStore.getState();
      await store.addMealLog(sanitizedArgs);
      const newMeal = store.meals[0];
      return { success: true, message: `Logged meal '${sanitizedArgs.title}' with ${sanitizedArgs.calories} kcal.`, entityId: newMeal?.id };
    }

    case 'log_workout': {
      const store = useFitnessStore.getState();
      await store.addWorkoutLog(sanitizedArgs);
      const newWorkout = store.workouts[0];
      return { success: true, message: `Logged workout '${sanitizedArgs.title}' (${sanitizedArgs.duration}).`, entityId: newWorkout?.id };
    }

    case 'create_crm_entry': {
      const store = useCrmStore.getState();
      await store.addContact(sanitizedArgs);
      const newContact = store.contacts[0];
      return { success: true, message: `CRM Contact '${sanitizedArgs.name}' logged successfully.`, entityId: newContact?.id };
    }

    case 'create_schedule': {
      const store = useScheduleStore.getState();
      const nextSchedule = {
        id: `sch-${Date.now()}`,
        ...sanitizedArgs
      };
      await store.addSchedule(nextSchedule);
      return { success: true, message: `Schedule event '${sanitizedArgs.title}' added.`, entityId: nextSchedule.id };
    }

    case 'create_finance_transaction': {
      const store = useFinanceStore.getState();
      const transaction = await store.addTransaction(sanitizedArgs);
      return { success: true, message: `Financial transaction '${transaction.title}' added. Current monthly spending is now $${useFinanceStore.getState().balanceOverview.monthlySpending}`, entityId: transaction.id };
    }

    default:
      throw new Error(`Tool execution for '${resolvedName}' (requested as '${name}') is not implemented.`);
  }
}

function sanitizeToolArgs(name, args) {
  const clean = JSON.parse(JSON.stringify(args));
  
  if (name === 'create_task' || name === 'update_task') {
    if (clean.title) clean.title = clean.title.slice(0, 100);
    if (clean.description) clean.description = clean.description.slice(0, 500);
  }
  
  if (name === 'create_journal_entry') {
    if (clean.title) clean.title = clean.title.slice(0, 100);
    if (clean.content) clean.content = clean.content.slice(0, 2000);
    if (clean.mood !== undefined) {
      clean.mood = Math.max(1, Math.min(10, Number(clean.mood) || 5));
    }
  }

  if (name === 'log_meal') {
    if (clean.title) clean.title = clean.title.slice(0, 100);
    if (clean.calories !== undefined) clean.calories = Math.max(0, Number(clean.calories) || 0);
    if (clean.protein !== undefined) clean.protein = Math.max(0, Number(clean.protein) || 0);
  }

  if (name === 'create_finance_transaction') {
    if (clean.amount !== undefined) clean.amount = Math.max(0.01, Number(clean.amount) || 0);
    if (clean.title) clean.title = clean.title.slice(0, 100);
  }

  return clean;
}
