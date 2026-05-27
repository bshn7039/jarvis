import { useCrmStore } from '../../../store/crmStore';

export function getCrmContext() {
  const state = useCrmStore.getState();
  const contacts = state.contacts || [];
  const reminders = state.reminders || [];

  const relationshipTypes = {};
  contacts.forEach(c => {
    const type = c.relationshipType || 'professional';
    relationshipTypes[type] = (relationshipTypes[type] || 0) + 1;
  });

  const recentContacts = [...contacts]
    .sort((a, b) => (b.lastInteraction || '').localeCompare(a.lastInteraction || ''))
    .slice(0, 5)
    .map(c => ({
      id: c.id,
      name: c.name,
      nickname: c.nickname,
      relationshipType: c.relationshipType,
      lastInteraction: c.lastInteraction,
      priority: c.priority
    }));

  const upcomingReminders = reminders
    .filter(r => !r.completed)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .slice(0, 5)
    .map(r => ({
      id: r.id,
      title: r.title,
      date: r.date
    }));

  return {
    metrics: {
      totalContacts: contacts.length,
      relationshipTypes
    },
    recentContacts,
    upcomingReminders
  };
}
