import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { generateDatabaseTree } from '../../data/databaseTree';
import { useTaskStore } from '../taskStore';
import { useGoalStore } from '../goalStore';
import { useJournalStore } from '../journalStore';
import { useFinanceStore } from '../financeStore';
import { useFitnessStore } from '../fitnessStore';
import { useCrmStore } from '../crmStore';
import { useAcademicStore } from '../academicStore';
import { useScheduleStore } from '../scheduleStore';
import { useProfileStore } from '../profileStore';
import { useChatStore } from '../chatStore';

export function useLiveDatabaseTree() {
  const { tasks, repetitiveTasks, repetitiveHistory } = useTaskStore(useShallow(s => ({
    tasks: s.tasks,
    repetitiveTasks: s.repetitiveTasks,
    repetitiveHistory: s.repetitiveHistory
  })));
  const goals = useGoalStore(s => s.goals);
  const journalEntries = useJournalStore(s => s.entries);
  const financeTransactions = useFinanceStore(s => s.transactions);
  const { fitnessWorkouts, fitnessMeals, fitnessHydration } = useFitnessStore(useShallow(s => ({
    fitnessWorkouts: s.workouts,
    fitnessMeals: s.meals,
    fitnessHydration: s.hydrationLogs
  })));
  const crmContacts = useCrmStore(s => s.contacts);
  const academicSubjects = useAcademicStore(s => s.subjects);
  const schedules = useScheduleStore(s => s.schedules);
  const profile = useProfileStore(s => s.profile);
  const chats = useChatStore(s => s.chatHistory);

  return useMemo(() => {
    const combinedState = {
      profile,
      tasks: { tasks, repetitiveTasks, repetitiveHistory },
      goals,
      journal: { entries: journalEntries },
      finance: { transactions: financeTransactions },
      fitness: { 
        workouts: fitnessWorkouts, 
        meals: fitnessMeals, 
        hydrationLogs: fitnessHydration 
      },
      crm: { contacts: crmContacts },
      academics: { subjects: academicSubjects },
      schedules,
      chats
    };
    
    return generateDatabaseTree(combinedState);
  }, [
    profile, tasks, repetitiveTasks, repetitiveHistory, goals, journalEntries, financeTransactions, 
    fitnessWorkouts, fitnessMeals, fitnessHydration, 
    crmContacts, academicSubjects, schedules, chats
  ]);
}
