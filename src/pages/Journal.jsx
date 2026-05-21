import { useMemo } from 'react';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import PagePanel from '../components/ui/PagePanel';
import JournalTimeline from '../components/journal/JournalTimeline';
import JournalEditor from '../components/journal/JournalEditor';
import { useJournalStore } from '../store/journalStore';

export default function Journal() {
  const entries = useJournalStore((s) => s.entries);
  const selectedEntryId = useJournalStore((s) => s.selectedEntryId);
  const searchQuery = useJournalStore((s) => s.searchQuery);
  const activeType = useJournalStore((s) => s.activeType);
  const activeTag = useJournalStore((s) => s.activeTag);
  const calendarPlaceholderOpen = useJournalStore((s) => s.calendarPlaceholderOpen);

  const setSelectedEntryId = useJournalStore((s) => s.setSelectedEntryId);
  const setSearchQuery = useJournalStore((s) => s.setSearchQuery);
  const setActiveType = useJournalStore((s) => s.setActiveType);
  const setActiveTag = useJournalStore((s) => s.setActiveTag);
  const toggleCalendarPlaceholder = useJournalStore((s) => s.toggleCalendarPlaceholder);
  const updateEntryContent = useJournalStore((s) => s.updateEntryContent);
  const updateEntryMood = useJournalStore((s) => s.updateEntryMood);
  const addEntry = useJournalStore((s) => s.addEntry);

  const entryTypes = useMemo(
    () => ['All', ...new Set(entries.map((entry) => entry.type))],
    [entries],
  );
  const tags = useMemo(() => ['All', ...new Set(entries.flatMap((entry) => entry.tags))], [entries]);

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesQuery =
        !query ||
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query);
      const matchesType = activeType === 'All' || entry.type === activeType;
      const matchesTag = activeTag === 'All' || entry.tags.includes(activeTag);
      return matchesQuery && matchesType && matchesTag;
    });
  }, [entries, searchQuery, activeType, activeTag]);

  const selectedEntry =
    filteredEntries.find((entry) => entry.id === selectedEntryId) ?? filteredEntries[0] ?? null;

  const streak = useMemo(() => {
    const dates = new Set(entries.map((entry) => entry.date));
    let streakCount = 0;
    const current = new Date('2026-05-21');
    while (true) {
      const key = current.toISOString().slice(0, 10);
      if (!dates.has(key)) break;
      streakCount += 1;
      current.setDate(current.getDate() - 1);
    }
    return streakCount;
  }, [entries]);

  return (
    <ModulePageLayout title="Journal" subtitle="Reflection, emotional awareness, and personal feedback loop.">
      <PagePanel
        title="Journal Controls"
        subtitle="Search entries, filter by type/tag, and maintain reflection streak."
        actions={
          <button
            type="button"
            onClick={() => addEntry({ type: 'Thoughts', title: 'Quick thought' })}
            className="rounded-lg border border-jarvis-border bg-white/5 px-3 py-1.5 text-xs text-jarvis-text"
          >
            New Entry
          </button>
        }
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search title or content..."
            className="rounded-xl border border-jarvis-border bg-black/20 px-3 py-2 text-sm text-jarvis-text placeholder:text-jarvis-muted focus:outline-none"
          />
          <select
            value={activeType}
            onChange={(event) => setActiveType(event.target.value)}
            className="rounded-xl border border-jarvis-border bg-black/20 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
          >
            {entryTypes.map((type) => (
              <option key={type} value={type} className="bg-jarvis-panel">
                {type}
              </option>
            ))}
          </select>
          <select
            value={activeTag}
            onChange={(event) => setActiveTag(event.target.value)}
            className="rounded-xl border border-jarvis-border bg-black/20 px-3 py-2 text-sm text-jarvis-text focus:outline-none"
          >
            {tags.map((tag) => (
              <option key={tag} value={tag} className="bg-jarvis-panel">
                {tag}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={toggleCalendarPlaceholder}
            className="rounded-xl border border-jarvis-border bg-black/20 px-3 py-2 text-sm text-jarvis-muted"
          >
            Calendar {calendarPlaceholderOpen ? 'On' : 'Off'}
          </button>
        </div>
        <p className="mt-3 text-xs text-jarvis-muted">Reflection streak: {streak} days</p>
      </PagePanel>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <PagePanel title="Timeline" subtitle={`${filteredEntries.length} entries`}>
          <JournalTimeline
            entries={filteredEntries}
            selectedEntryId={selectedEntry?.id}
            onSelectEntry={setSelectedEntryId}
          />
        </PagePanel>

        <JournalEditor
          entry={selectedEntry}
          onContentChange={updateEntryContent}
          onMoodChange={updateEntryMood}
        />
      </div>
    </ModulePageLayout>
  );
}
