import React, { useMemo } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useGoalStore } from '../../store/goalStore';
import { useEntityStore } from '../../store/entityStore';
import { useAcademicStore } from '../../store/academicStore';
import PagePanel from '../ui/PagePanel';
import { Plus, CheckSquare, Clock, AlertTriangle, Target } from 'lucide-react';

const ACADEMIC_TAGS = ['degree-study', 'revision', 'exam-prep', 'dsa', 'coding', 'lab', 'assignment', 'academics'];

export default function StudyExecution() {
  const tasks = useTaskStore((s) => s.tasks);
  const goals = useGoalStore((s) => s.goals);
  const { openCreateModal, openEditModal } = useEntityStore();
  const activeSemester = useAcademicStore((s) => s.activeSemester);

  const studyTasks = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    // Only fetch tasks that are purely academic
    const filtered = tasks.filter(t =>
      !t.completed &&
      (
        t.category === 'Academics' ||
        t.subTags?.some(tag => ACADEMIC_TAGS.includes(tag.toLowerCase()))
      )
    );

    return {
      today: filtered.filter(t => t.dueDate && t.dueDate.slice(0, 10) === today),
      overdue: filtered.filter(t => t.dueDate && t.dueDate.slice(0, 10) < today),
      active: filtered.filter(t => !t.dueDate || t.dueDate.slice(0, 10) > today),
    };
  }, [tasks]);

  // Academic-relevant goals only (Academics & Career area)
  const academicGoals = useMemo(() => {
    const academicAreas = goals.filter(g => g.type === 'area' && (
      g.title?.toLowerCase().includes('academic') ||
      g.title?.toLowerCase().includes('career') ||
      g.title?.toLowerCase().includes('coding') ||
      g.title?.toLowerCase().includes('software')
    ));
    const areaIds = new Set(academicAreas.map(a => a.id));
    return goals.filter(g =>
      (g.type === 'goal' || g.type === 'objective' || g.type === 'sub_goal') &&
      g.progress < 100 &&
      isUnderAcademicArea(g, goals, areaIds)
    ).slice(0, 6);
  }, [goals]);

  const handleQuickCreate = () => {
    openCreateModal('task', {
      category: 'Academics',
      subTags: ['degree-study'],
      bucket: 'today'
    });
  };

  return (
    <div className="space-y-4">
      {/* Academic Goals snapshot */}
      {academicGoals.length > 0 && (
        <div className="rounded-xl border border-jarvis-border/40 bg-black/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-3.5 w-3.5 text-jarvis-accent" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-jarvis-text">Academic Goals in Progress</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {academicGoals.map(goal => (
              <div key={goal.id} className="flex items-center gap-2 p-2 rounded-lg border border-jarvis-border/30 bg-white/[0.02]">
                <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                  goal.type === 'objective' ? 'bg-jarvis-accent' :
                  goal.type === 'sub_goal' ? 'bg-blue-400' : 'bg-green-400'
                }`} />
                <p className="text-[10px] text-jarvis-text leading-snug truncate">{goal.title}</p>
                <span className="text-[8px] text-jarvis-muted shrink-0 ml-auto">{goal.progress || 0}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Queue */}
      <PagePanel
        title="Study Task Queue"
        subtitle={`${activeSemester} — Academics only`}
        actions={
          <button onClick={handleQuickCreate} className="text-jarvis-muted hover:text-jarvis-text">
            <Plus className="h-4 w-4" />
          </button>
        }
      >
        <div className="grid gap-6 md:grid-cols-3">
          {/* TODAY */}
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-jarvis-border pb-2">
              <CheckSquare className="h-3.5 w-3.5 text-jarvis-accent" />
              <span className="text-[10px] uppercase font-bold text-jarvis-text">Today's Focus</span>
              <span className="ml-auto text-[10px] text-jarvis-muted bg-white/5 px-1.5 rounded">{studyTasks.today.length}</span>
            </div>
            <TaskList tasks={studyTasks.today} onEdit={openEditModal} />
          </div>

          {/* OVERDUE */}
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-jarvis-border pb-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              <span className="text-[10px] uppercase font-bold text-jarvis-text">Overdue</span>
              <span className="ml-auto text-[10px] text-jarvis-muted bg-white/5 px-1.5 rounded">{studyTasks.overdue.length}</span>
            </div>
            <TaskList tasks={studyTasks.overdue} onEdit={openEditModal} urgent />
          </div>

          {/* ACTIVE */}
          <div>
            <div className="flex items-center gap-2 mb-3 border-b border-jarvis-border pb-2">
              <Clock className="h-3.5 w-3.5 text-jarvis-muted" />
              <span className="text-[10px] uppercase font-bold text-jarvis-text">Upcoming</span>
              <span className="ml-auto text-[10px] text-jarvis-muted bg-white/5 px-1.5 rounded">{studyTasks.active.length}</span>
            </div>
            <TaskList tasks={studyTasks.active} onEdit={openEditModal} />
          </div>
        </div>
      </PagePanel>
    </div>
  );
}

function isUnderAcademicArea(goal, allGoals, areaIds) {
  if (!goal.parentId) return false;
  if (areaIds.has(goal.parentId)) return true;
  const parent = allGoals.find(g => g.id === goal.parentId);
  if (!parent) return false;
  return isUnderAcademicArea(parent, allGoals, areaIds);
}

function TaskList({ tasks, onEdit, urgent }) {
  if (tasks.length === 0) {
    return <p className="text-[10px] text-jarvis-muted italic py-2">No tasks.</p>;
  }

  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <div
          key={task.id}
          onClick={() => onEdit('task', task.id)}
          className={`group cursor-pointer rounded-lg border p-2 transition-colors ${
            urgent
              ? 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10'
              : 'border-jarvis-border/40 bg-white/[0.02] hover:bg-white/5'
          }`}
        >
          <div className="flex justify-between items-start">
            <p className="text-[11px] text-jarvis-text leading-tight">{task.title}</p>
            <span className={`text-[8px] uppercase px-1 rounded shrink-0 ml-2 ${
              task.priority === 'critical' ? 'bg-red-500/10 text-red-400' :
              task.priority === 'high' ? 'bg-orange-500/10 text-orange-400' : 'bg-white/5 text-jarvis-muted'
            }`}>
              {task.priority}
            </span>
          </div>
          {task.dueDate && (
            <p className="text-[9px] text-jarvis-muted mt-1">{task.dueDate}</p>
          )}
          <div className="mt-1 flex gap-1 flex-wrap">
            {task.subTags?.map(tag => (
              <span key={tag} className="text-[8px] text-jarvis-muted">#{tag}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
