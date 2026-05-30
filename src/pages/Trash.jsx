import { useState, useMemo } from 'react';
import {
  ClipboardList,
  Target,
  NotebookText,
  WalletCards,
  Dumbbell,
  Handshake,
  GraduationCap,
  Calendar,
  Heart,
  MessageSquare,
  TrendingUp,
  Globe,
  Music,
  PenTool,
  BookOpen,
  KeyRound,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  AlertTriangle,
  Archive,
  ArrowUpDown
} from 'lucide-react';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import { useTrashStore } from '../store/trashStore';

const entityLabels = {
  tasks: 'Task',
  goals: 'Goal',
  journalEntries: 'Journal Entry',
  financeTransactions: 'Transaction',
  fitnessLogs: 'Fitness Log',
  crmContacts: 'CRM Contact',
  academicSubjects: 'Academic Subject',
  academicAssignments: 'Academic Assignment',
  academicPracticals: 'Academic Practical',
  academicRevisionLogs: 'Academic Revision Log',
  academicProjects: 'Academic Project',
  academicSkills: 'Academic Skill',
  academicLearning: 'Academic Learning Topic',
  academicDsa: 'DSA Solved Question',
  academicTechStack: 'Tech Stack Item',
  academicCertifications: 'Certification',
  academicPortfolio: 'Portfolio Item',
  schedules: 'Schedule Item',
  personalSelfCare: 'Self-Care Routine',
  personalCommunication: 'Communication Log',
  personalSocialGrowth: 'Social Growth Record',
  personalPublicPersona: 'Social Platform',
  personalMusic: 'Music Practice Log',
  personalWriting: 'Creative Writing Draft',
  personalReading: 'Reading Library Book',
  personalVault: 'Creative Idea',
  mutualFunds: 'Mutual Fund Scheme'
};

const entityIcons = {
  tasks: ClipboardList,
  goals: Target,
  journalEntries: NotebookText,
  financeTransactions: WalletCards,
  fitnessLogs: Dumbbell,
  crmContacts: Handshake,
  academicSubjects: GraduationCap,
  academicAssignments: GraduationCap,
  academicPracticals: GraduationCap,
  academicRevisionLogs: GraduationCap,
  academicProjects: GraduationCap,
  academicSkills: GraduationCap,
  academicLearning: GraduationCap,
  academicDsa: GraduationCap,
  academicTechStack: GraduationCap,
  academicCertifications: GraduationCap,
  academicPortfolio: GraduationCap,
  schedules: Calendar,
  personalSelfCare: Heart,
  personalCommunication: MessageSquare,
  personalSocialGrowth: TrendingUp,
  personalPublicPersona: Globe,
  personalMusic: Music,
  personalWriting: PenTool,
  personalReading: BookOpen,
  personalVault: KeyRound,
  mutualFunds: WalletCards
};

const entityColorClasses = {
  tasks: 'text-sky-400 border-sky-500/20 bg-sky-500/5',
  goals: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
  journalEntries: 'text-pink-400 border-pink-500/20 bg-pink-500/5',
  financeTransactions: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
  fitnessLogs: 'text-orange-400 border-orange-500/20 bg-orange-500/5',
  crmContacts: 'text-teal-400 border-teal-500/20 bg-teal-500/5',
  academicSubjects: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
  academicAssignments: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
  academicPracticals: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
  academicRevisionLogs: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
  academicProjects: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
  academicSkills: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
  academicLearning: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
  academicDsa: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
  academicTechStack: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
  academicCertifications: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
  academicPortfolio: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
  schedules: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
  personalSelfCare: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
  personalCommunication: 'text-lime-400 border-lime-500/20 bg-lime-500/5',
  personalSocialGrowth: 'text-green-400 border-green-500/20 bg-green-500/5',
  personalPublicPersona: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
  personalMusic: 'text-violet-400 border-violet-500/20 bg-violet-500/5',
  personalWriting: 'text-fuchsia-400 border-fuchsia-500/20 bg-fuchsia-500/5',
  personalReading: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
  personalVault: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5',
  mutualFunds: 'text-amber-400 border-amber-500/20 bg-amber-500/5'
};

