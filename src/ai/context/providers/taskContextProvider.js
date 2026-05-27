import { useTaskStore } from '../../../store/taskStore';

export function getTaskContext() {
  const state = useTaskStore.getState();
  const allTasks = state.tasks || [];
  
  const activeTasks = allTasks.filter(t => !t.completed && !t.archived);
  const completedTasks = allTasks.filter(t => t.completed && !t.archived);
  
  const today = new Date().toISOString().slice(0, 10);
  
  const overdueTasks = activeTasks.filter(t => t.dueDate && t.dueDate.slice(0, 10) < today);
  const todayTasks = activeTasks.filter(t => t.bucket === 'today' || (t.dueDate && t.dueDate.slice(0, 10) === today));
  const weekTasks = activeTasks.filter(t => t.bucket === 'week');
  const monthTasks = activeTasks.filter(t => t.bucket === 'month');
  const undefinedTasks = activeTasks.filter(t => t.bucket === 'undefined' && (!t.dueDate || t.dueDate.slice(0, 10) !== today));
  
  const criticalTasks = activeTasks.filter(t => t.priority === 'critical' || t.priority === 'high');

  const categoriesCount = {};
  activeTasks.forEach(t => {
    const cat = t.category || 'General';
    categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
  });
  
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  const sortedTasks = [...activeTasks].sort((a, b) => {
    const aOverdue = a.dueDate && a.dueDate.slice(0, 10) < today;
    const bOverdue = b.dueDate && b.dueDate.slice(0, 10) < today;
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    const bucketWeight = { today: 4, week: 3, month: 2, undefined: 1 };
    const aWeight = bucketWeight[a.bucket] || 1;
    const bWeight = bucketWeight[b.bucket] || 1;
    if (aWeight !== bWeight) return bWeight - aWeight;

    const aPri = priorityOrder[a.priority] || 2;
    const bPri = priorityOrder[b.priority] || 2;
    if (aPri !== bPri) return bPri - aPri;

    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    return b.createdAt.localeCompare(a.createdAt);
  });

  const limitedTasks = sortedTasks.slice(0, 15).map(t => ({
    id: t.id,
    title: t.title,
    bucket: t.bucket,
    dueDate: t.dueDate,
    priority: t.priority,
    category: t.category,
    progress: t.progress
  }));

  return {
    metrics: {
      totalActive: activeTasks.length,
      overdue: overdueTasks.length,
      today: todayTasks.length,
      week: weekTasks.length,
      month: monthTasks.length,
      undefined: undefinedTasks.length,
      completedTotal: completedTasks.length,
      criticalOrHigh: criticalTasks.length,
    },
    topCategories: Object.entries(categoriesCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3),
    focusedTasks: limitedTasks
  };
}
