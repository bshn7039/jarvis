import { useEffect, useMemo, useState } from 'react';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import TaskToolbar from '../components/tasks/TaskToolbar';
import TaskColumn from '../components/tasks/TaskColumn';
import RepetitiveTaskColumn from '../components/tasks/RepetitiveTaskColumn';
import RepetitiveHistory from '../components/tasks/RepetitiveHistory';
import EntityModal from '../components/modals/EntityModal';
import EntityForm from '../components/forms/EntityForm';
import EntityDetailPanel from '../components/details/EntityDetailPanel';
import CommandPalette from '../components/system/CommandPalette';
import { useTaskStore } from '../store/taskStore';
import { useGoalStore } from '../store/goalStore';
import { useScheduleStore } from '../store/scheduleStore';
import { useEntityStore } from '../store/entityStore';
import { useCommandPaletteStore } from '../store/commandPaletteStore';
import { TASK_BOARD_COLUMNS } from '../utils/constants';

const BUCKET_LABELS = {
  today: 'Today',
  week: 'Week',
  month: 'Month',
  overdue: 'Overdue',
  undefined: 'Undefined',
  completed: 'Completed',
};

export default function Tasks() {
  const [isSavingTask, setIsSavingTask] = useState(false);
  const tasks = useTaskStore((state) => state.tasks);
  const repetitiveTasks = useTaskStore((state) => state.repetitiveTasks);
  const repetitiveHistory = useTaskStore((state) => state.repetitiveHistory);
  const searchQuery = useTaskStore((state) => state.searchQuery);
  const activeCategory = useTaskStore((state) => state.activeCategory);
  const activePriority = useTaskStore((state) => state.activePriority);
  const collapsedSections = useTaskStore((state) => state.collapsedSections);
  const expandedTaskIds = useTaskStore((state) => state.expandedTaskIds);

  const setSearchQuery = useTaskStore((state) => state.setSearchQuery);
  const setActiveCategory = useTaskStore((state) => state.setActiveCategory);
  const setActivePriority = useTaskStore((state) => state.setActivePriority);
  const toggleSectionCollapsed = useTaskStore((state) => state.toggleSectionCollapsed);
  const toggleTaskExpanded = useTaskStore((state) => state.toggleTaskExpanded);
  const toggleTaskCompletion = useTaskStore((state) => state.toggleTaskCompletion);
  const createTask = useTaskStore((state) => state.createTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const restoreTask = useTaskStore((state) => state.restoreTask);
  const duplicateTask = useTaskStore((state) => state.duplicateTask);
  const markTaskComplete = useTaskStore((state) => state.markTaskComplete);
  const updateTaskProgress = useTaskStore((state) => state.updateTaskProgress);
  const moveTaskToBucket = useTaskStore((state) => state.moveTaskToBucket);
  
  const createRepetitiveTask = useTaskStore(s => s.createRepetitiveTask);
  const toggleRepetitiveTaskCompletion = useTaskStore(s => s.toggleRepetitiveTaskCompletion);
  const deleteRepetitiveTask = useTaskStore(s => s.deleteRepetitiveTask);
  const deleteRepetitiveHistoryEntry = useTaskStore(s => s.deleteRepetitiveHistoryEntry);

  const goals = useGoalStore((state) => state.goals);
  const schedules = useScheduleStore((state) => state.schedules);

  const isModalOpen = useEntityStore((state) => state.isModalOpen);
  const activeType = useEntityStore((state) => state.activeType);
  const isDetailPanelOpen = useEntityStore((state) => state.isDetailPanelOpen);
  const selectedId = useEntityStore((state) => state.selectedId);
  const draftMode = useEntityStore((state) => state.draftMode);
  const openCreateModal = useEntityStore((state) => state.openCreateModal);
  const openEditModal = useEntityStore((state) => state.openEditModal);
  const closeModal = useEntityStore((state) => state.closeModal);
  const openDetailPanel = useEntityStore((state) => state.openDetailPanel);
  const closeDetailPanel = useEntityStore((state) => state.closeDetailPanel);

  const registerActions = useCommandPaletteStore((state) => state.registerActions);
  const registerEntities = useCommandPaletteStore((state) => state.registerEntities);

  const selectedTask = useMemo(() => {
    if (activeType === 'repetitiveTask') {
      return repetitiveTasks.find(t => t.id === selectedId) || null;
    }
    return tasks.find((task) => task.id === selectedId) || null;
  }, [selectedId, tasks, repetitiveTasks, activeType]);

  const goalMap = useMemo(() => Object.fromEntries(goals.map((goal) => [goal.id, goal.title])), [goals]);

  const scheduleMap = useMemo(
    () =>
      Object.fromEntries(
        schedules.map((schedule) => [
          schedule.id,
          `${schedule.label || schedule.title || 'Schedule'} (${schedule.date || '-'} ${schedule.time || '-'})`,
        ]),
      ),
    [schedules],
  );

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesQuery =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.subTags.some((tag) => tag.toLowerCase().includes(query));
      const matchesCategory = activeCategory === 'All' || task.category === activeCategory;
      const matchesPriority = activePriority === 'All' || task.priority === activePriority;
      return matchesQuery && matchesCategory && matchesPriority;
    });
  }, [activeCategory, activePriority, searchQuery, tasks]);

  const tasksBySection = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const byColumn = Object.fromEntries(TASK_BOARD_COLUMNS.map((bucket) => [bucket, []]));

    filteredTasks.forEach((task) => {
      const isOverdue = !task.completed && task.dueDate?.slice(0, 10) < today;
      if (isOverdue) {
        byColumn.overdue.push(task);
        return;
      }
      byColumn[task.bucket]?.push(task);
    });

    return byColumn;
  }, [filteredTasks]);

  const filteredRepetitive = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return repetitiveTasks.filter(t => {
       const matchesQuery = !query || t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query);
       const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
       const matchesPriority = activePriority === 'All' || t.priority === activePriority;
       return matchesQuery && matchesCategory && matchesPriority;
    });
  }, [activeCategory, activePriority, searchQuery, repetitiveTasks]);

  useEffect(() => {
    const actions = [
      { id: 'task.create', title: 'Create Task', category: 'task', onTrigger: () => openCreateModal('task') },
      { id: 'task.createRepetitive', title: 'Create Repetitive Task', category: 'task', onTrigger: () => openCreateModal('repetitiveTask') },
      {
        id: 'task.open',
        title: 'Open Task',
        category: 'task',
        onTrigger: () => {
          const firstTask = filteredTasks[0];
          if (firstTask) openDetailPanel('task', firstTask.id);
        },
      },
      {
        id: 'task.complete',
        title: 'Complete Task',
        category: 'task',
        onTrigger: () => {
          const firstOpen = filteredTasks.find((task) => !task.completed);
          if (firstOpen) markTaskComplete(firstOpen.id);
        },
      },
      {
        id: 'task.duplicate',
        title: 'Duplicate Task',
        category: 'task',
        onTrigger: () => {
          const firstTask = filteredTasks[0];
          if (firstTask) duplicateTask(firstTask.id);
        },
      },
    ];

    registerActions(actions.filter(Boolean));
    registerEntities([
      ...filteredTasks.map((task) => ({ id: task.id, title: task.title, type: 'task' })),
      ...filteredRepetitive.map(t => ({ id: t.id, title: t.title, type: 'repetitiveTask' }))
    ]);
  }, [duplicateTask, filteredTasks, filteredRepetitive, markTaskComplete, openCreateModal, openDetailPanel, registerActions, registerEntities]);

  const handleSubmitTask = async (data) => {
    if (isSavingTask) return;
    setIsSavingTask(true);
    try {
      if (activeType === 'repetitiveTask') {
         if (draftMode === 'edit' && selectedId) {
           // Not implemented update for repetitive yet, let's just create for now
         } else {
           await createRepetitiveTask(data);
         }
      } else {
        if (draftMode === 'edit' && selectedTask) {
          await updateTask(selectedTask.id, data);
        } else {
          await createTask(data);
        }
      }
      closeModal();
    } catch (err) {
      console.error('Failed to save task:', err);
    } finally {
      setIsSavingTask(false);
    }
  };

  return (
    <ModulePageLayout
      title="Tasks"
      subtitle="Central execution system with linked goals and schedules."
    >
      <TaskToolbar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        activePriority={activePriority}
        onPriorityChange={setActivePriority}
        onQuickAdd={() => openCreateModal('task')}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Repetitive Section */}
        <div className="md:col-span-2 xl:col-span-3">
           <RepetitiveTaskColumn 
             tasks={filteredRepetitive}
             collapsed={Boolean(collapsedSections.repetitive)}
             onToggleCollapsed={() => toggleSectionCollapsed('repetitive')}
             onToggleCompletion={toggleRepetitiveTaskCompletion}
             onQuickAdd={() => openCreateModal('repetitiveTask')}
             onDelete={deleteRepetitiveTask}
           />
        </div>

        {TASK_BOARD_COLUMNS.map((bucket) => (
          <TaskColumn
            key={bucket}
            title={BUCKET_LABELS[bucket]}
            bucket={bucket}
            tasks={tasksBySection[bucket]}
            collapsed={Boolean(collapsedSections[bucket])}
            onToggleCollapsed={() => toggleSectionCollapsed(bucket)}
            goalMap={goalMap}
            scheduleMap={scheduleMap}
            expandedTaskIds={expandedTaskIds}
            onToggleTaskExpanded={toggleTaskExpanded}
            onToggleTaskCompleted={toggleTaskCompletion}
            onOpenTaskDetail={(taskId) => openDetailPanel('task', taskId)}
            onChangeTaskProgress={updateTaskProgress}
            onDropTask={moveTaskToBucket}
            droppable={bucket !== 'overdue'}
            onDeleteTask={deleteTask}
            onEditTask={(taskId) => openEditModal('task', taskId)}
          />
        ))}

        <div className="md:col-span-2 xl:col-span-3">
           <RepetitiveHistory 
             history={repetitiveHistory}
             collapsed={Boolean(collapsedSections.repetitiveHistory)}
             onToggleCollapsed={() => toggleSectionCollapsed('repetitiveHistory')}
             onDeleteEntry={deleteRepetitiveHistoryEntry}
           />
        </div>
      </div>

      <EntityModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={draftMode === 'edit' ? `Edit ${activeType === 'repetitiveTask' ? 'Repetitive Task' : 'Task'}` : `Create ${activeType === 'repetitiveTask' ? 'Repetitive Task' : 'Task'}`}
      >
        <EntityForm
          initialData={selectedTask || {}}
          onSubmit={handleSubmitTask}
          onCancel={closeModal}
          isSubmitting={isSavingTask}
        />
      </EntityModal>

      <EntityDetailPanel
        isOpen={isDetailPanelOpen}
        onClose={closeDetailPanel}
        entity={selectedTask}
        onEdit={(taskId) => openEditModal(activeType || 'task', taskId)}
        onDuplicate={activeType === 'task' ? duplicateTask : null}
        onArchive={null}
        onRestore={activeType === 'task' ? restoreTask : null}
        onDelete={activeType === 'task' ? deleteTask : deleteRepetitiveTask}
        onComplete={activeType === 'task' ? markTaskComplete : null}
      />

      <CommandPalette />
    </ModulePageLayout>
  );
}
