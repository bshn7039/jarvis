import { useMemo } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useGoalStore } from '../../store/goalStore';
import { useFitnessStore } from '../../store/fitnessStore';
import { useFinanceStore } from '../../store/financeStore';
import { useAcademicStore } from '../../store/academicStore';
import { useCrmStore } from '../../store/crmStore';
import { useJournalStore } from '../../store/journalStore';
import { useChatStore } from '../../store/chatStore';

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-jarvis-border/70 bg-jarvis-bg/35 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-jarvis-muted">{label}</p>
      <p className="mt-0.5 text-xs font-medium text-jarvis-text">{value}</p>
    </div>
  );
}

function TasksPreview() {
  const tasks = useTaskStore((s) => s.tasks);
  const today = '2026-05-21';
  const todayTasks = tasks.filter((task) => task.deadline?.slice(0, 10) === today);
  const completed = tasks.filter((task) => task.status === 'completed').length;
  const overdue = tasks.filter(
    (task) => task.status !== 'completed' && task.deadline?.slice(0, 10) < today,
  ).length;
  const completion = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const priority = tasks.filter((task) => ['Critical', 'High'].includes(task.priority)).length;

  return (
    <div className="grid grid-cols-2 gap-2">
      <Stat label="Today" value={todayTasks.length} />
      <Stat label="Overdue" value={overdue} />
      <Stat label="Done %" value={`${completion}%`} />
      <Stat label="Priority" value={priority} />
    </div>
  );
}

function GoalsPreview() {
  const goals = useGoalStore((s) => s.goals);
  const activeGoals = goals.length;
  const avgProgress = activeGoals
    ? Math.round(goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / activeGoals)
    : 0;
  const milestoneProgress = useMemo(() => {
    const milestones = goals.flatMap((goal) => goal.milestones || []);
    if (!milestones.length) return 0;
    return Math.round(
      milestones.reduce((sum, milestone) => sum + (milestone.progress || 0), 0) /
        milestones.length,
    );
  }, [goals]);
  const currentObjective = goals[0]?.currentPhase ?? 'No active phase';

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Active" value={activeGoals} />
        <Stat label="Progress" value={`${avgProgress}%`} />
        <Stat label="Milestones" value={`${milestoneProgress}%`} />
      </div>
      <p className="truncate text-xs text-jarvis-muted">Objective: {currentObjective}</p>
    </div>
  );
}

function FitnessPreview() {
  const selectedDay = useFitnessStore((s) => s.selectedDay);
  const targets = useFitnessStore((s) => s.targets);
  const meals = useFitnessStore((s) => s.meals);
  const hydrationLogs = useFitnessStore((s) => s.hydrationLogs);
  const workouts = useFitnessStore((s) => s.workouts);
  const calories = meals.filter((item) => item.date === selectedDay).reduce((s, m) => s + m.calories, 0);
  const protein = meals.filter((item) => item.date === selectedDay).reduce((s, m) => s + m.protein, 0);
  const water = hydrationLogs.filter((item) => item.date === selectedDay).reduce((s, m) => s + m.amountMl, 0);
  const workoutStatus = workouts.some((workout) => workout.date === selectedDay && workout.completed)
    ? 'Done'
    : 'Pending';
  const streak = workouts.filter((workout) => workout.completed).length;

  return (
    <div className="grid grid-cols-2 gap-2">
      <Stat label="Calories" value={`${calories}/${targets.calories}`} />
      <Stat label="Protein" value={`${protein}g/${targets.protein}g`} />
      <Stat label="Water" value={`${(water / 1000).toFixed(1)}L`} />
      <Stat label="Workout" value={`${workoutStatus} · ${streak} streak`} />
    </div>
  );
}

function FinancePreview() {
  const balanceOverview = useFinanceStore((s) => s.balanceOverview);
  const transactions = useFinanceStore((s) => s.transactions);
  const savingsGoals = useFinanceStore((s) => s.savingsGoals);
  const recentExpenses = transactions.filter((txn) => txn.type === 'expense').slice(0, 3);
  const savingsProgress = savingsGoals.length
    ? Math.round(
        (savingsGoals.reduce((sum, goal) => sum + goal.current / goal.target, 0) /
          savingsGoals.length) *
          100,
      )
    : 0;
  const topCategory = recentExpenses[0]?.category ?? 'None';

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Balance" value={`$${balanceOverview.totalBalance}`} />
        <Stat label="Savings" value={`${savingsProgress}%`} />
      </div>
      <p className="text-xs text-jarvis-muted">
        Recent expenses: {recentExpenses.length} | Top: {topCategory}
      </p>
    </div>
  );
}

