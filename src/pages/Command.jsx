import { LayoutProvider, useLayout } from '../context/LayoutContext';
import Sidebar from '../components/sidebar/Sidebar';
import CommandHeader from '../components/command/CommandHeader';
import FocusCard from '../components/command/FocusCard';
import TaskSummaryCard from '../components/command/TaskSummaryCard';
import MetricCard from '../components/command/MetricCard';
import StreakCard from '../components/command/StreakCard';
import ProgressCard from '../components/command/ProgressCard';
import InsightFeed from '../components/command/InsightFeed';
import WarningPanel from '../components/command/WarningPanel';
import QuickActions from '../components/command/QuickActions';
import TimelineCard from '../components/command/TimelineCard';
import GoalsHierarchy from '../components/command/GoalsHierarchy';
import { useUiStore } from '../store/uiStore';
import {
  todayFocus,
  taskSummaries,
  operationalHighlights,
  dailyMetrics,
  streaks,
  weeklyProgress,
  aiInsights,
  systemWarnings,
  quickActions,
} from '../data/mockCommandData';

function CommandDashboard() {
  const { openMobile } = useLayout();
  const goalsTree = useUiStore((s) => s.commandCenter.goalsTree);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <CommandHeader onMenuClick={openMobile} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1600px] space-y-6 p-4 pb-10 md:p-6 lg:p-8">
          <FocusCard focus={todayFocus} />
          <TaskSummaryCard summaries={taskSummaries} highlights={operationalHighlights} />

          <section>
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-jarvis-muted">
              Daily Metrics
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
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
              {weeklyProgress.map((item) => (
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
              <QuickActions actions={quickActions} />
            </div>
            <TimelineCard />
          </div>

          <GoalsHierarchy tree={goalsTree} />
        </div>
      </div>
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
