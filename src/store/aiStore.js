import { create } from 'zustand';
import { DEFAULT_MODEL } from '../config/aiModels';

function generateOfflineFallback(data, includeSchedule = true) {
  const schedule = [];
  
  // 1. Brief Generator
  let primary = 'Review daily objectives and maintain system discipline.';
  if (data.overdueTasksCount > 0) {
    primary = `Focus on clearing your ${data.overdueTasksCount} overdue tasks to regain structural momentum.`;
  } else if (data.tasks && data.tasks.length > 3) {
    primary = `Prioritize executing today's ${data.tasks.length} critical tasks with maximum discipline.`;
  }
  
  let secondary = 'Maintain physical and cognitive health streaks today.';
  if (data.fitness.waterMl < 1500) {
    secondary = 'Your hydration levels are critically low (< 1.5L). Rehydrate immediately.';
  } else if (data.finance.monthlySpending > 20000) {
    secondary = `Monthly spending is at ₹${data.finance.monthlySpending.toLocaleString()}. Curb unnecessary expenditures.`;
  }

  let watchOuts = 'Ensure all fitness targets and routine habits are logged consistently.';
  if (data.coding.solvedProblemsCount < data.coding.targetProblems) {
    watchOuts = `Weekly coding solved is ${data.coding.solvedProblemsCount}/${data.coding.targetProblems}. Allocate focused DSA time today.`;
  }

  const brief = { primary, secondary, watchOuts };
  
  // 2. Schedule Generator
  if (includeSchedule) {
    const todayTasks = data.tasks || [];
    if (todayTasks.length > 0) {
      todayTasks.forEach((task, index) => {
        schedule.push({
          id: `sched-fallback-${index}`,
          time: task.time || (index === 0 ? '08:00' : '23:59'),
          label: task.title,
          category: task.category || 'Routines',
          status: task.completed ? 'done' : 'upcoming'
        });
      });
    } else {
      const baseSlots = [
        { time: '08:00', label: 'Morning routine & hydration', category: 'Routines' },
        { time: '09:00', label: 'Deep Work: Coding & DSA Target Session', category: 'Coding' },
        { time: '12:00', label: 'Lunch & nutrition log', category: 'Fitness' },
        { time: '14:00', label: 'Academic study & learning queue', category: 'Academics' },
        { time: '17:30', label: 'Gym workout session', category: 'Gym' },
        { time: '20:00', label: 'Dinner & personal reflection', category: 'Personal' },
        { time: '21:30', label: 'Journal entry & daily wrap-up', category: 'Journal' },
      ];
      baseSlots.forEach((slot, index) => {
        schedule.push({
          id: `sched-fallback-${index}`,
          time: slot.time,
          label: slot.label,
          category: slot.category,
          status: 'upcoming'
        });
      });
    }
  }
  
  return { brief, schedule };
}

