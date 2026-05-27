import { useMemo } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useGoalStore } from '../../store/goalStore';
import { useFitnessStore } from '../../store/fitnessStore';
import { useFinanceStore } from '../../store/financeStore';
import { useAcademicStore } from '../../store/academicStore';
import { useCrmStore } from '../../store/crmStore';
import { useJournalStore } from '../../store/journalStore';
import { useChatStore } from '../../store/chatStore';
import { useSelfCareStore } from '../../store/selfCareStore';
import { useReadingStore } from '../../store/readingStore';
import { useMusicStore } from '../../store/musicStore';
import { useVaultStore } from '../../store/vaultStore';
import { useMutualFundStore } from '../../store/mutualFundStore';

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
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter((task) => task.bucket === 'today');
  const completed = tasks.filter((task) => task.completed).length;
  const overdue = tasks.filter(
    (task) => !task.completed && task.dueDate?.slice(0, 10) < today,
  ).length;
  const completion = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const priority = tasks.filter((task) => ['critical', 'high'].includes(task.priority)).length;

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
  const rootAreas = goals.filter((g) => g.parentId === null);
  
  if (rootAreas.length === 0) {
    return <p className="text-xs text-jarvis-muted">No strategic goals defined.</p>;
  }

  return (
    <div className="space-y-3">
      {rootAreas.map((area) => {
        const childGoals = goals.filter(g => g.parentId === area.id);
        return (
          <div key={area.id} className="rounded-lg border border-jarvis-border/50 bg-black/20 p-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-jarvis-accent">{area.title}</p>
              <span className="text-[10px] text-jarvis-muted">{area.progress}%</span>
            </div>
            {childGoals.length > 0 && (
              <div className="mt-1.5 space-y-1 pl-2 border-l border-jarvis-border/30">
                {childGoals.slice(0, 2).map(goal => (
                  <div key={goal.id} className="flex items-center justify-between text-[10px]">
                    <span className="truncate text-jarvis-text/80">{goal.title}</span>
                    <span className="text-jarvis-muted">{goal.progress}%</span>
                  </div>
                ))}
                {childGoals.length > 2 && (
                  <p className="text-[9px] text-jarvis-muted italic">+{childGoals.length - 2} more goals</p>
                )}
              </div>
            )}
          </div>
        );
      })}
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
  const getPortfolioTotals = useMutualFundStore(s => s.getPortfolioTotals);
  const mfTotals = getPortfolioTotals();

  const currentMonthSpend = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return transactions
      .filter(t => t.type === 'debit' && (t.transactionDate || '').startsWith(currentMonth))
      .reduce((s, t) => s + (Number(t.amount) || 0), 0);
  }, [transactions]);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Balance" value={`₹${Math.round(balanceOverview.totalBalance).toLocaleString('en-IN')}`} />
        <Stat label="This Month" value={`-₹${Math.round(currentMonthSpend).toLocaleString('en-IN')}`} />
        <Stat label="MF Invested" value={mfTotals.totalInvested > 0 ? `₹${Math.round(mfTotals.totalInvested).toLocaleString('en-IN')}` : '—'} />
        <Stat label="MF Value" value={mfTotals.totalCurrentValue > 0 ? `₹${Math.round(mfTotals.totalCurrentValue).toLocaleString('en-IN')}` : '—'} />
      </div>
      {mfTotals.totalInvested > 0 && (
        <p className={`text-[10px] font-medium ${
          mfTotals.totalReturnsPercent >= 0 ? 'text-emerald-400' : 'text-red-400'
        }`}>
          MF Returns: {mfTotals.totalReturnsPercent >= 0 ? '+' : ''}{mfTotals.totalReturnsPercent}%
        </p>
      )}
    </div>
  );
}

