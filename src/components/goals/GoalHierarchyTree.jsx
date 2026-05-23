import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Target, 
  Shield, 
  Zap, 
  Circle, 
  Link2, 
  Plus, 
  Check, 
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useGoalStore } from '../../store/goalStore';
import ProgressBar from '../ui/ProgressBar';

const TYPE_ICONS = {
  area: Shield,
  goal: Target,
  objective: Zap,
  sub_goal: Circle,
};

const NEXT_TYPE = {
  area: 'goal',
  goal: 'objective',
  objective: 'sub_goal',
  sub_goal: 'sub_goal',
};

const TYPE_STYLES = {
  area: 'border-jarvis-accent/40 bg-jarvis-accent/5',
  goal: 'border-jarvis-border bg-black/40',
  objective: 'border-jarvis-border/60 bg-black/20',
  sub_goal: 'border-jarvis-border/40 bg-black/10',
};

function GoalNode({ node, allGoals, allTasks, level = 0 }) {
  const expandedNodeIds = useGoalStore((s) => s.expandedNodeIds);
  const toggleNodeExpanded = useGoalStore((s) => s.toggleNodeExpanded);
  const calculateNodeProgress = useGoalStore((s) => s.calculateNodeProgress);
  const updateGoal = useGoalStore((s) => s.updateGoal);
  const addGoal = useGoalStore((s) => s.addGoal);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  const [editDesc, setEditDesc] = useState(node.description || '');
  
  const isExpanded = Boolean(expandedNodeIds[node.id]);
  const children = allGoals.filter((g) => g.parentId === node.id);
  // Fetch tasks directly from the tasks list by checking linkedGoalIds
  const linkedTasks = allTasks.filter(t => (t.linkedGoalIds || []).includes(node.id));
  const hasChildren = children.length > 0 || linkedTasks.length > 0;
  
  const progress = calculateNodeProgress(node.id, allGoals, allTasks);
  const Icon = TYPE_ICONS[node.type] || Target;

  const handleSave = async () => {
    await updateGoal(node.id, { title: editTitle, description: editDesc });
    setIsEditing(false);
  };

  const handleAddChild = async (e) => {
    e.stopPropagation();
    const type = NEXT_TYPE[node.type];
    await addGoal({
      parentId: node.id,
      type,
      title: `New ${type.replace('_', ' ')}`,
      description: '',
    });
    if (!isExpanded) toggleNodeExpanded(node.id);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (confirm(`Delete "${node.title}" and all its descendants?`)) {
      await deleteGoal(node.id);
    }
  };

  const handleToggleComplete = async (e) => {
    e.stopPropagation();
    await updateGoal(node.id, { completed: !node.completed });
  };

  return (
    <div className={`mt-2 ${level > 0 ? 'ml-4 border-l border-jarvis-border/30 pl-4' : ''}`}>
      <div 
        className={`group relative flex flex-col rounded-xl border p-3 transition-all hover:border-jarvis-accent/30 ${TYPE_STYLES[node.type]}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {hasChildren ? (
              <button
                onClick={() => toggleNodeExpanded(node.id)}
                className="text-jarvis-muted hover:text-jarvis-text"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <ChevronRight className="h-4 w-4" strokeWidth={2} />
                )}
              </button>
            ) : (
              <div className="w-4" />
            )}
            
            <Icon className={`h-4 w-4 shrink-0 ${node.completed ? 'text-jarvis-accent' : node.type === 'area' ? 'text-jarvis-accent/70' : 'text-jarvis-muted'}`} strokeWidth={1.5} />
            
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input 
                    autoFocus
                    className="w-full bg-black/40 border border-jarvis-accent/30 rounded px-2 py-0.5 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-accent"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                  />
                  <input 
                    className="w-full bg-black/40 border border-jarvis-border/50 rounded px-2 py-0.5 text-[10px] text-jarvis-muted focus:outline-none focus:border-jarvis-accent"
                    value={editDesc}
                    placeholder="Add description..."
                    onChange={e => setEditDesc(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                  />
                </div>
              ) : (
                <>
                  <h4 className={`truncate text-sm font-medium ${node.completed ? 'text-jarvis-accent line-through' : node.type === 'area' ? 'text-jarvis-text font-bold' : 'text-jarvis-text/90'}`}>
                    {node.title}
                  </h4>
                  {node.description && isExpanded && (
                    <p className="mt-0.5 text-[11px] text-jarvis-muted line-clamp-1 italic">{node.description}</p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <button onClick={handleSave} className="p-1 text-jarvis-accent hover:bg-white/5 rounded" title="Save">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setIsEditing(false)} className="p-1 text-jarvis-muted hover:bg-white/5 rounded" title="Cancel">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={handleToggleComplete}
                  className={`p-1 rounded hover:bg-white/5 ${node.completed ? 'text-jarvis-accent' : 'text-jarvis-muted'}`}
                  title={node.completed ? 'Mark Incomplete' : 'Mark Complete'}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                  className="p-1 text-jarvis-muted hover:text-jarvis-text hover:bg-white/5 rounded"
                  title="Edit"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={handleAddChild}
                  className="p-1 text-jarvis-muted hover:text-jarvis-text hover:bg-white/5 rounded"
                  title="Add Child"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={handleDelete}
                  className="p-1 text-red-400/70 hover:text-red-400 hover:bg-white/5 rounded"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-3 ml-2">
              <span className="text-[10px] font-mono text-jarvis-muted w-8 text-right">{progress}%</span>
            </div>
          </div>
        </div>

        <div className="mt-2 w-full">
           <ProgressBar value={progress} />
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-1">
          {children.map((child) => (
            <GoalNode 
              key={child.id} 
              node={child} 
              allGoals={allGoals} 
              allTasks={allTasks} 
              level={level + 1} 
            />
          ))}
          
          {linkedTasks.length > 0 && (
            <div className="ml-8 mt-3 space-y-2 border-l border-jarvis-accent/20 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <Link2 className="h-3 w-3 text-jarvis-accent" />
                <span className="text-[10px] uppercase tracking-widest text-jarvis-muted">Execution Layer</span>
              </div>
              {linkedTasks.map((task) => {
                return (
                  <div key={task.id} className="group/task relative flex flex-col rounded-lg border border-jarvis-border/40 bg-white/5 p-2.5 transition-all hover:border-jarvis-accent/30">
                    <div className="flex items-center justify-between gap-3">
                       <div className="flex items-center gap-2 min-w-0">
                          <div className={`h-1.5 w-1.5 rounded-full ${task.completed ? 'bg-jarvis-accent' : 'bg-jarvis-muted'}`} />
                          <span className={`truncate text-xs ${task.completed ? 'text-jarvis-muted line-through' : 'text-jarvis-text/90 font-medium'}`}>
                            {task.title}
                          </span>
                       </div>
                       <div className="flex items-center gap-2 shrink-0">
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-[9px] text-jarvis-muted">
                               <Clock className="h-2.5 w-2.5" />
                               {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                          )}
                          <span className="text-[10px] font-mono text-jarvis-muted">{task.progress}%</span>
                       </div>
                    </div>
                    <div className="mt-2">
                       <ProgressBar value={task.progress} />
                    </div>
                    {task.description && (
                       <p className="mt-1.5 text-[10px] text-jarvis-muted line-clamp-1">{task.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GoalHierarchyTree({ goals, tasksById }) {
  const rootAreas = goals.filter((g) => g.parentId === null);
  const allTasks = Object.values(tasksById);
  const addGoal = useGoalStore(s => s.addGoal);

  const handleAddArea = async () => {
    await addGoal({
      type: 'area',
      title: 'New Life Area',
      description: 'Strategic life focus.',
    });
  };

  return (
    <div className="pb-8">
      <div className="flex justify-between items-center mb-4 px-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-jarvis-muted font-bold">Strategic Command Tree</p>
        <button
          onClick={handleAddArea}
          className="flex items-center gap-2 rounded-lg border border-jarvis-border bg-white/5 px-3 py-1.5 text-xs text-jarvis-text hover:bg-white/10 transition-all hover:border-jarvis-accent/50"
        >
          <Plus className="h-3.5 w-3.5 text-jarvis-accent" />
          Add Life Area
        </button>
      </div>
      <div className="space-y-4">
        {rootAreas.map((area) => (
          <GoalNode 
            key={area.id} 
            node={area} 
            allGoals={goals} 
            allTasks={allTasks} 
          />
        ))}
      </div>
    </div>
  );
}
