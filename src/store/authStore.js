import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../database/services/authService';
import { activityService } from '../database/services/activityService';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false, // Whether any user exists in the system
      rememberMe: false,

      init: async () => {
        const hasUsers = await authService.hasUsers();
        set({ isInitialized: hasUsers });
      },

      register: async (username, email, password) => {
        const user = await authService.register(username, email, password);
        set({ user, isAuthenticated: true, isInitialized: true, rememberMe: true });
        try {
          await activityService.logActivity({
            type: 'auth',
            action: 'register',
            entityType: 'user',
            entityId: user.userId,
            metadata: { username: user.username, email: user.email },
          });
        } catch {
          // Activity failures should never block auth
        }
        return user;
      },

      login: async (identifier, password, rememberMe = false) => {
        const user = await authService.login(identifier, password);
        if (user) {
          set({ user, isAuthenticated: true, rememberMe: !!rememberMe });
          try {
            await activityService.logActivity({
              type: 'auth',
              action: 'login',
              entityType: 'session',
              entityId: user.userId,
              metadata: { username: user.username, email: user.email, rememberMe: !!rememberMe },
            });
          } catch {
            // Ignore logging failures
          }
          return true;
        }
        return false;
      },

      logout: async () => {
        const currentUser = get().user;
        if (currentUser?.userId) {
          try {
            await activityService.logActivity({
              type: 'auth',
              action: 'logout',
              entityType: 'session',
              entityId: currentUser.userId,
              metadata: { username: currentUser.username, email: currentUser.email },
            });
          } catch {
            // Ignore logging failures
          }
        }
        set({ user: null, isAuthenticated: false, rememberMe: false });
      },

      lock: () => {
        set({ isAuthenticated: false });
      },
    }),
    {
      name: 'jarvis-auth-storage',
      // Only persist remembered sessions; non-remembered sessions die with the tab.
      partialize: (state) =>
        state.rememberMe
          ? { user: state.user, isAuthenticated: state.isAuthenticated, rememberMe: state.rememberMe }
          : { rememberMe: false },
    }
  )
);
