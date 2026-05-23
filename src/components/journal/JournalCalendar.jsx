import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useDailyMoods } from '../../store/journalStore';
import { formatDateKey } from '../../utils/dateUtils';

export default function JournalCalendar({ entries, onSelectDay, selectedDate, onAddEntry }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4)); // May 2026 based on seed
  const dailyMoods = useDailyMoods();

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    // Fill previous month days
    const firstDayIndex = date.getDay();
    for (let i = firstDayIndex; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      days.push({ date: prevDate, currentMonth: false });
    }

    // Current month days
    while (date.getMonth() === month) {
      days.push({ date: new Date(date), currentMonth: true });
      date.setDate(date.getDate() + 1);
    }

    // Fill next month days
    while (days.length % 7 !== 0) {
      days.push({ date: new Date(date), currentMonth: false });
      date.setDate(date.getDate() + 1);
    }

    return days;
  }, [currentMonth]);

  const entryCounts = useMemo(() => {
    return entries.reduce((acc, entry) => {
      const date = entry.entryDate;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
  }, [entries]);

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

  return (
    <div className="rounded-2xl border border-jarvis-border bg-jarvis-panel p-5">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-jarvis-text">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="rounded-lg border border-jarvis-border p-1.5 hover:bg-white/5">
            <ChevronLeft className="h-4 w-4 text-jarvis-muted" />
          </button>
          <button onClick={nextMonth} className="rounded-lg border border-jarvis-border p-1.5 hover:bg-white/5">
            <ChevronRight className="h-4 w-4 text-jarvis-muted" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-jarvis-border bg-jarvis-border">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="bg-jarvis-bg/40 py-2 text-center text-[10px] font-medium uppercase tracking-widest text-jarvis-muted">
            {day}
          </div>
        ))}
        {daysInMonth.map(({ date, currentMonth: isCurrentMonth }, i) => {
          const dateStr = formatDateKey(date);
          const count = entryCounts[dateStr] || 0;
          const mood = dailyMoods[dateStr];
          const isSelected = selectedDate === dateStr;

          return (
            <div
              key={i}
              onClick={() => onSelectDay(dateStr)}
              className={[
                'relative flex min-h-[80px] cursor-pointer flex-col p-2 transition-colors hover:bg-white/[0.03]',
                isCurrentMonth ? 'bg-jarvis-panel' : 'bg-jarvis-bg/20 opacity-40',
                isSelected ? 'ring-1 ring-inset ring-jarvis-accent/40 bg-jarvis-accent/5' : ''
              ].join(' ')}
            >
              <span className={['text-xs', isSelected ? 'font-bold text-jarvis-accent' : 'text-jarvis-text'].join(' ')}>
                {date.getDate()}
              </span>
              
              <div className="mt-auto flex items-end justify-between">
                {count > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-jarvis-muted">{count} {count === 1 ? 'entry' : 'entries'}</span>
                    <span className={['text-[10px] font-medium', mood >= 7 ? 'text-jarvis-accent' : mood <= 4 ? 'text-red-400' : 'text-jarvis-text'].join(' ')}>
                      {mood ? `Mood: ${mood}` : ''}
                    </span>
                  </div>
                )}
                {!count && isCurrentMonth && (
                   <button 
                    onClick={(e) => { e.stopPropagation(); onAddEntry({ entryDate: dateStr }); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-jarvis-accent transition-opacity"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