function AcademicsPreview() {
  const semester = useAcademicStore((s) => s.currentSemester);
  const assignments = useAcademicStore((s) => s.assignments);
  const revisionLogs = useAcademicStore((s) => s.revisionLogs);
  const codingProgress = useAcademicStore((s) => s.codingProgress);
  const dsaQuestions = useAcademicStore((s) => s.dsaQuestions);
  const upcoming = assignments.filter((item) => item.status !== 'completed').slice(0, 3).length;
  const studyHours = revisionLogs.reduce((sum, log) => sum + (log.hours || 0), 0).toFixed(1);
  const solvedCount = dsaQuestions.length;
  const revisionStatus = Math.round((solvedCount / (codingProgress.targetProblems || 1)) * 100);

  return (
    <div className="grid grid-cols-2 gap-2">
      <Stat label="Semester" value={semester || '—'} />
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

function MutualFundsPreview() {
  const funds = useMutualFundStore(s => s.funds);
  const getPortfolioTotals = useMutualFundStore(s => s.getPortfolioTotals);
  const computeFundStats = useMutualFundStore(s => s.computeFundStats);
  const totals = getPortfolioTotals();

  if (funds.length === 0) {
    return <p className="text-xs text-jarvis-muted italic">No mutual funds tracked yet.</p>;
  }

  const isGain = totals.totalReturnsPercent >= 0;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Invested" value={`₹${Math.round(totals.totalInvested).toLocaleString('en-IN')}`} />
        <Stat label="Current" value={`₹${Math.round(totals.totalCurrentValue).toLocaleString('en-IN')}`} />
        <Stat label="Returns" value={`${isGain ? '+' : ''}₹${Math.round(totals.totalReturns).toLocaleString('en-IN')}`} />
        <Stat label="Overall %" value={`${isGain ? '+' : ''}${totals.totalReturnsPercent}%`} />
      </div>
      <div className="space-y-1 mt-1">
        {funds.slice(0, 4).map(fund => {
          const stats = computeFundStats(fund);
          const rp = stats.returnsPercent;
          return (
            <div key={fund.id} className="flex items-center justify-between rounded-md bg-black/20 px-2 py-1.5 border border-jarvis-border/30">
              <p className="text-[10px] text-jarvis-text truncate flex-1 pr-2 leading-snug">{fund.schemeName.split(' ').slice(0, 4).join(' ')}…</p>
              <span className={`text-[10px] font-mono shrink-0 ${
                rp === null ? 'text-jarvis-muted' : rp >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {rp !== null ? `${rp >= 0 ? '+' : ''}${rp}%` : '...'}
              </span>
            </div>
          );
        })}
        {funds.length > 4 && (
          <p className="text-[9px] text-jarvis-muted italic text-center">+{funds.length - 4} more funds</p>
        )}
      </div>
    </div>
  );
}

function PersonalPreview() {
  const selfCare = useSelfCareStore((s) => s.routines);
  const reading = useReadingStore((s) => s.library);
  const music = useMusicStore((s) => s.practiceLogs);
  const vault = useVaultStore((s) => s.ideas);
  
  const activeReading = reading.filter((b) => b.status === 'reading').length;
  const vaultIdeas = vault.length;
  const selfCarePending = selfCare.filter((s) => !s.completed).length;
  const musicLogs = music.length;

  return (
    <div className="grid grid-cols-2 gap-2">
      <Stat label="Self Care" value={`${selfCarePending} pending`} />
      <Stat label="Reading" value={`${activeReading} books`} />
      <Stat label="Creative" value={`${vaultIdeas} ideas`} />
      <Stat label="Music" value={`${musicLogs} logs`} />
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
    case 'mutualFunds':
      return <MutualFundsPreview />;
    case 'academics':
      return <AcademicsPreview />;
    case 'crm':
      return <CrmPreview />;
    case 'journal':
      return <JournalPreview />;
    case 'chats':
      return <ChatsPreview />;
    case 'personal':
      return <PersonalPreview />;
    default:
      return <p className="text-xs text-jarvis-muted">No preview available.</p>;
  }
}