function formatDeletedTime(timestamp) {
  if (!timestamp) return 'Unknown date';
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Trash() {
  const trashItems = useTrashStore((s) => s.trashItems);
  const restoreItem = useTrashStore((s) => s.restoreItem);
  const permanentDelete = useTrashStore((s) => s.permanentDelete);
  const clearTrash = useTrashStore((s) => s.clearTrash);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleRestore = async (id) => {
    try {
      await restoreItem(id);
    } catch (err) {
      console.error('Failed to restore item:', err);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await permanentDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to purge item:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearTrash();
      setShowClearConfirm(false);
    } catch (err) {
      console.error('Failed to empty recycle bin:', err);
    }
  };

  const filteredItems = useMemo(() => {
    let items = [...trashItems];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => {
        const title = (item.entityTitle || item.data?.title || item.data?.name || 'Untitled').toLowerCase();
        const type = (item.entityType || '').toLowerCase();
        return title.includes(query) || type.includes(query);
      });
    }

    if (filterType !== 'all') {
      items = items.filter((item) => item.entityType === filterType);
    }

    items.sort((a, b) => {
      const aTime = a.deletedAt || '';
      const bTime = b.deletedAt || '';
      return sortOrder === 'newest' ? bTime.localeCompare(aTime) : aTime.localeCompare(bTime);
    });

    return items;
  }, [trashItems, searchQuery, filterType, sortOrder]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(trashItems.map((item) => item.entityType).filter(Boolean));
    return Array.from(types).sort();
  }, [trashItems]);

  const categoryBreakdown = useMemo(() => {
    const breakdown = {};
    trashItems.forEach((item) => {
      const type = item.entityType || 'other';
      breakdown[type] = (breakdown[type] || 0) + 1;
    });
    return breakdown;
  }, [trashItems]);

  return (
    <ModulePageLayout
      title="Recycle Bin"
      subtitle="Safeguard and manage soft-deleted items across your dashboard"
    >
      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowClearConfirm(false); }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-red-900/40 bg-jarvis-panel p-6 shadow-2xl jarvis-glass">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-900/30 bg-red-900/10">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-jarvis-text">Empty Recycle Bin?</h3>
                <p className="text-[11px] text-jarvis-muted">This action is irreversible.</p>
              </div>
            </div>
            <p className="mb-5 text-xs text-jarvis-muted">
              All {trashItems.length} deleted entities and version records will be permanently purged from your databases.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="rounded-lg border border-jarvis-border bg-white/5 px-4 py-2 text-xs text-jarvis-muted hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="rounded-lg border border-red-900/40 bg-red-900/10 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-900/20 transition-colors"
              >
                Purge All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Purge Confirmation Modal */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirmId(null); }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-red-900/40 bg-jarvis-panel p-6 shadow-2xl jarvis-glass">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-900/30 bg-red-900/10">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-jarvis-text">Delete Permanently?</h3>
                <p className="text-[11px] text-jarvis-muted">This item cannot be recovered.</p>
              </div>
            </div>
            <p className="mb-5 text-xs text-jarvis-muted">
              The selected entry will be permanently deleted and all local/cloud backup references will be removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-jarvis-border bg-white/5 px-4 py-2 text-xs text-jarvis-muted hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentDelete}
                className="rounded-lg border border-red-900/40 bg-red-900/10 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-900/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown Metrics */}
      {trashItems.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-jarvis-border bg-jarvis-panel/30 p-4 jarvis-glass">
            <span className="text-[10px] font-bold uppercase tracking-wider text-jarvis-muted">
              Total In Bin
            </span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-jarvis-text leading-none">
                {trashItems.length}
              </span>
              <span className="text-xs text-jarvis-muted">safeguarded items</span>
            </div>
          </div>

          <div className="col-span-2 rounded-xl border border-jarvis-border bg-jarvis-panel/30 p-4 jarvis-glass">
            <span className="text-[10px] font-bold uppercase tracking-wider text-jarvis-muted">
              Categories In Bin
            </span>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {Object.entries(categoryBreakdown).map(([type, count]) => (
                <div
                  key={type}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    entityColorClasses[type] || 'border-jarvis-border text-jarvis-muted'
                  }`}
                >
                  <span>{entityLabels[type] || type}</span>
                  <span className="rounded-full bg-white/5 px-1.5 py-0.25 text-[10px]">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-jarvis-muted" strokeWidth={1.75} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name..."
            className="w-full rounded-lg border border-jarvis-border bg-jarvis-panel py-2 pl-10 pr-4 text-sm text-jarvis-text placeholder-jarvis-muted/50 outline-none transition-colors focus:border-jarvis-accent/40"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-jarvis-muted" strokeWidth={1.75} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-jarvis-border bg-jarvis-panel px-3 py-2 text-sm text-jarvis-text outline-none transition-colors focus:border-jarvis-accent/40"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {entityLabels[type] || type}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
            className="flex items-center gap-1.5 rounded-lg border border-jarvis-border bg-jarvis-panel px-3 py-2 text-sm text-jarvis-muted transition-colors hover:text-jarvis-text"
          >
            <ArrowUpDown className="h-4 w-4" strokeWidth={1.75} />
            {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </button>

          {trashItems.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-900/30 bg-red-900/5 px-4 py-2 text-sm font-semibold text-red-400/80 transition-all duration-200 hover:border-red-900/60 hover:bg-red-900/10 hover:text-red-400 hover:shadow-[0_0_12px_rgba(239,68,68,0.05)]"
              title="Clear all recycle bin"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              Empty Bin
            </button>
          )}
        </div>
      </div>

      {/* Main Items Listing Grid */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-jarvis-border/40 bg-jarvis-panel/10">
            <Archive className="mb-4 h-12 w-12 text-jarvis-muted/20" strokeWidth={1.25} />
            <p className="text-sm font-semibold text-jarvis-text">Recycle Bin is empty</p>
            <p className="mt-1 text-xs text-jarvis-muted max-w-[280px]">
              Deleted items across your systems will appear here so you can easily restore them at any time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredItems.map((item) => {
              const Icon = entityIcons[item.entityType] || Archive;
              const colorClasses = entityColorClasses[item.entityType] || 'border-jarvis-border text-jarvis-muted bg-white/5';
              const title = item.entityTitle || item.data?.title || item.data?.name || 'Untitled Entry';

              return (
                <div
                  key={item.id}
                  className="group flex items-center justify-between rounded-xl border border-jarvis-border bg-jarvis-panel/20 p-4 transition-all duration-200 hover:border-jarvis-muted/40 hover:bg-jarvis-panel/30 jarvis-glass hover:shadow-[0_2px_12px_rgba(255,255,255,0.01)]"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105 ${colorClasses}`}>
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center flex-wrap gap-2">
                        <h4 className="text-sm font-bold text-jarvis-text truncate select-all">
                          {title}
                        </h4>
                        <span className={`rounded-md border px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase select-none ${colorClasses}`}>
                          {entityLabels[item.entityType] || item.entityType}
                        </span>
                      </div>
                      
                      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-jarvis-muted">
                        <span>Original ID:</span>
                        <code className="font-mono text-[9px] bg-white/5 px-1 py-0.25 rounded text-jarvis-text/80">{item.entityId}</code>
                        <span className="text-jarvis-border">•</span>
                        <span>Deleted: {formatDeletedTime(item.deletedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-3">
                    <button
                      type="button"
                      onClick={() => handleRestore(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 transition-all duration-150 hover:scale-105 hover:border-emerald-500/50 hover:bg-emerald-500/10 active:scale-95"
                      title={`Restore ${title}`}
                    >
                      <RotateCcw className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 transition-all duration-150 hover:scale-105 hover:border-red-500/50 hover:bg-red-500/10 active:scale-95"
                      title={`Permanently delete ${title}`}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ModulePageLayout>
  );
}
