export default function ContactDetail({
  contact,
  reminders,
  interactions,
  onNotesChange,
  onToggleReminder,
}) {
  if (!contact) {
    return (
      <div className="rounded-2xl border border-dashed border-jarvis-border p-6 text-sm text-jarvis-muted">
        Select a contact to see relationship details.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-jarvis-border bg-jarvis-panel p-4 md:p-5">
      <div>
        <h3 className="text-base text-jarvis-text md:text-lg">{contact.name}</h3>
        <p className="mt-1 text-sm text-jarvis-muted">{contact.connectionContext}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <p className="rounded-lg border border-jarvis-border bg-black/20 p-2 text-xs text-jarvis-muted">
          Likes: {contact.likes}
        </p>
        <p className="rounded-lg border border-jarvis-border bg-black/20 p-2 text-xs text-jarvis-muted">
          Dislikes: {contact.dislikes}
        </p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-jarvis-muted">Relationship Notes</p>
        <textarea
          value={contact.notes}
          onChange={(event) => onNotesChange(contact.id, event.target.value)}
          className="mt-2 h-28 w-full rounded-xl border border-jarvis-border bg-black/20 p-3 text-sm text-jarvis-text focus:outline-none"
        />
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-jarvis-muted">Reminders</p>
        <div className="mt-2 space-y-2">
          {reminders.map((reminder) => (
            <button
              key={reminder.id}
              type="button"
              onClick={() => onToggleReminder(reminder.id)}
              className="flex w-full items-center justify-between rounded-lg border border-jarvis-border bg-black/20 px-3 py-2 text-left"
            >
              <span className="text-xs text-jarvis-text">{reminder.title}</span>
              <span className="text-[11px] text-jarvis-muted">
                {reminder.status === 'done' ? 'Done' : `Due ${reminder.dueDate}`}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-jarvis-muted">Memory Timeline</p>
        <div className="mt-2 space-y-2">
          {interactions.map((interaction) => (
            <div key={interaction.id} className="rounded-lg border border-jarvis-border bg-black/20 p-2.5">
              <p className="text-[11px] text-jarvis-muted">{interaction.date}</p>
              <p className="mt-1 text-xs text-jarvis-text">{interaction.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
