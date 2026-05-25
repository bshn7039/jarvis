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

  openCreateModal: (entityType, mode = 'full', initialData = null) =>
    set({
      activeType: entityType,
      selectedId: null,
      draftMode: 'create',
      isModalOpen: true,
      mode,
      initialData,
    }),

  openEditModal: (entityType, entityId, mode = 'full') =>
    set({
      activeType: entityType,
      selectedId: entityId,
      draftMode: 'edit',
      isModalOpen: true,
      mode,
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
