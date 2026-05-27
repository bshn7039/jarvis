import { create } from 'zustand';
import { selfCareService } from '../database/services/selfCareService';
import { useActivityStore } from './activityStore';
import { useTaskStore } from './taskStore';
import { trashService } from '../database/services/trashService';

export const useSelfCareStore = create((set, get) => ({
  routines: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const routines = await selfCareService.getAll();
      set({ routines, isHydrated: true });
    } catch (err) {
      console.error('Failed to hydrate self-care store:', err);
    }
  },

  addItem: async (data) => {
    const next = {
      ...data,
      completed: data.status === 'completed',
      completedAt: data.status === 'completed' ? new Date().toISOString() : null,
      streak: 0,
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const saved = await selfCareService.create(next);
    set(state => ({ routines: [saved, ...state.routines] }));
    
    await useActivityStore.getState().logActivity({
      type: 'personal',
      action: 'created',
      entityType: 'selfCare',
      entityId: saved.id,
      metadata: { title: saved.title, category: saved.category }
    });
    return saved;
  },

  updateItem: async (id, updates) => {
    const routine = get().routines.find(r => r.id === id);
    if (!routine) return;
    const next = { ...routine, ...updates, updatedAt: new Date().toISOString() };
    await selfCareService.update(id, next);
    set(state => ({ routines: state.routines.map(r => r.id === id ? next : r) }));
  },

  deleteItem: async (id) => {
    const routine = get().routines.find(r => r.id === id);
    if (routine) {
      await trashService.moveToTrash('personalSelfCare', routine);
    }
    await selfCareService.delete(id);
    set(state => ({ routines: state.routines.filter(r => r.id !== id) }));
  },

  toggleComplete: async (id) => {
    const routine = get().routines.find(r => r.id === id);
    if (!routine) return;

    const isCompleting = !routine.completed;
    const now = new Date().toISOString();
    
    let nextStreak = routine.streak || 0;
    let nextHistory = [...(routine.history || [])];

    if (isCompleting) {
      nextStreak += 1;
      nextHistory.push(now);
      
      // Auto-sync with Tasks
      if (routine.linkedTaskIds?.length > 0) {
        const taskStore = useTaskStore.getState();
        for (const taskId of routine.linkedTaskIds) {
          await taskStore.markTaskComplete(taskId);
        }
      }
    } else {
      nextStreak = Math.max(0, nextStreak - 1);
      nextHistory = nextHistory.filter(h => h !== routine.completedAt);
    }

    const updated = {
      ...routine,
      completed: isCompleting,
      completedAt: isCompleting ? now : null,
      streak: nextStreak,
      history: nextHistory,
      updatedAt: now,
      status: isCompleting ? 'completed' : 'pending'
    };

    await selfCareService.update(id, updated);
    set(state => ({ routines: state.routines.map(r => r.id === id ? updated : r) }));

    await useActivityStore.getState().logActivity({
      type: 'personal',
      action: isCompleting ? 'completed' : 'reopened',
      entityType: 'selfCare',
      entityId: id,
      metadata: { title: routine.title, streak: nextStreak }
    });
  },

  getOverdueRoutines: () => {
    const { routines } = get();
    const today = new Date().toISOString().split('T')[0];
    return routines.filter(r => {
      if (r.completed) return false;
      if (r.routineType === 'daily') {
        const lastCompleted = r.completedAt ? r.completedAt.split('T')[0] : null;
        return lastCompleted !== today;
      }
      return false;
    });
  },

  getStreaks: () => {
    return get().routines
      .filter(r => r.streak > 0)
      .map(r => ({ title: r.title, streak: r.streak }));
  }
}));
