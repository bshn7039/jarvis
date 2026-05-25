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
import { usePersonalStore } from '../store/personalStore';
import { useActivityStore } from '../store/activityStore';
import { useEntityStore } from '../store/entityStore';
import { useTrashStore } from '../store/trashStore';
import { useAuthStore } from '../store/authStore';
import { localDb } from '../database/core/localDatabase';

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
  const hydratePersonal = usePersonalStore(s => s.hydrate);
  const hydrateActivities = useActivityStore(s => s.hydrate);
  const hydrateEntities = useEntityStore(s => s.hydrate);
  const hydrateTrash = useTrashStore(s => s.hydrate);
  const initAuth = useAuthStore(s => s.init);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const hydrateAll = async () => {
      await initAuth();

      // Only hydrate data stores if authenticated
      if (isAuthenticated && user?.userId) {
        localDb.setUserId(user.userId);

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
          hydratePersonal(),
          hydrateActivities(),
          hydrateEntities(),
          hydrateTrash()
        ]);
      } else {
        // Still hydrate UI and Entities as they might be needed for login UI
        await Promise.all([
          hydrateUi(),
          hydrateEntities()
        ]);
      }
    };

    hydrateAll();
  }, [isAuthenticated, user]);
}
