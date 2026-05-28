import { useEffect, useState } from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, Target, Zap, TrendingUp, Calendar } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { useGoalStore } from '../../store/goalStore';
import { useAiStore } from '../../store/aiStore';
import { useAuthStore } from '../../store/authStore';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good Morning', emoji: '☀️' };
  if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', emoji: '⚡' };
  if (hour >= 17 && hour < 22) return { text: 'Good Evening', emoji: '🌆' };
  return { text: 'Good Night', emoji: '🌙' };
}

function StatCard({ icon: Icon, label, value, color = 'text-jarvis-text', sub }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-jarvis-border/50 bg-jarvis-bg/60 px-4 py-3 backdrop-blur-sm">
      <div className={`mt-0.5 shrink-0 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-sm font-semibold ${color}`}>{value}</div>
        <div className="text-[11px] text-jarvis-muted">{label}</div>
        {sub && <div className="mt-0.5 text-[10px] text-jarvis-muted/60">{sub}</div>}
      </div>
    </div>
  );
}

export default function BootPanel({ isOpen, onClose }) {
  const [visible, setVisible] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const tasks = useTaskStore(s => s.tasks);
  const repetitiveTasks = useTaskStore(s => s.repetitiveTasks);
  const goals = useGoalStore(s => s.goals);
  const dailyBrief = useAiStore(s => s.dailyBrief);
  const generateDailyCommandData = useAiStore(s => s.generateDailyCommandData);
  const user = useAuthStore(s => s.user);

  const greeting = getGreeting();
  const userName = user?.username || 'Commander';

  // Derived data
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter(t => t.bucket === 'today' && !t.completed);
  const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && t.dueDate.slice(0, 10) < today);
  const completedToday = tasks.filter(t => t.completed && t.completedAt?.slice(0, 10) === today);
  const activeGoals = goals.filter(g => !g.completed).slice(0, 3);
  const activeRoutines = repetitiveTasks.filter(r => r.active && !r.archived);
  const routinesCompletedToday = repetitiveTasks.filter(r => r.active && (r.completionHistory || []).includes(today));

  useEffect(() => {
    if (isOpen) {
      // Trigger mount animation
      requestAnimationFrame(() => setVisible(true));
      // Generate daily brief if not already done — costs nothing if cached
      if (!hasGenerated) {
        generateDailyCommandData(false);
        setHasGenerated(true);
      }
    } else {
      setVisible(false);
    }
  }, [isOpen, generateDailyCommandData, hasGenerated]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed inset-x-4 bottom-4 top-4 z-50 mx-auto max-w-2xl overflow-hidden rounded-2xl border border-jarvis-border/60 bg-jarvis-panel/95 shadow-[0_24px_80px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-500 sm:inset-x-6 md:inset-x-auto md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[640px] ${
          visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
        }`}
      >
        {/* Header gradient bar */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-jarvis-accent/40 to-transparent" />

        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div className="relative flex shrink-0 items-start justify-between px-6 pt-6 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{greeting.emoji}</span>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-jarvis-muted">{greeting.text}</p>
                  <h2 className="text-2xl font-semibold tracking-tight text-jarvis-text">
                    Hi,{' '}
                    <span className="bg-gradient-to-r from-jarvis-accent to-sky-300 bg-clip-text text-transparent">
                      {userName}
                    </span>
                  </h2>
                </div>
              </div>
              <p className="mt-1.5 text-[12px] text-jarvis-muted">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg border border-jarvis-border/50 p-1.5 text-jarvis-muted transition-colors hover:bg-jarvis-muted/10 hover:text-jarvis-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Divider */}
          <div className="mx-6 h-px bg-jarvis-border/40" />

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

            {/* AI Daily Brief */}
            {dailyBrief?.primary && (
              <section>
                <div className="mb-2.5 flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-jarvis-accent" />
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-jarvis-accent">
                    Daily Brief
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="rounded-xl border border-jarvis-accent/20 bg-jarvis-accent/5 px-4 py-3">
                    <p className="text-[12px] font-medium text-jarvis-accent/80 uppercase tracking-wider mb-1">Primary</p>
                    <p className="text-sm text-jarvis-text leading-relaxed">{dailyBrief.primary}</p>
                  </div>
                  {dailyBrief.secondary && (
                    <div className="rounded-xl border border-jarvis-border/40 bg-jarvis-bg/40 px-4 py-3">
                      <p className="text-[12px] font-medium text-jarvis-muted uppercase tracking-wider mb-1">Secondary</p>
                      <p className="text-sm text-jarvis-muted leading-relaxed">{dailyBrief.secondary}</p>
                    </div>
                  )}
                  {dailyBrief.watchOuts && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                      <p className="text-[12px] font-medium text-amber-400/80 uppercase tracking-wider mb-1">Watch Out</p>
                      <p className="text-sm text-amber-100/80 leading-relaxed">{dailyBrief.watchOuts}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Stats Grid */}
            <section>
              <div className="mb-2.5 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-jarvis-muted" />
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-jarvis-muted">
                  System Status
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatCard
                  icon={Clock}
                  label="Pending Today"
                  value={todayTasks.length}
                  color={todayTasks.length > 0 ? 'text-sky-400' : 'text-emerald-400'}
                />
                <StatCard
                  icon={AlertTriangle}
                  label="Overdue"
                  value={overdueTasks.length}
                  color={overdueTasks.length > 0 ? 'text-red-400' : 'text-emerald-400'}
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Completed Today"
                  value={completedToday.length}
                  color="text-emerald-400"
                />
                <StatCard
                  icon={Calendar}
                  label="Routines Done"
                  value={`${routinesCompletedToday.length}/${activeRoutines.length}`}
                  color={routinesCompletedToday.length === activeRoutines.length && activeRoutines.length > 0 ? 'text-emerald-400' : 'text-jarvis-muted'}
                />
              </div>
            </section>

            {/* Today's Tasks */}
            {todayTasks.length > 0 && (
              <section>
                <div className="mb-2.5 flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-jarvis-muted" />
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-jarvis-muted">
                    Today's Tasks
                  </h3>
                  <span className="rounded-full bg-jarvis-border/60 px-1.5 py-0.5 text-[10px] text-jarvis-muted">
                    {todayTasks.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {todayTasks.slice(0, 5).map(task => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-lg border border-jarvis-border/30 bg-jarvis-bg/30 px-3 py-2"
                    >
                      <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        task.priority === 'critical' ? 'bg-red-400' :
                        task.priority === 'high' ? 'bg-orange-400' :
                        task.priority === 'medium' ? 'bg-sky-400' : 'bg-jarvis-muted/40'
                      }`} />
                      <span className="min-w-0 flex-1 truncate text-sm text-jarvis-text">{task.title}</span>
                      {task.category && (
                        <span className="shrink-0 rounded-full bg-jarvis-border/50 px-2 py-0.5 text-[10px] text-jarvis-muted">
                          {task.category}
                        </span>
                      )}
                    </div>
                  ))}
                  {todayTasks.length > 5 && (
                    <p className="text-center text-[11px] text-jarvis-muted">
                      +{todayTasks.length - 5} more tasks
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <section>
                <div className="mb-2.5 flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 text-jarvis-muted" />
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-jarvis-muted">
                    Active Goals
                  </h3>
                </div>
                <div className="space-y-2">
                  {activeGoals.map(goal => (
                    <div
                      key={goal.id}
                      className="rounded-xl border border-jarvis-border/30 bg-jarvis-bg/30 px-4 py-3"
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-sm font-medium text-jarvis-text truncate pr-2">{goal.title}</span>
                        <span className="shrink-0 text-[11px] text-jarvis-muted">{goal.progress || 0}%</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-jarvis-border/50 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-jarvis-accent to-sky-300 transition-all duration-700"
                          style={{ width: `${goal.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Overdue Tasks */}
            {overdueTasks.length > 0 && (
              <section>
                <div className="mb-2.5 flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-red-400">
                    Overdue — Needs Attention
                  </h3>
                </div>
                <div className="space-y-1.5">
                  {overdueTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2"
                    >
                      <AlertTriangle className="h-3 w-3 shrink-0 text-red-400" />
                      <span className="min-w-0 flex-1 truncate text-sm text-red-200">{task.title}</span>
                      {task.dueDate && (
                        <span className="shrink-0 text-[10px] text-red-400">
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  ))}
                  {overdueTasks.length > 3 && (
                    <p className="text-center text-[11px] text-red-400/70">
                      +{overdueTasks.length - 3} more overdue
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Empty state */}
            {todayTasks.length === 0 && overdueTasks.length === 0 && activeGoals.length === 0 && (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle2 className="mb-3 h-8 w-8 text-emerald-400/60" />
                <p className="text-sm text-jarvis-muted">All clear — system nominal.</p>
                <p className="mt-1 text-[11px] text-jarvis-muted/60">No pending tasks or overdue items.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-jarvis-border/40 px-6 py-3">
            <p className="text-center text-[10px] text-jarvis-muted/50">
              JARVIS · Personal AI Operating System · Daily brief cached — zero API cost
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
