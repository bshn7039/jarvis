import { Edit2, Trash2, Mail, Phone, MapPin, Calendar, Tag, ExternalLink, Eye } from 'lucide-react';
import { useEntityStore } from '../../store/entityStore';
import IconButton from '../ui/IconButton';
import RelationshipChips from '../relationships/RelationshipChips';
import { useMemo } from 'react';
import { useGoalStore } from '../../store/goalStore';
import { useAcademicStore } from '../../store/academicStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { useJournalStore } from '../../store/journalStore';

export default function ContactDetail({
  contact,
  reminders,
  interactions,
  onDelete,
}) {
  const { openEditModal } = useEntityStore();
  const goals = useGoalStore((s) => s.goals);
  const subjects = useAcademicStore((s) => s.subjects);
  const schedules = useScheduleStore((s) => s.schedules);
  const journals = useJournalStore((s) => s.entries);

  const linkedEntities = useMemo(() => {
    if (!contact) return [];
    const links = [];
    
    (contact.linkedGoalIds || []).forEach(id => {
      const g = goals.find(x => x.id === id);
      if (g) links.push({ id, title: g.title, type: 'Goal' });
    });
    
    (contact.linkedAcademicIds || []).forEach(id => {
      const s = subjects.find(x => x.id === id);
      if (s) links.push({ id, title: s.name || s.title, type: 'Academic' });
    });

    (contact.linkedScheduleIds || []).forEach(id => {
      const s = schedules.find(x => x.id === id);
      if (s) links.push({ id, title: s.label || s.title, type: 'Schedule' });
    });

    (contact.linkedJournalIds || []).forEach(id => {
      const j = journals.find(x => x.id === id);
      if (j) links.push({ id, title: j.title || j.date, type: 'Journal' });
    });

    return links;
  }, [contact, goals, subjects, schedules, journals]);

  if (!contact) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-jarvis-border p-8 text-center text-sm text-jarvis-muted">
        <p>Select a contact to see relationship details.</p>
      </div>
    );
  }

  const priorityColors = {
    high: 'text-red-400 border-red-400/20 bg-red-400/10',
    medium: 'text-jarvis-text border-jarvis-border bg-white/5',
    low: 'text-jarvis-muted border-jarvis-border bg-white/5',
  };

  return (
    <div className="space-y-6 rounded-2xl border border-jarvis-border bg-jarvis-panel p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-medium text-jarvis-text">{contact.name}</h3>
            {contact.nickname && (
              <span className="text-sm text-jarvis-muted">({contact.nickname})</span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-jarvis-border bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-jarvis-muted">
              {contact.relationshipType}
            </span>
            {contact.priority && (
              <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${priorityColors[contact.priority] || priorityColors.medium}`}>
                {contact.priority} Priority
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            icon={Eye}
            label="View Notes"
            onClick={() => openEditModal('crm', contact.id, 'view')}
            size="sm"
          />
          <IconButton
            icon={Edit2}
            label="Edit Notes"
            onClick={() => openEditModal('crm', contact.id, 'notes')}
            size="sm"
          />
          <IconButton
            icon={Trash2}
            label="Delete Contact"
            onClick={onDelete}
            size="sm"
            className="text-red-400 hover:bg-red-400/10 hover:text-red-300"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          {contact.email && (
            <div className="flex items-center gap-2 text-sm text-jarvis-text">
              <Mail size={14} className="text-jarvis-muted" />
              <span>{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2 text-sm text-jarvis-text">
              <Phone size={14} className="text-jarvis-muted" />
              <span>{contact.phone}</span>
            </div>
          )}
          {contact.location && (
            <div className="flex items-center gap-2 text-sm text-jarvis-text">
              <MapPin size={14} className="text-jarvis-muted" />
              <span>{contact.location}</span>
            </div>
          )}
          {contact.birthday && (
            <div className="flex items-center gap-2 text-sm text-jarvis-text">
              <Calendar size={14} className="text-jarvis-muted" />
              <span>{contact.birthday}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {contact.socialLinks && contact.socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {contact.socialLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-1.5 rounded-lg border border-jarvis-border bg-black/20 px-2 py-1 text-xs text-jarvis-text">
                  <ExternalLink size={10} className="text-jarvis-muted" />
                  {link}
                </div>
              ))}
            </div>
          )}
          {contact.tags && contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {contact.tags.map((tag, idx) => (
                <div key={idx} className="flex items-center gap-1.5 rounded-lg border border-jarvis-border bg-black/20 px-2 py-1 text-xs text-jarvis-muted">
                  <Tag size={10} />
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {contact.notes && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-jarvis-muted">Notes</p>
          <div className="mt-2 rounded-xl border border-jarvis-border bg-black/20 p-4 text-sm leading-relaxed text-jarvis-text whitespace-pre-wrap">
            {contact.notes}
          </div>
        </div>
      )}

      {linkedEntities.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-jarvis-muted">Linked Entities</p>
          <div className="mt-2">
            <RelationshipChips links={linkedEntities} emptyLabel="No linked entities" />
          </div>
        </div>
      )}

      {reminders.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-jarvis-muted">Upcoming Reminders</p>
          <div className="mt-2 space-y-2">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between rounded-lg border border-jarvis-border bg-black/20 px-3 py-2"
              >
                <span className="text-xs text-jarvis-text">{reminder.title}</span>
                <span className="text-[10px] text-jarvis-muted">
                  {reminder.status === 'done' ? 'Done' : `Due ${reminder.dueDate}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[10px] uppercase tracking-[0.1em] text-jarvis-muted">Memory Timeline</p>
        <div className="mt-2 space-y-2">
          {interactions.length > 0 ? (
            interactions.map((interaction) => (
              <div key={interaction.id} className="rounded-lg border border-jarvis-border bg-black/20 p-3">
                <p className="text-[10px] text-jarvis-muted">{interaction.date}</p>
                <p className="mt-1 text-xs text-jarvis-text">{interaction.note}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-jarvis-muted italic">No interaction history yet.</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-jarvis-border pt-4 text-[10px] text-jarvis-muted">
        <span>Created: {new Date(contact.createdAt).toLocaleDateString()}</span>
        {contact.lastInteraction && <span>Last Interaction: {contact.lastInteraction}</span>}
        <span>Updated: {new Date(contact.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
