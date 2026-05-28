import React from 'react';
import { useProfileStore } from '../../store/profileStore';
import { useAcademicStore } from '../../store/academicStore';
import { useTaskStore } from '../../store/taskStore';

export default function GrowthOverview() {
  const profile = useProfileStore((s) => s.profile);
  const { activeSemester, subjects, dsaQuestions, codingProgress } = useAcademicStore();
  const tasks = useTaskStore((s) => s.tasks);

  if (!profile) return null;

  const { degree } = profile;

  const activeStudyTasks = tasks.filter(t =>
    !t.completed &&
    (t.category === 'Academics' || t.subTags?.some(tag => ['study', 'coding', 'dsa', 'degree-study', 'revision', 'exam-prep'].includes(tag.toLowerCase())))
  ).length;

  const semSubjects = subjects.filter(s => s.semester === activeSemester);
  const criticalCount = semSubjects.filter(s => {
    if (!s.totalDays || s.totalDays === 0) return false;
    return Math.round((s.attendedDays || 0) / s.totalDays * 100) < 75;
  }).length;

  const solvedCount = dsaQuestions.length;
  const target = codingProgress.targetProblems || 50;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-jarvis-border bg-black/20 p-3">
        <p className="text-[10px] uppercase tracking-wider text-jarvis-muted">Active Semester</p>
        <p className="mt-1 text-sm font-bold text-jarvis-text">{activeSemester}</p>
        <p className="text-[9px] text-jarvis-muted mt-0.5">{semSubjects.length} subjects loaded</p>
      </div>

      <div className={`rounded-xl border p-3 ${criticalCount > 0 ? 'border-red-500/30 bg-red-500/5' : 'border-jarvis-border bg-black/20'}`}>
        <p className="text-[10px] uppercase tracking-wider text-jarvis-muted">Attendance Alerts</p>
        <p className={`mt-1 text-sm font-bold ${criticalCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {criticalCount > 0 ? `${criticalCount} Critical` : 'All Clear'}
        </p>
        <p className="text-[9px] text-jarvis-muted mt-0.5">
          {criticalCount > 0 ? 'Below 75% threshold' : 'All subjects above 75%'}
        </p>
      </div>

      <div className="rounded-xl border border-jarvis-border bg-black/20 p-3">
        <p className="text-[10px] uppercase tracking-wider text-jarvis-muted">DSA Phase 1</p>
        <p className="mt-1 text-sm font-bold text-jarvis-text">{solvedCount} / {target}</p>
        <p className="text-[9px] text-jarvis-muted mt-0.5">Problems solved</p>
      </div>

      <div className="rounded-xl border border-jarvis-border bg-black/20 p-3">
        <p className="text-[10px] uppercase tracking-wider text-jarvis-muted">Study Tasks</p>
        <p className="mt-1 text-sm font-bold text-jarvis-text">{activeStudyTasks} Pending</p>
        <p className="text-[9px] text-jarvis-muted mt-0.5">Academic category</p>
      </div>
    </div>
  );
}
