import { useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useGoalStore } from '../store/goalStore';
import { useJournalStore } from '../store/journalStore';
import { useFinanceStore } from '../store/financeStore';
import { useFitnessStore } from '../store/fitnessStore';
import { useCrmStore } from '../store/crmStore';
import { useAcademicStore } from '../store/academicStore';
import { useUiStore } from '../store/uiStore';
import { useScheduleStore } from '../store/scheduleStore';
import { useChatStore } from '../store/chatStore';
import { useProfileStore } from '../store/profileStore';
import { useActivityStore } from '../store/activityStore';
import { useEntityStore } from '../store/entityStore';

export function useStoreHydration() {
  const hydrateTasks = useTaskStore(s => s.hydrate);
  const hydrateGoals = useGoalStore(s => s.hydrate);
  const hydrateJournal = useJournalStore(s => s.hydrate);
  const hydrateFinance = useFinanceStore(s => s.hydrate);
  const hydrateFitness = useFitnessStore(s => s.hydrate);
  const hydrateCrm = useCrmStore(s => s.hydrate);
  const hydrateAcademics = useAcademicStore(s => s.hydrate);
  const hydrateUi = useUiStore(s => s.hydrate);
  const hydrateSchedule = useScheduleStore(s => s.hydrate);
  const hydrateChat = useChatStore(s => s.hydrate);
  const hydrateProfile = useProfileStore(s => s.hydrate);
  const hydrateActivities = useActivityStore(s => s.hydrate);
  const hydrateEntities = useEntityStore(s => s.hydrate);

  useEffect(() => {
    const hydrateAll = async () => {
      // Hydrate in order if needed, but parallel is usually fine
      await Promise.all([
        hydrateTasks(),
        hydrateGoals(),
        hydrateJournal(),
        hydrateFinance(),
        hydrateFitness(),
        hydrateCrm(),
        hydrateAcademics(),
        hydrateUi(),
        hydrateSchedule(),
        hydrateChat(),
        hydrateProfile(),
        hydrateActivities(),
        hydrateEntities()
      ]);
    };

    hydrateAll();
  }, []);
}
