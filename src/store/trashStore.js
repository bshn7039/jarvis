import { create } from 'zustand';
import { trashService } from '../database/services/trashService';

async function hydrateStoreForEntity(entityType) {
  try {
    switch (entityType) {
      case 'tasks': {
        const { useTaskStore } = await import('./taskStore');
        await useTaskStore.getState().hydrate();
        break;
      }
      case 'goals': {
        const { useGoalStore } = await import('./goalStore');
        await useGoalStore.getState().hydrate();
        break;
      }
      case 'journalEntries': {
        const { useJournalStore } = await import('./journalStore');
        await useJournalStore.getState().hydrate();
        break;
      }
      case 'financeTransactions': {
        const { useFinanceStore } = await import('./financeStore');
        await useFinanceStore.getState().hydrate();
        break;
      }
      case 'fitnessLogs': {
        const { useFitnessStore } = await import('./fitnessStore');
        await useFitnessStore.getState().hydrate();
        break;
      }
      case 'crmContacts': {
        const { useCrmStore } = await import('./crmStore');
        await useCrmStore.getState().hydrate();
        break;
      }
      case 'academicSubjects':
      case 'academicAssignments':
      case 'academicPracticals':
      case 'academicRevisionLogs':
      case 'academicProjects':
      case 'academicSkills':
      case 'academicLearning':
      case 'academicDsa':
      case 'academicTechStack':
      case 'academicCertifications':
      case 'academicPortfolio': {
        const { useAcademicStore } = await import('./academicStore');
        await useAcademicStore.getState().hydrate();
        break;
      }
      case 'schedules': {
        const { useScheduleStore } = await import('./scheduleStore');
        await useScheduleStore.getState().hydrate();
        break;
      }
      case 'personalSelfCare': {
        const { useSelfCareStore } = await import('./selfCareStore');
        await useSelfCareStore.getState().hydrate();
        break;
      }
      case 'personalCommunication': {
        const { useCommunicationStore } = await import('./communicationStore');
        await useCommunicationStore.getState().hydrate();
        break;
      }
      case 'personalSocialGrowth': {
        const { useSocialGrowthStore } = await import('./socialGrowthStore');
        await useSocialGrowthStore.getState().hydrate();
        break;
      }
      case 'personalPublicPersona': {
        const { usePublicPersonaStore } = await import('./publicPersonaStore');
        await usePublicPersonaStore.getState().hydrate();
        break;
      }
      case 'personalMusic': {
        const { useMusicStore } = await import('./musicStore');
        await useMusicStore.getState().hydrate();
        break;
      }
      case 'personalWriting': {
        const { useWritingStore } = await import('./writingStore');
        await useWritingStore.getState().hydrate();
        break;
      }
      case 'personalReading': {
        const { useReadingStore } = await import('./readingStore');
        await useReadingStore.getState().hydrate();
        break;
      }
      case 'personalVault': {
        const { useVaultStore } = await import('./vaultStore');
        await useVaultStore.getState().hydrate();
        break;
      }
      case 'mutualFunds': {
        const { useMutualFundStore } = await import('./mutualFundStore');
        await useMutualFundStore.getState().hydrate();
        break;
      }
      default:
        console.warn(`[TrashStore] No store hydration matched for entityType: ${entityType}`);
    }
  } catch (error) {
    console.error(`[TrashStore] Failed to hydrate store for entityType ${entityType}:`, error);
  }
}

export const useTrashStore = create((set, get) => ({
  trashItems: [],
  isHydrated: false,

  hydrate: async () => {
    const items = await trashService.getAll();
    set({ trashItems: items, isHydrated: true });
  },

  restoreItem: async (trashId) => {
    const result = await trashService.restore(trashId);
    await get().hydrate();
    if (result && result.entityType) {
      await hydrateStoreForEntity(result.entityType);
    }
  },

  permanentDelete: async (trashId) => {
    await trashService.permanentDelete(trashId);
    await get().hydrate();
  },

  clearTrash: async () => {
    await trashService.clearTrash();
    await get().hydrate();
  }
}));
