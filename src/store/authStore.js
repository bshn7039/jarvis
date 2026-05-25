import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../database/services/authService';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false, // Whether any user exists in the system

      init: async () => {
        const hasUsers = await authService.hasUsers();
        set({ isInitialized: hasUsers });
      },

      register: async (username, password) => {
        const user = await authService.register(username, password);
        set({ user, isAuthenticated: true, isInitialized: true });
        return user;
      },

      login: async (username, password) => {
        const user = await authService.login(username, password);
        if (user) {
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      lock: () => {
        set({ isAuthenticated: false });
      },
    }),
    {
      name: 'jarvis-auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
