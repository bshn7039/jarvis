import React, { useState, useRef } from 'react';
import { useAcademicStore } from '../../store/academicStore';
import PagePanel from '../ui/PagePanel';
import CinematicLoader from '../ui/CinematicLoader';
import {
  Brain, Send, Trash2, RefreshCw, Sparkles, Clock,
  ChevronDown, ChevronUp, FileText, Calendar
} from 'lucide-react';

// ─── Local AI Insights Engine ────────────────────────────────────────────────
function generateInsights({ fiveMinuteContract, daily3, dailyWalk, dsaQuestions, subjects, codingProgress, activeSemester }) {
  const lines = [];
  const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const solvedCount = dsaQuestions.length;
  const target = codingProgress.targetProblems || 50;
  const dsaPct = Math.round((solvedCount / target) * 100);

  if (solvedCount === 0) {
    lines.push(`⚡ DSA Alert: Zero problems solved yet. Start with one Easy array problem — the first solve breaks the barrier. Even LeetCode #1 (Two Sum) counts.`);
  } else if (dsaPct < 30) {
    lines.push(`📊 DSA Trajectory: ${solvedCount}/${target} problems (${dsaPct}%). Phase 1 is within reach. Stay consistent — 1 problem a day = 30 in a month.`);
  } else if (dsaPct < 100) {
    lines.push(`🔥 DSA Momentum: ${solvedCount}/${target} solved. ${target - solvedCount} remaining to Phase 1 completion. Don't stop now.`);
  } else {
    lines.push(`🏆 Phase 1 Complete! Time to upgrade to Phase 2 — Binary Search, Sorting & Two Pointers.`);
  }

  const semSubjects = subjects.filter(s => s.semester === activeSemester);
  const criticalSubs = semSubjects.filter(s => {
    if (!s.totalDays || s.totalDays === 0) return false;
    return Math.round((s.attendedDays || 0) / s.totalDays * 100) < 75;
  });
  if (criticalSubs.length > 0) {
    lines.push(`🚨 Attendance Warning: ${criticalSubs.map(s => s.name).join(', ')} — below 75%. Lateral entry students are scrutinized harder. Attend every class to recover.`);
  } else if (semSubjects.some(s => s.totalDays > 0)) {
    lines.push(`✅ Attendance: All ${activeSemester} subjects above critical threshold. Keep it consistent.`);
  }

  lines.push(`🎯 Lateral Entry Focus: Your Sem 3 curriculum (Data Structures, COA, Discrete Math) is the hardest academic jump. Mastering these puts you ahead of students who went through Sem 1–2 traditionally.`);

  lines.push(`💡 DSA + Academics Link: Data Structures isn't just a subject — every array/linked list problem you solve on LeetCode directly accelerates your DS exam preparation. These are the same concepts.`);

  return `[Neural Sync — ${timestamp}]\n\n` + lines.join('\n\n');
}

