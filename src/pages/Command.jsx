import { useCallback, useState } from 'react';
import { LayoutProvider, useLayout } from '../context/LayoutContext';
import Sidebar from '../components/sidebar/Sidebar';
import CommandHeader from '../components/command/CommandHeader';
import AiDailyBrief from '../components/command/AiDailyBrief';
import CriticalDeadlines from '../components/command/CriticalDeadlines';
import TaskOperations from '../components/command/TaskOperations';
import MetricCard from '../components/command/MetricCard';
import StreakCard from '../components/command/StreakCard';
import ProgressCard from '../components/command/ProgressCard';
import InsightFeed from '../components/command/InsightFeed';
import WarningPanel from '../components/command/WarningPanel';
import QuickActions from '../components/command/QuickActions';
import TodaySchedule from '../components/command/TodaySchedule';
import GoalsDirectionLayer from '../components/command/GoalsDirectionLayer';
import EntityModal from '../components/modals/EntityModal';
import EntityForm from '../components/forms/EntityForm';
import TransactionModal from '../components/finance/TransactionModal';
import { useUiStore } from '../store/uiStore';
import { useTaskStore } from '../store/taskStore';
import { useFinanceStore } from '../store/financeStore';
import { useEntityStore } from '../store/entityStore';
import { RefreshCcw } from 'lucide-react';
import {
  useTaskMetrics,
  useFitnessMetrics,
  useStreaks,
  useWeeklyProgress,
  useSystemWarnings,
  useAiInsights,
  useTodaySchedule,
  useBrief,
  useCriticalDeadlines,
  useStrategicGoals
} from '../store/selectors/metrics.selectors';

function CommandDashboard() {
  const { openMobile } = useLayout();
  
  // Use Live Derived Selectors
  const taskSummaries = useTaskMetrics();
  const criticalDeadlines = useCriticalDeadlines();
  const dailyMetrics = useFitnessMetrics();
  const streaks = useStreaks();
  const weeklyProgressData = useWeeklyProgress();
  const systemWarnings = useSystemWarnings();
  const aiInsights = useAiInsights();
  const todaySchedule = useTodaySchedule();
  const brief = useBrief();
  const goalsTree = useStrategicGoals();

  const createTask = useTaskStore(s => s.createTask);
  const addTransaction = useFinanceStore(s => s.addTransaction);

  const [activeModal, setActiveModal] = useState(null); // 'task' | 'expense' | null
  const [isSaving, setIsSaving] = useState(false);

  const quickActions = [
    { id: 'expense', label: 'Add Expense', icon: 'Wallet' },
    { id: 'workout', label: 'Log Workout', icon: 'Dumbbell' },
    { id: 'journal', label: 'Add Journal Entry', icon: 'PenLine' },
    { id: 'task', label: 'Add Task', icon: 'Plus' },
  ];

  const handleAction = (id) => {
    if (id === 'expense') setActiveModal('expense');
    if (id === 'task') {
       // Use entityStore to ensure EntityForm knows it's a task
       useEntityStore.getState().openCreateModal('task');
       setActiveModal('task');
    }
  };

  const handleSubmitTask = async (data) => {
    setIsSaving(true);
    try {
      await createTask(data);
      setActiveModal(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitExpense = async (data) => {
    setIsSaving(true);
    try {
      await addTransaction(data);
      setActiveModal(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshBrief = useCallback(() => {
    console.log('[Command] Refreshing AI Brief...');
  }, []);

  const handleRefreshMetrics = useCallback(() => {
    console.log('[Command] Refreshing Metrics Snapshot...');
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <CommandHeader onMenuClick={openMobile} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1600px] space-y-6 p-4 pb-10 md:p-6 lg:p-8">
          <AiDailyBrief brief={brief} onRefresh={handleRefreshBrief} />
          
          <CriticalDeadlines deadlines={criticalDeadlines} />
          
          <TaskOperations summaries={taskSummaries} />

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium uppercase tracking-wider text-jarvis-muted">
                Daily Metrics
              </h2>
              <button
                onClick={handleRefreshMetrics}
                className="flex items-center gap-1.5 rounded-lg border border-jarvis-border px-2.5 py-1 text-xs text-jarvis-muted transition-colors hover:border-jarvis-muted/50 hover:text-jarvis-text"
              >
                <RefreshCcw className="h-3 w-3" strokeWidth={1.75} />
                Refresh Metrics
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
              {dailyMetrics.map((metric) => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          </section>

          <StreakCard streaks={streaks} />

          <section>
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-jarvis-muted">
              Weekly Progress
            </h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {weeklyProgressData.map((item) => (
                <ProgressCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <InsightFeed insights={aiInsights} />
            <WarningPanel warnings={systemWarnings} />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <QuickActions actions={quickActions} onAction={handleAction} />
            </div>
            <TodaySchedule schedule={todaySchedule} />
          </div>

          <GoalsDirectionLayer tree={goalsTree} />
        </div>
      </div>

      <EntityModal 
        isOpen={activeModal === 'task'} 
        onClose={() => setActiveModal(null)} 
        title="Quick Task"
      >
        <EntityForm 
          onSubmit={handleSubmitTask} 
          onCancel={() => setActiveModal(null)} 
          isSubmitting={isSaving} 
        />
      </EntityModal>

      <TransactionModal 
        open={activeModal === 'expense'} 
        onClose={() => setActiveModal(null)} 
        type="debit" 
        onSubmit={handleSubmitExpense} 
      />
    </div>
  );
}

export default function Command() {
  return (
    <LayoutProvider>
      <div className="flex h-screen w-full overflow-hidden bg-jarvis-bg">
        <Sidebar />
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <CommandDashboard />
        </main>
      </div>
    </LayoutProvider>
  );
}
