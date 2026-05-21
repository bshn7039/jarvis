import { ChevronDown, ChevronRight } from 'lucide-react';
import TaskCard from './TaskCard';

export default function TaskColumn({
  title,
  tasks,
  collapsed,
  onToggleCollapsed,
  goalMap,
  scheduleMap,
  expandedTaskIds,
  onToggleTaskExpanded,
  onToggleTaskCompleted,
}) {
  return (
    <section className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-3 md:p-4">
      <button
        type="button"
        onClick={onToggleCollapsed}
        className="mb-3 flex w-full items-center justify-between rounded-lg px-1 py-1 text-left text-sm text-jarvis-text hover:bg-white/[0.03]"
      >
        <span className="flex items-center gap-2">
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-jarvis-muted" strokeWidth={1.75} />
          ) : (
            <ChevronDown className="h-4 w-4 text-jarvis-muted" strokeWidth={1.75} />
          )}
          {title}
        </span>
        <span className="rounded-md border border-jarvis-border px-2 py-0.5 text-[11px] text-jarvis-muted">
          {tasks.length}
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-2">
          {tasks.length === 0 && (
            <p className="rounded-lg border border-dashed border-jarvis-border/70 p-3 text-xs text-jarvis-muted">
              No tasks in this section with current filters.
            </p>
          )}
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              goalTitle={goalMap[task.linkedGoal]}
              scheduleLabel={scheduleMap[task.scheduleId]}
              isExpanded={Boolean(expandedTaskIds[task.id])}
              onToggleExpanded={onToggleTaskExpanded}
              onToggleCompleted={onToggleTaskCompleted}
            />
          ))}
        </div>
      )}
    </section>
  );
}
