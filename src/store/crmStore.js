import { mockDatabase } from '../data/mockDatabase';
import { createPersistedStore } from './persistHelpers';

const initialState = {
  contacts: mockDatabase.crm.contacts,
  reminders: mockDatabase.crm.reminders,
  interactionLog: mockDatabase.crm.interactionLog,
  selectedContactId: mockDatabase.crm.contacts[0]?.id ?? null,
  searchQuery: '',
  activeTag: 'all',
};

export const useCrmStore = createPersistedStore({
  name: 'jarvis-crm',
  initialState,
  partialize: (state) => ({
    contacts: state.contacts,
    reminders: state.reminders,
    interactionLog: state.interactionLog,
    selectedContactId: state.selectedContactId,
    searchQuery: state.searchQuery,
    activeTag: state.activeTag,
  }),
  actions: (set) => ({
    setSelectedContactId: (contactId) => set({ selectedContactId: contactId }),
    setSearchQuery: (value) => set({ searchQuery: value }),
    setActiveTag: (value) => set({ activeTag: value }),
    updateContactNotes: (contactId, notes) =>
      set((state) => ({
        contacts: state.contacts.map((contact) =>
          contact.id === contactId ? { ...contact, notes } : contact,
        ),
      })),
    toggleReminderStatus: (reminderId) =>
      set((state) => ({
        reminders: state.reminders.map((reminder) =>
          reminder.id === reminderId
            ? {
                ...reminder,
                status: reminder.status === 'done' ? 'pending' : 'done',
              }
            : reminder,
        ),
      })),
  }),
});
