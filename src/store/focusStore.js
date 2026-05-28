import { create } from 'zustand';

export const useFocusStore = create((set) => ({
  brightness: 100, // 0 to 100
  dnd: false, // Do Not Disturb / mute sounds
  notificationsEnabled: true,

  setBrightness: (val) => set({ brightness: Math.max(0, Math.min(100, val)) }),
  setDnd: (enabled) => set({ dnd: enabled }),
  setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
}));
