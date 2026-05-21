import { create } from 'zustand';
import { BaseService } from '../database/services/baseService';
import { STORES } from '../database/core/localDatabase';
import { deepClone } from '../utils/deepClone';

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

  addSchedule: async (schedule) => {
    const saved = await scheduleService.create(schedule);
    set(state => ({ schedules: [...state.schedules, saved] }));
  }
}));