function AcademicsPreview() {
  const semester = useAcademicStore((s) => s.currentSemester);
  const assignments = useAcademicStore((s) => s.assignments);
  const revisionLogs = useAcademicStore((s) => s.revisionLogs);
  const codingProgress = useAcademicStore((s) => s.codingProgress);
  const upcoming = assignments.filter((item) => item.status !== 'completed').slice(0, 3).length;
  const studyHours = revisionLogs.reduce((sum, log) => sum + (log.hours || 0), 0).toFixed(1);
  const revisionStatus = Math.round((codingProgress.solvedProblems / codingProgress.targetProblems) * 100);

  return (
    <div className="grid grid-cols-2 gap-2">
      <Stat label="Semester" value={semester} />
      <Stat label="Assignments" value={upcoming} />
      <Stat label="Study Hours" value={`${studyHours}h`} />
      <Stat label="Revision" value={`${revisionStatus}%`} />
    </div>
  );
}

function CrmPreview() {
  const reminders = useCrmStore((s) => s.reminders);
  const contacts = useCrmStore((s) => s.contacts);
  const interactionLog = useCrmStore((s) => s.interactionLog);
  const pendingReminders = reminders.filter((item) => item.status !== 'done').length;
  const recentInteractions = interactionLog.slice(0, 3).length;
  const birthdays = contacts.filter((contact) => contact.birthday?.slice(5) === '05-29').length;

  return (
    <div className="grid grid-cols-2 gap-2">
      <Stat label="Interactions" value={recentInteractions} />
      <Stat label="Reminders" value={pendingReminders} />
      <Stat label="Birthdays" value={birthdays} />
      <Stat label="Follow-ups" value={pendingReminders} />
    </div>
  );
}

function JournalPreview() {
  const entries = useJournalStore((s) => s.entries);
  const latestEntry = entries[0];
  const avgMood = entries.length
    ? (
        entries.slice(0, 7).reduce((sum, entry) => sum + (entry.mood || 0), 0) /
        Math.min(entries.length, 7)
      ).toFixed(1)
    : '0.0';
  const streak = entries.length;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Latest" value={latestEntry?.date ?? 'None'} />
        <Stat label="Mood" value={`${avgMood}/10`} />
        <Stat label="Streak" value={`${streak}d`} />
      </div>
      <p className="truncate text-xs text-jarvis-muted">{latestEntry?.title ?? 'No reflection yet'}</p>
    </div>
  );
}

function ChatsPreview() {
  const chats = useChatStore((s) => s.chatHistory);
  const totalChats = chats.length;
  const totalMessages = chats.reduce((sum, chat) => sum + (chat.messages?.length || 0), 0);
  const latestChat = chats[0];
  const latestMessage =
    latestChat?.messages?.[latestChat.messages.length - 1]?.content || 'No messages yet';

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Chats" value={totalChats} />
        <Stat label="Messages" value={totalMessages} />
      </div>
      <p className="truncate text-xs text-jarvis-muted">
        Latest: {latestChat?.title || 'No conversations'}
      </p>
      <p className="truncate text-xs text-jarvis-muted">{latestMessage}</p>
    </div>
  );
}

export default function CanvasModuleRenderer({ type }) {
  switch (type) {
    case 'tasks':
      return <TasksPreview />;
    case 'goals':
      return <GoalsPreview />;
    case 'fitness':
      return <FitnessPreview />;
    case 'finance':
      return <FinancePreview />;
    case 'academics':
      return <AcademicsPreview />;
    case 'crm':
      return <CrmPreview />;
    case 'journal':
      return <JournalPreview />;
    case 'chats':
      return <ChatsPreview />;
    default:
      return <p className="text-xs text-jarvis-muted">No preview available.</p>;
  }
}
