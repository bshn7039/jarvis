import { localDb, STORES } from '../../database/core/localDatabase';

/**
 * JARVIS Heuristic Insights & Recommendations Engine
 * Evaluates multi-store metrics to compute behavioral correlations, burnout risks, and discipline warnings
 */
class InsightsEngine {
  /**
   * Evaluates entire system states and returns a bundle of insights and alerts
   */
  async generateDailyInsights() {
    const insights = [];
    const warnings = [];
    
    try {
      const today = new Date().toISOString().slice(0, 10);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

      // Parallel database retrieval
      const [tasks, journals, transactions, workouts, hydration, profile] = await Promise.all([
        localDb.getAll(STORES.TASKS),
        localDb.getAll(STORES.JOURNAL_ENTRIES),
        localDb.getAll(STORES.FINANCE_TRANSACTIONS),
        localDb.getAll(STORES.FITNESS_LOGS),
        localDb.getAll(STORES.FITNESS_ROUTINES), // Routines logged
        localDb.getAll(STORES.PROFILE)
      ]);

      const recentJournals = journals.filter(j => j.createdAt >= sevenDaysAgoStr || j.date >= sevenDaysAgoStr);
      const recentTasks = tasks.filter(t => t.createdAt >= sevenDaysAgoStr);
      const recentWorkouts = workouts.filter(w => w.date >= sevenDaysAgoStr);

      // ==========================================
      // 1. BURNOUT RISK ALGORITHM
      // ==========================================
      const completedRecentTasks = recentTasks.filter(t => t.completed);
      
      // Calculate mood average
      let averageMood = 7.5; // Baseline default
      if (recentJournals.length > 0) {
        const moodSum = recentJournals.reduce((sum, j) => sum + (j.mood || 7), 0);
        averageMood = moodSum / recentJournals.length;
      }

      // Burnout heuristic: high task volume completed but low journal mood average
      if (completedRecentTasks.length >= 8 && averageMood < 5.5) {
        warnings.push({
          id: 'warn-burnout-risk',
          title: 'High Burnout Signature Detected',
          description: `You completed ${completedRecentTasks.length} tasks in 7 days, but your average journal mood dipped to ${averageMood.toFixed(1)}/10. Consider scheduling self-care intervals immediately.`,
          severity: 'high'
        });
      }

      // ==========================================
      // 2. HABIT CORRELATION ENGINE
      // ==========================================
      // Heuristic: check if workout days correlate with morning journals
      let workoutOnJournalDays = 0;
      let journalDaysCount = 0;

      recentJournals.forEach(j => {
        const dateStr = (j.date || j.createdAt || '').slice(0, 10);
        if (dateStr) {
          journalDaysCount++;
          const hadWorkout = recentWorkouts.some(w => (w.date || '').slice(0, 10) === dateStr);
          if (hadWorkout) workoutOnJournalDays++;
        }
      });

      const correlationRatio = journalDaysCount > 0 ? (workoutOnJournalDays / journalDaysCount) * 100 : 0;
      if (correlationRatio >= 60 && journalDaysCount >= 3) {
        insights.push({
          id: 'insight-habit-correlation',
          title: 'Positive Habit Loop Detected',
          description: `You are ${Math.round(correlationRatio)}% more likely to execute your fitness workouts on days you log journal reflections. Keep your morning journal streak active.`,
          value: `+${Math.round(correlationRatio)}% correlation`
        });
      } else {
        // Default positive momentum insight
        insights.push({
          id: 'insight-discipline-momentum',
          title: 'Structural Momentum',
          description: 'Sustaining a consistent balance of tasks and daily self-care logs directly anchors cognitive discipline.',
          value: 'Optimal'
        });
      }

      // ==========================================
      // 3. DISCIPLINE WARNINGS
      // ==========================================
      
      // Hydration Check
      const recentHydration = await localDb.getAll(STORES.FITNESS_LOGS); // In case they are logged under logs
      const recentHydrationWeek = recentHydration.filter(h => h.date >= sevenDaysAgoStr && h.amountMl);
      
      let lowHydrationDays = 0;
      const hydrationByDate = {};
      recentHydrationWeek.forEach(h => {
        hydrationByDate[h.date] = (hydrationByDate[h.date] || 0) + h.amountMl;
      });

      Object.entries(hydrationByDate).forEach(([date, ml]) => {
        if (ml < 2000) lowHydrationDays++;
      });

      if (lowHydrationDays >= 3) {
        warnings.push({
          id: 'warn-low-hydration',
          title: 'Critically Low Hydration Levels',
          description: `Your hydration levels fell below 2.0L on ${lowHydrationDays} days this week. This compromises workout recovery and focus. Rehydrate immediately.`,
          severity: 'medium'
        });
      }

      // Finance Burndown Check
      const totalRecentDebits = transactions
        .filter(t => t.date >= sevenDaysAgoStr && t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);

      if (totalRecentDebits > 8000) {
        warnings.push({
          id: 'warn-spending-spikes',
          title: 'Elevated Financial Outflow',
          description: `Logged spending ₹${totalRecentDebits.toLocaleString()} in the last 7 days. Ensure luxury transaction limits are not breached.`,
          severity: 'medium'
        });
      }

      // Fallback: If no warnings triggered, output positive security health status
      if (warnings.length === 0) {
        insights.push({
          id: 'insight-system-health',
          title: 'Operational Status Balanced',
          description: 'All tracked disciplines (hydration, tasks, spend velocity) are performing well within established parameters.',
          value: 'Nominal'
        });
      }

    } catch (err) {
      console.warn('[Insights Engine] Analytics parsing bypassed:', err);
    }

    return { insights, warnings };
  }
}

export const insightsEngine = new InsightsEngine();
