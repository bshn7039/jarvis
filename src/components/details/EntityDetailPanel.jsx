import { useMemo } from 'react';
import { useActivityStore } from '../../store/activityStore';
import { useGoalStore } from '../../store/goalStore';
import { useAcademicStore } from '../../store/academicStore';
import { useScheduleStore } from '../../store/scheduleStore';
import { useJournalStore } from '../../store/journalStore';
import { useFinanceStore } from '../../store/financeStore';
import { useCrmStore } from '../../store/crmStore';
import BaseModal from '../modals/BaseModal';
import RelationshipChips from '../relationships/RelationshipChips';

function buildLinks(ids = [], collection = [], labelField = 'title') {
  const map = new Map(collection.map((item) => [item.id, item]));
  return ids.map((id) => {
    const item = map.get(id);
    return { id, title: item?.[labelField] || item?.title || item?.name || id };
  });
}

export default function EntityDetailPanel({ isOpen, onClose, entity, onEdit, onDuplicate, onArchive, onRestore, onDelete, onComplete }) {
  const activities = useActivityStore((state) => state.activities);
  const goals = useGoalStore((state) => state.goals);
  const subjects = useAcademicStore((state) => state.subjects);
  const schedules = useScheduleStore((state) => state.schedules);
  const journals = useJournalStore((state) => state.entries);
  const financeEntries = useFinanceStore((state) => state.transactions);
  const contacts = useCrmStore((state) => state.contacts);

  const recentActivity = useMemo(
    () => activities.filter((activity) => activity.entityType === 'task' && activity.entityId === entity?.id).slice(0, 8),
    [activities, entity?.id],
  );

  const linked = useMemo(
    () => ({
      goals: buildLinks(entity?.linkedGoalIds, goals),
      academics: buildLinks(entity?.linkedSubjectIds, subjects, 'name'),
      schedules: buildLinks(entity?.linkedScheduleIds, schedules, 'label'),
      journals: buildLinks(entity?.linkedJournalIds, journals),
      finance: buildLinks(entity?.linkedFinanceIds, financeEntries, 'note'),
      contacts: buildLinks(entity?.linkedContactIds, contacts, 'name'),
    }),
    [contacts, entity?.linkedContactIds, entity?.linkedFinanceIds, entity?.linkedGoalIds, entity?.linkedJournalIds, entity?.linkedScheduleIds, entity?.linkedSubjectIds, financeEntries, goals, journals, schedules, subjects],
  );

  if (!entity) return null;

  const isArchived = entity.status === 'archived';

  return (
    <BaseModal open={isOpen} onClose={onClose} size="lg" ariaLabel="Task details">
      <div className="space-y-4 text-sm text-jarvis-text">
        <header className="space-y-1 border-b border-jarvis-border pb-3">
          <h2 className="text-lg font-medium">{entity.title}</h2>
          <p className="text-xs text-jarvis-muted">{entity.description || 'No description'}</p>
          <div className="flex flex-wrap gap-1.5 text-[11px] text-jarvis-muted">
            <span>Status: {entity.status}</span>
            <span>Progress: {entity.progress}%</span>
            <span>Priority: {entity.priority}</span>
            <span>Energy: {entity.energy}</span>
            <span>Due: {entity.deadline ? new Date(entity.deadline).toLocaleDateString() : 'None'}</span>
            <span>Created: {entity.createdAt ? new Date(entity.createdAt).toLocaleDateString() : 'Unknown'}</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button type="button" onClick={() => onEdit?.(entity.id)} className="rounded border border-jarvis-border px-2 py-1 text-xs text-jarvis-text">Edit</button>
            <button type="button" onClick={() => onDuplicate?.(entity.id)} className="rounded border border-jarvis-border px-2 py-1 text-xs text-jarvis-text">Duplicate</button>
            {entity.status !== 'completed' ? (
              <button type="button" onClick={() => onComplete?.(entity.id)} className="rounded border border-jarvis-border px-2 py-1 text-xs text-jarvis-text">Complete</button>
            ) : null}
            {!isArchived ? (
              <button type="button" onClick={() => onArchive?.(entity.id)} className="rounded border border-jarvis-border px-2 py-1 text-xs text-jarvis-text">Archive</button>
            ) : (
              <button type="button" onClick={() => onRestore?.(entity.id)} className="rounded border border-jarvis-border px-2 py-1 text-xs text-jarvis-text">Restore</button>
            )}
            <button type="button" onClick={() => onDelete?.(entity.id)} className="rounded border border-jarvis-border px-2 py-1 text-xs text-jarvis-muted">Delete</button>
          </div>
        </header>

        <section className="space-y-2">
          <h3 className="text-xs uppercase tracking-wide text-jarvis-muted">Linked Entities</h3>
          <RelationshipChips links={linked.goals} emptyLabel="No goals linked" />
          <RelationshipChips links={linked.academics} emptyLabel="No academics linked" />
          <RelationshipChips links={linked.schedules} emptyLabel="No schedules linked" />
          <RelationshipChips links={linked.journals} emptyLabel="No journal entries linked" />
          <RelationshipChips links={linked.finance} emptyLabel="No finance entries linked" />
          <RelationshipChips links={linked.contacts} emptyLabel="No contacts linked" />
        </section>

        <section className="space-y-2">
          <h3 className="text-xs uppercase tracking-wide text-jarvis-muted">Recent Activity</h3>
          {recentActivity.length ? (
            <div className="space-y-1">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="rounded border border-jarvis-border bg-black/20 px-2 py-1.5 text-xs text-jarvis-muted">
                  <span className="text-jarvis-text">{activity.action}</span> {' '}on{' '}
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-jarvis-muted">No recent activity for this task.</p>
          )}
        </section>
      </div>
    </BaseModal>
  );
}
