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

export function useCombinedState() {
  const tasks = useTaskStore(s => s.tasks);
  const goals = useGoalStore(s => s.goals);
  const journalEntries = useJournalStore(s => s.entries);
  const journalStreak = useJournalStore(s => s.streak);
  const financeTransactions = useFinanceStore(s => s.transactions);
  const balanceOverview = useFinanceStore(s => s.balanceOverview);
  const fitnessWorkouts = useFitnessStore(s => s.workouts);
  const fitnessMeals = useFitnessStore(s => s.meals);
  const fitnessHydration = useFitnessStore(s => s.hydrationLogs);
  const crmContacts = useCrmStore(s => s.contacts);
  const academicSubjects = useAcademicStore(s => s.subjects);
  const schedules = useScheduleStore(s => s.schedules);
  const profile = useProfileStore(s => s.profile);
  const chats = useChatStore(s => s.chatHistory);

  return {
    profile,
    tasks,
    goals,
    journal: { entries: journalEntries, streak: journalStreak },
    finance: { transactions: financeTransactions, balanceOverview },
    fitness: { workouts: fitnessWorkouts, meals: fitnessMeals, hydrationLogs: fitnessHydration },
    crm: { contacts: crmContacts },
    academics: { subjects: academicSubjects },
    schedules,
    chats
  };
}
