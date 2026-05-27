import { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import PagePanel from '../components/ui/PagePanel';
import JournalCalendar from '../components/journal/JournalCalendar';
import JournalDayPanel from '../components/journal/JournalDayPanel';
import JournalEditor from '../components/journal/JournalEditor';
import JournalEntryForm from '../components/journal/JournalEntryForm';
import EntityModal from '../components/modals/EntityModal';
import { useJournalStore } from '../store/journalStore';
import { useJournalStreak } from '../store/selectors/metrics.selectors';
import { formatDateKey } from '../utils/dateUtils';

export default function Journal() {
  const location = useLocation();
  const entries = useJournalStore((s) => s.entries);
  const selectedEntryId = useJournalStore((s) => s.selectedEntryId);
  const searchQuery = useJournalStore((s) => s.searchQuery);
  const activeType = useJournalStore((s) => s.activeType);
  const activeTag = useJournalStore((s) => s.activeTag);

  const setSelectedEntryId = useJournalStore((s) => s.setSelectedEntryId);
  const setSearchQuery = useJournalStore((s) => s.setSearchQuery);
  const setActiveType = useJournalStore((s) => s.setActiveType);
  const setActiveTag = useJournalStore((s) => s.setActiveTag);
  const updateEntry = useJournalStore((s) => s.updateEntry);
  const addEntry = useJournalStore((s) => s.addEntry);
  const deleteEntry = useJournalStore((s) => s.deleteEntry);

  const [selectedDate, setSelectedDate] = useState(formatDateKey());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialFormData, setInitialFormData] = useState({});

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

  const handleAddEntry = (data = {}) => {
    setInitialFormData(data);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (location.state?.openAddEntry) {
      handleAddEntry({ entryDate: formatDateKey() });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleFormSubmit = async (formData) => {
    try {
      await addEntry(formData);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create journal entry:', err);
      setIsModalOpen(false);
    }
  };

  const dayEntries = useMemo(() => {
    return filteredEntries.filter(e => e.entryDate === selectedDate);
  }, [filteredEntries, selectedDate]);

  const selectedEntry =
    entries.find((entry) => entry.id === selectedEntryId) ?? null;

  const streak = useJournalStreak();

  // Compute dates that have entries for the date list
  const datesWithEntries = useMemo(() => {
    const dateSet = {};
    filteredEntries.forEach(e => {
      if (!dateSet[e.entryDate]) dateSet[e.entryDate] = 0;
      dateSet[e.entryDate]++;
    });
    return Object.entries(dateSet)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 30); // last 30 dates
  }, [filteredEntries]);

  // Auto-select first entry of the day when date changes
  useEffect(() => {
    if (dayEntries.length > 0) {
      setSelectedEntryId(dayEntries[0].id);
    } else {
      setSelectedEntryId(null);
    }
  }, [selectedDate]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedEntryId(null);
  };

  return (
    <ModulePageLayout title="Journal" subtitle="Reflection, emotional awareness, and personal feedback loop.">
      {/* Top control bar */}
      <PagePanel
        title="Journal Controls"
        subtitle={`Streak: ${streak} days`}
        actions={
          <button
            type="button"
            onClick={() => handleAddEntry({ entryDate: selectedDate })}
            className="rounded-lg border border-jarvis-border bg-jarvis-accent/10 px-3 py-1.5 text-xs text-jarvis-accent transition hover:bg-jarvis-accent/20"
          >
            + New Entry
          </button>
        }
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
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
        </div>
      </PagePanel>

      {/* Main 3-column layout */}
      <div className="grid gap-4 xl:grid-cols-[320px_280px_1fr]">
        {/* Column 1: Calendar */}
        <div className="flex flex-col gap-4">
          <JournalCalendar
            entries={filteredEntries}
            onSelectDay={handleDateSelect}
            selectedDate={selectedDate}
            onAddEntry={handleAddEntry}
          />

          {/* Date list — recent dates with entries */}
          <PagePanel title="Entry Dates" subtitle="Click a date to browse">
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
              {datesWithEntries.length === 0 ? (
                <p className="py-4 text-center text-xs text-jarvis-muted italic">No entries yet.</p>
              ) : (
                datesWithEntries.map(([date, count]) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    className={[
                      'flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition',
                      selectedDate === date
                        ? 'bg-jarvis-accent/15 text-jarvis-accent border border-jarvis-accent/30'
                        : 'text-jarvis-text hover:bg-white/5 border border-transparent',
                    ].join(' ')}
                  >
                    <span className="font-medium">
                      {new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-jarvis-muted">{count} {count === 1 ? 'entry' : 'entries'}</span>
                  </button>
                ))
              )}
            </div>
          </PagePanel>
        </div>

        {/* Column 2: Day entries panel */}
        <PagePanel
          title={selectedDate
            ? new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
            : 'Day Explorer'
          }
          subtitle="Select an entry to open it"
          actions={
            <button
              type="button"
              onClick={() => handleAddEntry({ entryDate: selectedDate })}
              className="rounded-md border border-jarvis-border bg-white/5 px-2 py-1 text-[10px] text-jarvis-muted hover:text-jarvis-text transition"
            >
              + Add
            </button>
          }
        >
          <JournalDayPanel
            date={selectedDate}
            entries={dayEntries}
            onEdit={setSelectedEntryId}
            onDelete={deleteEntry}
            selectedEntryId={selectedEntryId}
          />
        </PagePanel>

        {/* Column 3: Editor */}
        <div>
          {selectedEntry ? (
            <JournalEditor
              entry={selectedEntry}
              onUpdate={(updates) => updateEntry(selectedEntry.id, updates)}
            />
          ) : (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-jarvis-border bg-jarvis-panel/20">
              <div className="text-center">
                <p className="text-sm font-medium text-jarvis-text">No entry selected</p>
                <p className="mt-1 text-xs text-jarvis-muted">Click a date on the calendar, then select an entry</p>
              </div>
              <button
                type="button"
                onClick={() => handleAddEntry({ entryDate: selectedDate })}
                className="rounded-lg border border-jarvis-border bg-jarvis-accent/10 px-4 py-2 text-xs text-jarvis-accent hover:bg-jarvis-accent/20 transition"
              >
                + Write for {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Today'}
              </button>
            </div>
          )}
        </div>
      </div>

      <EntityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Journal Entry"
      >
        <JournalEntryForm
          initialData={initialFormData}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </EntityModal>
    </ModulePageLayout>
  );
}
