import React, { useMemo } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useFitnessStore } from '../../store/fitnessStore';
import { useJournalStore } from '../../store/journalStore';
import { useFinanceStore } from '../../store/financeStore';
import { useAcademicStore } from '../../store/academicStore';
import {
  Activity,
  Brain,
  TrendingUp,
  Coins,
  GraduationCap,
  Flame,
  Dumbbell,
  Calendar,
  Award,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export default function CommandAnalytics() {
  // Ingest store states
  const tasks = useTaskStore((s) => s.tasks) || [];
  const repetitiveTasks = useTaskStore((s) => s.repetitiveTasks) || [];
  const meals = useFitnessStore((s) => s.meals) || [];
  const hydrationLogs = useFitnessStore((s) => s.hydrationLogs) || [];
  const workouts = useFitnessStore((s) => s.workouts) || [];
  const fitnessTargets = useFitnessStore((s) => s.targets) || {};
  const journalEntries = useJournalStore((s) => s.journalEntries) || [];
  const transactions = useFinanceStore((s) => s.transactions) || [];
  const balanceOverview = useFinanceStore((s) => s.balanceOverview) || { monthlySpending: 0, balance: 0 };
  const dsaQuestions = useAcademicStore((s) => s.dsaQuestions) || [];
  const codingProgress = useAcademicStore((s) => s.codingProgress) || { targetProblems: 100 };
  const revisionLogs = useAcademicStore((s) => s.revisionLogs) || [];

  // Compute Analytics Metrics
  const metrics = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

    // 1. Task completion rate (last 7 days tasks)
    const activeTasks = tasks.filter(t => t.createdAt >= sevenDaysAgoStr || t.dueDate >= sevenDaysAgoStr);
    const completedTasks = activeTasks.filter(t => t.completed);
    const taskCompletionRate = activeTasks.length > 0 ? completedTasks.length / activeTasks.length : 0.8;

    // 2. Fitness Adherence
    const recentWorkouts = workouts.filter(w => w.date >= sevenDaysAgoStr && w.completed);
    const recentHydration = hydrationLogs.filter(h => h.date >= sevenDaysAgoStr);
    const workoutAdherence = recentWorkouts.length >= 3 ? 1 : recentWorkouts.length / 3;
    const targetHydration = fitnessTargets.hydrationMl || 3500;
    const dailyHydrationSum = {};
    recentHydration.forEach(h => {
      dailyHydrationSum[h.date] = (dailyHydrationSum[h.date] || 0) + h.amountMl;
    });
    const metHydrationDays = Object.values(dailyHydrationSum).filter(val => val >= targetHydration).length;
    const hydrationAdherence = metHydrationDays >= 5 ? 1 : metHydrationDays / 5;
    const fitnessAdherence = (workoutAdherence + hydrationAdherence) / 2;

    // 3. Routine Adherence
    const activeRoutines = repetitiveTasks.filter(r => r.active);
    const routineStreakRatio = activeRoutines.length > 0 
      ? activeRoutines.reduce((sum, r) => sum + Math.min(r.streak / 10, 1), 0) / activeRoutines.length
      : 0.7;

    // Consistency Index
    const consistencyScore = Math.round((taskCompletionRate * 0.4 + fitnessAdherence * 0.3 + routineStreakRatio * 0.3) * 100);

    // Mood Sentiment Analysis
    const moodCounts = { positive: 0, calm: 0, neutral: 0, tired: 0, anxious: 0, burnout: 0 };
    let totalJournalsWithMood = 0;
    
    journalEntries.forEach(j => {
      const mood = j.mood?.toLowerCase() || 'neutral';
      if (moodCounts[mood] !== undefined) {
        moodCounts[mood]++;
        totalJournalsWithMood++;
      } else {
        moodCounts.neutral++;
        totalJournalsWithMood++;
      }
    });

    const primaryMood = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b, 'neutral');

    // Financial Burn Rate
    const totalRecentDebits = transactions
      .filter(t => t.date >= sevenDaysAgoStr && t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
    const dailySpendingAverage = Math.round(totalRecentDebits / 7);
    const budgetCap = 30000;
    const budgetPercentage = Math.min(Math.round((balanceOverview.monthlySpending / budgetCap) * 100), 100);

    // Fitness stats
    const averageWater = recentHydration.length > 0 
      ? Math.round(recentHydration.reduce((sum, h) => sum + h.amountMl, 0) / 7)
      : 0;

    // Academics Progress
    const weeklyRevisions = revisionLogs.filter(r => r.date >= sevenDaysAgoStr).length;
    const codingTargetMet = dsaQuestions.length;
    const codingProgressPercent = Math.min(Math.round((codingTargetMet / (codingProgress.targetProblems || 100)) * 100), 100);

    return {
      consistencyScore,
      taskCompletionRate: Math.round(taskCompletionRate * 100),
      fitnessAdherence: Math.round(fitnessAdherence * 100),
      routineStreakRatio: Math.round(routineStreakRatio * 100),
      moodCounts,
      totalJournalsWithMood,
      primaryMood,
      dailySpendingAverage,
      budgetPercentage,
      averageWater,
      weeklyRevisions,
      codingTargetMet,
      codingProgressPercent
    };
  }, [tasks, repetitiveTasks, meals, hydrationLogs, workouts, fitnessTargets, journalEntries, transactions, balanceOverview, dsaQuestions, codingProgress, revisionLogs]);

  const moodColors = {
    positive: 'bg-emerald-500 text-emerald-400 border-emerald-500/20',
    calm: 'bg-sky-500 text-sky-400 border-sky-500/20',
    neutral: 'bg-slate-500 text-slate-400 border-slate-500/20',
    tired: 'bg-amber-500 text-amber-400 border-amber-500/20',
    anxious: 'bg-indigo-500 text-indigo-400 border-indigo-500/20',
    burnout: 'bg-rose-500 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="space-y-6">
      
      {/* 1. CONSISTENCY INDEX HEADER CARD */}
      <section className="relative overflow-hidden rounded-2xl border border-jarvis-border/60 bg-jarvis-panel p-6 shadow-xl backdrop-blur-md">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-jarvis-accent/5 blur-3xl" />
        
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-jarvis-accent" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-jarvis-text">Consistency Index Score</h2>
            </div>
            <p className="text-xs text-jarvis-muted max-w-xl leading-relaxed">
              Calculated dynamically based on task completion deadlines, repetitive self-care streaks, fitness targets, and hydration logs. This represents your operational discipline.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center">
              <svg className="h-24 w-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" className="stroke-white/5" strokeWidth="8" fill="transparent" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-jarvis-accent transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * metrics.consistencyScore) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xl font-bold text-jarvis-text font-mono">
                {metrics.consistencyScore}%
              </span>
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-jarvis-muted">System Adherence</p>
              <h3 className="text-md font-semibold text-jarvis-text">
                {metrics.consistencyScore >= 80 ? 'Exceptional Order' : metrics.consistencyScore >= 60 ? 'Structural Momentum' : 'Refinement Needed'}
              </h3>
              <p className="text-[11px] text-jarvis-muted">
                Keep daily logs consistent to sustain streak momentum.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-jarvis-border/60 pt-6 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-jarvis-muted uppercase tracking-wider text-[10px]">Task Completion Rate</span>
              <span className="font-semibold text-jarvis-text font-mono">{metrics.taskCompletionRate}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-sky-400 rounded-full transition-all duration-700" style={{ width: `${metrics.taskCompletionRate}%` }} />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-jarvis-muted uppercase tracking-wider text-[10px]">Fitness Adherence</span>
              <span className="font-semibold text-jarvis-text font-mono">{metrics.fitnessAdherence}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all duration-700" style={{ width: `${metrics.fitnessAdherence}%` }} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-jarvis-muted uppercase tracking-wider text-[10px]">Routine Mastery</span>
              <span className="font-semibold text-jarvis-text font-mono">{metrics.routineStreakRatio}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-pink-400 rounded-full transition-all duration-700" style={{ width: `${metrics.routineStreakRatio}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. MOOD & FINANCIAL BURNDOWN */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* MOOD TRENDS CARD */}
        <article className="rounded-2xl border border-jarvis-border/60 bg-jarvis-panel p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-pink-400" />
                <h3 className="text-sm font-semibold uppercase tracking-widest text-jarvis-text">Mood & Emotional Trends</h3>
              </div>
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${moodColors[metrics.primaryMood] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                {metrics.primaryMood} bias
              </span>
            </div>
            
            <p className="text-xs text-jarvis-muted leading-relaxed">
              Extracted directly from your daily Journal logs. Maintaining positive cognitive indicators prevents structural fatigue.
            </p>

            {metrics.totalJournalsWithMood === 0 ? (
              <div className="rounded-xl border border-dashed border-jarvis-border/40 py-10 text-center text-xs text-jarvis-muted bg-white/[0.01]">
                Add daily journal logs to populate emotional trends.
              </div>
            ) : (
              <div className="flex items-end justify-between gap-2 h-40 pt-4 border-b border-jarvis-border/40">
                {Object.entries(metrics.moodCounts).map(([mood, count]) => {
                  const percentage = metrics.totalJournalsWithMood > 0 ? (count / metrics.totalJournalsWithMood) * 100 : 0;
                  const colorClasses = moodColors[mood].split(' ')[0];
                  
                  return (
                    <div key={mood} className="group relative flex flex-col items-center flex-1">
                      <div className="absolute -top-10 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all bg-black/90 border border-jarvis-border px-2 py-1 rounded text-[10px] text-jarvis-text z-10 whitespace-nowrap pointer-events-none">
                        {count} logs ({Math.round(percentage)}%)
                      </div>
                      
                      <div 
                        className={`w-full ${colorClasses} opacity-80 group-hover:opacity-100 rounded-t-lg transition-all duration-1000 ease-out`} 
                        style={{ height: `${Math.max(percentage * 1.2, 8)}px` }} 
                      />
                      
                      <span className="mt-2 text-[9px] uppercase tracking-wider text-jarvis-muted capitalize truncate w-full text-center">
                        {mood}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-pink-500/5 border border-pink-500/10 p-3 text-[11px] text-jarvis-muted leading-relaxed">
            <Sparkles className="h-4 w-4 shrink-0 text-pink-400" />
            <span>
              {metrics.primaryMood === 'burnout' || metrics.primaryMood === 'anxious'
                ? 'High fatigue signature detected. Consider scheduling self-care revision intervals today.'
                : 'Steady cognitive coherence observed. Keep up the disciplined journaling.'}
            </span>
          </div>
        </article>

        {/* FINANCIAL BURN RATE CARD */}
        <article className="rounded-2xl border border-jarvis-border/60 bg-jarvis-panel p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-semibold uppercase tracking-widest text-jarvis-text">Financial Outflow Metrics</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded-full border border-amber-500/20">
                <TrendingUp className="h-3 w-3" />
                ₹{metrics.dailySpendingAverage.toLocaleString()}/day
              </div>
            </div>
            
            <p className="text-xs text-jarvis-muted leading-relaxed">
              Calculated on debit transactions logged in the last 7 days against your monthly budget caps to monitor active burndowns.
            </p>

            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-jarvis-muted uppercase tracking-wider text-[10px]">Monthly Budget Status</span>
                <span className="font-semibold text-jarvis-text font-mono">₹{balanceOverview.monthlySpending.toLocaleString()} / ₹30,000</span>
              </div>
              
              <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden border border-jarvis-border/40">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${
                    metrics.budgetPercentage >= 80 
                      ? 'from-red-500 to-rose-600' 
                      : metrics.budgetPercentage >= 50 
                      ? 'from-amber-400 to-orange-500' 
                      : 'from-sky-400 to-indigo-500'
                  }`}
                  style={{ width: `${metrics.budgetPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className={`mt-6 flex items-start gap-2.5 rounded-xl p-3 text-[11px] leading-relaxed transition-all ${
            metrics.budgetPercentage >= 80
              ? 'bg-rose-500/10 border border-rose-500/25 text-rose-300'
              : 'bg-amber-500/5 border border-amber-500/10 text-jarvis-muted'
          }`}>
            {metrics.budgetPercentage >= 80 ? (
              <>
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>
                  Critical overspending warning: Monthly expenditures are exceeding budget threshold. Curb luxury outlays immediately.
                </span>
              </>
            ) : (
              <>
                <Coins className="h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  Monthly spending is well balanced within parameters. Maintain this spending velocity to meet your quarterly savings targets.
                </span>
              </>
            )}
          </div>
        </article>

      </div>

      {/* 3. FITNESS & ACADEMICS */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* FITNESS ADHERENCE CARD */}
        <article className="rounded-2xl border border-jarvis-border/60 bg-jarvis-panel p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-semibold uppercase tracking-widest text-jarvis-text">Fitness OS Progress</h3>
          </div>
          
          <p className="text-xs text-jarvis-muted leading-relaxed">
            Compares physical gym workout registrations and water volume metrics logged over the past 7 days against target metrics.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 pt-2">
            <div className="rounded-xl border border-jarvis-border bg-black/25 p-4 flex flex-col justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-jarvis-muted">7-Day Hydration Average</p>
                <h4 className="text-lg font-bold text-jarvis-text font-mono">
                  {metrics.averageWater.toLocaleString()} mL <span className="text-xs font-normal text-jarvis-muted">/ day</span>
                </h4>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-jarvis-muted">
                  <span>Hydration Target</span>
                  <span>{Math.round((metrics.averageWater / (fitnessTargets.hydrationMl || 3500)) * 100)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full bg-sky-400 rounded-full transition-all duration-700" 
                    style={{ width: `${Math.min(Math.round((metrics.averageWater / (fitnessTargets.hydrationMl || 3500)) * 100), 100)}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-jarvis-border bg-black/25 p-4 flex flex-col justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-jarvis-muted">Weekly Workout Adherence</p>
                <h4 className="font-bold text-jarvis-text text-lg flex items-center gap-1.5 font-mono">
                  <Flame className="h-4 w-4 text-orange-400" strokeWidth={2} />
                  {workouts.filter(w => w.date >= new Date(Date.now() - 7*24*60*60*1000).toISOString().slice(0, 10) && w.completed).length} Workouts
                </h4>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-jarvis-muted">
                  <span>Weekly Target (3 Days)</span>
                  <span>{Math.round(Math.min((workouts.filter(w => w.date >= new Date(Date.now() - 7*24*60*60*1000).toISOString().slice(0, 10) && w.completed).length / 3) * 100, 100))}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 rounded-full transition-all duration-700" 
                    style={{ width: `${Math.min(Math.round((workouts.filter(w => w.date >= new Date(Date.now() - 7*24*60*60*1000).toISOString().slice(0, 10) && w.completed).length / 3) * 100), 100)}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* ACADEMICS PROGRESS CARD */}
        <article className="rounded-2xl border border-jarvis-border/60 bg-jarvis-panel p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-semibold uppercase tracking-widest text-jarvis-text">Academics Growth Metrics</h3>
          </div>
          
          <p className="text-xs text-jarvis-muted leading-relaxed">
            Analyzes DSA coding problems solved and weekly active revision intervals logged in the academics database.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 pt-2">
            <div className="rounded-xl border border-jarvis-border bg-black/25 p-4 flex flex-col justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-jarvis-muted">DSA Master Target Progress</p>
                <h4 className="text-lg font-bold text-jarvis-text font-mono">
                  {metrics.codingTargetMet} Solved <span className="text-xs font-normal text-jarvis-muted">/ {codingProgress.targetProblems || 100}</span>
                </h4>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-jarvis-muted">
                  <span>Problem Target Metric</span>
                  <span>{metrics.codingProgressPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-indigo-400 rounded-full transition-all duration-700" style={{ width: `${metrics.codingProgressPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-jarvis-border bg-black/25 p-4 flex flex-col justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-jarvis-muted">7-Day Revision Logs</p>
                <h4 className="font-bold text-jarvis-text text-lg flex items-center gap-1.5 font-mono">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  {metrics.weeklyRevisions} Session Logs
                </h4>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-jarvis-muted">
                  <span>Goal: 4 Revisions / week</span>
                  <span>{Math.round(Math.min((metrics.weeklyRevisions / 4) * 100, 100))}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full bg-purple-400 rounded-full transition-all duration-700" 
                    style={{ width: `${Math.min(Math.round((metrics.weeklyRevisions / 4) * 100), 100)}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </article>

      </div>

    </div>
  );
}
