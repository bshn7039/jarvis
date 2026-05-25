import React, { useMemo } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useAcademicStore } from '../../store/academicStore';
import PagePanel from '../ui/PagePanel';
import ProgressBar from '../ui/ProgressBar';
import { Zap, Clock, AlertTriangle, CheckCircle, Activity, Target, Flame, Moon, Sun, Smartphone, Dumbbell } from 'lucide-react';

export default function ProductivityDiscipline() {
  const tasks = useTaskStore((s) => s.tasks);
  const repetitiveHistory = useTaskStore((s) => s.repetitiveHistory);
  const revisionLogs = useAcademicStore((s) => s.revisionLogs);

  const stats = useMemo(() => {
    // Productivity
    const studyHours = revisionLogs.reduce((acc, log) => acc + (Number(log.hours) || 0), 0);
    const codingTasks = tasks.filter(t => t.subTags?.some(tag => tag.toLowerCase() === 'coding'));
    const codingHours = codingTasks.filter(t => t.completed).length * 1.5; // Estimated 1.5h per completed coding task
    
    const relevantTasks = tasks.filter(t => 
      t.category === 'Academics' || 
      t.subTags?.some(tag => ['study', 'coding', 'gym', 'dsa', 'degree-study'].includes(tag.toLowerCase()))
    );
    const completedRelevant = relevantTasks.filter(t => t.completed).length;
    const taskCompletionPct = relevantTasks.length > 0 ? Math.round((completedRelevant / relevantTasks.length) * 100) : 0;

    // Discipline
    const last7Days = repetitiveHistory.slice(0, 7);
    const totalPossible = last7Days.reduce((sum, day) => sum + (day.snapshot?.length || 0), 0);
    const totalCompleted = last7Days.reduce((sum, day) => sum + (day.completedIds?.length || 0), 0);
    const routinePct = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    const gymTasks = tasks.filter(t => t.subTags?.some(tag => tag.toLowerCase() === 'gym'));
    const gymConsistency = gymTasks.length > 0 ? Math.round((gymTasks.filter(t => t.completed).length / gymTasks.length) * 100) : 0;

    return {
      studyHours,
      codingHours,
      taskCompletionPct,
      routinePct,
      gymConsistency,
      totalGrowthHours: studyHours + codingHours,
      overdueCount: tasks.filter(t => !t.completed && t.dueDate && t.dueDate < new Date().toISOString().slice(0, 10)).length
    };
  }, [tasks, repetitiveHistory, revisionLogs]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* PRODUCTIVITY LAYER */}
        <PagePanel title="Productivity Layer" subtitle="Execution & Output Metrics">
          <div className="grid gap-3 sm:grid-cols-2">
             <MetricCard 
                icon={<Clock className="h-4 w-4 text-jarvis-accent" />}
                label="Study Hours"
                value={`${stats.studyHours.toFixed(1)}h`}
                subValue="Logged Revision"
             />
             <MetricCard 
                icon={<Activity className="h-4 w-4 text-blue-400" />}
                label="Coding Hours"
                value={`${stats.codingHours.toFixed(1)}h`}
                subValue="Estimated Output"
             />
             <MetricCard 
                icon={<Target className="h-4 w-4 text-green-400" />}
                label="Task Completion"
                value={`${stats.taskCompletionPct}%`}
                subValue="Academic/Coding"
             />
             <MetricCard 
                icon={<Flame className="h-4 w-4 text-orange-400" />}
                label="Growth Hours"
                value={`${stats.totalGrowthHours.toFixed(1)}h`}
                subValue="Total Sem 1 Dev"
             />
          </div>
        </PagePanel>

        {/* DISCIPLINE LAYER */}
        <PagePanel title="Discipline Layer" subtitle="Habit & Routine Adherence">
          <div className="grid gap-3 sm:grid-cols-2">
             <MetricCard 
                icon={<Sun className="h-4 w-4 text-yellow-400" />}
                label="Wake Consistency"
                value="90%"
                subValue="Target: 06:00 AM"
             />
             <MetricCard 
                icon={<CheckCircle className="h-4 w-4 text-green-400" />}
                label="Routine Adherence"
                value={`${stats.routinePct}%`}
                subValue="Last 7 Days Avg"
             />
             <MetricCard 
                icon={<Dumbbell className="h-4 w-4 text-red-400" />}
                label="Gym Consistency"
                value={`${stats.gymConsistency}%`}
                subValue="Weight Training"
             />
             <MetricCard 
                icon={<Smartphone className="h-4 w-4 text-purple-400" />}
                label="Phone Control"
                value="Operational"
                subValue="Low Distraction"
             />
          </div>
        </PagePanel>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, subValue }) {
  return (
    <div className="rounded-xl border border-jarvis-border bg-black/20 p-3">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[9px] uppercase tracking-wider text-jarvis-muted">{label}</span>
      </div>
      <p className="text-xl font-bold text-jarvis-text">{value}</p>
      <p className="text-[9px] text-jarvis-muted mt-1">{subValue}</p>
    </div>
  );
}
