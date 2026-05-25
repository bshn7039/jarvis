import { useMemo, useState } from 'react';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import PagePanel from '../components/ui/PagePanel';
import ContactList from '../components/crm/ContactList';
import ContactDetail from '../components/crm/ContactDetail';
import { useCrmStore } from '../store/crmStore';
import { useEntityStore } from '../store/entityStore';
import EntityModal from '../components/modals/EntityModal';
import EntityForm from '../components/forms/EntityForm';

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
  const addContact = useCrmStore((s) => s.addContact);
  const updateContact = useCrmStore((s) => s.updateContact);
  const deleteContact = useCrmStore((s) => s.deleteContact);

  const { isModalOpen, closeModal, activeType, selectedId, draftMode, openCreateModal, mode } = useEntityStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tags = useMemo(() => ['all', ...new Set(contacts.flatMap((contact) => contact.tags || []))], [contacts]);

  const filteredContacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return contacts.filter((contact) => {
      const queryMatch =
        !query ||
        contact.name.toLowerCase().includes(query) ||
        (contact.nickname && contact.nickname.toLowerCase().includes(query)) ||
        (contact.notes && contact.notes.toLowerCase().includes(query));
      const tagMatch = activeTag === 'all' || (contact.tags && contact.tags.includes(activeTag));
      return queryMatch && tagMatch;
    });
  }, [contacts, searchQuery, activeTag]);

  const selectedContact = contacts.find((c) => c.id === (selectedId || selectedContactId)) ?? filteredContacts[0] ?? null;
  const selectedReminders = reminders.filter((reminder) => reminder.contactId === selectedContact?.id);
  const selectedInteractions = interactionLog.filter((item) => item.contactId === selectedContact?.id);

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (draftMode === 'create') {
        await addContact(data);
      } else {
        await updateContact(selectedId, data);
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save contact:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            onClick={() => openCreateModal('crm')}
            className="rounded-lg border border-jarvis-border bg-white/5 px-3 py-1.5 text-xs text-jarvis-text hover:bg-white/10"
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
          onDelete={() => selectedContact && deleteContact(selectedContact.id)}
        />
      </div>

      <EntityModal
        isOpen={isModalOpen && activeType === 'crm'}
        onClose={closeModal}
        title={draftMode === 'create' ? 'New Contact' : mode === 'view' ? 'View Contact Notes' : mode === 'notes' ? 'Edit Contact Notes' : 'Edit Contact'}
      >
        <EntityForm
          initialData={draftMode === 'edit' ? selectedContact : {}}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isSubmitting={isSubmitting}
        />
      </EntityModal>
    </ModulePageLayout>
  );
}