export const useAiStore = create((set, get) => ({
  isGenerating: false,
  currentModel: localStorage.getItem('jarvis_active_model') || DEFAULT_MODEL,
  lastError: null,
  
  // Daily Command Center AI generated items (hydrated from localStorage)
  dailyBrief: (() => {
    try {
      return JSON.parse(localStorage.getItem('jarvis_daily_brief')) || {
        primary: 'Review daily objectives and maintain system discipline.',
        secondary: 'Hydrate properly and follow your active schedules.',
        watchOuts: 'Keep monitoring task deadlines and transaction thresholds.'
      };
    } catch {
      return {
        primary: 'Review daily objectives and maintain system discipline.',
        secondary: 'Hydrate properly and follow your active schedules.',
        watchOuts: 'Keep monitoring task deadlines and transaction thresholds.'
      };
    }
  })(),
  dailyInsights: [],
  dailyWarnings: [],
  dailySchedule: (() => {
    try { return JSON.parse(localStorage.getItem('jarvis_daily_schedule')) || []; } catch { return []; }
  })(),
  lastGeneratedDate: localStorage.getItem('jarvis_last_generated_date') || null,
  bootBrief: (() => {
    try {
      const cached = localStorage.getItem('jarvis_boot_brief');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  })(),
  isBootGenerating: false,
  generateDailyCommandData: async (force = false) => {
    const today = new Date().toISOString().slice(0, 10);
    const lastGen = get().lastGeneratedDate;

    // Load today's schedule from IndexedDB if it exists
    let todayDbSchedules = [];
    try {
      const { localDb, STORES } = await import('../database/core/localDatabase');
      const allSchedules = await localDb.getAll(STORES.SCHEDULES);
      todayDbSchedules = allSchedules.filter(s => s.date === today);
    } catch (e) {
      console.warn('[JARVIS AI Store] Failed to load schedules from IndexedDB on daily generation check:', e);
    }
    
    // STRICT MANUAL RULES: Skip API generation unless explicitly forced via manual click
    if (!force) {
      console.log('[JARVIS AI Store] Eager daily generation bypassed. Loading cached or fallback structures.');
      const cachedBrief = get().dailyBrief || {
        primary: 'Review daily objectives and maintain system discipline.',
        secondary: 'Hydrate properly and follow your active schedules.',
        watchOuts: 'Keep monitoring task deadlines and transaction thresholds.'
      };
      
      let insights = [];
      let warnings = [];
      try {
        const { insightsEngine } = await import('../ai/services/insightsEngine');
        const engineResult = await insightsEngine.generateDailyInsights();
        insights = engineResult.insights || [];
        warnings = engineResult.warnings || [];
      } catch (e) {
        console.warn('[JARVIS AI Store] Bypassed heuristics insights compiler:', e);
      }

      // Determine what schedule to set
      let finalSchedule = get().dailySchedule || [];
      if (todayDbSchedules.length > 0) {
        finalSchedule = todayDbSchedules.map(s => ({
          id: s.id,
          time: s.time || s.startTime || '08:00',
          label: s.label || s.title || 'Schedule slot',
          category: s.category || 'Routines',
          status: s.status || 'upcoming'
        })).sort((a, b) => a.time.localeCompare(b.time));
      } else if (lastGen !== today) {
        // New day and no DB schedules yet: generate offline fallback daily items and save them to DB
        const fallbackResult = generateOfflineFallback({
          overdueTasksCount: 0,
          tasks: [],
          routines: [],
          fitness: { calories: 0, caloriesTarget: 2500, protein: 0, proteinTarget: 140, waterMl: 0, waterTargetMl: 3500, workoutDone: false },
          finance: { monthlySpending: 0, recentTransactions: [] },
          coding: { solvedProblemsCount: 0, targetProblems: 0 }
        }, true);
        
        finalSchedule = (fallbackResult.schedule || []).sort((a, b) => a.time.localeCompare(b.time));
        
        // Save to IndexedDB
        try {
          const { localDb, STORES } = await import('../database/core/localDatabase');
          const { useScheduleStore } = await import('./scheduleStore');
          for (const item of finalSchedule) {
            await localDb.put(STORES.SCHEDULES, {
              id: item.id || `sched-fallback-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              title: item.label,
              label: item.label,
              date: today,
              time: item.time,
              startTime: item.time,
              endTime: item.time,
              category: item.category,
              status: item.status,
              taskIds: []
            });
          }
          await useScheduleStore.getState().hydrate();
        } catch (e) {
          console.warn('[AI Store] Failed to save new day fallback schedules to IndexedDB:', e);
        }
      }

      set({
        dailyBrief: cachedBrief,
        dailyInsights: insights,
        dailyWarnings: warnings,
        dailySchedule: finalSchedule,
        lastGeneratedDate: lastGen || today,
        isGenerating: false
      });
      
      try {
        localStorage.setItem('jarvis_daily_schedule', JSON.stringify(finalSchedule));
      } catch (e) {
        console.warn('[JARVIS AI Store] Failed to save schedule to localStorage:', e);
      }
      return;
    }
    
    set({ isGenerating: true, lastError: null });
    
    let parsedResult = null;
    let contextData = null;

    try {
      // Dynamically import stores to avoid eager circular dependency cycles
      const { useTaskStore } = await import('./taskStore');
      const { useFitnessStore } = await import('./fitnessStore');
      const { useJournalStore } = await import('./journalStore');
      const { useFinanceStore } = await import('./financeStore');
      const { useAcademicStore } = await import('./academicStore');

      const tasks = useTaskStore.getState().tasks || [];
      const repetitiveTasks = useTaskStore.getState().repetitiveTasks || [];
      const meals = useFitnessStore.getState().meals || [];
      const hydrationLogs = useFitnessStore.getState().hydrationLogs || [];
      const workouts = useFitnessStore.getState().workouts || [];
      const fitnessTargets = useFitnessStore.getState().targets || {};
      const transactions = useFinanceStore.getState().transactions || [];
      const financeOverview = useFinanceStore.getState().balanceOverview || { monthlySpending: 0 };
      const codingProgress = useAcademicStore.getState().codingProgress || {};
      const dsaQuestions = useAcademicStore.getState().dsaQuestions || [];
      
      const calories = meals.filter(m => m.date === today).reduce((sum, m) => sum + m.calories, 0);
      const protein = meals.filter(m => m.date === today).reduce((sum, m) => sum + m.protein, 0);
      const waterMl = hydrationLogs.filter(l => l.date === today).reduce((sum, l) => sum + l.amountMl, 0);
      const workoutDone = workouts.some(w => w.date === today && w.completed);
      
      const todayTasks = tasks.filter(t => t.bucket === 'today' || t.dueDate?.slice(0, 10) === today);
      const overdueTasks = tasks.filter(t => !t.completed && t.dueDate?.slice(0, 10) < today);
      
      contextData = {
        date: today,
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        tasks: todayTasks.map(t => ({ title: t.title, priority: t.priority, completed: t.completed, category: t.category, time: t.time })),
        overdueTasksCount: overdueTasks.length,
        routines: repetitiveTasks.filter(r => r.active).map(r => ({ title: r.title, streak: r.streak })),
        fitness: {
          calories,
          caloriesTarget: fitnessTargets.calories || 2500,
          protein,
          proteinTarget: fitnessTargets.protein || 140,
          waterMl,
          waterTargetMl: fitnessTargets.hydrationMl || 3500,
          workoutDone
        },
        finance: {
          monthlySpending: financeOverview.monthlySpending,
          recentTransactions: transactions.slice(0, 3).map(t => ({ title: t.title, amount: t.amount, type: t.type }))
        },
        coding: {
          solvedProblemsCount: dsaQuestions.length,
          weeklySolved: codingProgress.weeklySolved,
          targetProblems: codingProgress.targetProblems
        }
      };

      const promptContext = JSON.stringify(contextData, null, 2);
      
      const systemPrompt = `You are JARVIS, a calm, precise, and highly capable AI operating layer.
Analyze the user's daily life metrics and tasks provided below, and generate:
1. An AI Daily Brief consisting of a Primary Priority, a Secondary Priority, and a Watch-out (each 1-2 concise, highly personalized sentences highlighting key focal points, spend warning, low study/workouts, or tasks).
${force ? '2. A structured, hour-by-hour Today\'s Schedule using their actual tasks, routines, and fitness goals.' : ''}

Return a JSON object ONLY, with no extra text or markdown formatting (except a standard JSON code block), in this exact format:
{
  "brief": {
    "primary": "Primary daily focus based on metrics...",
    "secondary": "Secondary focus or habit risk...",
    "watchOuts": "Key watch-out (e.g., budget alert, dehydration threat, overdue tasks)..."
  }${force ? `,
  "schedule": [
    { "id": "sched-1", "time": "08:00", "label": "Morning routine & hydration", "category": "Routines", "status": "upcoming" }
  ]` : ''}
}

${force ? 'Strictly use only these categories for schedule items: "Coding", "Academics", "Journal", "Gym", "Fitness", "Routines", "Personal".\nKeep the times in HH:MM 24-hour format. Ensure the schedule items are ordered chronologically.' : ''}
`;
      
      const { aiDispatcher } = await import('../ai/services/aiDispatcher');
      const response = await aiDispatcher.sendMessage([
        { role: 'user', content: `Here is my system snapshot:\n${promptContext}` }
      ], {
        systemPrompt,
        temperature: 0.3
      });
      
      if (response && response.content) {
        let cleanContent = response.content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.slice(7);
        }
        if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.slice(3);
        }
        if (cleanContent.endsWith('```')) {
          cleanContent = cleanContent.slice(0, -3);
        }
        cleanContent = cleanContent.trim();
        
        parsedResult = JSON.parse(cleanContent);
        console.log('[JARVIS AI Store] Successfully generated daily data from AI API.');
      }
    } catch (err) {
      console.warn('[JARVIS AI Store] AI API generation failed or was bypassed. Running offline fallback:', err);
    }
    
    if (!parsedResult || !parsedResult.brief || (force && !parsedResult.schedule)) {
      console.log('[JARVIS AI Store] Generating dynamic offline fallback...');
      if (!contextData) {
        // Safe mock context if import or store query failed completely
        contextData = {
          overdueTasksCount: 0,
          tasks: [],
          routines: [],
          fitness: { calories: 0, caloriesTarget: 2500, protein: 0, proteinTarget: 140, waterMl: 0, waterTargetMl: 3500, workoutDone: false },
          finance: { monthlySpending: 0, recentTransactions: [] },
          coding: { solvedProblemsCount: 0, targetProblems: 0 }
        };
      }
      parsedResult = generateOfflineFallback(contextData, force);
    }
    
    const brief = parsedResult.brief || {
      primary: 'Review daily objectives and maintain system discipline.',
      secondary: 'Hydrate properly and follow your active schedules.',
      watchOuts: 'Keep monitoring task deadlines and transaction thresholds.'
    };
    
    // If manually forced, generate schedule.
    // If auto-loaded (force=false):
    //   - If it's a new day (lastGen !== today), keep/set it blank (empty array).
    //   - If it's the same day, preserve the existing dailySchedule.
    const schedule = force
      ? ((parsedResult.schedule || []).sort((a, b) => a.time.localeCompare(b.time)))
      : (lastGen === today ? get().dailySchedule : []);
    
    // Dynamic Heuristics Insight compilations
    let insights = [];
    let warnings = [];
    try {
      const { insightsEngine } = await import('../ai/services/insightsEngine');
      const engineResult = await insightsEngine.generateDailyInsights();
      insights = engineResult.insights || [];
      warnings = engineResult.warnings || [];
      console.log('[JARVIS AI Store] Heuristic daily insights/warnings compiled.');
    } catch (e) {
      console.warn('[JARVIS AI Store] Bypassed heuristics insights compiler:', e);
    }

    set({
      dailyBrief: brief,
      dailyInsights: insights,
      dailyWarnings: warnings,
      dailySchedule: schedule,
      lastGeneratedDate: today,
      isGenerating: false
    });
    
    try {
      localStorage.setItem('jarvis_daily_brief', JSON.stringify(brief));
      localStorage.setItem('jarvis_daily_schedule', JSON.stringify(schedule));
      localStorage.setItem('jarvis_last_generated_date', today);

      // Mirror the newly generated daily schedule to IndexedDB
      if (force && schedule.length > 0) {
        const { localDb, STORES } = await import('../database/core/localDatabase');
        const { useScheduleStore } = await import('./scheduleStore');
        
        const allSchedules = await localDb.getAll(STORES.SCHEDULES);
        const todayIds = allSchedules.filter(s => s.date === today).map(s => s.id);
        
        for (const id of todayIds) {
          await localDb.delete(STORES.SCHEDULES, id);
        }
        
        for (const item of schedule) {
          await localDb.put(STORES.SCHEDULES, {
            id: item.id || `sched-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            title: item.label,
            label: item.label,
            date: today,
            time: item.time,
            startTime: item.time,
            endTime: item.time,
            category: item.category,
            status: item.status,
            taskIds: []
          });
        }
        await useScheduleStore.getState().hydrate();
      }
    } catch (e) {
      console.warn('[JARVIS AI Store] Failed to save daily data or sync to IndexedDB:', e);
    }
  },

  generateBootBrief: async (force = false) => {
    const today = new Date().toISOString().slice(0, 10);
    const cached = get().bootBrief;
    
    // STRICT MANUAL RULES: Load cache or fallback without contacting AI unless forced
    if (!force) {
      if (cached && cached.date === today) {
        set({ isBootGenerating: false });
        return cached;
      }
      
      console.log('[JARVIS AI Store] Eager boot diagnostics bypassed. Generating dynamic local boot payload.');
      const fallbackBoot = {
        date: today,
        speechText: `Welcome back, Commander. System metrics loaded. All security vault layers are active. Standing by for instructions.`,
        visualBrief: {
          primary: "Review daily objectives and maintain system discipline.",
          secondary: "Ensure all fitness and routine metrics are logged.",
          watchOuts: "Check overdue tasks and financial thresholds.",
          goalsSummary: "Active goals are loaded and tracking.",
          systemHealth: "85%"
        }
      };
      set({
        bootBrief: fallbackBoot,
        isBootGenerating: false
      });
      return fallbackBoot;
    }
    
    set({ isBootGenerating: true, lastError: null });
    
    let parsedResult = null;
    let contextData = null;
    
    try {
      // Dynamic imports to prevent circular dependencies
      const { useTaskStore } = await import('./taskStore');
      const { useFitnessStore } = await import('./fitnessStore');
      const { useFinanceStore } = await import('./financeStore');
      const { useAcademicStore } = await import('./academicStore');
      const { useGoalStore } = await import('./goalStore');
      const { useSelfCareStore } = await import('./selfCareStore');
      const { useAuthStore } = await import('./authStore');
      const { useProfileStore } = await import('./profileStore');
      
      const user = useAuthStore.getState().user;
      const profile = useProfileStore.getState().profile;
      const userName = profile?.identity?.displayName || user?.username || 'Commander';
      
      const tasks = useTaskStore.getState().tasks || [];
      const repetitiveTasks = useTaskStore.getState().repetitiveTasks || [];
      const meals = useFitnessStore.getState().meals || [];
      const hydrationLogs = useFitnessStore.getState().hydrationLogs || [];
      const workouts = useFitnessStore.getState().workouts || [];
      const fitnessTargets = useFitnessStore.getState().targets || {};
      const transactions = useFinanceStore.getState().transactions || [];
      const financeOverview = useFinanceStore.getState().balanceOverview || { monthlySpending: 0, balance: 0 };
      const codingProgress = useAcademicStore.getState().codingProgress || {};
      const dsaQuestions = useAcademicStore.getState().dsaQuestions || [];
      const selfCareRoutines = useSelfCareStore.getState().routines || [];
      const goals = useGoalStore.getState().goals || [];
      
      // Calculate today metrics
      const calories = meals.filter(m => m.date === today).reduce((sum, m) => sum + m.calories, 0);
      const protein = meals.filter(m => m.date === today).reduce((sum, m) => sum + m.protein, 0);
      const waterMl = hydrationLogs.filter(l => l.date === today).reduce((sum, l) => sum + l.amountMl, 0);
      const workoutDone = workouts.some(w => w.date === today && w.completed);
      
      const todayTasks = tasks.filter(t => t.bucket === 'today' && !t.completed);
      const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && t.dueDate.slice(0, 10) < today);
      const completedToday = tasks.filter(t => t.completed && t.completedAt?.slice(0, 10) === today);
      const activeGoals = goals.filter(g => !g.completed);
      const activeSelfCare = selfCareRoutines.filter(r => !r.completed);
      
      contextData = {
        userName,
        date: today,
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        tasks: {
          pendingTodayCount: todayTasks.length,
          overdueCount: overdueTasks.length,
          overdueSample: overdueTasks.slice(0, 3).map(t => t.title),
          completedTodayCount: completedToday.length,
          routinesCount: repetitiveTasks.filter(r => r.active).length,
        },
        goals: activeGoals.map(g => ({ title: g.title, progress: g.progress || 0 })),
        fitness: {
          calories,
          caloriesTarget: fitnessTargets.calories || 2500,
          protein,
          proteinTarget: fitnessTargets.protein || 140,
          waterMl,
          waterTargetMl: fitnessTargets.hydrationMl || 3500,
          workoutDone
        },
        finance: {
          monthlySpending: financeOverview.monthlySpending,
          balance: financeOverview.balance,
          recentTransactions: transactions.slice(0, 3).map(t => ({ title: t.title, amount: t.amount, type: t.type }))
        },
        coding: {
          solvedProblemsCount: dsaQuestions.length,
          weeklySolved: codingProgress.weeklySolved,
          targetProblems: codingProgress.targetProblems
        },
        selfCare: activeSelfCare.map(r => ({ title: r.title, category: r.category, streak: r.streak }))
      };
      
      const promptContext = JSON.stringify(contextData, null, 2);
      
      const systemPrompt = `You are JARVIS, a calm, precise, and highly capable AI operating layer.
Analyze the user's daily life metrics and tasks provided below, and generate:
1. "speechText": A highly natural-sounding spoken audio greeting and summary that starts by greeting the user by name (e.g. "Good morning, Commander" or "Welcome back, Bhuvan") and covers the most critical parts of the data. Keep this speech text EXTREMELY CONCISE (maximum 3-4 sentences, 60-70 words) to save cost on text-to-speech APIs while retaining all important alerts (overdue tasks, finance warnings, coding targets, low hydration).
2. "visualBrief": A structured visualization summary object containing:
   - "primary": The single most critical focus area for today.
   - "secondary": Secondary action item or streak risk.
   - "watchOuts": Low-hydration or budget warnings, or overdue tasks alerts.
   - "goalsSummary": A short 1-sentence update summarizing their goals status.
   - "systemHealth": A percentage (e.g. "90%") rating current daily progression/discipline.

Return a JSON object ONLY, with no extra text or markdown formatting (except a standard JSON code block), in this exact format:
{
  "speechText": "Spoken text summarizing their metrics...",
  "visualBrief": {
    "primary": "Primary priority text...",
    "secondary": "Secondary priority text...",
    "watchOuts": "Alerts or risks...",
    "goalsSummary": "Goal overview text...",
    "systemHealth": "90%"
  }
}
`;

      const { aiDispatcher } = await import('../ai/services/aiDispatcher');
      const response = await aiDispatcher.sendMessage([
        { role: 'user', content: `Here is my system snapshot:\n${promptContext}` }
      ], {
        systemPrompt,
        temperature: 0.3
      });
      
      if (response && response.content) {
        let cleanContent = response.content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.slice(7);
        }
        if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.slice(3);
        }
        if (cleanContent.endsWith('```')) {
          cleanContent = cleanContent.slice(0, -3);
        }
        cleanContent = cleanContent.trim();
        
        parsedResult = JSON.parse(cleanContent);
        console.log('[JARVIS AI Store] Successfully generated boot diagnostics data from AI API.');
      }
    } catch (err) {
      console.error('[JARVIS AI Store] AI API generation for boot failed. Detailed error:', err);
    }
    
    if (!parsedResult || !parsedResult.speechText || !parsedResult.visualBrief) {
      console.log('[JARVIS AI Store] Generating dynamic offline fallback for boot...');
      parsedResult = {
        speechText: `Welcome back, Commander. System metrics loaded. You have some pending items to review.`,
        visualBrief: {
          primary: "Review daily objectives and maintain system discipline.",
          secondary: "Ensure all fitness and routine metrics are logged.",
          watchOuts: "Check overdue tasks and financial thresholds.",
          goalsSummary: "Active goals are loaded and tracking.",
          systemHealth: "85%"
        }
      };
    }
    
    const bootData = {
      date: today,
      ...parsedResult
    };
    
    set({
      bootBrief: bootData,
      isBootGenerating: false
    });
    
    try {
      localStorage.setItem('jarvis_boot_brief', JSON.stringify(bootData));
    } catch (e) {
      console.warn('[JARVIS AI Store] Failed to save boot data to localStorage:', e);
    }
    
    return bootData;
  },
    addToSchedule: async (item) => {
    const today = new Date().toISOString().slice(0, 10);
    const nextItem = {
      id: item.id || `sched-usr-${Date.now()}`,
      time: item.time || '12:00',
      label: item.label || 'New schedule item',
      category: item.category || 'Routines',
      status: item.status || 'upcoming'
    };
    const nextSchedule = [...get().dailySchedule, nextItem].sort((a, b) => a.time.localeCompare(b.time));
    set({ dailySchedule: nextSchedule });
    localStorage.setItem('jarvis_daily_schedule', JSON.stringify(nextSchedule));

    try {
      const { localDb, STORES } = await import('../database/core/localDatabase');
      const { useScheduleStore } = await import('./scheduleStore');
      await localDb.put(STORES.SCHEDULES, {
        id: nextItem.id,
        title: nextItem.label,
        label: nextItem.label,
        date: today,
        time: nextItem.time,
        startTime: nextItem.time,
        endTime: nextItem.time,
        category: nextItem.category,
        status: nextItem.status,
        taskIds: []
      });
      await useScheduleStore.getState().hydrate();
    } catch (e) {
      console.warn('[AI Store] Failed to save schedule item to IndexedDB:', e);
    }
  },
  
  updateScheduleItem: async (id, updates) => {
    const today = new Date().toISOString().slice(0, 10);
    const nextSchedule = get().dailySchedule.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ).sort((a, b) => a.time.localeCompare(b.time));
    set({ dailySchedule: nextSchedule });
    localStorage.setItem('jarvis_daily_schedule', JSON.stringify(nextSchedule));

    try {
      const { localDb, STORES } = await import('../database/core/localDatabase');
      const { useScheduleStore } = await import('./scheduleStore');
      const updatedItem = nextSchedule.find(item => item.id === id);
      if (updatedItem) {
        const existing = await localDb.getById(STORES.SCHEDULES, id) || {};
        await localDb.put(STORES.SCHEDULES, {
          ...existing,
          id: updatedItem.id,
          title: updatedItem.label,
          label: updatedItem.label,
          date: existing.date || today,
          time: updatedItem.time,
          startTime: updatedItem.time,
          endTime: updatedItem.time,
          category: updatedItem.category,
          status: updatedItem.status
        });
        await useScheduleStore.getState().hydrate();
      }
    } catch (e) {
      console.warn('[AI Store] Failed to update schedule item in IndexedDB:', e);
    }
  },
  
  deleteScheduleItem: async (id) => {
    const nextSchedule = get().dailySchedule.filter(item => item.id !== id);
    set({ dailySchedule: nextSchedule });
    localStorage.setItem('jarvis_daily_schedule', JSON.stringify(nextSchedule));

    try {
      const { localDb, STORES } = await import('../database/core/localDatabase');
      const { useScheduleStore } = await import('./scheduleStore');
      await localDb.delete(STORES.SCHEDULES, id);
      await useScheduleStore.getState().hydrate();
    } catch (e) {
      console.warn('[AI Store] Failed to delete schedule item from IndexedDB:', e);
    }
  },

  resetSchedule: async () => {
    const today = new Date().toISOString().slice(0, 10);
    const defaultSchedule = [
      { id: `sched-wakeup-${today}`, time: '08:00', label: 'Wake up', category: 'Routines', status: 'upcoming' },
      { id: `sched-sleep-${today}`, time: '00:00', label: 'Sleep', category: 'Routines', status: 'upcoming' }
    ];
    set({ dailySchedule: defaultSchedule });
    localStorage.setItem('jarvis_daily_schedule', JSON.stringify(defaultSchedule));

    try {
      const { localDb, STORES } = await import('../database/core/localDatabase');
      const { useScheduleStore } = await import('./scheduleStore');
      
      const allSchedules = await localDb.getAll(STORES.SCHEDULES);
      const todayIds = allSchedules.filter(s => s.date === today).map(s => s.id);
      
      for (const id of todayIds) {
        await localDb.delete(STORES.SCHEDULES, id);
      }
      
      for (const item of defaultSchedule) {
        await localDb.put(STORES.SCHEDULES, {
          id: item.id,
          title: item.label,
          label: item.label,
          date: today,
          time: item.time,
          startTime: item.time,
          endTime: item.time,
          category: item.category,
          status: item.status,
          taskIds: []
        });
      }
      await useScheduleStore.getState().hydrate();
    } catch (e) {
      console.warn('[AI Store] Failed to reset schedules in IndexedDB:', e);
    }
  },

  // AI Execution tracking
  executionStatus: 'idle', // 'idle' | 'analyzing' | 'executing' | 'completed' | 'failed'
  pendingTools: [],
  executedTools: [],
  toolCooldowns: {}, // { toolName: timestamp }

  setGenerating: (isGenerating) => set({ isGenerating }),
  setModel: (model) => {
    console.log('[AI Store] setModel called with:', model);
    localStorage.setItem('jarvis_active_model', model);
    set({ currentModel: model });
  },
  setError: (error) => set({ lastError: error }),
  clearError: () => set({ lastError: null }),
  
  setExecutionStatus: (status) => set({ executionStatus: status }),
  
  addPendingTool: (tool) => set((state) => ({ 
    pendingTools: [...state.pendingTools, { ...tool, status: 'pending', timestamp: Date.now() }] 
  })),
  
  updateToolStatus: (toolId, status, result = null) => set((state) => ({
    pendingTools: state.pendingTools.map(t => 
      t.id === toolId ? { ...t, status, result, completedAt: status === 'executed' ? Date.now() : null } : t
    ),
    executedTools: status === 'executed' 
      ? [...state.executedTools, { ...state.pendingTools.find(t => t.id === toolId), status, result, completedAt: Date.now() }]
      : state.executedTools
  })),

  setToolCooldown: (toolName) => set((state) => ({
    toolCooldowns: { ...state.toolCooldowns, [toolName]: Date.now() + 2000 } // 2 second cooldown
  })),

  isToolOnCooldown: (toolName) => {
    const cooldown = get().toolCooldowns[toolName];
    return cooldown && Date.now() < cooldown;
  },

  resetExecution: () => set({
    executionStatus: 'idle',
    pendingTools: [],
    executedTools: [],
    lastError: null
  })
}));
