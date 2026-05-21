import { Plus, Search } from 'lucide-react';
import { TASK_CATEGORIES, TASK_PRIORITIES } from '../../data/mockDatabase';

function FilterSelect({ value, onChange, options, label }) {
  return (
    <label className="flex items-center gap-2 text-xs text-jarvis-muted">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-jarvis-border bg-black/20 px-2 py-1 text-xs text-jarvis-text focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-jarvis-panel text-jarvis-text">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function TaskToolbar({
  searchQuery,
  onSearchQueryChange,
  activeCategory,
  onCategoryChange,
  activePriority,
  onPriorityChange,
  onQuickAdd,
}) {
  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-4 md:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-lg">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-jarvis-muted" />
          <input
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search tasks, tags, goals..."
            className="w-full rounded-xl border border-jarvis-border bg-black/25 py-2 pl-9 pr-3 text-sm text-jarvis-text placeholder:text-jarvis-muted focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            value={activeCategory}
            onChange={onCategoryChange}
            options={['All', ...TASK_CATEGORIES]}
            label="Category"
          />
          <FilterSelect
            value={activePriority}
            onChange={onPriorityChange}
            options={['All', ...TASK_PRIORITIES]}
            label="Priority"
          />
          <button
            type="button"
            onClick={onQuickAdd}
            className="inline-flex items-center gap-1.5 rounded-lg border border-jarvis-border bg-white/5 px-3 py-1.5 text-xs text-jarvis-text transition hover:border-jarvis-muted/40"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Add Task
          </button>
        </div>
      </div>
    </section>
  );
}
