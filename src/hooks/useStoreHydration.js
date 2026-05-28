import { useEffect, useRef } from 'react';
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
import { useSelfCareStore } from '../store/selfCareStore';
import { useCommunicationStore } from '../store/communicationStore';
import { useSocialGrowthStore } from '../store/socialGrowthStore';
import { usePublicPersonaStore } from '../store/publicPersonaStore';
import { useMusicStore } from '../store/musicStore';
import { useWritingStore } from '../store/writingStore';
import { useReadingStore } from '../store/readingStore';
import { useVaultStore } from '../store/vaultStore';
import { usePersonalRoadmapStore } from '../store/personalRoadmapStore';
import { useActivityStore } from '../store/activityStore';
import { useEntityStore } from '../store/entityStore';
import { useTrashStore } from '../store/trashStore';
import { useAuthStore } from '../store/authStore';
import { useMutualFundStore } from '../store/mutualFundStore';
import { localDb } from '../database/core/localDatabase';
import { bootstrapDatabase } from '../database/core/bootstrap';

export function useStoreHydration() {
  const isHydrating = useRef(false);
  const lastAuthStatus = useRef(null);

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
  const hydrateSelfCare = useSelfCareStore(s => s.hydrate);
  const hydrateCommunication = useCommunicationStore(s => s.hydrate);
  const hydrateSocialGrowth = useSocialGrowthStore(s => s.hydrate);
  const hydratePublicPersona = usePublicPersonaStore(s => s.hydrate);
  const hydrateMusic = useMusicStore(s => s.hydrate);
  const hydrateWriting = useWritingStore(s => s.hydrate);
  const hydrateReading = useReadingStore(s => s.hydrate);
  const hydrateVault = useVaultStore(s => s.hydrate);
  const hydratePersonalRoadmaps = usePersonalRoadmapStore(s => s.hydrate);
  const hydrateActivities = useActivityStore(s => s.hydrate);
  const hydrateEntities = useEntityStore(s => s.hydrate);
  const hydrateTrash = useTrashStore(s => s.hydrate);
  const hydrateMutualFunds = useMutualFundStore(s => s.hydrate);
  const initAuth = useAuthStore(s => s.init);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const authKey = `${isAuthenticated}:${user?.userId || 'none'}`;
    if (lastAuthStatus.current === authKey) return;
    if (isHydrating.current) return;

    const hydrateAll = async () => {
      isHydrating.current = true;
      try {
        await initAuth();

        // Only hydrate data stores if authenticated
        if (isAuthenticated && user?.userId) {
          await bootstrapDatabase(user.userId);

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
            hydrateSelfCare(),
            hydrateCommunication(),
            hydrateSocialGrowth(),
            hydratePublicPersona(),
            hydrateMusic(),
            hydrateWriting(),
            hydrateReading(),
            hydrateVault(),
            hydratePersonalRoadmaps(),
            hydrateActivities(),
            hydrateEntities(),
            hydrateTrash(),
            hydrateMutualFunds()
          ]);
        } else {
          // Still hydrate UI and Entities as they might be needed for login UI
          await Promise.all([
            hydrateUi(),
            hydrateEntities()
          ]);
        }
        lastAuthStatus.current = authKey;
      } catch (err) {
        console.error('[Hydration] Critical failure during hydration:', err);
      } finally {
        isHydrating.current = false;
      }
    };

    hydrateAll();
  }, [isAuthenticated, user, initAuth]);
}

