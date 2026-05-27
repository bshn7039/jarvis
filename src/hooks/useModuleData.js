import { useTaskStore } from '../store/taskStore';
import { useGoalStore } from '../store/goalStore';
import { useJournalStore } from '../store/journalStore';
import { useFinanceStore } from '../store/financeStore';
import { useFitnessStore } from '../store/fitnessStore';
import { useCrmStore } from '../store/crmStore';
import { useAcademicStore } from '../store/academicStore';
import { useScheduleStore } from '../store/scheduleStore';
import { useProfileStore } from '../store/profileStore';
import { useChatStore } from '../store/chatStore';
import { useTrashStore } from '../store/trashStore';
import { useSelfCareStore } from '../store/selfCareStore';
import { useCommunicationStore } from '../store/communicationStore';
import { useSocialGrowthStore } from '../store/socialGrowthStore';
import { usePublicPersonaStore } from '../store/publicPersonaStore';
import { useMusicStore } from '../store/musicStore';
import { useWritingStore } from '../store/writingStore';
import { useReadingStore } from '../store/readingStore';
import { useVaultStore } from '../store/vaultStore';

export function useModuleData(moduleId) {
  switch (moduleId) {
    case 'tasks':
      return useTaskStore(s => ({ tasks: s.tasks, repetitiveTasks: s.repetitiveTasks, repetitiveHistory: s.repetitiveHistory }));
    case 'goals':
      return useGoalStore(s => s.goals);
    case 'journal':
      return useJournalStore(s => ({ entries: s.entries, streak: s.streak }));
    case 'finance':
      return useFinanceStore(s => ({ transactions: s.transactions, balanceOverview: s.balanceOverview }));
    case 'fitness':
      return useFitnessStore(s => ({ workouts: s.workouts, meals: s.meals, hydrationLogs: s.hydrationLogs }));
    case 'crm':
      return useCrmStore(s => ({ contacts: s.contacts }));
    case 'academics':
      return useAcademicStore(s => ({
        subjects: s.subjects,
        assignments: s.assignments,
        practicals: s.practicals,
        revisionLogs: s.revisionLogs,
        projects: s.projects,
        skills: s.skills,
        activeLearning: s.activeLearning,
        dsaQuestions: s.dsaQuestions,
        techStack: s.techStack,
        certifications: s.certifications,
        portfolio: s.portfolio,
        codingProgress: s.codingProgress,
        currentSemester: s.currentSemester,
        termEndDate: s.termEndDate
      }));
    case 'schedules':
      return useScheduleStore(s => s.schedules);
    case 'profile':
      return useProfileStore(s => s.profile);
    case 'chats':
      return useChatStore(s => s.chatHistory);
    case 'trash':
      return useTrashStore(s => s.trashItems);
    case 'personal':
      // Personal is more complex as it aggregates multiple stores
      // But for simple access we can combine them here if needed
      return {
        selfCare: useSelfCareStore(s => s.routines),
        communication: useCommunicationStore(s => s.logs),
        socialGrowth: useSocialGrowthStore(s => s.records),
        publicPersona: usePublicPersonaStore(s => s.platforms),
        music: useMusicStore(s => s.practiceLogs),
        writing: useWritingStore(s => s.drafts),
        reading: useReadingStore(s => s.library),
        vault: useVaultStore(s => s.ideas)
      };
    default:
      return null;
  }
}
