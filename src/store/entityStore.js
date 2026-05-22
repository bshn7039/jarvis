import { create } from 'zustand';

const initialState = {
  activeType: null,
  selectedId: null,
  isModalOpen: false,
  isDetailPanelOpen: false,
  draftMode: 'create',
  isHydrated: true,
};

export const useEntityStore = create((set) => ({
  ...initialState,

  hydrate: async () => {
    set({ isHydrated: true });
  },

  openCreateModal: (entityType) =>
    set({
      activeType: entityType,
      selectedId: null,
      draftMode: 'create',
      isModalOpen: true,
    }),

  openEditModal: (entityType, entityId) =>
    set({
      activeType: entityType,
      selectedId: entityId,
      draftMode: 'edit',
      isModalOpen: true,
    }),

  closeModal: () => set({ isModalOpen: false }),

  openDetailPanel: (entityType, entityId) =>
    set({
      activeType: entityType,
      selectedId: entityId,
      isDetailPanelOpen: true,
    }),

  closeDetailPanel: () => set({ isDetailPanelOpen: false }),

  setSelectedEntity: (entityType, entityId) =>
    set({
      activeType: entityType,
      selectedId: entityId,
    }),
}));
