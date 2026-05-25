import { useState, useMemo } from 'react';
import { 
  Dumbbell, 
  Utensils, 
  Droplets, 
  Scale, 
  Target, 
  Zap, 
  Brain, 
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Check,
  Sparkles,
  Info
} from 'lucide-react';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import PagePanel from '../components/ui/PagePanel';
import ProgressBar from '../components/ui/ProgressBar';
import BaseModal from '../components/modals/BaseModal';
import EntityModal from '../components/modals/EntityModal';
import EntityForm from '../components/forms/EntityForm';
import { useFitnessStore } from '../store/fitnessStore';
import { useFitnessTransformation } from '../store/selectors/fitness.selectors';
import { useTaskStore } from '../store/taskStore';
import { useEntityStore } from '../store/entityStore';

const MOCK_NUTRITION_DB = {
  chicken: { calories: 239, protein: 27 },
  rice: { calories: 130, protein: 2.7 },
  egg: { calories: 155, protein: 13 },
  oats: { calories: 389, protein: 17 },
  whey: { calories: 120, protein: 24 },
  banana: { calories: 89, protein: 1.1 },
  milk: { calories: 42, protein: 3.4 },
  bread: { calories: 265, protein: 9 },
  peanut: { calories: 567, protein: 25 },
};

function extractNutrition(text) {
  const lowercase = text.toLowerCase();
  let totalCalories = 0;
  let totalProtein = 0;
  let found = false;
  
  Object.entries(MOCK_NUTRITION_DB).forEach(([item, data]) => {
    if (lowercase.includes(item)) {
       totalCalories += data.calories;
       totalProtein += data.protein;
       found = true;
    }
  });

  if (!found) {
    return { calories: 250, protein: 12, extracted: false };
  }

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein),
    extracted: true
  };
}

