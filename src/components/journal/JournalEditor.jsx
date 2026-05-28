import { Star, Archive, Tag, Layout, Link as LinkIcon } from 'lucide-react';
import EntityLinkSelector from '../relationships/EntityLinkSelector';
import { useGoalStore } from '../../store/goalStore';
import { useTaskStore } from '../../store/taskStore';
import { useMemo } from 'react';

export default function JournalEditor({ entry, onUpdate }) {
  const goals = useGoalStore((s) => s.goals);
  const tasks = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);

  const relationshipOptions = useMemo(() => ({
    linkedGoalIds: goals.map((g) => ({ id: g.id, title: g.title })),
    linkedTaskIds: tasks.map((t) => ({ id: t.id, title: t.title })),
  }), [goals, tasks]);

  const activeLinkedTaskIds = useMemo(() => {
    if (!entry) return [];
    const directLinks = entry.linkedTaskIds || [];
    const inverseLinks = tasks
      .filter((t) => t.linkedJournalIds?.includes(entry.id))
      .map((t) => t.id);
    return Array.from(new Set([...directLinks, ...inverseLinks]));
  }, [entry?.linkedTaskIds, entry?.id, tasks]);

  const handleTaskLinksChange = async (newIds) => {
    // 1. Update direct journal entry links
    onUpdate({ linkedTaskIds: newIds });

    // 2. Sync inverse links in the task store
    const added = newIds.filter(id => !activeLinkedTaskIds.includes(id));
    const removed = activeLinkedTaskIds.filter(id => !newIds.includes(id));

    for (const taskId of added) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const nextJournalIds = Array.from(new Set([...(task.linkedJournalIds || []), entry.id]));
        await updateTask(taskId, { linkedJournalIds: nextJournalIds });
      }
    }

    for (const taskId of removed) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const nextJournalIds = (task.linkedJournalIds || []).filter(id => id !== entry.id);
        await updateTask(taskId, { linkedJournalIds: nextJournalIds });
      }
    }
  };

  if (!entry) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-dashed border-jarvis-border bg-jarvis-panel/20 text-sm text-jarvis-muted">
        Select an entry from the explorer to begin reflecting.
      </div>
    );
  }

  const handleMoodChange = (val) => onUpdate({ mood: Number(val) });
  const toggleFavorite = () => onUpdate({ favorite: !entry.favorite });
  const toggleArchived = () => onUpdate({ archived: !entry.archived });

  return (
    <div className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-5 transition-all duration-300">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-[200px]">
            <input 
              value={entry.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Entry Title..."
              className="w-full bg-transparent text-xl font-medium text-jarvis-text outline-none placeholder:text-jarvis-muted"
            />
            <div className="mt-1 flex items-center gap-3 text-[10px] uppercase tracking-widest text-jarvis-muted">
              <span>{new Date(entry.entryDate).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
              <span className="h-1 w-1 rounded-full bg-jarvis-border" />
              <input 
                value={entry.type}
                onChange={(e) => onUpdate({ type: e.target.value })}
                className="bg-transparent outline-none hover:text-jarvis-text transition-colors"
                placeholder="TYPE"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleFavorite}
              className={['p-2 rounded-lg border transition-colors', entry.favorite ? 'border-jarvis-accent/40 bg-jarvis-accent/10 text-jarvis-accent' : 'border-jarvis-border text-jarvis-muted hover:bg-white/5'].join(' ')}
            >
              <Star className={['h-4 w-4', entry.favorite ? 'fill-current' : ''].join(' ')} />
            </button>
            <button 
              onClick={toggleArchived}
              className={['p-2 rounded-lg border transition-colors', entry.archived ? 'border-jarvis-border bg-white/10 text-jarvis-text' : 'border-jarvis-border text-jarvis-muted hover:bg-white/5'].join(' ')}
            >
              <Archive className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 rounded-xl border border-jarvis-border bg-jarvis-bg/40 p-3">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-jarvis-muted">
              <span className="flex items-center gap-1.5"><Layout className="h-3 w-3" /> Mood Awareness</span>
              <span className="font-medium text-jarvis-text">{entry.mood !== null ? `${entry.mood}/10` : 'Not Set'}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={entry.mood || 5}
              onChange={(e) => handleMoodChange(e.target.value)}
              className="h-1.5 w-full appearance-none rounded-lg bg-jarvis-border accent-jarvis-accent"
            />
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-jarvis-border bg-jarvis-bg/40 p-3">
             <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-jarvis-muted">
              <Tag className="h-3 w-3" /> Tags & Aspects
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <input 
                value={entry.tags?.join(', ') || ''}
                onChange={(e) => onUpdate({ tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="Add tags (comma separated)..."
                className="w-full bg-transparent text-[11px] text-jarvis-text outline-none placeholder:text-jarvis-muted"
              />
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 rounded-xl border border-jarvis-border bg-jarvis-bg/40 p-3">
             <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-jarvis-muted">
              <LinkIcon className="h-3 w-3" /> Linked Goals
            </div>
            <EntityLinkSelector
              entities={relationshipOptions.linkedGoalIds}
              value={entry.linkedGoalIds || []}
              onChange={(val) => onUpdate({ linkedGoalIds: val })}
              placeholder="Link goals..."
              hideLabel
            />
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-jarvis-border bg-jarvis-bg/40 p-3">
             <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-jarvis-muted">
              <LinkIcon className="h-3 w-3" /> Linked Tasks
            </div>
            <EntityLinkSelector
              entities={relationshipOptions.linkedTaskIds}
              value={activeLinkedTaskIds}
              onChange={handleTaskLinksChange}
              placeholder="Link tasks..."
              hideLabel
            />
          </div>
        </div>

        {/* Editor Area */}
        <div className="relative">
          <textarea
            value={entry.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Start writing..."
            className="min-h-[350px] w-full resize-none rounded-xl border border-jarvis-border bg-black/20 p-4 text-sm leading-relaxed text-jarvis-text placeholder:text-jarvis-muted focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
