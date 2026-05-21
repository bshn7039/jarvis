import { useMemo } from 'react';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import PagePanel from '../components/ui/PagePanel';
import ContactList from '../components/crm/ContactList';
import ContactDetail from '../components/crm/ContactDetail';
import { useCrmStore } from '../store/crmStore';

export default function CRM() {
  const contacts = useCrmStore((s) => s.contacts);
  const reminders = useCrmStore((s) => s.reminders);
  const interactionLog = useCrmStore((s) => s.interactionLog);
  const selectedContactId = useCrmStore((s) => s.selectedContactId);
  const searchQuery = useCrmStore((s) => s.searchQuery);
  const activeTag = useCrmStore((s) => s.activeTag);
  const setSelectedContactId = useCrmStore((s) => s.setSelectedContactId);
  const setSearchQuery = useCrmStore((s) => s.setSearchQuery);
  const setActiveTag = useCrmStore((s) => s.setActiveTag);
  const updateContactNotes = useCrmStore((s) => s.updateContactNotes);
  const toggleReminderStatus = useCrmStore((s) => s.toggleReminderStatus);
  const addContact = useCrmStore((s) => s.addContact);

  const tags = useMemo(() => ['all', ...new Set(contacts.flatMap((contact) => contact.tags))], [contacts]);

  const filteredContacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return contacts.filter((contact) => {
      const queryMatch =
        !query ||
        contact.name.toLowerCase().includes(query) ||
        contact.connectionContext.toLowerCase().includes(query);
      const tagMatch = activeTag === 'all' || contact.tags.includes(activeTag);
      return queryMatch && tagMatch;
    });
  }, [contacts, searchQuery, activeTag]);

  const selectedContact = filteredContacts.find((c) => c.id === selectedContactId) ?? filteredContacts[0] ?? null;
  const selectedReminders = reminders.filter((reminder) => reminder.contactId === selectedContact?.id);
  const selectedInteractions = interactionLog.filter((item) => item.contactId === selectedContact?.id);

  return (
    <ModulePageLayout
      title="CRM"
      subtitle="Relationship memory system with reminders, notes, and timelines."
    >
      <PagePanel 
        title="Filters"
        actions={
          <button
            type="button"
            onClick={() => addContact({ name: 'New Lead', role: 'Strategic Partner' })}
            className="rounded-lg border border-jarvis-border bg-white/5 px-3 py-1.5 text-xs text-jarvis-text"
          >
            New Contact
          </button>
        }
      >
        <div className="flex flex-wrap gap-2">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search contacts..."
            className="w-full max-w-md rounded-xl border border-jarvis-border bg-black/20 px-3 py-2 text-sm text-jarvis-text placeholder:text-jarvis-muted focus:outline-none"
          />
          <select
            value={activeTag}
            onChange={(event) => setActiveTag(event.target.value)}
            className="rounded-xl border border-jarvis-border bg-black/20 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
          >
            {tags.map((tag) => (
              <option key={tag} value={tag} className="bg-jarvis-panel">
                {tag === 'all' ? 'All tags' : tag}
              </option>
            ))}
          </select>
        </div>
      </PagePanel>

      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <PagePanel title="People">
          <ContactList
            contacts={filteredContacts}
            selectedContactId={selectedContact?.id}
            onSelectContact={setSelectedContactId}
          />
        </PagePanel>

        <ContactDetail
          contact={selectedContact}
          reminders={selectedReminders}
          interactions={selectedInteractions}
          onNotesChange={updateContactNotes}
          onToggleReminder={toggleReminderStatus}
        />
      </div>
    </ModulePageLayout>
  );
}