export default function Fitness() {
  const { 
    overview, 
    daily, 
    tasks: fitnessTasks, 
    goals: fitnessGoals, 
    recovery, 
    history 
  } = useFitnessTransformation();

  const selectedDay = useFitnessStore((s) => s.selectedDay);
  const setSelectedDay = useFitnessStore((s) => s.setSelectedDay);
  const addHydrationLog = useFitnessStore((s) => s.addHydrationLog);
  const addMealLog = useFitnessStore((s) => s.addMealLog);
  const addBodyMetricLog = useFitnessStore((s) => s.addBodyMetricLog);
  const updateBodyMetricLog = useFitnessStore((s) => s.updateBodyMetricLog);
  const updateMealLog = useFitnessStore((s) => s.updateMealLog);
  const deleteLog = useFitnessStore((s) => s.deleteLog);
  
  const tasks = useTaskStore((s) => s.tasks);
  const createTask = useTaskStore((s) => s.createTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const toggleRepetitiveTaskCompletion = useTaskStore((s) => s.toggleRepetitiveTaskCompletion);

  const isEntityModalOpen = useEntityStore((s) => s.isModalOpen);
  const activeType = useEntityStore((s) => s.activeType);
  const draftMode = useEntityStore((s) => s.draftMode);
  const selectedId = useEntityStore((s) => s.selectedId);
  const openCreateModal = useEntityStore((s) => s.openCreateModal);
  const openEditModal = useEntityStore((s) => s.openEditModal);
  const closeModal = useEntityStore((s) => s.closeModal);

  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState(null);
  const [metricForm, setMetricForm] = useState({ weightKg: '', bodyFat: '', waistCm: '' });

  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [mealInput, setMealInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const [isSavingEntity, setIsSavingEntity] = useState(false);

  const caloriesPct = Math.round((daily.calories / daily.targets.calories) * 100);
  const proteinPct = Math.round((daily.protein / daily.targets.protein) * 100);
  const waterPct = Math.round((daily.water / daily.targets.hydrationMl) * 100);

  const selectedEntity = useMemo(() => {
    if (activeType === 'task') return tasks.find(t => t.id === selectedId) || null;
    return null;
  }, [activeType, selectedId, tasks]);

  const handleOpenMetricModal = (metric = null) => {
    if (metric) {
      setEditingMetric(metric);
      setMetricForm({ weightKg: metric.weightKg, bodyFat: metric.bodyFat || '', waistCm: metric.waistCm || '' });
    } else {
      setEditingMetric(null);
      setMetricForm({ weightKg: overview.currentWeight || '', bodyFat: '', waistCm: '' });
    }
    setIsMetricModalOpen(true);
  };

  const handleSaveMetric = async () => {
    if (editingMetric) {
      await updateBodyMetricLog(editingMetric.id, metricForm);
    } else {
      await addBodyMetricLog(metricForm);
    }
    setIsMetricModalOpen(false);
    setEditingMetric(null);
  };

  const handleOpenMealModal = (meal = null) => {
    if (meal) {
      setEditingMeal(meal);
      setMealInput(`${meal.title} (${meal.calories}kcal, ${meal.protein}g protein)`);
    } else {
      setEditingMeal(null);
      setMealInput('');
    }
    setIsMealModalOpen(true);
  };

  const handleSaveMeal = async () => {
    setIsAiProcessing(true);
    // Simulate AI delay
    await new Promise(r => setTimeout(r, 800));
    
    const nutrition = extractNutrition(mealInput);
    const title = mealInput.split('(')[0].trim() || 'Meal Log';

    if (editingMeal) {
      await updateMealLog(editingMeal.id, {
        title,
        calories: nutrition.calories,
        protein: nutrition.protein
      });
    } else {
      await addMealLog({
        meal: 'Meal',
        title,
        calories: nutrition.calories,
        protein: nutrition.protein
      });
    }
    
    setIsAiProcessing(false);
    setIsMealModalOpen(false);
    setEditingMeal(null);
    setMealInput('');
  };

  const handleSubmitTask = async (data) => {
    setIsSavingEntity(true);
    try {
      if (draftMode === 'edit' && selectedId) {
        await updateTask(selectedId, data);
      } else {
        await createTask({
          ...data,
          subTags: [...(data.subTags || []), 'gym'],
          bucket: 'today',
          category: 'Fitness'
        });
      }
      closeModal();
    } catch (err) {
      console.error('Failed to save task from fitness:', err);
    } finally {
      setIsSavingEntity(false);
    }
  };

  return (
    <ModulePageLayout 
      title="Fitness OS" 
      subtitle="Physical transformation layer of your life operating system."
    >
      <div className="grid gap-4 lg:grid-cols-4">
        <article className="rounded-xl border border-jarvis-border bg-black/20 p-4">
          <div className="flex items-center gap-2 text-jarvis-muted">
            <Scale className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Current Weight</span>
          </div>
          <p className="mt-2 text-2xl font-light text-jarvis-text">{overview.currentWeight} kg</p>
          <p className="mt-1 text-xs text-jarvis-muted">
            {overview.weeklyChange > 0 ? '+' : ''}{overview.weeklyChange} kg since last entry
          </p>
        </article>

        <article className="rounded-xl border border-jarvis-border bg-black/20 p-4">
          <div className="flex items-center gap-2 text-jarvis-muted">
            <Target className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Current Phase</span>
          </div>
          <p className="mt-2 text-2xl font-light text-jarvis-text">{overview.currentPhase}</p>
          <p className="mt-1 text-xs text-jarvis-muted">Goal: {overview.targetWeight} kg</p>
        </article>

        <article className="rounded-xl border border-jarvis-border bg-black/20 p-4">
          <div className="flex items-center gap-2 text-jarvis-muted">
            <Zap className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Consistency</span>
          </div>
          <p className="mt-2 text-2xl font-light text-jarvis-text">{overview.consistencyScore}%</p>
          <p className="mt-1 text-xs text-jarvis-muted">Last 7 logs</p>
        </article>

        <article className="rounded-xl border border-jarvis-border bg-black/20 p-4">
          <div className="flex items-center gap-2 text-jarvis-muted">
            <Brain className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wider">Recovery</span>
          </div>
          <p className="mt-2 text-2xl font-light text-jarvis-text">{recovery.mood ? `${recovery.mood}/10` : '--'}</p>
          <p className="mt-1 text-xs text-jarvis-muted">Daily average mood</p>
        </article>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <PagePanel title="Daily Summary" subtitle={`Transformation status for ${selectedDay}`}>
            <div className="flex flex-wrap items-center gap-4">
               <div className="flex-1 min-w-[200px]">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-jarvis-muted uppercase">Fueling (Calories)</span>
                    <span className="text-jarvis-text">{daily.calories} / {daily.targets.calories} kcal</span>
                  </div>
                  <ProgressBar value={caloriesPct} />
               </div>
               <div className="flex-1 min-w-[200px]">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-jarvis-muted uppercase">Hydration</span>
                    <span className="text-jarvis-text">{daily.water} / {daily.targets.hydrationMl} ml</span>
                  </div>
                  <ProgressBar value={waterPct} />
               </div>
               <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 border border-jarvis-border">
                  <div className={`h-2 w-2 rounded-full ${daily.workoutDone ? 'bg-green-500' : 'bg-jarvis-muted'}`} />
                  <span className="text-xs text-jarvis-text">Workout {daily.workoutDone ? 'Logged' : 'Pending'}</span>
               </div>
            </div>
            
            <div className="mt-4 flex gap-2">
               <button 
                  onClick={() => addHydrationLog(300)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-jarvis-border bg-white/5 text-xs text-jarvis-text hover:bg-white/10 transition-colors"
               >
                 <Plus className="h-3 w-3" /> Water
               </button>
               <button 
                  onClick={() => handleOpenMealModal()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-jarvis-border bg-white/5 text-xs text-jarvis-text hover:bg-white/10 transition-colors"
               >
                 <Sparkles className="h-3 w-3 text-jarvis-accent" /> AI Meal
               </button>
               <button 
                  onClick={() => openCreateModal('task')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-jarvis-border bg-white/5 text-xs text-jarvis-text hover:bg-white/10 transition-colors"
               >
                 <Plus className="h-3 w-3" /> GYM Task
               </button>
               <button 
                  onClick={() => handleOpenMetricModal()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-jarvis-border bg-white/5 text-xs text-jarvis-text hover:bg-white/10 transition-colors"
               >
                 <Plus className="h-3 w-3" /> Weight
               </button>
               <div className="ml-auto">
                 <input 
                    type="date" 
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="px-2 py-1 rounded border border-jarvis-border bg-transparent text-xs text-jarvis-text focus:outline-none focus:ring-1 focus:ring-jarvis-accent"
                 />
               </div>
            </div>
          </PagePanel>

          <div className="grid gap-6 md:grid-cols-2">
            <PagePanel title="Workout System" subtitle="Gym tasks and routines">
              <div className="space-y-2">
                {fitnessTasks.today.length === 0 && fitnessTasks.repetitive.length === 0 && (
                  <p className="text-xs text-jarvis-muted py-4 text-center">No GYM tasks for today.</p>
                )}
                
                {fitnessTasks.repetitive.map(task => (
                  <div key={task.id} className="group flex items-center justify-between p-3 rounded-xl border border-jarvis-border bg-black/20 hover:border-jarvis-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleRepetitiveTaskCompletion(task.id)}
                        className={`transition-colors ${task.completionHistory.includes(selectedDay) ? 'text-jarvis-accent' : 'text-jarvis-muted'}`}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                      <div>
                        <p className="text-sm text-jarvis-text">{task.title}</p>
                        <p className="text-[10px] uppercase text-jarvis-muted tracking-widest">{task.streak} day streak</p>
                      </div>
                    </div>
                  </div>
                ))}

                {fitnessTasks.today.map(task => (
                  <div key={task.id} className="group flex items-center justify-between p-3 rounded-xl border border-jarvis-border bg-black/20 hover:border-jarvis-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded border border-jarvis-border" />
                      <p className="text-sm text-jarvis-text">{task.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                          onClick={() => openEditModal('task', task.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-jarvis-muted hover:text-jarvis-accent transition-all"
                       >
                          <Edit2 className="h-3 w-3" />
                       </button>
                       <button 
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-jarvis-muted hover:text-red-400 transition-all"
                       >
                          <X className="h-3 w-3" />
                       </button>
                       <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-jarvis-border text-jarvis-muted uppercase">GYM</span>
                    </div>
                  </div>
                ))}
              </div>
            </PagePanel>

            <PagePanel title="Nutrition Logs" subtitle="Daily intake breakdown">
               <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-jarvis-muted uppercase">Protein Target</span>
                      <span className="text-jarvis-text">{daily.protein}g / {daily.targets.protein}g</span>
                    </div>
                    <ProgressBar value={proteinPct} />
                  </div>
                  
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {daily.meals.length === 0 && (
                       <p className="text-[11px] text-jarvis-muted italic text-center py-4">No meal logs for this day.</p>
                    )}
                    {daily.meals.map(m => (
                      <div key={m.id} className="group flex justify-between items-center p-2 rounded-lg bg-white/5 border border-jarvis-border hover:border-jarvis-muted transition-colors">
                        <div className="flex flex-col">
                           <span className="text-xs text-jarvis-text">{m.title}</span>
                           <span className="text-[10px] text-jarvis-muted">{m.calories} kcal | {m.protein}g P</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                           <button 
                              onClick={() => handleOpenMealModal(m)}
                              className="p-1 text-jarvis-muted hover:text-jarvis-accent"
                            >
                               <Edit2 className="h-3 w-3" />
                            </button>
                            <button 
                              onClick={() => deleteLog(m.id)}
                              className="p-1 text-jarvis-muted hover:text-red-400"
                            >
                               <X className="h-3 w-3" />
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </PagePanel>
          </div>

          <PagePanel 
            title="Body Transformation" 
            subtitle="Weight history and progress snapshots"
            actions={
              <button 
                onClick={() => handleOpenMetricModal()}
                className="p-1 text-jarvis-muted hover:text-jarvis-text transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            }
          >
            <div className="grid gap-4 md:grid-cols-3">
               {history.bodyMetrics.slice(0, 3).map((m, i) => (
                 <div key={i} className="group relative p-4 rounded-xl border border-jarvis-border bg-black/20 text-center hover:border-jarvis-muted transition-colors">
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                       <button 
                          onClick={() => handleOpenMetricModal(m)}
                          className="p-1 text-jarvis-muted hover:text-jarvis-accent"
                        >
                           <Edit2 className="h-3 w-3" />
                        </button>
                        <button 
                          onClick={() => deleteLog(m.id)}
                          className="p-1 text-jarvis-muted hover:text-red-400"
                        >
                           <X className="h-3 w-3" />
                        </button>
                    </div>
                    <p className="text-[10px] uppercase text-jarvis-muted mb-2">{m.date}</p>
                    <p className="text-xl font-light text-jarvis-text">{m.weightKg} kg</p>
                    <p className="text-[10px] text-jarvis-muted mt-1">Waist: {m.waistCm || '--'} cm</p>
                 </div>
               ))}
               {history.bodyMetrics.length === 0 && (
                  <div className="col-span-3 p-8 rounded-xl border border-jarvis-dashed bg-black/10 text-center">
                    <p className="text-xs text-jarvis-muted">No transformation history yet. Log your first weight entry.</p>
                  </div>
               )}
            </div>
          </PagePanel>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <PagePanel title="Consistency & Habits">
             <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-jarvis-muted">Weekly Workout Adherence</span>
                  <span className="text-xs text-jarvis-text">{overview.consistencyScore}%</span>
                </div>
                <div className="flex gap-1">
                  {overview.consistencyBars.map((v, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${v ? 'bg-jarvis-accent' : 'bg-white/5'}`} />
                  ))}
                </div>
                {fitnessGoals.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] uppercase text-jarvis-muted tracking-wider mb-2">Linked Goals</p>
                    {fitnessGoals.map(goal => (
                      <div key={goal.id} className="p-2 rounded border border-jarvis-border bg-black/20">
                          <p className="text-xs text-jarvis-text truncate">{goal.title}</p>
                          <ProgressBar value={goal.progress} className="mt-1.5 h-1" />
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </PagePanel>

          <PagePanel title="Recovery & Energy">
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-white/5 border border-jarvis-border">
                      <Zap className="h-4 w-4 text-jarvis-accent" />
                   </div>
                   <div>
                      <p className="text-xs text-jarvis-muted">Energy Level</p>
                      <p className="text-sm text-jarvis-text">{recovery.mood ? `${recovery.mood}/10` : 'Not Logged'}</p>
                   </div>
                </div>
                <div className="p-3 rounded-xl border border-jarvis-border bg-black/20">
                   <p className="text-[11px] uppercase text-jarvis-muted mb-2 flex items-center gap-1">
                     <Brain className="h-3 w-3" /> Recovery Notes
                   </p>
                   <p className="text-xs text-jarvis-text italic leading-relaxed">
                     {recovery.notes === 'No recovery notes for today.' ? (
                        <span className="text-jarvis-muted">No journal entry for today.</span>
                     ) : (
                        `"${recovery.notes}"`
                     )}
                   </p>
                </div>
             </div>
          </PagePanel>

          <PagePanel title="Self-Care">
             <div className="opacity-50 space-y-2">
                <div className="flex items-center justify-between text-xs p-2 rounded border border-jarvis-border border-dashed">
                   <span className="text-jarvis-muted">Personal Grooming</span>
                   <AlertCircle className="h-3 w-3" />
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded border border-jarvis-border border-dashed">
                   <span className="text-jarvis-muted">Sleep Hygiene</span>
                   <AlertCircle className="h-3 w-3" />
                </div>
             </div>
          </PagePanel>

          <PagePanel title="AI Insights" subtitle="Predictive transformation analysis">
             <div className="space-y-3">
                <div className="p-8 rounded-xl border border-jarvis-dashed bg-black/10 text-center">
                   <p className="text-xs text-jarvis-muted italic">Insufficient data for AI generation. Keep logging to unlock insights.</p>
                </div>
             </div>
          </PagePanel>
        </div>
      </div>

      <BaseModal 
        open={isMetricModalOpen} 
        onClose={() => setIsMetricModalOpen(false)}
        ariaLabel={editingMetric ? "Edit Body Metrics" : "Add Body Metrics"}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-jarvis-border pb-2 mb-2">
            <h2 className="text-sm font-medium uppercase tracking-wide text-jarvis-text">
              {editingMetric ? "Edit Body Metrics" : "Add Body Metrics"}
            </h2>
            <button onClick={() => setIsMetricModalOpen(false)} className="text-jarvis-muted hover:text-jarvis-text">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase text-jarvis-muted mb-1 block">Weight (kg)</label>
              <input 
                type="number"
                value={metricForm.weightKg}
                onChange={(e) => setMetricForm({ ...metricForm, weightKg: e.target.value })}
                className="w-full bg-black/20 border border-jarvis-border rounded-lg px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-accent"
                placeholder="e.g. 75.5"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase text-jarvis-muted block">Body Fat (%)</label>
                <a 
                  href="https://www.fittr.com/tools/body-fat-calculator/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-jarvis-muted hover:text-jarvis-accent transition-colors"
                  title="Body Fat Calculator"
                >
                  <Info className="h-3 w-3" />
                </a>
              </div>
              <input 
                type="number"
                value={metricForm.bodyFat}
                onChange={(e) => setMetricForm({ ...metricForm, bodyFat: e.target.value })}
                className="w-full bg-black/20 border border-jarvis-border rounded-lg px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-accent"
                placeholder="e.g. 15.2"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase text-jarvis-muted mb-1 block">Waist (cm)</label>
            <input 
              type="number"
              value={metricForm.waistCm}
              onChange={(e) => setMetricForm({ ...metricForm, waistCm: e.target.value })}
              className="w-full bg-black/20 border border-jarvis-border rounded-lg px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-accent"
              placeholder="e.g. 82"
            />
          </div>
          <div className="flex gap-2 pt-2">
             <button onClick={() => setIsMetricModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-jarvis-border text-xs text-jarvis-text hover:bg-white/5">Cancel</button>
             <button onClick={handleSaveMetric} className="flex-1 px-4 py-2 rounded-lg bg-jarvis-accent text-black text-xs font-medium hover:brightness-110 flex items-center justify-center gap-2">
               <Check className="h-3 w-3" /> Save Entry
             </button>
          </div>
        </div>
      </BaseModal>

      <BaseModal
        open={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        ariaLabel={editingMeal ? "Edit Meal" : "AI Meal Input"}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-jarvis-border pb-2 mb-2">
            <h2 className="text-sm font-medium uppercase tracking-wide text-jarvis-text">
              {editingMeal ? "Edit Meal" : "AI Meal Input"}
            </h2>
            <button onClick={() => setIsMealModalOpen(false)} className="text-jarvis-muted hover:text-jarvis-text">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[10px] text-jarvis-muted uppercase tracking-wider">Describe your meal (e.g., "Chicken and rice")</p>
          <textarea 
            value={mealInput}
            onChange={(e) => setMealInput(e.target.value)}
            className="w-full bg-black/20 border border-jarvis-border rounded-xl p-3 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-accent h-32 resize-none"
            placeholder="I ate two eggs and some oats..."
            autoFocus
          />
          <div className="flex gap-2">
             <button onClick={() => setIsMealModalOpen(false)} className="flex-1 px-4 py-2 rounded-lg border border-jarvis-border text-xs text-jarvis-text hover:bg-white/5">Cancel</button>
             <button 
                onClick={handleSaveMeal}
                disabled={isAiProcessing || !mealInput.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-jarvis-accent text-black text-xs font-medium hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50"
             >
               {isAiProcessing ? <><Sparkles className="h-3 w-3 animate-pulse" /> Extracting...</> : <><Sparkles className="h-3 w-3" /> Save with AI</>}
             </button>
          </div>
        </div>
      </BaseModal>

      <EntityModal
        isOpen={isEntityModalOpen && activeType === 'task'}
        onClose={closeModal}
        title={draftMode === 'edit' ? "Edit GYM Task" : "Create GYM Task"}
      >
        <EntityForm 
          initialData={selectedEntity || { subTags: ['gym'], bucket: 'today', category: 'Fitness' }}
          onSubmit={handleSubmitTask}
          onCancel={closeModal}
          isSubmitting={isSavingEntity}
        />
      </EntityModal>
    </ModulePageLayout>
  );
}


