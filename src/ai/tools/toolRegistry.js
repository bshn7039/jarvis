import { useTaskStore } from '../../store/taskStore';
import { useGoalStore } from '../../store/goalStore';
import { useJournalStore } from '../../store/journalStore';
import { useFitnessStore } from '../../store/fitnessStore';
import { useCrmStore } from '../../store/crmStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { useFinanceStore } from '../../store/financeStore';
import { useMutualFundStore } from '../../store/mutualFundStore';
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
  deleteTransaction: 'delete_finance_transaction',
  updateTransaction: 'update_finance_transaction',
  saveMoney: 'create_savings_transfer',
  bulkCreateTransactions: 'bulk_create_finance_transactions',
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
  create_savings_transfer: PERMISSION_LEVELS.SAFE_WRITE,
  bulk_create_finance_transactions: PERMISSION_LEVELS.SAFE_WRITE,
  
  create_mutual_fund: PERMISSION_LEVELS.SAFE_WRITE,
  add_mutual_fund_purchase: PERMISSION_LEVELS.SAFE_WRITE,
  delete_mutual_fund: PERMISSION_LEVELS.CONFIRM_REQUIRED,
  delete_mutual_fund_purchase: PERMISSION_LEVELS.CONFIRM_REQUIRED,
  
  add_to_daily_schedule: PERMISSION_LEVELS.SAFE_WRITE,
  update_daily_schedule_item: PERMISSION_LEVELS.SAFE_WRITE,
  delete_from_daily_schedule_item: PERMISSION_LEVELS.SAFE_WRITE,
  reset_daily_schedule: PERMISSION_LEVELS.SAFE_WRITE,
  
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
  },
  {
    type: 'function',
    function: {
      name: 'bulk_create_finance_transactions',
      description: 'Bulk import/create multiple credit/debit transaction logs at once.',
      parameters: {
        type: 'object',
        properties: {
          transactions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Description of the transaction' },
                amount: { type: 'number', description: 'Financial amount' },
                type: { type: 'string', enum: ['credit', 'debit'] },
                category: { type: 'string', description: 'E.g. Food, Rent, Education, Dividend' },
                account: { type: 'string', description: 'Account source/destination, e.g. Checking, Cash, Savings, Credit Card' },
                transactionDate: { type: 'string', description: 'YYYY-MM-DD format' }
              },
              required: ['title', 'amount', 'type', 'category', 'account']
            }
          }
        },
        required: ['transactions']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_finance_transaction',
      description: 'Update an existing finance transaction details.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The unique transaction ID to update' },
          updates: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              amount: { type: 'number' },
              type: { type: 'string', enum: ['credit', 'debit'] },
              category: { type: 'string' },
              account: { type: 'string' },
              transactionDate: { type: 'string', description: 'YYYY-MM-DD' }
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
      name: 'delete_finance_transaction',
      description: 'Delete a finance transaction. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Transaction ID' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_savings_transfer',
      description: 'Transfer / Save money from an account into the savings account.',
      parameters: {
        type: 'object',
        properties: {
          amount: { type: 'number', description: 'The savings transfer amount' },
          fromAccount: { type: 'string', description: 'Source account, e.g. checking, cash' },
          transactionDate: { type: 'string', description: 'YYYY-MM-DD format (optional)' },
          note: { type: 'string', description: 'Description/Note for the transfer' }
        },
        required: ['amount', 'fromAccount']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_to_daily_schedule',
      description: "Add a new slot or routine directly into the Command Center's Today Schedule.",
      parameters: {
        type: 'object',
        properties: {
          time: { type: 'string', description: 'Scheduled time in 24h HH:MM format, e.g. "08:00" or "22:30"' },
          label: { type: 'string', description: 'Label/description of the scheduled activity' },
          category: { type: 'string', enum: ['Coding', 'Academics', 'Journal', 'Gym', 'Fitness', 'Routines', 'Personal'], description: 'Activity category' }
        },
        required: ['time', 'label']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_daily_schedule_item',
      description: "Update an existing item inside Today's AI Schedule.",
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Schedule item ID (e.g. sched-wakeup or sched-usr-12345)' },
          updates: {
            type: 'object',
            properties: {
              time: { type: 'string', description: 'HH:MM format' },
              label: { type: 'string' },
              category: { type: 'string', enum: ['Coding', 'Academics', 'Journal', 'Gym', 'Fitness', 'Routines', 'Personal'] },
              status: { type: 'string', enum: ['upcoming', 'active', 'done'] }
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
      name: 'delete_from_daily_schedule_item',
      description: "Remove/Delete an item from Today's AI Schedule.",
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID of the schedule item to delete' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_mutual_fund',
      description: 'Create a new mutual fund tracking entry with one or more initial purchases.',
      parameters: {
        type: 'object',
        properties: {
          schemeName: { type: 'string', description: 'Name of the mutual fund scheme, e.g. Nippon India Small Cap Fund Direct Growth' },
          schemeCode: { type: 'string', description: 'MFAPI scheme code, e.g. "118778"' },
          purchase: {
            type: 'object',
            description: 'A single initial purchase/SIP detail for the fund',
            properties: {
              date: { type: 'string', description: 'Date of the purchase in YYYY-MM-DD format' },
              amount: { type: 'number', description: 'Amount invested in ₹' },
              nav: { type: 'number', description: 'NAV price at purchase time in ₹' }
            },
            required: ['date', 'amount', 'nav']
          },
          purchases: {
            type: 'array',
            description: 'Multiple initial purchases/SIPs details for the fund',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string', description: 'Date of the purchase in YYYY-MM-DD format' },
                amount: { type: 'number', description: 'Amount invested in ₹' },
                nav: { type: 'number', description: 'NAV price at purchase time in ₹' }
              },
              required: ['date', 'amount', 'nav']
            }
          }
        },
        required: ['schemeName', 'schemeCode']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_mutual_fund_purchase',
      description: 'Add one or more new purchases (SIP or lumpsum) to an existing mutual fund tracking entry.',
      parameters: {
        type: 'object',
        properties: {
          fundId: { type: 'string', description: 'The ID of the existing mutual fund entry' },
          purchase: {
            type: 'object',
            description: 'A single purchase/SIP detail to add',
            properties: {
              date: { type: 'string', description: 'Date of the purchase in YYYY-MM-DD format' },
              amount: { type: 'number', description: 'Amount invested in ₹' },
              nav: { type: 'number', description: 'NAV price at purchase time in ₹' }
            },
            required: ['date', 'amount', 'nav']
          },
          purchases: {
            type: 'array',
            description: 'Multiple purchases/SIPs details to add',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string', description: 'Date of the purchase in YYYY-MM-DD format' },
                amount: { type: 'number', description: 'Amount invested in ₹' },
                nav: { type: 'number', description: 'NAV price at purchase time in ₹' }
              },
              required: ['date', 'amount', 'nav']
            }
          }
        },
        required: ['fundId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_mutual_fund',
      description: 'Delete a mutual fund tracking entry entirely by its ID. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          fundId: { type: 'string', description: 'ID of the mutual fund to delete' }
        },
        required: ['fundId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_mutual_fund_purchase',
      description: 'Delete a specific purchase entry from a mutual fund. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          fundId: { type: 'string', description: 'ID of the mutual fund' },
          purchaseId: { type: 'string', description: 'ID of the purchase to delete' }
        },
        required: ['fundId', 'purchaseId']
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

    case 'bulk_create_finance_transactions': {
      const store = useFinanceStore.getState();
      let txns = [];
      if (Array.isArray(sanitizedArgs.transactions)) {
        txns = sanitizedArgs.transactions;
      } else if (sanitizedArgs.transactions && typeof sanitizedArgs.transactions === 'object') {
        txns = [sanitizedArgs.transactions];
      } else if (Array.isArray(sanitizedArgs)) {
        txns = sanitizedArgs;
      } else if (sanitizedArgs.title && sanitizedArgs.amount) {
        txns = [sanitizedArgs];
      }
      
      const added = [];
      for (const t of txns) {
        // Enforce account as "Cash" if requested
        const enriched = { ...t, account: t.account || 'Cash' };
        const transaction = await store.addTransaction(enriched);
        added.push(transaction);
      }
      return { 
        success: true, 
        message: `Successfully bulk recorded ${added.length} transaction(s).`, 
        entityId: added[0]?.id || 'bulk' 
      };
    }

    case 'update_finance_transaction': {
      const store = useFinanceStore.getState();
      const existing = store.transactions.find(t => t.id === sanitizedArgs.id);
      if (!existing) {
        return { success: false, message: `Transaction with ID ${sanitizedArgs.id} not found.` };
      }
      await store.updateTransaction(sanitizedArgs.id, sanitizedArgs.updates);
      return { success: true, message: `Financial transaction '${existing.title}' updated successfully.`, entityId: sanitizedArgs.id };
    }

    case 'delete_finance_transaction': {
      const store = useFinanceStore.getState();
      const existing = store.transactions.find(t => t.id === sanitizedArgs.id);
      if (!existing) {
        return { success: false, message: `Transaction with ID ${sanitizedArgs.id} not found.` };
      }
      await store.deleteTransaction(sanitizedArgs.id);
      return { success: true, message: `Financial transaction '${existing.title}' deleted successfully.` };
    }

    case 'create_savings_transfer': {
      const store = useFinanceStore.getState();
      const result = await store.saveMoney(sanitizedArgs);
      return { success: true, message: `Successfully transferred ₹${sanitizedArgs.amount} from '${sanitizedArgs.fromAccount}' to savings account.`, entityId: result.savedDebit.id };
    }

    case 'create_mutual_fund': {
      const store = useMutualFundStore.getState();
      const fund = await store.addFund(sanitizedArgs);
      return { success: true, message: `Mutual Fund '${fund.schemeName}' created successfully with ID ${fund.id}`, entityId: fund.id };
    }

    case 'add_mutual_fund_purchase': {
      const store = useMutualFundStore.getState();
      const purchaseOrPurchases = sanitizedArgs.purchases || sanitizedArgs.purchase;
      await store.addPurchase(sanitizedArgs.fundId, purchaseOrPurchases);
      const fund = store.funds.find(f => f.id === sanitizedArgs.fundId);
      const count = Array.isArray(purchaseOrPurchases) ? purchaseOrPurchases.length : 1;
      return { success: true, message: `Successfully added ${count} purchase(s) to Mutual Fund '${fund?.schemeName || sanitizedArgs.fundId}'.`, entityId: sanitizedArgs.fundId };
    }

    case 'delete_mutual_fund': {
      const store = useMutualFundStore.getState();
      const fund = store.funds.find(f => f.id === sanitizedArgs.fundId);
      await store.deleteFund(sanitizedArgs.fundId);
      return { success: true, message: `Mutual Fund '${fund?.schemeName || sanitizedArgs.fundId}' deleted successfully.` };
    }

    case 'delete_mutual_fund_purchase': {
      const store = useMutualFundStore.getState();
      const fund = store.funds.find(f => f.id === sanitizedArgs.fundId);
      await store.deletePurchase(sanitizedArgs.fundId, sanitizedArgs.purchaseId);
      return { success: true, message: `Purchase ID '${sanitizedArgs.purchaseId}' deleted from Mutual Fund '${fund?.schemeName || sanitizedArgs.fundId}'.` };
    }

    case 'add_to_daily_schedule': {
      const { useAiStore } = await import('../../store/aiStore');
      useAiStore.getState().addToSchedule(sanitizedArgs);
      return { success: true, message: `Added '${sanitizedArgs.label}' at ${sanitizedArgs.time} to Today's Schedule.` };
    }

    case 'update_daily_schedule_item': {
      const { useAiStore } = await import('../../store/aiStore');
      useAiStore.getState().updateScheduleItem(sanitizedArgs.id, sanitizedArgs.updates);
      return { success: true, message: `Updated schedule item '${sanitizedArgs.id}' details.` };
    }

    case 'delete_from_daily_schedule_item': {
      const { useAiStore } = await import('../../store/aiStore');
      useAiStore.getState().deleteScheduleItem(sanitizedArgs.id);
      return { success: true, message: `Deleted schedule item '${sanitizedArgs.id}' from Today's Schedule.` };
    }

    case 'reset_daily_schedule': {
      const { useAiStore } = await import('../../store/aiStore');
      useAiStore.getState().resetSchedule();
      return { success: true, message: "Reset Today's Schedule to default Wake up (8:00 AM) and Sleep (12:00 AM) rhythm." };
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

  if (name === 'update_finance_transaction' && clean.updates) {
    if (clean.updates.amount !== undefined) clean.updates.amount = Math.max(0.01, Number(clean.updates.amount) || 0);
    if (clean.updates.title) clean.updates.title = clean.updates.title.slice(0, 100);
  }

  if (name === 'create_savings_transfer') {
    if (clean.amount !== undefined) clean.amount = Math.max(0.01, Number(clean.amount) || 0);
    if (clean.note) clean.note = clean.note.slice(0, 100);
  }

  if (name === 'create_mutual_fund') {
    if (clean.schemeName) clean.schemeName = clean.schemeName.slice(0, 150);
    if (clean.schemeCode) clean.schemeCode = String(clean.schemeCode).slice(0, 20);
    if (clean.purchase) {
      clean.purchase.amount = Math.max(0.01, Number(clean.purchase.amount) || 0);
      clean.purchase.nav = Math.max(0.0001, Number(clean.purchase.nav) || 0);
      if (clean.purchase.date) clean.purchase.date = clean.purchase.date.slice(0, 10);
    }
    if (Array.isArray(clean.purchases)) {
      clean.purchases = clean.purchases.map(p => {
        const cleanP = { ...p };
        cleanP.amount = Math.max(0.01, Number(cleanP.amount) || 0);
        cleanP.nav = Math.max(0.0001, Number(cleanP.nav) || 0);
        if (cleanP.date) cleanP.date = cleanP.date.slice(0, 10);
        return cleanP;
      });
    }
  }

  if (name === 'add_mutual_fund_purchase') {
    if (clean.purchase) {
      clean.purchase.amount = Math.max(0.01, Number(clean.purchase.amount) || 0);
      clean.purchase.nav = Math.max(0.0001, Number(clean.purchase.nav) || 0);
      if (clean.purchase.date) clean.purchase.date = clean.purchase.date.slice(0, 10);
    }
    if (Array.isArray(clean.purchases)) {
      clean.purchases = clean.purchases.map(p => {
        const cleanP = { ...p };
        cleanP.amount = Math.max(0.01, Number(cleanP.amount) || 0);
        cleanP.nav = Math.max(0.0001, Number(cleanP.nav) || 0);
        if (cleanP.date) cleanP.date = cleanP.date.slice(0, 10);
        return cleanP;
      });
    }
  }

  return clean;
}
