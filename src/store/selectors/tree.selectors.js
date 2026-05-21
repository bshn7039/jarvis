import { useMemo } from 'react';
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

export function useLiveDatabaseTree() {
  const tasks = useTaskStore(s => s.tasks);
  const goals = useGoalStore(s => s.goals);
  const journalEntries = useJournalStore(s => s.entries);
  const financeTransactions = useFinanceStore(s => s.transactions);
  const fitnessWorkouts = useFitnessStore(s => s.workouts);
  const fitnessMeals = useFitnessStore(s => s.meals);
  const fitnessHydration = useFitnessStore(s => s.hydrationLogs);
  const crmContacts = useCrmStore(s => s.contacts);
  const academicSubjects = useAcademicStore(s => s.subjects);
  const schedules = useScheduleStore(s => s.schedules);
  const profile = useProfileStore(s => s.profile);

  return useMemo(() => {
    const combinedState = {
      profile,
      tasks,
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
      schedules
    };
    
    return generateDatabaseTree(combinedState);
  }, [
    profile, tasks, goals, journalEntries, financeTransactions, 
    fitnessWorkouts, fitnessMeals, fitnessHydration, 
    crmContacts, academicSubjects, schedules
  ]);
}
