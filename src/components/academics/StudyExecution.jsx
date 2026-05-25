import React, { useMemo } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useEntityStore } from '../../store/entityStore';
import PagePanel from '../ui/PagePanel';
import { Plus, CheckSquare, Clock, AlertTriangle } from 'lucide-react';

export default function StudyExecution() {
  const tasks = useTaskStore((s) => s.tasks);
  const { openCreateModal, openEditModal } = useEntityStore();

  const studyTasks = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const filtered = tasks.filter(t => 
      !t.completed && 
      (t.subTags?.some(tag => ['degree-study', 'revision', 'exam-prep'].includes(tag.toLowerCase())) || t.category === 'Academics')
    );

    return {
      today: filtered.filter(t => t.dueDate && t.dueDate.slice(0, 10) === today),
      overdue: filtered.filter(t => t.dueDate && t.dueDate.slice(0, 10) < today),
      active: filtered.filter(t => !t.dueDate || (t.dueDate && t.dueDate.slice(0, 10) > today))
    };
  }, [tasks]);

  const handleQuickCreate = () => {
    openCreateModal('task', { 
      category: 'Academics', 
      subTags: ['degree-study'],
      bucket: 'today'
    });
  };

  return (
    <PagePanel 
      title="Study Execution Layer" 
      subtitle="Sem 1 Operational Task Queue"
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
            <span className="text-[10px] uppercase font-bold text-jarvis-text">Overdue Sessions</span>
            <span className="ml-auto text-[10px] text-jarvis-muted bg-white/5 px-1.5 rounded">{studyTasks.overdue.length}</span>
          </div>
          <TaskList tasks={studyTasks.overdue} onEdit={openEditModal} />
        </div>

        {/* ACTIVE QUEUE */}
        <div>
          <div className="flex items-center gap-2 mb-3 border-b border-jarvis-border pb-2">
            <Clock className="h-3.5 w-3.5 text-jarvis-muted" />
            <span className="text-[10px] uppercase font-bold text-jarvis-text">Active Queue</span>
            <span className="ml-auto text-[10px] text-jarvis-muted bg-white/5 px-1.5 rounded">{studyTasks.active.length}</span>
          </div>
          <TaskList tasks={studyTasks.active} onEdit={openEditModal} />
        </div>
      </div>
    </PagePanel>
  );
}

function TaskList({ tasks, onEdit }) {
  if (tasks.length === 0) {
    return <p className="text-[10px] text-jarvis-muted italic py-2">No active study tasks.</p>;
  }

  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <div 
          key={task.id} 
          onClick={() => onEdit('task', task.id)}
          className="group cursor-pointer rounded-lg border border-jarvis-border/40 bg-white/[0.02] p-2 hover:bg-white/5 transition-colors"
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
          <div className="mt-2 flex gap-1 flex-wrap">
            {task.subTags?.map(tag => (
              <span key={tag} className="text-[8px] text-jarvis-muted">#{tag}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
