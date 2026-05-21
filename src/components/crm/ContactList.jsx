export default function ContactList({
  contacts,
  selectedContactId,
  onSelectContact,
}) {
  return (
    <div className="space-y-2">
      {contacts.map((contact) => (
        <button
          key={contact.id}
          type="button"
          onClick={() => onSelectContact(contact.id)}
          className={[
            'w-full rounded-xl border p-3 text-left transition',
            selectedContactId === contact.id
              ? 'border-jarvis-accent/40 bg-jarvis-accent/10'
              : 'border-jarvis-border bg-black/20 hover:border-jarvis-muted/40',
          ].join(' ')}
        >
          <p className="text-sm text-jarvis-text">{contact.name}</p>
          <p className="mt-1 text-xs text-jarvis-muted">{contact.connectionContext}</p>
          <p className="mt-1 text-[11px] text-jarvis-muted">Last interaction: {contact.lastInteraction}</p>
        </button>
      ))}
    </div>
  );
}
