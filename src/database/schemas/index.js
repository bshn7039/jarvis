import { taskSchema } from './task.schema';
import { goalSchema } from './goal.schema';
import { journalSchema } from './journal.schema';
import { financeSchema } from './finance.schema';
import { fitnessSchema } from './fitness.schema';
import { crmSchema } from './crm.schema';
import { academicSchema } from './academic.schema';
import { profileSchema } from './profile.schema';
import { chatSchema } from './chat.schema';
import { repetitiveTaskSchema, repetitiveHistorySchema } from './repetitiveTask.schema';

export const schemas = {
  tasks: taskSchema,
  goals: goalSchema,
  journalEntries: journalSchema,
  financeTransactions: financeSchema,
  fitnessLogs: fitnessSchema,
  crmContacts: crmSchema,
  academicSubjects: academicSchema,
  profile: profileSchema,
  chats: chatSchema,
  repetitiveTasks: repetitiveTaskSchema,
  repetitiveHistory: repetitiveHistorySchema
};

export {
  taskSchema,
  goalSchema,
  journalSchema,
  financeSchema,
  fitnessSchema,
  crmSchema,
  academicSchema,
  profileSchema,
  chatSchema,
  repetitiveTaskSchema,
  repetitiveHistorySchema
};
