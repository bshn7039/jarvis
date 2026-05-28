import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
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
import { useMutualFundStore } from '../store/mutualFundStore';

export function useCombinedState(selector) {
  const tasksData = useTaskStore(useShallow(s => ({ 
    tasks: s.tasks, 
    repetitiveTasks: s.repetitiveTasks, 
    repetitiveHistory: s.repetitiveHistory 
  })));

  const goals = useGoalStore(s => s.goals);
  
  const journalData = useJournalStore(useShallow(s => ({ 
    entries: s.entries, 
    streak: s.streak 
  })));

  const financeData = useFinanceStore(useShallow(s => ({ 
    transactions: s.transactions, 
    balanceOverview: s.balanceOverview 
  })));

  const fitnessData = useFitnessStore(useShallow(s => ({ 
    workouts: s.workouts, 
    meals: s.meals, 
    hydrationLogs: s.hydrationLogs 
  })));

  const crmContacts = useCrmStore(s => s.contacts);

  const academicState = useAcademicStore(useShallow(s => ({
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
    activeSemester: s.activeSemester,
    termEndDate: s.termEndDate
  })));

  const schedules = useScheduleStore(s => s.schedules);
  const profile = useProfileStore(s => s.profile);
  const chats = useChatStore(s => s.chatHistory);
  const trashItems = useTrashStore(s => s.trashItems);

  // Personal Evolution System
  const selfCare = useSelfCareStore(s => s.routines);
  const communication = useCommunicationStore(s => s.logs);
  const socialGrowth = useSocialGrowthStore(s => s.records);
  const publicPersona = usePublicPersonaStore(s => s.platforms);
  const music = useMusicStore(s => s.practiceLogs);
  const writing = useWritingStore(s => s.drafts);
  const reading = useReadingStore(s => s.library);
  const vault = useVaultStore(s => s.ideas);

  const mutualFunds = useMutualFundStore(s => s.funds);

  const fullState = useMemo(() => ({
    profile,
    tasks: tasksData,
    goals,
    journal: journalData,
    finance: {
      ...financeData,
      mutualFunds,
    },
    fitness: fitnessData,
    crm: { contacts: crmContacts },
    academics: academicState,
    schedules,
    chats,
    trash: trashItems,
    personal: {
      selfCare,
      communication,
      socialGrowth,
      publicPersona,
      music,
      writing,
      reading,
      vault
    }
  }), [
    profile, 
    tasksData, 
    goals, 
    journalData, 
    financeData, 
    fitnessData, 
    crmContacts, 
    academicState, 
    schedules, 
    chats, 
    trashItems,
    selfCare,
    communication,
    socialGrowth,
    publicPersona,
    music,
    writing,
    reading,
    vault,
    mutualFunds
  ]);

  return selector ? selector(fullState) : fullState;
}
