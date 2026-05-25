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

export function useCombinedState() {
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
    currentSemester: s.currentSemester,
    termEndDate: s.termEndDate
  })));

  const schedules = useScheduleStore(s => s.schedules);
  const profile = useProfileStore(s => s.profile);
  const chats = useChatStore(s => s.chatHistory);
  const trashItems = useTrashStore(s => s.trashItems);

  return useMemo(() => ({
    profile,
    tasks: tasksData,
    goals,
    journal: journalData,
    finance: financeData,
    fitness: fitnessData,
    crm: { contacts: crmContacts },
    academics: academicState,
    schedules,
    chats,
    trash: trashItems
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
    trashItems
  ]);
}
