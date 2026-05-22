import { useEffect, useMemo } from 'react';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import TaskToolbar from '../components/tasks/TaskToolbar';
import TaskColumn from '../components/tasks/TaskColumn';
import EntityModal from '../components/modals/EntityModal';
import EntityForm from '../components/forms/EntityForm';
import EntityDetailPanel from '../components/details/EntityDetailPanel';
import CommandPalette from '../components/system/CommandPalette';
import { useTaskStore } from '../store/taskStore';
import { useGoalStore } from '../store/goalStore';
import { useScheduleStore } from '../store/scheduleStore';
import { useEntityStore } from '../store/entityStore';
import { useCommandPaletteStore } from '../store/commandPaletteStore';
import { TASK_SECTIONS } from '../utils/constants';

export default function Tasks() {
  const tasks = useTaskStore((state) => state.tasks);
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
  const archiveTask = useTaskStore((state) => state.archiveTask);
  const restoreTask = useTaskStore((state) => state.restoreTask);
  const duplicateTask = useTaskStore((state) => state.duplicateTask);
  const markTaskComplete = useTaskStore((state) => state.markTaskComplete);
  const changeTaskStatus = useTaskStore((state) => state.changeTaskStatus);
  const updateTaskProgress = useTaskStore((state) => state.updateTaskProgress);

  const goals = useGoalStore((state) => state.goals);
  const schedules = useScheduleStore((state) => state.schedules);

  const isModalOpen = useEntityStore((state) => state.isModalOpen);
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

  const selectedTask = useMemo(() => tasks.find((task) => task.id === selectedId) || null, [selectedId, tasks]);

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
        task.tags.some((tag) => tag.toLowerCase().includes(query));
      const matchesCategory = activeCategory === 'All' || task.category === activeCategory;
      const matchesPriority = activePriority === 'All' || task.priority === activePriority;
      return matchesQuery && matchesCategory && matchesPriority;
    });
  }, [activeCategory, activePriority, searchQuery, tasks]);

  const tasksBySection = useMemo(
    () => Object.fromEntries(TASK_SECTIONS.map((section) => [section, filteredTasks.filter((task) => task.section === section)])),
    [filteredTasks],
  );

  useEffect(() => {
    const actions = [
      { id: 'task.create', title: 'Create Task', category: 'task', onTrigger: () => openCreateModal('task') },
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
          const firstOpen = filteredTasks.find((task) => task.status !== 'completed' && task.status !== 'archived');
          if (firstOpen) markTaskComplete(firstOpen.id);
        },
      },
      {
        id: 'task.archive',
        title: 'Archive Task',
        category: 'task',
        onTrigger: () => {
          const firstOpen = filteredTasks.find((task) => task.status !== 'archived');
          if (firstOpen) archiveTask(firstOpen.id);
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

    registerActions(actions);
    registerEntities(filteredTasks.map((task) => ({ id: task.id, title: task.title, type: 'task' })));
  }, [archiveTask, duplicateTask, filteredTasks, markTaskComplete, openCreateModal, openDetailPanel, registerActions, registerEntities]);

  const handleSubmitTask = async (data) => {
    if (draftMode === 'edit' && selectedTask) {
      await updateTask(selectedTask.id, data);
    } else {
      await createTask(data);
    }
    closeModal();
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

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {TASK_SECTIONS.map((section) => (
          <TaskColumn
            key={section}
            title={section}
            tasks={tasksBySection[section]}
            collapsed={Boolean(collapsedSections[section])}
            onToggleCollapsed={() => toggleSectionCollapsed(section)}
            goalMap={goalMap}
            scheduleMap={scheduleMap}
            expandedTaskIds={expandedTaskIds}
            onToggleTaskExpanded={toggleTaskExpanded}
            onToggleTaskCompleted={toggleTaskCompletion}
            onOpenTaskDetail={(taskId) => openDetailPanel('task', taskId)}
            onChangeTaskStatus={changeTaskStatus}
            onChangeTaskProgress={updateTaskProgress}
          />
        ))}
      </div>

      <EntityModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={draftMode === 'edit' ? 'Edit Task' : 'Create Task'}
      >
        <EntityForm
          initialData={selectedTask || {}}
          onSubmit={handleSubmitTask}
          onCancel={closeModal}
        />
      </EntityModal>

      <EntityDetailPanel
        isOpen={isDetailPanelOpen}
        onClose={closeDetailPanel}
        entity={selectedTask}
        onEdit={(taskId) => openEditModal('task', taskId)}
        onDuplicate={duplicateTask}
        onArchive={archiveTask}
        onRestore={restoreTask}
        onDelete={deleteTask}
        onComplete={markTaskComplete}
      />

      <CommandPalette />
    </ModulePageLayout>
  );
}
