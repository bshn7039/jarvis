import { useState } from 'react';
import { aiDispatcher } from '../../ai/services/aiDispatcher';
import CinematicLoader from '../ui/CinematicLoader';
import { useFitnessTransformation } from '../../store/selectors/fitness.selectors';
import { useFitnessStore } from '../../store/fitnessStore';
import { 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Apple, 
  Dumbbell, 
  Droplets,
  Layers,
  Info
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'jarvis_fitness_ai_insights';

function generateOfflineInsights(data, currentDayNote = '') {
  const daily = data.daily || {};
  const targets = daily.targets || { calories: 2000, protein: 140, hydrationMl: 3000, steps: 10000 };
  const overview = data.overview || {};
  
  // Calculate a basic heuristic score
  let score = 40;
  if (overview.consistencyScore) score += Math.round(overview.consistencyScore * 0.3);
  if (daily.calories && targets.calories) {
    const calPct = daily.calories / targets.calories;
    if (calPct >= 0.8 && calPct <= 1.2) score += 10;
  }
  if (daily.protein && targets.protein) {
    const protPct = daily.protein / targets.protein;
    if (protPct >= 0.8) score += 10;
  }
  if (daily.steps && targets.steps) {
    const stepsPct = daily.steps / targets.steps;
    if (stepsPct >= 0.8) score += 10;
  }
  score = Math.min(100, Math.max(0, score));

  // Determine commentary based on phase and score
  const phase = overview.currentPhase || 'Maintenance';
  let summary = `Currently in a ${phase} phase with a consistent training schedule. Macro targets are partially tracked.`;
  if (currentDayNote) {
    summary = `Progress is steady in the ${phase} phase. Daily Note: "${currentDayNote}" is recorded and factored in.`;
  } else if (daily.calories > 0 && daily.protein > 0) {
    summary = `Progress is steady in the ${phase} phase. Logged ${daily.calories} kcal and ${daily.protein}g protein today, showing moderate diet discipline.`;
  }

  const nutritionAdvice = [];
  if (!daily.protein || daily.protein < targets.protein * 0.7) {
    nutritionAdvice.push(`Protein Boost: Focus on incorporating lean protein sources (eggs, whey, chicken breast) to reach your target of ${targets.protein}g.`);
  } else {
    nutritionAdvice.push(`Protein Maintained: Excellent job hitting your daily protein threshold. Continue spacing intakes evenly across the day.`);
  }
  if (daily.calories > targets.calories * 1.15) {
    nutritionAdvice.push(`Calorie Surplus: Today's intake is slightly elevated. Monitor snacking or dense spreads to avoid drifting past ${targets.calories} kcal.`);
  } else {
    nutritionAdvice.push(`Energy Alignment: Calories are well regulated. Keep tracking meals to maintain precise control over your phase targets.`);
  }

  const trainingAdvice = [];
  if (overview.consistencyScore < 50) {
    trainingAdvice.push(`Consistency Focus: Training consistency is currently low at ${overview.consistencyScore}%. Prioritize hitting at least 3 gym tasks this week.`);
  } else {
    trainingAdvice.push(`Great Consistency: Keep up the excellent work keeping your workout routine at ${overview.consistencyScore}%. Maintain your weekly split.`);
  }
  if (data.tasks?.today?.length > 0) {
    trainingAdvice.push(`Pending Routine: You have ${data.tasks.today.length} active gym tasks today. Mark them complete to advance your streak.`);
  }

  const lifestyleAdvice = [];
  if (daily.water < targets.hydrationMl * 0.6) {
    lifestyleAdvice.push(`Hydration Deficit: Sipped only ${daily.water} ml out of ${targets.hydrationMl} ml. Keep a bottle nearby to flush sodium and support protein synthesis.`);
  } else {
    lifestyleAdvice.push(`Optimal Hydration: Great job drinking ${daily.water} ml of water. Highly hydrated muscles perform significantly better.`);
  }
  if (daily.steps < (targets.steps || 10000) * 0.6) {
    lifestyleAdvice.push(`Activity Boost: Hitting only ${daily.steps || 0} of your ${targets.steps || 10000} step target. A brief brisk walk will boost fat loss.`);
  } else {
    lifestyleAdvice.push(`Consistent Steps: Logged ${daily.steps} steps. Excellent cardiorespiratory baseline to drive your TDEE.`);
  }

  const warnings = [];
  if (overview.consistencyScore < 40) {
    warnings.push(`Deconditioning Risk: Prolonged inactive days can impact metabolic rate and strength preservation. Schedule a brief active recovery session.`);
  }
  if (daily.water < targets.hydrationMl * 0.4) {
    warnings.push(`Severe Dehydration: Very low water intake detected today. Hydrate immediately to avoid joint strain and recovery lag.`);
  }
  if (warnings.length === 0) {
    warnings.push(`Optimal Discipline: No major flags today. Keep up the high standard of physical discipline!`);
  }

  return {
    summary,
    transformationScore: score,
    progressComment: `Weight sits at ${overview.currentWeight || '--'} kg (Weekly shift: ${overview.weeklyChange || 0} kg). Focused on ${phase}.`,
    nutritionAdvice,
    trainingAdvice,
    lifestyleAdvice,
    warnings,
    actionPlan: "Maintain calorie limits, finalize today's active tasks, and complete hydration requirements.",
    isFallback: true
  };
}

export default function FitnessAiInsights() {
  const data = useFitnessTransformation();
  const dailyInfos = useFitnessStore((s) => s.dailyInfos || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const [insights, setInsights] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Validate schema key properties
      if (!parsed.summary || typeof parsed.transformationScore !== 'number' || !parsed.nutritionAdvice) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    const currentDayNote = dailyInfos.find(i => i.date === data.selectedDay)?.info || '';
    const recentNotes = dailyInfos.filter(i => i.date !== data.selectedDay).slice(0, 5).map(i => ({ date: i.date, info: i.info }));

    // Compile active, real fitness data to send to the AI
    const fitnessSummary = {
      selectedDay: data.selectedDay,
      dailyNotes: currentDayNote,
      recentNotes: recentNotes,
      overview: {
        currentWeight: data.overview.currentWeight,
        targetWeight: data.overview.targetWeight,
        currentPhase: data.overview.currentPhase,
        weeklyWeightChange: data.overview.weeklyChange,
        workoutConsistency: data.overview.consistencyScore
      },
      dailyStats: {
        caloriesLogged: data.daily.calories,
        calorieTarget: data.daily.targets.calories,
        proteinLogged: data.daily.protein,
        proteinTarget: data.daily.targets.protein,
        waterLoggedMl: data.daily.water,
        waterTargetMl: data.daily.targets.hydrationMl,
        stepsLogged: data.daily.steps || 0,
        stepsTarget: data.daily.targets.steps || 10000,
        workoutDone: data.daily.workoutDone,
        loggedMeals: data.daily.meals.map(m => ({ title: m.title, calories: m.calories, protein: m.protein }))
      },
      gymTasks: {
        todayTasks: data.tasks.today.map(t => t.title),
        repetitiveStreaks: data.tasks.repetitive.map(t => ({ title: t.title, streak: t.streak }))
      },
      recentHistory: {
        bodyMetrics: data.history.bodyMetrics.map(m => ({ date: m.date, weightKg: m.weightKg, bodyFat: m.bodyFat, waistCm: m.waistCm })),
        workouts: data.history.workouts.map(w => ({ date: w.date, title: w.title, duration: w.duration, intensity: w.intensity, completed: w.completed }))
      }
    };

    const systemPrompt = `You are JARVIS, an expert physical transformation and sports science AI coach.
Analyze the user's fitness, training, and nutrition logs, including their custom daily notes, provided below.
Provide a highly realistic, motivating yet critical, and scientifically sound review of their current physical state and habits.
Highlight any structural issues such as poor hydration, insufficient protein intake, low training consistency, or unrealistic weight trends relative to their goals.

Specifically consider:
- The user's typed daily notes (feelings, fatigue, injury updates, or additional meal/lifestyle context).
- They are an 18-year-old, 80kg, 5'10" individual working towards a healthier body composition. They have selected a 1700 kcal calorie target, 140g protein target, 6000 ml water target, and a 10,000 steps target.

Your analysis must provide clear action lists detailing:
1. NUTRITION & DIET: Key adjustments to their calories, protein, and eating patterns.
2. TRAINING & WORKOUTS: Optimizations for their workout consistency, intensity, and active GYM tasks.
3. HYDRATION & HABITS: Insights on consistency markers (like water intake, routine adherence).
4. WARNINGS: Critical concerns regarding missed targets, muscle preservation risks, or stalling weight.

Return a JSON response ONLY, with no extra text or markdown formatting (except a standard JSON code block), in this exact format:
{
  "summary": "A sharp, executive summary of their current progress, caloric alignment, and training frequency (1-2 sentences).",
  "transformationScore": 78, // an overall consistency & progress score out of 100 as an integer
  "progressComment": "A brief, scientifically grounded observation about their weight trend and goals (1-2 sentences).",
  "nutritionAdvice": [
    "Macro/Meal: Clear action item based on actual logged meals or protein intake."
  ],
  "trainingAdvice": [
    "Exercise/Volume: Strategic suggestion to improve work capacity, routine adherence, or strength progression."
  ],
  "lifestyleAdvice": [
    "Water/Habits: Actionable tip regarding hydration, routine consistency, or logging practices."
  ],
  "warnings": [
    "A direct, critical alert regarding stalled weights, severe calorie deficits, high-fat spikes, or missed workouts."
  ],
  "actionPlan": "A clear, actionable weekly gameplan to keep them on target."
}
`;

    try {
      const response = await aiDispatcher.sendMessage([
        { role: 'user', content: `Here is my current live Fitness OS snapshot:\n${JSON.stringify(fitnessSummary, null, 2)}` }
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

        const parsed = JSON.parse(cleanContent);
        
        if (
          parsed.summary && 
          typeof parsed.transformationScore === 'number' && 
          Array.isArray(parsed.nutritionAdvice) && 
          Array.isArray(parsed.trainingAdvice) && 
          Array.isArray(parsed.lifestyleAdvice) && 
          Array.isArray(parsed.warnings) && 
          parsed.actionPlan
        ) {
          parsed.isFallback = false;
          setInsights(parsed);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
          console.log('[FitnessAiInsights] Successfully generated premium fitness insights from AI.');
        } else {
          throw new Error('Invalid JSON structure returned by AI coach.');
        }
      } else {
        throw new Error('No content received from AI Dispatcher.');
      }
    } catch (err) {
      console.warn('[FitnessAiInsights] AI dispatch failed. Running offline fallback rule-engine:', err);
      const currentDayNote = dailyInfos.find(i => i.date === data.selectedDay)?.info || '';
      const fallbackData = generateOfflineInsights(data, currentDayNote);
      setInsights(fallbackData);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fallbackData));
    } finally {
      setIsGenerating(false);
    }
  };

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = insights 
    ? circumference - (circumference * insights.transformationScore) / 100 
    : circumference;

  return (
    <section className="rounded-2xl border border-jarvis-border bg-gradient-to-br from-jarvis-panel to-black/35 p-5 transition-all space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-jarvis-border pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-jarvis-accent/10 border border-jarvis-accent/20">
            <Sparkles className="h-4.5 w-4.5 text-jarvis-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-jarvis-text flex items-center gap-1.5">
              AI Fitness Insights
              {insights && insights.isFallback && (
                <span className="text-[9px] font-normal uppercase tracking-wider bg-jarvis-border px-1.5 py-0.5 rounded text-jarvis-muted">
                  Heuristic Analysis
                </span>
              )}
            </h3>
            <p className="text-[10px] text-jarvis-muted mt-0.5">Physical transformation insights & advisory</p>
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-1.5 rounded-lg border border-jarvis-border bg-white/5 px-3 py-1.5 text-xs font-medium text-jarvis-text hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Analyzing Progress...' : insights ? 'Refresh Insights' : 'Generate Insights'}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 text-xs text-rose-400">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Empty State ── */}
      {!insights && !isGenerating && (
        <div className="flex flex-col items-center justify-center py-10 text-center bg-black/10 rounded-xl border border-dashed border-jarvis-border">
          <TrendingUp className="h-8 w-8 text-jarvis-muted opacity-40 mb-2.5 animate-pulse" />
          <p className="text-xs font-medium text-jarvis-text">Unlock Dynamic Fitness Advisory</p>
          <p className="text-[11px] text-jarvis-muted mt-1 max-w-[320px]">
            Run JARVIS's physical diagnostic engine to analyze your caloric tracking, macro balancing, hydration, and gym consistency.
          </p>
          <button
            onClick={handleGenerate}
            className="mt-3.5 flex items-center gap-1.5 rounded-lg bg-jarvis-accent/15 border border-jarvis-accent/20 px-3.5 py-1.5 text-xs text-jarvis-accent hover:bg-jarvis-accent/25 transition"
          >
            <Sparkles className="h-3 w-3" />
            Analyze Performance Now
          </button>
        </div>
      )}

      {/* ── Loading State ── */}
      {isGenerating && (
        <div className="py-8 bg-black/20 rounded-xl border border-jarvis-border/40">
          <CinematicLoader message="Analyzing Physical Transformation Trends..." />
        </div>
      )}

      {/* ── Active Insights Layout ── */}
      {insights && !isGenerating && (
        <div className="space-y-5">
          {/* Summary Banner with radial gauge */}
          <div className="grid gap-4 md:grid-cols-12 items-center bg-black/20 border border-jarvis-border/40 rounded-xl p-4">
            <div className="md:col-span-8 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-jarvis-accent bg-jarvis-accent/10 px-2 py-0.5 rounded border border-jarvis-accent/20">
                  JARVIS Diagnosis
                </span>
              </div>
              <p className="text-xs text-jarvis-text leading-relaxed font-medium">
                {insights.summary}
              </p>
            </div>

            <div className="md:col-span-4 flex items-center md:justify-end gap-3.5 border-t border-jarvis-border/40 md:border-t-0 pt-3 md:pt-0">
              <div className="relative h-18 w-18 flex items-center justify-center">
                <svg className="absolute transform -rotate-90" width="76" height="76">
                  <circle 
                    cx="38" 
                    cy="38" 
                    r={radius} 
                    className="stroke-jarvis-border/40 fill-transparent" 
                    strokeWidth="4" 
                  />
                  <circle 
                    cx="38" 
                    cy="38" 
                    r={radius} 
                    className={`${insights.transformationScore > 75 ? 'stroke-emerald-400' : insights.transformationScore > 50 ? 'stroke-jarvis-accent' : 'stroke-rose-400'} fill-transparent transition-all duration-1000 ease-out`} 
                    strokeWidth="4" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center z-10">
                  <span className="text-base font-bold text-jarvis-text">{insights.transformationScore}</span>
                  <span className="text-[8px] block text-jarvis-muted uppercase tracking-tighter">Score</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-wider text-jarvis-muted font-bold flex items-center gap-1">
                  <Layers className="h-3 w-3 text-jarvis-accent" /> Trend Analysis
                </p>
                <p className="text-[11px] text-jarvis-muted leading-tight mt-0.5">
                  {insights.progressComment}
                </p>
              </div>
            </div>
          </div>

          {/* ── advice cards grid ── */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* 1. Nutrition & Diet */}
            <article className="rounded-xl border border-jarvis-border bg-black/20 p-4 flex flex-col h-full">
              <div className="flex items-center gap-1.5 text-jarvis-accent font-bold text-xs uppercase tracking-wider mb-2.5 border-b border-jarvis-border pb-1.5">
                <Apple className="h-4 w-4 shrink-0" />
                <span>Nutrition & Diet</span>
              </div>
              <ul className="space-y-3 flex-1">
                {(insights.nutritionAdvice || []).map((item, idx) => (
                  <li key={idx} className="text-[11px] text-jarvis-text leading-snug">
                    <span className="font-semibold block text-white/90">{item.split(':')[0]}</span>
                    <span className="text-jarvis-muted">{item.split(':').slice(1).join(':')}</span>
                  </li>
                ))}
              </ul>
            </article>

            {/* 2. Training & Exercise */}
            <article className="rounded-xl border border-jarvis-border bg-black/20 p-4 flex flex-col h-full">
              <div className="flex items-center gap-1.5 text-jarvis-accent font-bold text-xs uppercase tracking-wider mb-2.5 border-b border-jarvis-border pb-1.5">
                <Dumbbell className="h-4 w-4 shrink-0" />
                <span>Training split</span>
              </div>
              <ul className="space-y-3 flex-1">
                {(insights.trainingAdvice || []).map((item, idx) => (
                  <li key={idx} className="text-[11px] text-jarvis-text leading-snug">
                    <span className="font-semibold block text-white/90">{item.split(':')[0]}</span>
                    <span className="text-jarvis-muted">{item.split(':').slice(1).join(':')}</span>
                  </li>
                ))}
              </ul>
            </article>

            {/* 3. Hydration & Habits */}
            <article className="rounded-xl border border-jarvis-border bg-black/20 p-4 flex flex-col h-full">
              <div className="flex items-center gap-1.5 text-jarvis-accent font-bold text-xs uppercase tracking-wider mb-2.5 border-b border-jarvis-border pb-1.5">
                <Droplets className="h-4 w-4 shrink-0" />
                <span>Hydration & habits</span>
              </div>
              <ul className="space-y-3 flex-1">
                {(insights.lifestyleAdvice || []).map((item, idx) => (
                  <li key={idx} className="text-[11px] text-jarvis-text leading-snug">
                    <span className="font-semibold block text-white/90">{item.split(':')[0]}</span>
                    <span className="text-jarvis-muted">{item.split(':').slice(1).join(':')}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          {/* Warnings Panel */}
          {insights.warnings && insights.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.02] p-4">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0" /> Critical warnings
              </h4>
              <ul className="list-disc pl-4 mt-2 space-y-1">
                {insights.warnings.map((w, idx) => (
                  <li key={idx} className="text-xs text-jarvis-text font-light">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tactical Advice Panel */}
          <div className="rounded-xl border border-jarvis-border/60 bg-gradient-to-r from-jarvis-accent/5 to-black/10 p-4">
            <h4 className="text-xs font-bold text-jarvis-accent uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" /> Core Tactical transformation Plan
            </h4>
            <p className="text-xs text-jarvis-text leading-relaxed mt-2 italic font-light">
              "{insights.actionPlan}"
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
