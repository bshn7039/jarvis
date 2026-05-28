import { useState } from 'react';
import { Pencil, Plus, Trash2, RefreshCcw } from 'lucide-react';
import CinematicLoader from '../ui/CinematicLoader';
import { categoryStyles } from '../../utils/constants';
import { useUiStore } from '../../store/uiStore';
import { useAiStore } from '../../store/aiStore';

const statusStyles = {
  done: 'bg-jarvis-muted/30 border-jarvis-muted/40',
  active: 'bg-jarvis-accent/60 border-jarvis-accent shadow-[0_0_10px_rgba(125,211,252,0.35)]',
  upcoming: 'bg-jarvis-border border-jarvis-border',
};

const CATEGORIES = ['Routines', 'Coding', 'Academics', 'Fitness', 'Gym', 'Personal', 'Journal'];

export default function TodaySchedule({ schedule, onRefresh, isGenerating }) {
  const sectionExpanded = useUiStore(
    (s) => s.commandCenter.collapsedSections['command:schedule'] ?? true,
  );
  const toggleCommandExpanded = useUiStore((s) => s.toggleCommandExpanded);

  // AI Store actions for inline editing
  const addToSchedule = useAiStore((s) => s.addToSchedule);
  const updateScheduleItem = useAiStore((s) => s.updateScheduleItem);
  const deleteScheduleItem = useAiStore((s) => s.deleteScheduleItem);

  // Local state for inline Add/Edit forms
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [time, setTime] = useState('');
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('Routines');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!time || !label) return;
    addToSchedule({ time, label, category, status: 'upcoming' });
    resetForm();
  };

  const handleEditSubmit = (e, id) => {
    e.preventDefault();
    if (!time || !label) return;
    updateScheduleItem(id, { time, label, category });
    resetForm();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setTime(item.time);
    setLabel(item.label);
    setCategory(item.category || 'Routines');
    setIsAdding(false);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setTime('');
    setLabel('');
    setCategory('Routines');
  };

  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => toggleCommandExpanded('command:schedule')}
          className="text-sm font-medium uppercase tracking-wider text-jarvis-muted hover:text-jarvis-text text-left"
        >
          Today Schedule
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isGenerating}
            type="button"
            className="rounded-lg border border-jarvis-border p-1.5 text-jarvis-muted hover:border-jarvis-muted/40 hover:text-jarvis-text transition-all duration-300 disabled:opacity-50"
            title="Refresh AI Schedule"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : 'hover:rotate-45 transition-transform duration-300'}`} />
          </button>
          <button
            onClick={() => {
              if (isAdding) resetForm();
              else {
                resetForm();
                setIsAdding(true);
              }
            }}
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-jarvis-border px-2.5 py-1.5 text-xs text-jarvis-muted transition-colors duration-200 hover:border-jarvis-muted/40 hover:text-jarvis-text"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            {isAdding ? 'Cancel' : 'Add Item'}
          </button>
        </div>
      </div>

      <div
        className={[
          'grid transition-all duration-200 ease-out',
          sectionExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          {/* Add Form */}
          {isAdding && (
            <form onSubmit={handleAddSubmit} className="mb-5 rounded-xl border border-jarvis-border bg-jarvis-bg/40 p-3 space-y-2.5">
              <p className="text-xs font-semibold text-jarvis-muted uppercase tracking-wider">New Schedule Slot</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="08:00"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-20 rounded-lg border border-jarvis-border bg-jarvis-panel px-2.5 py-1.5 font-mono text-sm text-jarvis-text focus:border-jarvis-muted focus:outline-none"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 rounded-lg border border-jarvis-border bg-jarvis-panel px-2.5 py-1.5 text-sm text-jarvis-text focus:border-jarvis-muted focus:outline-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                required
                placeholder="Morning routine & breakfast..."
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full rounded-lg border border-jarvis-border bg-jarvis-panel px-2.5 py-1.5 text-sm text-jarvis-text focus:border-jarvis-muted focus:outline-none"
              />
              <div className="flex justify-end gap-2 text-xs pt-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg px-3 py-1.5 text-jarvis-muted hover:text-jarvis-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-jarvis-muted/20 border border-jarvis-border px-3.5 py-1.5 font-medium text-jarvis-text hover:bg-jarvis-muted/30"
                >
                  Save Slot
                </button>
              </div>
            </form>
          )}

          {isGenerating ? (
            <div className="py-4">
              <CinematicLoader size="sm" message="Recalibrating schedule grid..." />
            </div>
          ) : schedule.length > 0 ? (
            <div className="relative ml-2 border-l border-jarvis-border/80 pl-6">
              {schedule.map((item) => (
                <div
                  key={item.id}
                  className="group relative mb-5 flex gap-2 pb-1 last:mb-0"
                >
                  <span
                    onClick={() => {
                      const nextStatus = item.status === 'done' ? 'upcoming' : 'done';
                      updateScheduleItem(item.id, { status: nextStatus });
                    }}
                    className={[
                      'absolute -left-[29px] top-2 h-3 w-3 rounded-full border-2 cursor-pointer transition-colors duration-200',
                      statusStyles[item.status] || statusStyles.upcoming,
                    ].join(' ')}
                    title="Toggle Status"
                  />

                  {editingId === item.id ? (
                    /* Inline Edit Form */
                    <form onSubmit={(e) => handleEditSubmit(e, item.id)} className="w-full rounded-lg border border-jarvis-border bg-jarvis-bg/40 p-3 space-y-2.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-20 rounded-lg border border-jarvis-border bg-jarvis-panel px-2.5 py-1.5 font-mono text-sm text-jarvis-text focus:border-jarvis-muted focus:outline-none"
                        />
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="flex-1 rounded-lg border border-jarvis-border bg-jarvis-panel px-2.5 py-1.5 text-sm text-jarvis-text focus:border-jarvis-muted focus:outline-none"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="text"
                        required
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="w-full rounded-lg border border-jarvis-border bg-jarvis-panel px-2.5 py-1.5 text-sm text-jarvis-text focus:border-jarvis-muted focus:outline-none"
                      />
                      <div className="flex justify-end gap-2 text-xs pt-1">
                        <button
                          type="button"
                          onClick={resetForm}
                          className="rounded-lg px-3 py-1.5 text-jarvis-muted hover:text-jarvis-text"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-lg bg-jarvis-muted/20 border border-jarvis-border px-3.5 py-1.5 font-medium text-jarvis-text hover:bg-jarvis-muted/30"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* View Mode */
                    <div className="min-w-0 flex-1 rounded-lg border border-jarvis-border/60 bg-jarvis-bg/30 px-3 py-2 transition-colors duration-200 hover:border-jarvis-muted/30">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-mono text-xs text-jarvis-muted">{item.time}</p>
                          <p className={`mt-1 text-sm text-jarvis-text ${item.status === 'done' ? 'line-through opacity-50' : ''}`}>
                            {item.label}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span
                            className={[
                              'rounded-full border px-2 py-0.5 text-[10px]',
                              categoryStyles[item.category] ?? categoryStyles.System,
                            ].join(' ')}
                          >
                            {item.category}
                          </span>
                          
                          {/* Edit / Delete hover actions */}
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-1">
                            <button
                              onClick={() => startEdit(item)}
                              type="button"
                              className="rounded p-1 text-jarvis-muted hover:bg-jarvis-border hover:text-jarvis-text transition-colors animate-fade-in"
                              title="Edit item"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => deleteScheduleItem(item.id)}
                              type="button"
                              className="rounded p-1 text-jarvis-muted hover:bg-jarvis-border hover:text-red-400 transition-colors animate-fade-in"
                              title="Delete item"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-jarvis-muted">
              No items scheduled for today
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
