import React, { useState } from 'react';
import { useAcademicStore } from '../../store/academicStore';
import PagePanel from '../ui/PagePanel';
import {
  Monitor, CheckSquare, Square, Footprints, Pencil, Check, X
} from 'lucide-react';

export default function ProductivityDiscipline() {
  const {
    fiveMinuteContract, toggleFiveMinuteContract,
    daily3, updateDaily3Task, toggleDaily3Check,
    dailyWalk, toggleDailyWalk,
  } = useAcademicStore();

  const [editingIdx, setEditingIdx] = useState(null);
  const [editText, setEditText] = useState('');

  const completedCount = daily3.filter(d => d.checked && d.text).length;
  const totalFilled = daily3.filter(d => d.text).length;

  const handleStartEdit = (idx) => {
    setEditingIdx(idx);
    setEditText(daily3[idx].text);
  };

  const handleSaveEdit = async (idx) => {
    await updateDaily3Task(idx, editText);
    setEditingIdx(null);
  };

  const handleCancelEdit = () => {
    setEditingIdx(null);
    setEditText('');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* 5-MINUTE CONTRACT */}
      <PagePanel title="5-Minute Contract" subtitle="The IDE Activation Rule">
        <div className="flex flex-col h-full">
          <div className="rounded-xl border border-jarvis-border/40 bg-black/20 p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <Monitor className="h-5 w-5 text-jarvis-accent shrink-0" />
              <div>
                <p className="text-xs font-semibold text-jarvis-text">The Daily Commitment</p>
                <p className="text-[10px] text-jarvis-muted leading-relaxed mt-0.5">
                  Open your IDE for just 5 minutes. That's it. Momentum follows.
                </p>
              </div>
            </div>
            <p className="text-[9px] text-jarvis-muted/70 italic leading-relaxed">
              "You don't need motivation. You need a tiny commitment. 5 minutes always turns into more."
            </p>
          </div>

          <button
            onClick={toggleFiveMinuteContract}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
              fiveMinuteContract
                ? 'bg-green-500/10 border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
                : 'bg-white/[0.02] border-jarvis-border/40 hover:border-jarvis-accent/40 hover:bg-white/5'
            }`}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 transition-all duration-300 ${
              fiveMinuteContract ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-jarvis-muted'
            }`}>
              {fiveMinuteContract ? <Check className="h-5 w-5" /> : <Monitor className="h-4 w-4" />}
            </div>
            <div className="text-left">
              <p className={`text-xs font-bold transition-colors ${fiveMinuteContract ? 'text-green-400' : 'text-jarvis-text'}`}>
                {fiveMinuteContract ? 'Contract Fulfilled ✓' : 'Did I open the IDE today?'}
              </p>
              <p className="text-[9px] text-jarvis-muted mt-0.5">
                {fiveMinuteContract ? 'Great work — momentum is building.' : 'Tap to mark as done'}
              </p>
            </div>
          </button>

          {/* Walk Anchor */}
          <button
            onClick={toggleDailyWalk}
            className={`mt-3 w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
              dailyWalk
                ? 'bg-blue-500/10 border-blue-500/40 shadow-[0_0_16px_rgba(59,130,246,0.1)]'
                : 'bg-white/[0.02] border-jarvis-border/40 hover:border-blue-500/30'
            }`}
          >
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 transition-all duration-300 ${
              dailyWalk ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-jarvis-muted'
            }`}>
              {dailyWalk ? <Check className="h-4 w-4" /> : <Footprints className="h-3.5 w-3.5" />}
            </div>
            <div className="text-left">
              <p className={`text-xs font-medium transition-colors ${dailyWalk ? 'text-blue-400' : 'text-jarvis-text'}`}>
                {dailyWalk ? '30-Min Walk ✓' : 'Daily 30-Min Walk'}
              </p>
              <p className="text-[9px] text-jarvis-muted">Physical anchor — resets mental state</p>
            </div>
          </button>
        </div>
      </PagePanel>

      {/* THE DAILY 3 */}
      <PagePanel
        title="The Daily 3"
        subtitle={`${completedCount}/${totalFilled} non-negotiables done`}
      >
        <div className="space-y-3">
          <p className="text-[10px] text-jarvis-muted leading-relaxed mb-4">
            Three tasks that must happen today. Not goals — commitments. Click to check off, click the edit icon to rename.
          </p>
          {daily3.map((item, idx) => (
            <div key={item.id} className={`rounded-xl border transition-all duration-200 overflow-hidden ${
              item.checked && item.text
                ? 'border-green-500/30 bg-green-500/5'
                : 'border-jarvis-border/40 bg-white/[0.02]'
            }`}>
              {editingIdx === idx ? (
                <div className="flex items-center gap-2 p-2.5">
                  <input
                    type="text"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveEdit(idx)}
                    autoFocus
                    placeholder={`Non-negotiable #${idx + 1}...`}
                    className="flex-1 bg-transparent text-xs text-jarvis-text outline-none placeholder-jarvis-muted/50"
                  />
                  <button onClick={() => handleSaveEdit(idx)} className="text-green-400 hover:text-green-300 p-1">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={handleCancelEdit} className="text-jarvis-muted hover:text-jarvis-text p-1">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-2.5">
                  <button
                    onClick={() => item.text && toggleDaily3Check(idx)}
                    className={`shrink-0 transition-colors ${item.text ? 'cursor-pointer' : 'cursor-default opacity-30'}`}
                  >
                    {item.checked && item.text
                      ? <CheckSquare className="h-4 w-4 text-green-400" />
                      : <Square className="h-4 w-4 text-jarvis-muted" />
                    }
                  </button>
                  <span className={`flex-1 text-xs leading-snug transition-colors ${
                    item.checked && item.text ? 'text-jarvis-muted line-through' : item.text ? 'text-jarvis-text' : 'text-jarvis-muted/40 italic'
                  }`}>
                    {item.text || `Set non-negotiable #${idx + 1}...`}
                  </span>
                  <button
                    onClick={() => handleStartEdit(idx)}
                    className="opacity-0 group-hover:opacity-100 shrink-0 text-jarvis-muted hover:text-jarvis-text p-1 rounded transition-all"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </PagePanel>

      {/* DISCIPLINE SNAPSHOT */}
      <PagePanel title="Today's Score" subtitle="Contract completion snapshot">
        <div className="space-y-4">
          {/* Score ring visualization */}
          <div className="flex items-center justify-center py-4">
            <div className="relative flex items-center justify-center">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="hsl(var(--color-accent))"
                  strokeWidth="2.5"
                  strokeDasharray={`${(() => {
                    let score = 0;
                    if (fiveMinuteContract) score++;
                    if (dailyWalk) score++;
                    if (completedCount > 0) score++;
                    return Math.round((score / 3) * 100);
                  })()} 100`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-lg font-bold text-jarvis-text">
                  {(() => {
                    let score = 0;
                    if (fiveMinuteContract) score++;
                    if (dailyWalk) score++;
                    if (completedCount > 0) score++;
                    return score;
                  })()}/3
                </p>
                <p className="text-[8px] uppercase text-jarvis-muted">Done</p>
              </div>
            </div>
          </div>

          {/* Status list */}
          <div className="space-y-2">
            {[
              { label: '5-Min IDE Contract', done: fiveMinuteContract },
              { label: 'Daily 3 Progress', done: completedCount > 0 },
              { label: '30-Min Walk', done: dailyWalk },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2.5 text-[11px]">
                <div className={`h-2 w-2 rounded-full shrink-0 ${item.done ? 'bg-green-400' : 'bg-jarvis-border'}`} />
                <span className={item.done ? 'text-jarvis-text' : 'text-jarvis-muted'}>{item.label}</span>
                {item.done && <Check className="h-3 w-3 text-green-400 ml-auto" />}
              </div>
            ))}
          </div>

          <p className="text-[9px] text-jarvis-muted/60 italic leading-relaxed pt-2 border-t border-jarvis-border/20">
            These reset daily. Consistency across weeks is what creates real momentum.
          </p>
        </div>
      </PagePanel>
    </div>
  );
}
