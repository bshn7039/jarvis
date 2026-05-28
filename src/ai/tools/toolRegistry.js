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
  update_goal: PERMISSION_LEVELS.SAFE_WRITE,
  delete_goal: PERMISSION_LEVELS.CONFIRM_REQUIRED,
  
  create_journal_entry: PERMISSION_LEVELS.SAFE_WRITE,
  update_journal_entry: PERMISSION_LEVELS.SAFE_WRITE,
  delete_journal_entry: PERMISSION_LEVELS.CONFIRM_REQUIRED,
  
  log_meal: PERMISSION_LEVELS.SAFE_WRITE,
  log_workout: PERMISSION_LEVELS.SAFE_WRITE,
  log_hydration: PERMISSION_LEVELS.SAFE_WRITE,
  delete_fitness_log: PERMISSION_LEVELS.CONFIRM_REQUIRED,
  update_fitness_log: PERMISSION_LEVELS.SAFE_WRITE,
  
  create_crm_entry: PERMISSION_LEVELS.SAFE_WRITE,
  update_crm_entry: PERMISSION_LEVELS.SAFE_WRITE,
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
  
  spotify_play: PERMISSION_LEVELS.SAFE_WRITE,
  spotify_pause: PERMISSION_LEVELS.SAFE_WRITE,
  spotify_next: PERMISSION_LEVELS.SAFE_WRITE,
  spotify_prev: PERMISSION_LEVELS.SAFE_WRITE,
  spotify_search_and_play: PERMISSION_LEVELS.SAFE_WRITE,
  spotify_add_to_queue: PERMISSION_LEVELS.SAFE_WRITE,

  // Academics operational capabilities
  create_academic_subject: PERMISSION_LEVELS.SAFE_WRITE,
  update_academic_subject: PERMISSION_LEVELS.SAFE_WRITE,
  delete_academic_subject: PERMISSION_LEVELS.CONFIRM_REQUIRED,
  create_academic_skill: PERMISSION_LEVELS.SAFE_WRITE,
  update_academic_skill: PERMISSION_LEVELS.SAFE_WRITE,
  delete_academic_skill: PERMISSION_LEVELS.CONFIRM_REQUIRED,
  create_academic_project: PERMISSION_LEVELS.SAFE_WRITE,
  update_academic_project: PERMISSION_LEVELS.SAFE_WRITE,
  delete_academic_project: PERMISSION_LEVELS.CONFIRM_REQUIRED,
  create_academic_tech_stack: PERMISSION_LEVELS.SAFE_WRITE,
  update_academic_tech_stack: PERMISSION_LEVELS.SAFE_WRITE,
  delete_academic_tech_stack: PERMISSION_LEVELS.CONFIRM_REQUIRED,
  create_academic_dsa: PERMISSION_LEVELS.SAFE_WRITE,
  create_academic_certification: PERMISSION_LEVELS.SAFE_WRITE,
  update_academic_certification: PERMISSION_LEVELS.SAFE_WRITE,
  delete_academic_certification: PERMISSION_LEVELS.CONFIRM_REQUIRED,

  // Personal Hub & Self Care capabilities
  create_personal_item: PERMISSION_LEVELS.SAFE_WRITE,
  update_personal_item: PERMISSION_LEVELS.SAFE_WRITE,
  delete_personal_item: PERMISSION_LEVELS.CONFIRM_REQUIRED,
  create_self_care_routine: PERMISSION_LEVELS.SAFE_WRITE,
  update_self_care_routine: PERMISSION_LEVELS.SAFE_WRITE,
  delete_self_care_routine: PERMISSION_LEVELS.CONFIRM_REQUIRED,
  complete_self_care_routine: PERMISSION_LEVELS.SAFE_WRITE,

  // Personal Roadmaps
  create_roadmap: PERMISSION_LEVELS.SAFE_WRITE,
  update_roadmap: PERMISSION_LEVELS.SAFE_WRITE,
  delete_roadmap: PERMISSION_LEVELS.CONFIRM_REQUIRED,
  add_roadmap_log: PERMISSION_LEVELS.SAFE_WRITE,

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
          category: { type: 'string', description: 'Category (e.g. Academics, Fitness, Finance, Career)' },
          linkedGoalIds: { type: 'array', items: { type: 'string' }, description: 'IDs of goals to link to this task' },
          linkedJournalIds: { type: 'array', items: { type: 'string' }, description: 'IDs of journal entries to link to this task' }
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
              progress: { type: 'number' },
              linkedGoalIds: { type: 'array', items: { type: 'string' }, description: 'Linked goal IDs' },
              linkedJournalIds: { type: 'array', items: { type: 'string' }, description: 'Linked journal entry IDs' }
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
      name: 'log_hydration',
      description: 'Log water intake or hydration under fitness tracking.',
      parameters: {
        type: 'object',
        properties: {
          amountMl: { type: 'number', description: 'Amount of water in milliliters (ml)' }
        },
        required: ['amountMl']
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
  },
  {
    type: 'function',
    function: {
      name: 'spotify_play',
      description: 'Start or resume music playback on Spotify. Can play a specific track, album, or playlist URI if provided.',
      parameters: {
        type: 'object',
        properties: {
          uri: { type: 'string', description: 'Optional Spotify URI to play (e.g. spotify:track:XXXX, spotify:playlist:XXXX)' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'spotify_pause',
      description: 'Pause the currently playing music on Spotify.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'spotify_next',
      description: 'Skip to the next song in the Spotify playback queue.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'spotify_prev',
      description: 'Skip to the previous song in the Spotify playback history.',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function',
    function: {
      name: 'spotify_search_and_play',
      description: 'Search for a track by song name/artist on Spotify and play the top result instantly.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query containing track name and optional artist, e.g. "Blinding Lights by The Weeknd"' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'spotify_add_to_queue',
      description: 'Add a track to the active Spotify play queue by track URI.',
      parameters: {
        type: 'object',
        properties: {
          uri: { type: 'string', description: 'The Spotify track URI to queue (must start with spotify:track:)' }
        },
        required: ['uri']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_academic_subject',
      description: 'Add a new academic subject in the active semester.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Subject name, e.g. Data Structures' },
          code: { type: 'string', description: 'Course Code, e.g. CSC301' },
          credits: { type: 'number', description: 'Number of credits (1-5)' },
          instructor: { type: 'string', description: 'Instructor name' },
          category: { type: 'string', enum: ['Core', 'Lab', 'Elective', 'Project'] },
          status: { type: 'string', enum: ['Ongoing', 'Completed'] },
          syllabus: { type: 'string', description: 'Syllabus notes or outline' }
        },
        required: ['name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_academic_subject',
      description: 'Update details of an existing academic subject card.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The subject ID' },
          updates: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              code: { type: 'string' },
              credits: { type: 'number' },
              instructor: { type: 'string' },
              category: { type: 'string', enum: ['Core', 'Lab', 'Elective', 'Project'] },
              status: { type: 'string', enum: ['Ongoing', 'Completed'] },
              attendedDays: { type: 'number' },
              totalDays: { type: 'number' },
              revisionStatus: { type: 'string', enum: ['Not Started', 'In Progress', 'Completed'] },
              weakTopics: { type: 'array', items: { type: 'string' } },
              internalMarks: { type: 'string' },
              practicals: { type: 'string' },
              vivaPrep: { type: 'string' }
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
      name: 'delete_academic_subject',
      description: 'Remove/Delete an academic subject card. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The subject ID' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_academic_skill',
      description: 'Add a professional or academic skill target.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Skill Name, e.g. Java Programming' },
          category: { type: 'string', description: 'Category, e.g. Programming, Database, Design' },
          progress: { type: 'number', description: 'Starting progress percentage (0-100)' },
          difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
          status: { type: 'string', enum: ['Learning', 'Mastered', 'On Hold'] },
          notes: { type: 'string' }
        },
        required: ['name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_academic_skill',
      description: 'Update progress or details of an academic/placement skill.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Skill ID' },
          updates: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              category: { type: 'string' },
              progress: { type: 'number' },
              difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
              status: { type: 'string', enum: ['Learning', 'Mastered', 'On Hold'] },
              notes: { type: 'string' }
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
      name: 'delete_academic_skill',
      description: 'Delete/Remove a placement or placement skill. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Skill ID' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_academic_project',
      description: 'Add a new portfolio or academic coding project in Jarvis.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Project Name' },
          description: { type: 'string' },
          stack: { type: 'string', description: 'Tech stack used, e.g. React, Node.js' },
          status: { type: 'string', enum: ['idea', 'in_progress', 'completed', 'archived'] },
          progress: { type: 'number', description: 'Progress percentage (0-100)' },
          github: { type: 'string', description: 'GitHub repo link' },
          link: { type: 'string', description: 'Live deployment link' },
          notes: { type: 'string' }
        },
        required: ['name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_academic_project',
      description: 'Update status, links, progress, or notes of a portfolio project.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Project ID' },
          updates: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              stack: { type: 'string' },
              status: { type: 'string', enum: ['idea', 'in_progress', 'completed', 'archived'] },
              progress: { type: 'number' },
              github: { type: 'string' },
              link: { type: 'string' },
              notes: { type: 'string' }
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
      name: 'delete_academic_project',
      description: 'Delete/Remove a portfolio project. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Project ID' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_academic_tech_stack',
      description: 'Add a new technology, language, or framework card.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name, e.g. React, Docker, Python' },
          category: { type: 'string', enum: ['Language', 'Framework', 'Tool', 'Database', 'Platform'] },
          proficiency: { type: 'string', enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
          currentlyLearning: { type: 'boolean' },
          notes: { type: 'string' }
        },
        required: ['name', 'category']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_academic_tech_stack',
      description: 'Update technology mastery proficiency or learning status.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Tech Stack ID' },
          updates: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              category: { type: 'string', enum: ['Language', 'Framework', 'Tool', 'Database', 'Platform'] },
              proficiency: { type: 'string', enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
              currentlyLearning: { type: 'boolean' },
              notes: { type: 'string' }
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
      name: 'delete_academic_tech_stack',
      description: 'Remove/Delete a technology card. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Tech Stack ID' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_academic_dsa',
      description: 'Log a solved Data Structures & Algorithms question / problem.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Problem name, e.g. Two Sum' },
          platform: { type: 'string', description: 'Platform, e.g. LeetCode, HackerRank' },
          difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
          notes: { type: 'string', description: 'Notes on solution pattern, time/space complexity' },
          date: { type: 'string', description: 'Date solved in YYYY-MM-DD (defaults to today)' }
        },
        required: ['title']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_academic_certification',
      description: 'Log a course or external industry certification in progress.',
      parameters: {
        type: 'object',
        properties: {
          course: { type: 'string', description: 'Course name' },
          platform: { type: 'string', description: 'E.g. Coursera, Udemy, NPTEL' },
          progress: { type: 'number', description: 'Progress percentage (0-100)' },
          status: { type: 'string', enum: ['In Progress', 'Completed', 'Planned'] },
          certificateLink: { type: 'string', description: 'Link to certificate URL' },
          notes: { type: 'string' }
        },
        required: ['course', 'platform']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_academic_certification',
      description: 'Update progress or details of an active certification.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Certification ID' },
          updates: {
            type: 'object',
            properties: {
              course: { type: 'string' },
              platform: { type: 'string' },
              progress: { type: 'number' },
              status: { type: 'string', enum: ['In Progress', 'Completed', 'Planned'] },
              certificateLink: { type: 'string' },
              notes: { type: 'string' }
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
      name: 'delete_academic_certification',
      description: 'Remove/Delete a certification entry. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Certification ID' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_personal_item',
      description: 'Add a new item to one of the Personal Hub categories (reading, writing, music, vault, socialGrowth, communication).',
      parameters: {
        type: 'object',
        properties: {
          categoryType: { type: 'string', enum: ['reading', 'writing', 'music', 'vault', 'socialGrowth', 'communication'], description: 'Personal Hub section' },
          title: { type: 'string', description: 'Title or name of the item' },
          author: { type: 'string', description: 'Author/Creator (for reading/writing/music)' },
          instrument: { type: 'string', description: 'Instrument (for music practice)' },
          genre: { type: 'string', description: 'Genre (for writing)' },
          wordCount: { type: 'number', description: 'Word count (for writing)' },
          progress: { type: 'number', description: 'Progress percentage (0-100)' },
          status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'Draft', 'Published'] },
          metricName: { type: 'string', description: 'Metric/Topic name (for socialGrowth/communication)' },
          value: { type: 'string', description: 'Metric value' },
          notes: { type: 'string' }
        },
        required: ['categoryType', 'title']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_personal_item',
      description: 'Update an existing item in Personal Hub categories.',
      parameters: {
        type: 'object',
        properties: {
          categoryType: { type: 'string', enum: ['reading', 'writing', 'music', 'vault', 'socialGrowth', 'communication'] },
          id: { type: 'string', description: 'The item ID' },
          updates: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              author: { type: 'string' },
              instrument: { type: 'string' },
              genre: { type: 'string' },
              wordCount: { type: 'number' },
              progress: { type: 'number' },
              status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'Draft', 'Published'] },
              metricName: { type: 'string' },
              value: { type: 'string' },
              notes: { type: 'string' }
            }
          }
        },
        required: ['categoryType', 'id', 'updates']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_personal_item',
      description: 'Delete/Remove an item from Personal Hub categories. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          categoryType: { type: 'string', enum: ['reading', 'writing', 'music', 'vault', 'socialGrowth', 'communication'] },
          id: { type: 'string', description: 'Item ID to delete' }
        },
        required: ['categoryType', 'id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_self_care_routine',
      description: 'Add a new self-care habit or routine (e.g. Reading Rule, Fighting Boxing Jab cross drills).',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Name of the habit/routine' },
          routineType: { type: 'string', enum: ['daily', 'weekly', 'custom'] },
          category: { type: 'string', description: 'Category, e.g. Reading, Physical, Mental' },
          status: { type: 'string', enum: ['pending', 'completed'] }
        },
        required: ['title']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_self_care_routine',
      description: 'Update an existing self-care habit or routine.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Routine ID' },
          updates: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              routineType: { type: 'string', enum: ['daily', 'weekly', 'custom'] },
              category: { type: 'string' },
              status: { type: 'string', enum: ['pending', 'completed'] }
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
      name: 'delete_self_care_routine',
      description: 'Remove/Delete a self-care habit or routine. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Routine ID' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'complete_self_care_routine',
      description: 'Toggle completion or log completion for a self-care routine habit, triggering linked task completions.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Routine ID' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_goal',
      description: 'Update an existing goal, objective, or area node (title, description, progress, completed status).',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The goal/objective/area ID' },
          updates: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              progress: { type: 'number', description: 'Progress percentage (0-100)' },
              completed: { type: 'boolean' }
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
      name: 'update_journal_entry',
      description: 'Update an existing journal entry (title, content, mood, tags).',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Journal entry ID' },
          updates: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              content: { type: 'string' },
              mood: { type: 'number', description: 'Mood 1-10' },
              tags: { type: 'array', items: { type: 'string' } }
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
      name: 'delete_journal_entry',
      description: 'Delete a journal entry permanently. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Journal entry ID' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_crm_entry',
      description: 'Update an existing CRM contact (name, phone, email, notes, tags, relationship type).',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Contact ID' },
          updates: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              nickname: { type: 'string' },
              relationshipType: { type: 'string', enum: ['professional', 'personal', 'mentor', 'peer'] },
              email: { type: 'string' },
              phone: { type: 'string' },
              notes: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              lastInteraction: { type: 'string', description: 'YYYY-MM-DD' }
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
      name: 'delete_crm_entry',
      description: 'Delete a CRM contact entry permanently. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Contact ID' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_fitness_log',
      description: 'Delete a specific fitness log entry (meal, workout, or hydration) by ID. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The fitness log entry ID' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_fitness_log',
      description: 'Update a specific fitness log entry (e.g., correct a meal\'s calories or a workout\'s duration).',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The fitness log entry ID' },
          logType: { type: 'string', enum: ['meal', 'workout'], description: 'Type of log to update' },
          updates: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              calories: { type: 'number' },
              protein: { type: 'number' },
              meal: { type: 'string', enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'] },
              duration: { type: 'string' },
              intensity: { type: 'string', enum: ['Low', 'Medium', 'High'] },
              exercises: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        required: ['id', 'logType', 'updates']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_roadmap',
      description: 'Create a new Personal Roadmap / self-improvement blueprint in JARVIS. This will also create a corresponding goal hierarchy.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Roadmap title, e.g. "Learning Chess Strategy"' },
          category: { type: 'string', description: 'Category, e.g. "Learning & Skills", "Social Confidence", "Creative"' },
          description: { type: 'string', description: 'What this roadmap is about' },
          rule: { type: 'string', description: 'The core rule or constraint for this roadmap' },
          example: { type: 'string', description: 'A concrete example of applying this roadmap' },
          microDose: { type: 'string', description: 'The smallest daily action to maintain momentum' }
        },
        required: ['title', 'category']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_roadmap',
      description: 'Update an existing Personal Roadmap details (title, description, rule, microDose, example).',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Roadmap ID' },
          updates: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              category: { type: 'string' },
              description: { type: 'string' },
              rule: { type: 'string' },
              example: { type: 'string' },
              microDose: { type: 'string' },
              active: { type: 'boolean' }
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
      name: 'delete_roadmap',
      description: 'Delete a Personal Roadmap and its associated goal hierarchy. Requires confirmation.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Roadmap ID' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_roadmap_log',
      description: 'Add a custom progress log entry to a Personal Roadmap (e.g., log a completed action, shadow session, or social challenge).',
      parameters: {
        type: 'object',
        properties: {
          roadmapId: { type: 'string', description: 'The roadmap ID' },
          logKey: { type: 'string', description: 'Log category key (e.g. "appliedActions", "shadowboxSessions", "socialChallenges", "sleepLogs", "skincareLogs")' },
          entry: {
            type: 'object',
            description: 'Log entry data',
            properties: {
              note: { type: 'string', description: 'What was done' },
              duration: { type: 'string', description: 'Duration if applicable (e.g. "5m", "15m")' },
              result: { type: 'string', description: 'Outcome or observation' }
            }
          }
        },
        required: ['roadmapId', 'logKey', 'entry']
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

    case 'update_goal': {
      const store = useGoalStore.getState();
      const existing = store.goals.find(g => g.id === sanitizedArgs.id);
      if (!existing) {
        return { success: false, message: `Goal with ID ${sanitizedArgs.id} not found.` };
      }
      await store.updateGoal(sanitizedArgs.id, sanitizedArgs.updates);
      return { success: true, message: `Goal '${existing.title}' updated successfully.`, entityId: sanitizedArgs.id };
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

    case 'update_journal_entry': {
      const store = useJournalStore.getState();
      const existing = store.entries.find(e => e.id === sanitizedArgs.id);
      if (!existing) {
        return { success: false, message: `Journal entry with ID ${sanitizedArgs.id} not found.` };
      }
      const updates = { ...sanitizedArgs.updates };
      if (updates.content) updates.content = updates.content.slice(0, 2000);
      if (updates.mood !== undefined) updates.mood = Math.max(1, Math.min(10, Number(updates.mood) || 5));
      await store.updateEntry(sanitizedArgs.id, updates);
      return { success: true, message: `Journal entry '${existing.title}' updated successfully.`, entityId: sanitizedArgs.id };
    }

    case 'delete_journal_entry': {
      const store = useJournalStore.getState();
      const existing = store.entries.find(e => e.id === sanitizedArgs.id);
      if (!existing) {
        return { success: false, message: `Journal entry with ID ${sanitizedArgs.id} not found.` };
      }
      await trashService.moveToTrash('journals', existing);
      await store.deleteEntry(sanitizedArgs.id);
      return { success: true, message: `Journal entry '${existing.title}' deleted successfully.` };
    }

    case 'log_meal': {
      const store = useFitnessStore.getState();
      await store.addMealLog(sanitizedArgs);
      const newMeal = store.meals[0];
      return { success: true, message: `Logged meal '${sanitizedArgs.title}' with ${sanitizedArgs.calories} kcal.`, entityId: newMeal?.id };
    }

    case 'log_hydration': {
      const store = useFitnessStore.getState();
      await store.addHydrationLog(sanitizedArgs.amountMl);
      return { success: true, message: `Logged ${sanitizedArgs.amountMl} ml of water intake.` };
    }

    case 'log_workout': {
      const store = useFitnessStore.getState();
      await store.addWorkoutLog(sanitizedArgs);
      const newWorkout = store.workouts[0];
      return { success: true, message: `Logged workout '${sanitizedArgs.title}' (${sanitizedArgs.duration}).`, entityId: newWorkout?.id };
    }

    case 'delete_fitness_log': {
      const store = useFitnessStore.getState();
      const allLogs = [...store.workouts, ...store.meals, ...store.hydrationLogs];
      const existing = allLogs.find(l => l.id === sanitizedArgs.id);
      if (!existing) {
        return { success: false, message: `Fitness log with ID ${sanitizedArgs.id} not found.` };
      }
      await store.deleteLog(sanitizedArgs.id);
      return { success: true, message: `Fitness log '${existing.title || existing.meal || existing.type}' deleted successfully.` };
    }

    case 'update_fitness_log': {
      const store = useFitnessStore.getState();
      const { id, logType, updates } = sanitizedArgs;
      if (logType === 'meal') {
        const existing = store.meals.find(m => m.id === id);
        if (!existing) return { success: false, message: `Meal log with ID ${id} not found.` };
        await store.updateMealLog(id, updates);
        return { success: true, message: `Meal log '${existing.title}' updated successfully.`, entityId: id };
      } else if (logType === 'workout') {
        const existing = store.workouts.find(w => w.id === id);
        if (!existing) return { success: false, message: `Workout log with ID ${id} not found.` };
        await store.updateWorkoutLog(id, updates);
        return { success: true, message: `Workout log '${existing.title}' updated successfully.`, entityId: id };
      }
      return { success: false, message: `Unknown logType '${logType}'. Use 'meal' or 'workout'.` };
    }

    case 'create_crm_entry': {
      const store = useCrmStore.getState();
      await store.addContact(sanitizedArgs);
      const newContact = store.contacts[0];
      return { success: true, message: `CRM Contact '${sanitizedArgs.name}' logged successfully.`, entityId: newContact?.id };
    }

    case 'update_crm_entry': {
      const store = useCrmStore.getState();
      const existing = store.contacts.find(c => c.id === sanitizedArgs.id);
      if (!existing) {
        return { success: false, message: `CRM contact with ID ${sanitizedArgs.id} not found.` };
      }
      await store.updateContact(sanitizedArgs.id, sanitizedArgs.updates);
      return { success: true, message: `CRM contact '${existing.name}' updated successfully.`, entityId: sanitizedArgs.id };
    }

    case 'delete_crm_entry': {
      const store = useCrmStore.getState();
      const existing = store.contacts.find(c => c.id === sanitizedArgs.id);
      if (!existing) {
        return { success: false, message: `CRM contact with ID ${sanitizedArgs.id} not found.` };
      }
      await trashService.moveToTrash('crm', existing);
      await store.deleteContact(sanitizedArgs.id);
      return { success: true, message: `CRM contact '${existing.name}' deleted successfully.` };
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

    case 'spotify_play': {
      const { useSpotifyStore } = await import('../../store/spotifyStore');
      const store = useSpotifyStore.getState();
      if (!store.token) {
        return { success: false, message: 'Spotify is not connected. Tell the user to connect Spotify in the right panel first.' };
      }
      await store.play(sanitizedArgs.uri);
      return { success: true, message: `Spotify play command sent successfully.` };
    }

    case 'spotify_pause': {
      const { useSpotifyStore } = await import('../../store/spotifyStore');
      const store = useSpotifyStore.getState();
      if (!store.token) {
        return { success: false, message: 'Spotify is not connected.' };
      }
      await store.pause();
      return { success: true, message: 'Spotify pause command sent successfully.' };
    }

    case 'spotify_next': {
      const { useSpotifyStore } = await import('../../store/spotifyStore');
      const store = useSpotifyStore.getState();
      if (!store.token) {
        return { success: false, message: 'Spotify is not connected.' };
      }
      await store.next();
      return { success: true, message: 'Spotify skip-next command sent successfully.' };
    }

    case 'spotify_prev': {
      const { useSpotifyStore } = await import('../../store/spotifyStore');
      const store = useSpotifyStore.getState();
      if (!store.token) {
        return { success: false, message: 'Spotify is not connected.' };
      }
      await store.prev();
      return { success: true, message: 'Spotify skip-previous command sent successfully.' };
    }

    case 'spotify_search_and_play': {
      const { useSpotifyStore } = await import('../../store/spotifyStore');
      const store = useSpotifyStore.getState();
      if (!store.token) {
        return { success: false, message: 'Spotify is not connected. Tell the user to connect Spotify in the right panel first.' };
      }
      await store.search(sanitizedArgs.query);
      const results = useSpotifyStore.getState().searchResults;
      if (results && results.length > 0) {
        const topTrack = results[0];
        await store.play(topTrack.uri);
        return { success: true, message: `Found and playing top result '${topTrack.name}' by ${topTrack.artists?.map(a => a.name).join(', ')}` };
      } else {
        return { success: false, message: `No tracks found on Spotify matching query '${sanitizedArgs.query}'` };
      }
    }

    case 'spotify_add_to_queue': {
      const { useSpotifyStore } = await import('../../store/spotifyStore');
      const store = useSpotifyStore.getState();
      if (!store.token) {
        return { success: false, message: 'Spotify is not connected.' };
      }
      await store.addToQueue(sanitizedArgs.uri);
      return { success: true, message: `Successfully queued track ${sanitizedArgs.uri} on Spotify.` };
    }

    // Academics CRUD Handlers
    case 'create_academic_subject': {
      const { useAcademicStore } = await import('../../store/academicStore');
      const store = useAcademicStore.getState();
      await store.addSubject(sanitizedArgs);
      const subjects = store.subjects;
      const created = subjects[subjects.length - 1];
      return { success: true, message: `Subject '${sanitizedArgs.name}' created successfully in ${created?.semester || 'active semester'}.`, entityId: created?.id };
    }

    case 'update_academic_subject': {
      const { useAcademicStore } = await import('../../store/academicStore');
      const store = useAcademicStore.getState();
      await store.updateSubject(sanitizedArgs.id, sanitizedArgs.updates);
      return { success: true, message: `Subject updated successfully.`, entityId: sanitizedArgs.id };
    }

    case 'delete_academic_subject': {
      const { useAcademicStore } = await import('../../store/academicStore');
      const store = useAcademicStore.getState();
      await store.deleteSubject(sanitizedArgs.id);
      return { success: true, message: `Subject deleted successfully.` };
    }

    case 'create_academic_skill': {
      const { useAcademicStore } = await import('../../store/academicStore');
      const store = useAcademicStore.getState();
      await store.addSkill(sanitizedArgs);
      const skills = store.skills;
      const created = skills[skills.length - 1];
      return { success: true, message: `Skill '${sanitizedArgs.name}' registered successfully.`, entityId: created?.id };
    }

    case 'update_academic_skill': {
      const { useAcademicStore } = await import('../../store/academicStore');
      const store = useAcademicStore.getState();
      await store.updateSkill(sanitizedArgs.id, sanitizedArgs.updates);
      return { success: true, message: `Skill updated successfully.`, entityId: sanitizedArgs.id };
    }

    case 'delete_academic_skill': {
      const { useAcademicStore } = await import('../../store/academicStore');
      const store = useAcademicStore.getState();
      await store.deleteSkill(sanitizedArgs.id);
      return { success: true, message: `Skill removed successfully.` };
    }

    case 'create_academic_project': {
      const { useAcademicStore } = await import('../../store/academicStore');
      const store = useAcademicStore.getState();
      await store.addProject(sanitizedArgs);
      const projects = store.projects;
      const created = projects[projects.length - 1];
      return { success: true, message: `Project '${sanitizedArgs.name}' created successfully.`, entityId: created?.id };
    }

    case 'update_academic_project': {
      const { useAcademicStore } = await import('../../store/academicStore');
      const store = useAcademicStore.getState();
      await store.updateProject(sanitizedArgs.id, sanitizedArgs.updates);
      return { success: true, message: `Project updated successfully.`, entityId: sanitizedArgs.id };
    }

    case 'delete_academic_project': {
      const { useAcademicStore } = await import('../../store/academicStore');
      const store = useAcademicStore.getState();
      await store.deleteProject(sanitizedArgs.id);
      return { success: true, message: `Project deleted successfully.` };
    }

    case 'create_academic_tech_stack': {
      const { useAcademicStore } = await import('../../store/academicStore');
      const store = useAcademicStore.getState();
      await store.addTechStack(sanitizedArgs.name);
      const techStack = store.techStack;
      const created = techStack[techStack.length - 1];
      if (created && (sanitizedArgs.category || sanitizedArgs.proficiency || sanitizedArgs.currentlyLearning !== undefined || sanitizedArgs.notes)) {
        await store.updateTechStack(created.id, {
          category: sanitizedArgs.category || 'General',
          proficiency: sanitizedArgs.proficiency || 'Beginner',
          currentlyLearning: sanitizedArgs.currentlyLearning !== undefined ? sanitizedArgs.currentlyLearning : true,
          notes: sanitizedArgs.notes || ''
        });
      }
      return { success: true, message: `Technology '${sanitizedArgs.name}' added to tech stack.`, entityId: created?.id };
    }

    case 'update_academic_tech_stack': {
      const { useAcademicStore } = await import('../../store/academicStore');
      const store = useAcademicStore.getState();
      await store.updateTechStack(sanitizedArgs.id, sanitizedArgs.updates);
      return { success: true, message: `Tech stack item updated.`, entityId: sanitizedArgs.id };
    }

    case 'delete_academic_tech_stack': {
      const { useAcademicStore } = await import('../../store/academicStore');
      const store = useAcademicStore.getState();
      await store.deleteTechStack(sanitizedArgs.id);
      return { success: true, message: `Tech stack item deleted.` };
    }

    case 'create_academic_dsa': {
      const { useAcademicStore } = await import('../../store/academicStore');
      const store = useAcademicStore.getState();
      await store.addDsaQuestion(sanitizedArgs);
      const dsa = store.dsaQuestions;
      const created = dsa[dsa.length - 1];
      return { success: true, message: `DSA Problem '${sanitizedArgs.title}' logged as solved.`, entityId: created?.id };
    }

    case 'create_academic_certification': {
      const { useAcademicStore } = await import('../../store/academicStore');
      const store = useAcademicStore.getState();
      await store.addCertification(sanitizedArgs);
      const certs = store.certifications;
      const created = certs[certs.length - 1];
      return { success: true, message: `Certification '${sanitizedArgs.course}' added.`, entityId: created?.id };
    }

    case 'update_academic_certification': {
      const { useAcademicStore } = await import('../../store/academicStore');
      const store = useAcademicStore.getState();
      await store.updateCertification(sanitizedArgs.id, sanitizedArgs.updates);
      return { success: true, message: `Certification updated.`, entityId: sanitizedArgs.id };
    }

    case 'delete_academic_certification': {
      const { useAcademicStore } = await import('../../store/academicStore');
      const store = useAcademicStore.getState();
      await store.deleteCertification(sanitizedArgs.id);
      return { success: true, message: `Certification deleted.` };
    }

    // Personal Hub & Self Care handlers
    case 'create_personal_item': {
      const { usePersonalStore } = await import('../../store/personalStore');
      const store = usePersonalStore.getState();
      const { categoryType, ...itemData } = sanitizedArgs;
      const created = await store.addItem(categoryType, itemData);
      return { success: true, message: `Item successfully logged under personal ${categoryType}.`, entityId: created?.id };
    }

    case 'update_personal_item': {
      const { usePersonalStore } = await import('../../store/personalStore');
      const store = usePersonalStore.getState();
      const { categoryType, id, updates } = sanitizedArgs;
      await store.updateItem(categoryType, id, updates);
      return { success: true, message: `Personal item updated successfully.`, entityId: id };
    }

    case 'delete_personal_item': {
      const { usePersonalStore } = await import('../../store/personalStore');
      const store = usePersonalStore.getState();
      const { categoryType, id } = sanitizedArgs;
      await store.deleteItem(categoryType, id);
      return { success: true, message: `Personal item deleted successfully.` };
    }

    case 'create_self_care_routine': {
      const { useSelfCareStore } = await import('../../store/selfCareStore');
      const store = useSelfCareStore.getState();
      const created = await store.addItem(sanitizedArgs);
      return { success: true, message: `Self-care routine '${sanitizedArgs.title}' created.`, entityId: created?.id };
    }

    case 'update_self_care_routine': {
      const { useSelfCareStore } = await import('../../store/selfCareStore');
      const store = useSelfCareStore.getState();
      await store.updateItem(sanitizedArgs.id, sanitizedArgs.updates);
      return { success: true, message: `Self-care routine updated.`, entityId: sanitizedArgs.id };
    }

    case 'delete_self_care_routine': {
      const { useSelfCareStore } = await import('../../store/selfCareStore');
      const store = useSelfCareStore.getState();
      await store.deleteItem(sanitizedArgs.id);
      return { success: true, message: `Self-care routine deleted.` };
    }

    case 'complete_self_care_routine': {
      const { useSelfCareStore } = await import('../../store/selfCareStore');
      const store = useSelfCareStore.getState();
      await store.toggleComplete(sanitizedArgs.id);
      const routine = store.routines.find(r => r.id === sanitizedArgs.id);
      return { success: true, message: `Self-care routine '${routine?.title}' completion status toggled. Current streak: ${routine?.streak || 0}` };
    }

    // Personal Roadmap handlers
    case 'create_roadmap': {
      const { usePersonalRoadmapStore } = await import('../../store/personalRoadmapStore');
      const store = usePersonalRoadmapStore.getState();
      const created = await store.addRoadmap(sanitizedArgs);
      return { success: true, message: `Personal Roadmap '${created.title}' created successfully.`, entityId: created.id };
    }

    case 'update_roadmap': {
      const { usePersonalRoadmapStore } = await import('../../store/personalRoadmapStore');
      const store = usePersonalRoadmapStore.getState();
      const existing = store.roadmaps.find(r => r.id === sanitizedArgs.id);
      if (!existing) {
        return { success: false, message: `Roadmap with ID ${sanitizedArgs.id} not found.` };
      }
      await store.updateRoadmap(sanitizedArgs.id, sanitizedArgs.updates);
      return { success: true, message: `Roadmap '${existing.title}' updated successfully.`, entityId: sanitizedArgs.id };
    }

    case 'delete_roadmap': {
      const { usePersonalRoadmapStore } = await import('../../store/personalRoadmapStore');
      const store = usePersonalRoadmapStore.getState();
      const existing = store.roadmaps.find(r => r.id === sanitizedArgs.id);
      if (!existing) {
        return { success: false, message: `Roadmap with ID ${sanitizedArgs.id} not found.` };
      }
      await store.deleteRoadmap(sanitizedArgs.id);
      return { success: true, message: `Roadmap '${existing.title}' deleted successfully.` };
    }

    case 'add_roadmap_log': {
      const { usePersonalRoadmapStore } = await import('../../store/personalRoadmapStore');
      const store = usePersonalRoadmapStore.getState();
      const existing = store.roadmaps.find(r => r.id === sanitizedArgs.roadmapId);
      if (!existing) {
        return { success: false, message: `Roadmap with ID ${sanitizedArgs.roadmapId} not found.` };
      }
      await store.addCustomLog(sanitizedArgs.roadmapId, sanitizedArgs.logKey, sanitizedArgs.entry);
      return { success: true, message: `Log entry added to roadmap '${existing.title}' under key '${sanitizedArgs.logKey}'.`, entityId: sanitizedArgs.roadmapId };
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

  if (name === 'log_hydration') {
    if (clean.amountMl !== undefined) clean.amountMl = Math.max(50, Number(clean.amountMl) || 250);
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
