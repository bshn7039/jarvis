import { useMemo } from 'react';
import { useFitnessStore } from '../fitnessStore';
import { useProfileStore } from '../profileStore';
import { useTaskStore } from '../taskStore';
import { useGoalStore } from '../goalStore';
import { useJournalStore } from '../journalStore';

const todayKey = () => new Date().toISOString().slice(0, 10);

export const useFitnessTransformation = () => {
  const profile = useProfileStore((s) => s.profile);
  const tasks = useTaskStore((s) => s.tasks);
  const repetitiveTasks = useTaskStore((s) => s.repetitiveTasks);
  const goals = useGoalStore((s) => s.goals);
  const journalEntries = useJournalStore((s) => s.entries);
  
  const fitnessStore = useFitnessStore();
  const selectedDay = fitnessStore.selectedDay;
  const meals = fitnessStore.meals;
  const hydrationLogs = fitnessStore.hydrationLogs;
  const workouts = fitnessStore.workouts;
  const bodyMetrics = fitnessStore.bodyMetrics;
  const stepLogs = fitnessStore.stepLogs || [];
  const targets = fitnessStore.targets;

  return useMemo(() => {
    const TODAY = todayKey();
    const DAY = selectedDay || TODAY;

    // 1. Physical Overview (Profile driven)
    const physical = profile?.physical || {};
    const latestMetric = bodyMetrics[0];
    const previousMetric = bodyMetrics[1];
    
    const currentWeight = latestMetric?.weightKg || physical.weightKg || 0;
    const targetWeight = 70; // Hardcoded or from profile if added later
    const currentPhase = physical.fitnessGoal || 'Maintenance';
    
    const weeklyChange = previousMetric ? (latestMetric.weightKg - previousMetric.weightKg).toFixed(1) : 0;
    
    // Consistency Score: % of workouts completed in last 7 logs
    const recentWorkouts = workouts.slice(0, 7);
    const completedCount = recentWorkouts.filter(w => w.completed).length;
    const consistencyScore = recentWorkouts.length > 0 ? Math.round((completedCount / recentWorkouts.length) * 100) : 0;

    // Consistency Bars (Last 7 days)
    const consistencyBars = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      return workouts.some(w => w.date === dateStr && w.completed) ? 1 : 0;
    });

    // 2. Daily Summary
    const caloriesToday = meals.filter(m => m.date === DAY).reduce((sum, m) => sum + m.calories, 0);
    const proteinToday = meals.filter(m => m.date === DAY).reduce((sum, m) => sum + m.protein, 0);
    const waterToday = hydrationLogs.filter(l => l.date === DAY).reduce((sum, l) => sum + l.amountMl, 0);
    const stepsToday = stepLogs.filter(l => l.date === DAY).reduce((sum, l) => sum + l.steps, 0);
    const workoutDone = workouts.some(w => w.date === DAY && w.completed);
    
    // 3. Tasks & Repetitive Tasks
    const fitnessTasks = tasks.filter(t => 
      !t.completed && 
      (
        t.subTags?.some(tag => ['gym', 'GYM'].includes(tag)) ||
        t.category?.toLowerCase() === 'fitness' || 
        t.title?.toLowerCase().includes('workout')
      )
    );
    const fitnessRepetitive = repetitiveTasks.filter(t => 
      t.active && 
      (
        t.subTags?.some(tag => ['gym', 'GYM'].includes(tag)) ||
        t.category?.toLowerCase() === 'fitness' || 
        t.tags?.some(tag => ['fitness', 'health', 'gym'].includes(tag.toLowerCase()))
      )
    );

    // 4. Goals
    const fitnessGoals = goals.filter(g => 
      g.type === 'goal' && 
      (g.title?.toLowerCase().includes('weight') || g.title?.toLowerCase().includes('fitness') || g.title?.toLowerCase().includes('health'))
    );

    // 5. Recovery & Energy (Journal)
    const dayJournal = journalEntries.find(e => e.entryDate === DAY);
    const recoveryMood = dayJournal?.mood || null;
    const recoveryNotes = dayJournal?.content?.slice(0, 100) || 'No recovery notes for today.';

    return {
      overview: {
        currentWeight,
        targetWeight,
        currentPhase,
        weeklyChange,
        consistencyScore,
        consistencyBars,
      },
      daily: {
        calories: caloriesToday,
        protein: proteinToday,
        water: waterToday,
        steps: stepsToday,
        workoutDone,
        targets,
        meals: meals.filter(m => m.date === DAY),
        hydration: hydrationLogs.filter(l => l.date === DAY),
        stepsLogs: stepLogs.filter(l => l.date === DAY),
      },
      tasks: {
        today: fitnessTasks.filter(t => t.bucket === 'today'),
        repetitive: fitnessRepetitive,
      },
      goals: fitnessGoals,
      recovery: {
        mood: recoveryMood,
        notes: recoveryNotes,
      },
      history: {
        bodyMetrics: bodyMetrics.slice(0, 10),
        workouts: workouts.slice(0, 10),
        stepLogs: stepLogs.slice(0, 10),
      }
    };
  }, [profile, tasks, repetitiveTasks, goals, journalEntries, fitnessStore, selectedDay]);
};