export default function AiInsightsPanel() {
  const {
    outputLogs, addOutputLog, deleteOutputLog,
    aiInsights, setAiInsights,
    dsaQuestions, subjects, codingProgress, activeSemester,
    fiveMinuteContract, daily3, dailyWalk,
  } = useAcademicStore();

  const [logText, setLogText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [logsExpanded, setLogsExpanded] = useState(true);
  const textRef = useRef(null);

  const handleAddLog = async () => {
    if (!logText.trim()) return;
    await addOutputLog(logText);
    setLogText('');
  };

  const handleRefreshInsights = async () => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 700));
    const text = generateInsights({
      fiveMinuteContract, daily3, dailyWalk,
      dsaQuestions, subjects, codingProgress, activeSemester
    });
    await setAiInsights(text);
    setIsGenerating(false);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* OUTPUT LOG */}
      <PagePanel title="Output Log" subtitle="Brain dump — ideas, thoughts, breakthroughs">
        <div className="space-y-3">
          <div className="rounded-xl border border-jarvis-border/40 bg-black/20 overflow-hidden">
            <textarea
              ref={textRef}
              value={logText}
              onChange={e => setLogText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handleAddLog()}
              placeholder="Dump your thoughts here... (Ctrl+Enter to save)"
              rows={4}
              className="w-full bg-transparent text-xs text-jarvis-text placeholder-jarvis-muted/50 p-3 outline-none resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between px-3 py-2 border-t border-jarvis-border/30">
              <span className="text-[9px] text-jarvis-muted">Ctrl+Enter to save · All notes are dated</span>
              <button
                onClick={handleAddLog}
                disabled={!logText.trim()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-jarvis-accent/10 border border-jarvis-accent/20 text-jarvis-accent hover:bg-jarvis-accent/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[10px] font-medium"
              >
                <Send className="h-3 w-3" />
                Save Note
              </button>
            </div>
          </div>

          {outputLogs.length > 0 && (
            <div>
              <button
                onClick={() => setLogsExpanded(!logsExpanded)}
                className="flex items-center gap-1.5 text-[9px] text-jarvis-muted hover:text-jarvis-text uppercase tracking-wider mb-2 transition-colors"
              >
                {logsExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {outputLogs.length} saved notes
              </button>
              {logsExpanded && (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {outputLogs.map(log => (
                    <div key={log.id} className="group relative rounded-lg border border-jarvis-border/30 bg-white/[0.02] p-2.5">
                      <p className="text-[10px] text-jarvis-text leading-relaxed whitespace-pre-wrap">{log.text}</p>
                      <div className="flex items-center justify-between mt-1.5 gap-2">
                        <div className="flex items-center gap-1 text-[8px] text-jarvis-muted">
                          <Calendar className="h-2.5 w-2.5" />
                          <span>
                            {new Date(log.timestamp).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                            {' · '}
                            {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteOutputLog(log.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-400 transition-all p-0.5"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {outputLogs.length === 0 && (
            <div className="py-4 text-center">
              <FileText className="h-6 w-6 text-jarvis-muted/30 mx-auto mb-2" />
              <p className="text-[10px] text-jarvis-muted italic">No notes yet. Start dumping your thoughts.</p>
            </div>
          )}
        </div>
      </PagePanel>

      {/* NEURAL INSIGHTS */}
      <PagePanel title="Neural Layer" subtitle="Manual AI sync — click to generate">
        <div className="flex flex-col h-full space-y-4">
          <button
            onClick={handleRefreshInsights}
            disabled={isGenerating}
            className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border transition-all duration-300 font-medium text-xs ${
              isGenerating
                ? 'border-jarvis-accent/20 bg-jarvis-accent/5 text-jarvis-accent/50 cursor-wait'
                : 'border-jarvis-accent/40 bg-jarvis-accent/10 text-jarvis-accent hover:bg-jarvis-accent/20 hover:border-jarvis-accent/60 hover:shadow-[0_0_20px_rgba(var(--color-accent)/0.15)]'
            }`}
          >
            {isGenerating ? (
              <><RefreshCw className="h-4 w-4 animate-spin" />Syncing Neural Layer...</>
            ) : (
              <><Sparkles className="h-4 w-4" />Sync Neural Layer & Refresh Insights</>
            )}
          </button>

          {isGenerating ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 rounded-xl border border-jarvis-border/30 bg-black/20">
              <CinematicLoader size="sm" message="Syncing Neural Layer..." />
            </div>
          ) : aiInsights.text ? (
            <div className="flex-1 rounded-xl border border-jarvis-border/40 bg-black/20 p-3 overflow-y-auto max-h-72">
              {aiInsights.timestamp && (
                <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-jarvis-border/30">
                  <Clock className="h-3 w-3 text-jarvis-muted" />
                  <span className="text-[9px] text-jarvis-muted">
                    {new Date(aiInsights.timestamp).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              <p className="text-[10px] text-jarvis-text leading-relaxed whitespace-pre-wrap">{aiInsights.text}</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-jarvis-border/30 bg-white/[0.01]">
              <Brain className="h-8 w-8 text-jarvis-muted/30 mb-3" />
              <p className="text-[10px] text-jarvis-muted italic text-center px-4">
                Neural layer idle. Click "Sync" to generate coaching based on your current DSA, attendance, and task data.
              </p>
            </div>
          )}
        </div>
      </PagePanel>
    </div>
  );
}
