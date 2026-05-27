import { useState, useMemo } from 'react';
import { Search, Filter, Clock, ArrowUpDown, Trash2, AlertTriangle } from 'lucide-react';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import { useActivityStore } from '../store/activityStore';

const entityTypeLabels = {
  task: 'Task',
  goal: 'Goal',
  journal_entry: 'Journal',
  transaction: 'Finance',
  workout: 'Fitness',
  assignment: 'Academic',
  contact: 'CRM',
  profile: 'Profile',
  schedule: 'Schedule'
};

const actionLabels = {
  created: 'Created',
  updated: 'Updated',
  completed: 'Completed',
  archived: 'Archived',
  deleted: 'Deleted',
  progress_updated: 'Progress Updated',
  reopened: 'Reopened'
};

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupByDay(activities) {
  const groups = {};
  activities.forEach(activity => {
    const day = activity.timestamp.slice(0, 10);
    if (!groups[day]) groups[day] = [];
    groups[day].push(activity);
  });
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

export default function Activity() {
  const activities = useActivityStore((s) => s.activities);
  const clearHistory = useActivityStore((s) => s.clearHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearActivity = async () => {
    await clearHistory();
    setShowClearConfirm(false);
  };

  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.type.toLowerCase().includes(query) ||
        a.action.toLowerCase().includes(query) ||
        (a.metadata?.title && a.metadata.title.toLowerCase().includes(query))
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.type === filterType);
    }

    filtered.sort((a, b) => {
      const diff = a.timestamp.localeCompare(b.timestamp);
      return sortOrder === 'newest' ? -diff : diff;
    });

    return filtered;
  }, [activities, searchQuery, filterType, sortOrder]);

  const groupedActivities = useMemo(() => groupByDay(filteredActivities), [filteredActivities]);

  const entityTypes = useMemo(() => {
    const types = new Set(activities.map(a => a.type));
    return ['all', ...Array.from(types).sort()];
  }, [activities]);

  return (
    <ModulePageLayout
      title="Activity Timeline"
      subtitle="Track every action across your system"
    >
      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowClearConfirm(false); }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-red-900/40 bg-jarvis-panel p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-900/30 bg-red-900/10">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-jarvis-text">Clear All Activity?</h3>
                <p className="text-[11px] text-jarvis-muted">This cannot be undone.</p>
              </div>
            </div>
            <p className="mb-5 text-xs text-jarvis-muted">
              All {activities.length} activity entries will be permanently deleted from your timeline.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="rounded-lg border border-jarvis-border bg-white/5 px-4 py-2 text-xs text-jarvis-muted hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearActivity}
                className="rounded-lg border border-red-900/40 bg-red-900/10 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-900/20 transition-colors"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-jarvis-muted" strokeWidth={1.75} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities..."
            className="w-full rounded-lg border border-jarvis-border bg-jarvis-panel py-2 pl-10 pr-4 text-sm text-jarvis-text placeholder-jarvis-muted/50 outline-none transition-colors focus:border-jarvis-accent/40"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-jarvis-muted" strokeWidth={1.75} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-jarvis-border bg-jarvis-panel px-3 py-2 text-sm text-jarvis-text outline-none transition-colors focus:border-jarvis-accent/40"
            >
              {entityTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : entityTypeLabels[type] || type}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-1.5 rounded-lg border border-jarvis-border bg-jarvis-panel px-3 py-2 text-sm text-jarvis-muted transition-colors hover:text-jarvis-text"
          >
            <ArrowUpDown className="h-4 w-4" strokeWidth={1.75} />
            {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </button>
          {activities.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-900/30 bg-red-900/5 px-3 py-2 text-sm text-red-400/70 transition-colors hover:border-red-900/50 hover:text-red-400"
              title="Clear all activity"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {groupedActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Clock className="mb-4 h-12 w-12 text-jarvis-muted/30" strokeWidth={1.5} />
            <p className="text-sm text-jarvis-muted">No activities recorded yet</p>
            <p className="mt-1 text-xs text-jarvis-muted/60">
              Activities will appear here as you interact with the system
            </p>
          </div>
        ) : (
          groupedActivities.map(([day, dayActivities]) => (
            <div key={day}>
              <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-jarvis-muted">
                {new Date(day + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <div className="space-y-2">
                {dayActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 rounded-xl border border-jarvis-border bg-jarvis-panel p-3 transition-colors hover:border-jarvis-muted/40"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-jarvis-border bg-jarvis-bg/60">
                      <span className="text-[10px] font-medium uppercase text-jarvis-muted">
                        {activity.type.slice(0, 2)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-jarvis-text">
                          {actionLabels[activity.action] || activity.action}
                        </span>
                        <span className="text-xs text-jarvis-muted">
                          {entityTypeLabels[activity.entityType] || activity.entityType}
                        </span>
                      </div>
                      {activity.metadata?.title && (
                        <p className="mt-0.5 truncate text-xs text-jarvis-muted/80">
                          {activity.metadata.title}
                        </p>
                      )}
                      {activity.metadata?.amount && (
                        <p className="mt-0.5 text-xs text-jarvis-muted/80">
                          ₹{activity.metadata.amount.toLocaleString()}
                        </p>
                      )}
                      {activity.metadata?.progress !== undefined && (
                        <p className="mt-0.5 text-xs text-jarvis-muted/80">
                          Progress: {activity.metadata.progress}%
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-jarvis-muted/60">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </ModulePageLayout>
  );
}
