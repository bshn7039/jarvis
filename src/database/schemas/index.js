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
import { selfCareRoutineSchema } from './selfCareRoutine.schema';
import { communicationPracticeSchema } from './communicationPractice.schema';
import { socialGrowthRecordSchema } from './socialGrowthRecord.schema';
import { publicPersonaItemSchema } from './publicPersonaItem.schema';
import { musicPracticeLogSchema } from './musicPracticeLog.schema';
import { creativeEntrySchema } from './creativeEntry.schema';
import { readingItemSchema } from './readingItem.schema';
import { creativeVaultIdeaSchema } from './creativeVaultIdea.schema';

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
  repetitiveHistory: repetitiveHistorySchema,
  selfCareRoutines: selfCareRoutineSchema,
  communicationPractices: communicationPracticeSchema,
  socialGrowthRecords: socialGrowthRecordSchema,
  publicPersonaItems: publicPersonaItemSchema,
  musicPracticeLogs: musicPracticeLogSchema,
  creativeEntries: creativeEntrySchema,
  readingItems: readingItemSchema,
  creativeVaultIdeas: creativeVaultIdeaSchema,
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
  repetitiveHistorySchema,
  selfCareRoutineSchema,
  communicationPracticeSchema,
  socialGrowthRecordSchema,
  publicPersonaItemSchema,
  musicPracticeLogSchema,
  creativeEntrySchema,
  readingItemSchema,
  creativeVaultIdeaSchema,
};
