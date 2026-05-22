import { create } from 'zustand';
import { BaseService } from '../database/services/baseService';
import { STORES } from '../database/core/localDatabase';
import { deepClone } from '../utils/deepClone';
import { useActivityStore } from './activityStore';

class ScheduleService extends BaseService {
  constructor() {
    super(STORES.SCHEDULES);
  }
}

const scheduleService = new ScheduleService();

const initialState = {
  schedules: [],
  isHydrated: false,
};

export const useScheduleStore = create((set) => ({
  ...deepClone(initialState),

  hydrate: async () => {
    try {
      const schedules = await scheduleService.getAll();
      set({ schedules, isHydrated: true });
    } catch (err) {
      console.error('Failed to hydrate schedules:', err);
    }
  },

  logActivity: async ({ action, entityId, metadata = {} }) => {
    const activityStore = useActivityStore.getState();
    await activityStore.logActivity({
      type: 'schedule',
      action,
      entityType: 'schedule',
      entityId,
      metadata
    });
  },

  addSchedule: async (schedule) => {
    const saved = await scheduleService.create(schedule);
    set(state => ({ schedules: [...state.schedules, saved] }));
    await get().logActivity({ 
      action: 'created', 
      entityId: saved.id,
      metadata: { title: saved.title }
    });
  }
}));
