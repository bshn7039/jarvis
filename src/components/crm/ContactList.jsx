import { Edit2 } from 'lucide-react';
import { useEntityStore } from '../../store/entityStore';
import IconButton from '../ui/IconButton';

export default function ContactList({
  contacts,
  selectedContactId,
  onSelectContact,
}) {
  const { openEditModal } = useEntityStore();

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-jarvis-muted',
    low: 'bg-black/20',
  };

  return (
    <div className="space-y-2">
      {contacts.length > 0 ? (
        contacts.map((contact) => (
          <div
            key={contact.id}
            className={[
              'group relative flex items-center justify-between rounded-xl border p-3 transition',
              selectedContactId === contact.id
                ? 'border-jarvis-accent/40 bg-jarvis-accent/10'
                : 'border-jarvis-border bg-black/20 hover:border-jarvis-muted/40',
            ].join(' ')}
          >
            <button
              type="button"
              onClick={() => onSelectContact(contact.id)}
              className="flex-1 text-left outline-none"
            >
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-jarvis-text">
                  {contact.name} {contact.nickname && <span className="text-xs font-normal text-jarvis-muted">({contact.nickname})</span>}
                </p>
                {contact.priority && (
                  <span className={`h-1.5 w-1.5 rounded-full ${priorityColors[contact.priority] || priorityColors.medium}`} />
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-jarvis-muted uppercase tracking-wider">{contact.relationshipType}</p>
              {contact.lastInteraction && (
                <p className="mt-1 text-[10px] text-jarvis-muted">Last: {contact.lastInteraction}</p>
              )}
            </button>
            
            <div className="flex shrink-0 items-center opacity-0 transition group-hover:opacity-100">
              <IconButton
                icon={Edit2}
                label="Edit"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal('crm', contact.id);
                }}
                size="xs"
              />
            </div>
          </div>
        ))
      ) : (
        <p className="py-4 text-center text-xs text-jarvis-muted italic">No contacts found.</p>
      )}
    </div>
  );
}
