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
      console.log('Submitting journal entry:', formData);
      await addEntry(formData);
      console.log('Journal entry created, closing modal');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create journal entry:', err);
      // Still close if user expects it, or show error
      setIsModalOpen(false);
    }
  };

  const dayEntries = useMemo(() => {
    return filteredEntries.filter(e => e.entryDate === selectedDate);
  }, [filteredEntries, selectedDate]);

  const selectedEntry =
    entries.find((entry) => entry.id === selectedEntryId) ?? null;

  const streak = useJournalStreak();

  // If selectedEntryId is null but dayEntries has items, select the first one
  useEffect(() => {
    if (!selectedEntryId && dayEntries.length > 0) {
      setSelectedEntryId(dayEntries[0].id);
    }
  }, [dayEntries, selectedEntryId, setSelectedEntryId]);

  return (
    <ModulePageLayout title="Journal" subtitle="Reflection, emotional awareness, and personal feedback loop.">
      <PagePanel
        title="Journal Controls"
        subtitle="Search entries, filter by type/tag, and maintain reflection streak."
        actions={
          <button
            type="button"
            onClick={() => handleAddEntry({ entryDate: selectedDate })}
            className="rounded-lg border border-jarvis-border bg-white/5 px-3 py-1.5 text-xs text-jarvis-text hover:bg-white/10"
          >
            New Entry
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
        <p className="mt-3 text-xs text-jarvis-muted">Reflection streak: {streak} days</p>
      </PagePanel>

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-6">
          <JournalCalendar 
            entries={filteredEntries} 
            onSelectDay={setSelectedDate}
            selectedDate={selectedDate}
            onAddEntry={handleAddEntry}
          />
          
          <JournalEditor
            entry={selectedEntry}
            onUpdate={(updates) => updateEntry(selectedEntry.id, updates)}
          />
        </div>

        <PagePanel title="Day Explorer" subtitle={`Selected: ${selectedDate}`}>
          <JournalDayPanel
            date={selectedDate}
            entries={dayEntries}
            onEdit={setSelectedEntryId}
            onDelete={deleteEntry}
            selectedEntryId={selectedEntryId}
          />
        </PagePanel>
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
