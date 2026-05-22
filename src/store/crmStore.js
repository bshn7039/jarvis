import { create } from 'zustand';
import { crmService } from '../database/services/crmService';
import { deepClone } from '../utils/deepClone';
import { useActivityStore } from './activityStore';

const initialState = {
  contacts: [],
  reminders: [],
  interactionLog: [],
  selectedContactId: null,
  searchQuery: '',
  activeTag: 'all',
  isHydrated: false,
};

export const useCrmStore = create((set, get) => ({
  ...deepClone(initialState),

  hydrate: async () => {
    try {
      const contacts = await crmService.getAll();
      const reminders = await localDb.getAll('crmReminders');
      const interactionLog = await localDb.getAll('crmInteractions');
      
      set({ 
        contacts, 
        reminders,
        interactionLog,
        selectedContactId: contacts[0]?.id ?? null,
        isHydrated: true 
      });
    } catch (err) {
      console.error('Failed to hydrate CRM:', err);
    }
  },

  setSelectedContactId: (contactId) => set({ selectedContactId: contactId }),
  setSearchQuery: (value) => set({ searchQuery: value }),
  setActiveTag: (value) => set({ activeTag: value }),

  logActivity: async ({ action, entityId, metadata = {} }) => {
    const activityStore = useActivityStore.getState();
    await activityStore.logActivity({
      type: 'crm',
      action,
      entityType: 'contact',
      entityId,
      metadata
    });
  },

  updateContactNotes: async (contactId, notes) => {
    const contacts = get().contacts;
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    const updatedContact = { ...contact, notes };
    await crmService.update(contactId, updatedContact);
    set({ contacts: contacts.map(c => c.id === contactId ? updatedContact : c) });
    await get().logActivity({ 
      action: 'updated', 
      entityId: contactId,
      metadata: { name: contact.name }
    });
  },

  toggleReminderStatus: async (reminderId) => {
    // Ideally use reminderService
    set((state) => ({
      reminders: state.reminders.map((reminder) =>
        reminder.id === reminderId
          ? {
              ...reminder,
              status: reminder.status === 'done' ? 'pending' : 'done',
            }
          : reminder,
      ),
    }));
  },

  addContact: async (contactData) => {
    const next = {
      name: contactData.name || 'New Connection',
      role: contactData.role || 'Professional',
      connectionContext: contactData.connectionContext || 'Initial Outreach',
      location: contactData.location || 'Unknown',
      tags: contactData.tags || ['new'],
      notes: contactData.notes || 'Added from CRM module.',
      avatar: contactData.avatar || null,
      lastInteraction: new Date().toISOString().split('T')[0],
    };
    
    const savedContact = await crmService.create(next);
    set((state) => ({
      contacts: [savedContact, ...state.contacts],
      selectedContactId: savedContact.id,
    }));
    await get().logActivity({ 
      action: 'created', 
      entityId: savedContact.id,
      metadata: { name: savedContact.name, role: savedContact.role }
    });
  },
}));

