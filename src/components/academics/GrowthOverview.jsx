import React from 'react';
import { useProfileStore } from '../../store/profileStore';
import { useAcademicStore } from '../../store/academicStore';
import { useTaskStore } from '../../store/taskStore';

export default function GrowthOverview() {
  const profile = useProfileStore((s) => s.profile);
  const codingProgress = useAcademicStore((s) => s.codingProgress);
  const tasks = useTaskStore((s) => s.tasks);
  
  if (!profile) return null;

  const { degree } = profile;

  const activeStudyTasks = tasks.filter(t => 
    !t.completed && 
    (t.category === 'Academics' || t.subTags?.some(tag => ['study', 'coding', 'career', 'dsa'].includes(tag.toLowerCase())))
  ).length;

  // Real consistency calculation
  const completedToday = tasks.filter(t => t.completed && t.completedAt?.slice(0, 10) === new Date().toISOString().slice(0, 10)).length;
  const totalToday = tasks.filter(t => t.bucket === 'today' || (t.completed && t.completedAt?.slice(0, 10) === new Date().toISOString().slice(0, 10))).length;
  const consistency = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-jarvis-border bg-black/20 p-3">
        <p className="text-[10px] uppercase tracking-wider text-jarvis-muted">Academic Phase</p>
        <p className="mt-1 text-sm font-medium text-jarvis-text">
          {degree.collegeName ? 'Degree Program' : 'Transition Phase'}
        </p>
      </div>

      <div className="rounded-xl border border-jarvis-border bg-black/20 p-3">
        <p className="text-[10px] uppercase tracking-wider text-jarvis-muted">Current Focus</p>
        <p className="mt-1 text-sm font-medium text-jarvis-text">
          {codingProgress.currentTopic || 'No Active Focus'}
        </p>
      </div>

      <div className="rounded-xl border border-jarvis-border bg-black/20 p-3">
        <p className="text-[10px] uppercase tracking-wider text-jarvis-muted">Study Tasks</p>
        <p className="mt-1 text-sm font-medium text-jarvis-text">{activeStudyTasks} Pending</p>
      </div>

      <div className="rounded-xl border border-jarvis-border bg-black/20 p-3">
        <p className="text-[10px] uppercase tracking-wider text-jarvis-muted">Today's Consistency</p>
        <p className="mt-1 text-sm font-medium text-jarvis-text">{consistency}%</p>
      </div>
    </div>
  );
}
