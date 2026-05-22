import { useMemo } from 'react';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import TaskToolbar from '../components/tasks/TaskToolbar';
import EntityModal from '../components/modals/EntityModal';
import EntityForm from '../components/forms/EntityForm';
import EntityDetailPanel from '../components/details/EntityDetailPanel';
import { useTaskStore } from '../store/taskStore';
import { useGoalStore } from '../store/goalStore';
import { useScheduleStore } from '../store/scheduleStore';
import { TASK_SECTIONS } from '../utils/constants';

export default function Tasks() {
  const tasks = useTaskStore((s) => s.tasks);
  const searchQuery = useTaskStore((s) => s.searchQuery);
  const activeCategory = useTaskStore((s) => s.activeCategory);
  const activePriority = useTaskStore((s) => s.activePriority);
  const collapsedSections = useTaskStore((s) => s.collapsedSections);
  const expandedTaskIds = useTaskStore((s) => s.expandedTaskIds);

  const setSearchQuery = useTaskStore((s) => s.setSearchQuery);
  const setActiveCategory = useTaskStore((s) => s.setActiveCategory);
  const setActivePriority = useTaskStore((s) => s.setActivePriority);
  const toggleSectionCollapsed = useTaskStore((s) => s.toggleSectionCollapsed);
  const toggleTaskExpanded = useTaskStore((s) => s.toggleTaskExpanded);
  const toggleTaskCompletion = useTaskStore((s) => s.toggleTaskCompletion);
  const addTask = useTaskStore((s) => s.addTask);

  const goals = useGoalStore((s) => s.goals);
  const schedules = useScheduleStore((s) => s.schedules);

  const goalMap = useMemo(
    () => Object.fromEntries(goals.map((goal) => [goal.id, goal.title])),
    [goals],
  );
  const scheduleMap = useMemo(
    () =>
      Object.fromEntries(
        schedules.map((schedule) => [
          schedule.id,
          `${schedule.label} (${schedule.date} ${schedule.time})`,
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
  }, [tasks, searchQuery, activeCategory, activePriority]);

  const tasksBySection = useMemo(
    () =>
      Object.fromEntries(
        TASK_SECTIONS.map((section) => [
          section,
          filteredTasks.filter((task) => task.section === section),
        ]),
      ),
    [filteredTasks],
  );

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
        onQuickAdd={() =>
          addTask({
            title: 'Quick capture',
            description: 'Captured from Tasks page.',
            category: 'System',
            priority: 'Medium',
            tags: ['inbox'],
          })
        }
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
          />
        ))}
      </div>

      <EntityModal
        isOpen={useTaskStore((s) => s.isModalOpen)}
        onClose={() => useTaskStore.getState().closeModal()}
        title="Task"
        form={<EntityForm />}
        onSubmit={(data) => useTaskStore.getState().addTask(data)}
      />

      <EntityDetailPanel
        isOpen={useTaskStore((s) => s.isDetailPanelOpen)}
        onClose={() => useTaskStore.getState().closeDetailPanel()}
        entity={useTaskStore((s) => s.selectedEntity)}
      />
    </ModulePageLayout>
  );
}
