import { create } from 'zustand';
import { crmService } from '../database/services/crmService';
import { deepClone } from '../utils/deepClone';
import { useActivityStore } from './activityStore';
import { cleanupEntityReferences } from '../utils/entityCleanup';
import { localDb } from '../database/core/localDatabase';

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

  updateContact: async (contactId, contactData) => {
    const contacts = get().contacts;
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    const updatedContact = { ...contact, ...contactData };
    await crmService.update(contactId, updatedContact);
    
    set({ 
      contacts: contacts.map(c => c.id === contactId ? updatedContact : c) 
    });

    await get().logActivity({ 
      action: 'updated', 
      entityId: contactId,
      metadata: { name: updatedContact.name }
    });
  },

  deleteContact: async (contactId) => {
    const contacts = get().contacts;
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    await crmService.delete(contactId);
    await cleanupEntityReferences(contactId);
    
    set({ 
      contacts: contacts.filter(c => c.id !== contactId),
      selectedContactId: get().selectedContactId === contactId ? (contacts.filter(c => c.id !== contactId)[0]?.id || null) : get().selectedContactId
    });

    await get().logActivity({ 
      action: 'deleted', 
      entityId: contactId,
      metadata: { name: contact.name }
    });
  },

  addContact: async (contactData) => {
    const next = {
      name: contactData.name || 'New Connection',
      nickname: contactData.nickname || '',
      relationshipType: contactData.relationshipType || 'professional',
      phone: contactData.phone || '',
      email: contactData.email || '',
      socialLinks: contactData.socialLinks || [],
      birthday: contactData.birthday || '',
      location: contactData.location || '',
      notes: contactData.notes || '',
      tags: contactData.tags || [],
      priority: contactData.priority || 'medium',
      linkedEntityIds: contactData.linkedEntityIds || [],
      lastInteraction: contactData.lastInteraction || new Date().toISOString().split('T')[0],
    };
    
    const savedContact = await crmService.create(next);
    set((state) => ({
      contacts: [savedContact, ...state.contacts],
      selectedContactId: savedContact.id,
    }));

    await get().logActivity({ 
      action: 'created', 
      entityId: savedContact.id,
      metadata: { 
        name: savedContact.name, 
        relationshipType: savedContact.relationshipType 
      }
    });
  },
}));

