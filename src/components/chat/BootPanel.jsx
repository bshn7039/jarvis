import { useEffect, useState, useRef } from 'react';
import { 
  X, CheckCircle2, Clock, AlertTriangle, Target, Zap, 
  TrendingUp, Calendar, Play, Pause, Square, Volume2, 
  VolumeX, RotateCcw, Activity, ShieldAlert, Sparkles,
  Award, Heart, ShoppingBag, Terminal, Dumbbell, Code
} from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { useGoalStore } from '../../store/goalStore';
import { useAiStore } from '../../store/aiStore';
import { useAuthStore } from '../../store/authStore';
import { useFitnessStore } from '../../store/fitnessStore';
import { useFinanceStore } from '../../store/financeStore';
import { useAcademicStore } from '../../store/academicStore';
import { useSelfCareStore } from '../../store/selfCareStore';
import { useProfileStore } from '../../store/profileStore';
import { elevenlabsService } from '../../services/elevenlabsService';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good Morning', emoji: '☀️' };
  if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', emoji: '⚡' };
  if (hour >= 17 && hour < 22) return { text: 'Good Evening', emoji: '🌆' };
  return { text: 'Good Night', emoji: '🌙' };
}

function GridCard({ icon: Icon, title, value, subtext, color = 'text-jarvis-text' }) {
  return (
    <div className="rounded-xl border border-jarvis-border/40 bg-jarvis-bg/40 p-4 transition-all duration-300 hover:border-jarvis-border/80 hover:bg-jarvis-bg/60">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-jarvis-muted">{title}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="text-xl font-bold text-jarvis-text">{value}</div>
      {subtext && <div className="mt-1 text-[10px] text-jarvis-muted">{subtext}</div>}
    </div>
  );
}

export default function BootPanel({ isOpen, onClose }) {
  const [visible, setVisible] = useState(false);
  const [bootStage, setBootStage] = useState('diagnostic'); // 'diagnostic' | 'ready'
  const [logs, setLogs] = useState([]);
  const [logIndex, setLogIndex] = useState(0);

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioSource, setAudioSource] = useState(null); // 'elevenlabs' | 'browser' | null
  const [voiceEngine, setVoiceEngine] = useState(() => localStorage.getItem('jarvis_boot_voice_engine') || 'elevenlabs');

  // Refs for Audio elements
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);

  // Retrieve states from store
  const tasks = useTaskStore(s => s.tasks);
  const repetitiveTasks = useTaskStore(s => s.repetitiveTasks);
  const goals = useGoalStore(s => s.goals);
  const authUser = useAuthStore(s => s.user);

  // Store actions & briefings
  const bootBrief = useAiStore(s => s.bootBrief);
  const isBootGenerating = useAiStore(s => s.isBootGenerating);
  const generateBootBrief = useAiStore(s => s.generateBootBrief);

  // Extra details from fitness, finance, academics, self care stores
  const fitnessStore = useFitnessStore();
  const financeStore = useFinanceStore();
  const academicStore = useAcademicStore();
  const selfCareStore = useSelfCareStore();

  const profile = useProfileStore(s => s.profile);

  const greeting = getGreeting();
  const userName = profile?.identity?.displayName || authUser?.username || 'Commander';
  const today = new Date().toISOString().slice(0, 10);

  // Derived aggregates
  const todayTasks = tasks.filter(t => t.bucket === 'today' && !t.completed);
  const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && t.dueDate.slice(0, 10) < today);
  const completedToday = tasks.filter(t => t.completed && t.completedAt?.slice(0, 10) === today);
  const activeGoals = goals.filter(g => !g.completed);

  // Fitness stats
  const calories = fitnessStore.meals.filter(m => m.date === today).reduce((sum, m) => sum + m.calories, 0);
  const hydration = fitnessStore.hydrationLogs.filter(l => l.date === today).reduce((sum, l) => sum + l.amountMl, 0);
  const waterTarget = fitnessStore.targets.hydrationMl || 3500;
  const workoutDone = fitnessStore.workouts.some(w => w.date === today && w.completed);

  // Finance stats
  const monthlySpending = financeStore.balanceOverview?.monthlySpending || 0;
  const balance = financeStore.balanceOverview?.balance || 0;

  // Academics/Coding stats
  const solvedProblems = academicStore.dsaQuestions?.length || 0;
  const targetProblems = academicStore.codingProgress?.targetProblems || 0;

  // Self care stats
  const selfCareRoutines = selfCareStore.routines || [];
  const routinesDoneToday = selfCareRoutines.filter(r => r.completed || (r.history || []).some(h => h.slice(0, 10) === today)).length;

  // Stop current audio/speech synthesis
  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setIsPlaying(false);
  };

  // Play ElevenLabs or Fallback TTS
  const startPlayback = async (briefData, engineOverride) => {
    if (!briefData || !briefData.speechText) return;
    
    stopPlayback();
    setIsPlaying(true);
    setAudioSource(null);

    const activeEngine = engineOverride || voiceEngine;

    try {
      const result = await elevenlabsService.textToSpeech(briefData.speechText, null, activeEngine === 'browser');
      if (!result) {
        setIsPlaying(false);
        return;
      }

      if (result.source === 'elevenlabs') {
        setAudioSource('elevenlabs');
        const audio = new Audio(result.audioUrl);
        audioRef.current = audio;
        audio.muted = isMuted;
        audio.play().catch(err => {
          console.warn('Audio play failed, fallback to synthesis:', err);
          setIsPlaying(false);
        });
        audio.onended = () => {
          setIsPlaying(false);
        };
      } else if (result.source === 'browser' && result.utterance) {
        setAudioSource('browser');
        utteranceRef.current = result.utterance;
        result.utterance.onend = () => {
          setIsPlaying(false);
        };
        result.utterance.onerror = () => {
          setIsPlaying(false);
        };
        
        result.utterance.volume = isMuted ? 0 : 1;
        window.speechSynthesis.speak(result.utterance);
      }
    } catch (e) {
      console.error('Audio playback exception:', e);
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      if (audioSource === 'elevenlabs' && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else if (audioSource === 'browser') {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      }
    } else {
      if (audioSource === 'elevenlabs' && audioRef.current) {
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      } else if (audioSource === 'browser') {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        if (bootBrief) startPlayback(bootBrief);
      }
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    
    if (audioSource === 'elevenlabs' && audioRef.current) {
      audioRef.current.muted = nextMuted;
    } else if (audioSource === 'browser' && utteranceRef.current) {
      if (nextMuted) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        if (bootBrief) startPlayback(bootBrief);
      }
    }
  };

  const toggleVoiceEngine = () => {
    const nextEngine = voiceEngine === 'elevenlabs' ? 'browser' : 'elevenlabs';
    setVoiceEngine(nextEngine);
    localStorage.setItem('jarvis_boot_voice_engine', nextEngine);
    window.dispatchEvent(new Event('jarvis_voice_engine_changed'));
    
    if (isPlaying && bootBrief) {
      stopPlayback();
      setTimeout(() => {
        startPlayback(bootBrief, nextEngine);
      }, 50);
    }
  };

  const triggerReboot = async () => {
    stopPlayback();
    setBootStage('diagnostic');
    setLogs([]);
    setLogIndex(0);
    const newBrief = await generateBootBrief(true);
    // The diagnostic completion will auto-trigger startPlayback(newBrief)
  };

  // Close and cleanup
  const handleClose = () => {
    stopPlayback();
    onClose();
  };

  // Mount/Unmount hooks
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
      setBootStage('diagnostic');
      setLogs([]);
      setLogIndex(0);
      generateBootBrief(false);
    } else {
      setVisible(false);
      stopPlayback();
    }
  }, [isOpen]);

  // Sync voice engine selection from other components
  useEffect(() => {
    const handleSync = () => {
      setVoiceEngine(localStorage.getItem('jarvis_boot_voice_engine') || 'elevenlabs');
    };
    window.addEventListener('jarvis_voice_engine_changed', handleSync);
    return () => window.removeEventListener('jarvis_voice_engine_changed', handleSync);
  }, []);

  // Handle diagnostics console log scrolling
  useEffect(() => {
    if (!isOpen || bootStage !== 'diagnostic') return;

    const DIAGNOSTIC_LOGS = [
      '⚡ [SYS] INITIALIZING CORE JARVIS PROCESSOR...',
      '📡 [SYS] EXAMINING ACTIVE DATABASE STORAGE VOLUMES...',
      '📦 [SYS] HYDRATING SCHEMA: REGISTERED USER TASKS & ROUTINES...',
      '💪 [SYS] HYDRATING SCHEMA: WELLNESS METRICS & NUTRITIONAL LOGS...',
      '💵 [SYS] HYDRATING SCHEMA: FINANCE BUDGETS AND VALUATION SHEETS...',
      '💻 [SYS] HYDRATING SCHEMA: CODING DSA TRACKERS & PROGRESSION...',
      '🤖 [SYS] DATA SNAPSHOT COMPILED. QUERYING AI COGNITIVE CORE...',
      '🔊 [SYS] PRE-WARMING ELEVENLABS NEURAL VOICE COGNITION SERVICE...',
      '✅ [SYS] BOOT COMPLETED SUCCESSFULLY. STANDING BY FOR COMMAND VOICE.'
    ];

    if (logIndex < DIAGNOSTIC_LOGS.length) {
      // Pause animation if AI is still working
      if (logIndex === 7 && isBootGenerating) {
        return;
      }
      
      const delay = logIndex === 6 ? 700 : 250;
      const timer = setTimeout(() => {
        setLogs(prev => [...prev, DIAGNOSTIC_LOGS[logIndex]]);
        setLogIndex(prev => prev + 1);
      }, delay);
      
      return () => clearTimeout(timer);
    } else {
      // Roll into dashboard
      const timer = setTimeout(() => {
        setBootStage('ready');
        if (bootBrief) {
          startPlayback(bootBrief);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, logIndex, bootStage, isBootGenerating, bootBrief]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/75 backdrop-blur-md transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Main Panel */}
      <div
        className={`fixed inset-x-4 bottom-4 top-4 z-50 mx-auto max-w-3xl overflow-hidden rounded-2xl border border-jarvis-border/60 bg-jarvis-panel/95 shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all duration-500 sm:inset-x-6 md:inset-x-auto md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[720px] ${
          visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
        }`}
      >
        {/* Futuristic glowing top bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-jarvis-accent/60 to-transparent" />

        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div className="relative flex shrink-0 items-start justify-between px-6 pt-6 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{greeting.emoji}</span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-jarvis-muted">{greeting.text}</p>
                  <h2 className="text-2xl font-bold tracking-tight text-jarvis-text">
                    Hi,{' '}
                    <span className="bg-gradient-to-r from-jarvis-accent to-indigo-300 bg-clip-text text-transparent">
                      {userName}
                    </span>
                  </h2>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg border border-jarvis-border/50 p-1.5 text-jarvis-muted transition-colors hover:bg-jarvis-muted/10 hover:text-jarvis-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mx-6 h-px bg-jarvis-border/30" />

          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {bootStage === 'diagnostic' ? (
              /* CYBER DIAGNOSTIC SEQUENCE */
              <div className="flex h-[380px] flex-col justify-between rounded-xl border border-jarvis-accent/20 bg-black/40 p-6 font-mono text-[12px] leading-relaxed text-jarvis-accent">
                <div className="space-y-2.5 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-center gap-2 animate-[pulse_0.1s_ease-out_1]">
                      {index === logs.length - 1 && index < 8 ? (
                        <Activity className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Terminal className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span>{log}</span>
                    </div>
                  ))}
                  {isBootGenerating && logIndex === 7 && (
                    <div className="flex items-center gap-2 text-indigo-400 animate-pulse pl-5">
                      <Sparkles className="h-3 w-3 animate-spin" />
                      <span>[AI] Compiling summary insights (this will take a moment)...</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-jarvis-accent/20 pt-4 text-[10px] text-jarvis-muted">
                  <span>MODULE: JARVIS_BOOT_STAGE_DIAG_v4.5</span>
                  <span className="animate-pulse">SYS: INITIALIZING BRIEFING COG...</span>
                </div>
              </div>
            ) : (
              /* READY READY DASHBOARD */
              <div className="space-y-6 animate-greeting-in">
                
                {/* Audio briefing audio controller */}
                <div className="flex items-center justify-between rounded-xl border border-jarvis-accent/30 bg-jarvis-accent/5 px-5 py-4 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    {/* Glowing audio speaker */}
                    <div className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-jarvis-accent/40 bg-jarvis-accent/10 text-jarvis-accent ${isPlaying ? 'animate-pulse' : ''}`}>
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-jarvis-accent">
                        COGNITIVE AUDIO TRANSMISSION
                      </p>
                      <h4 className="text-sm font-semibold text-jarvis-text">
                        {isPlaying ? (
                          <span className="text-sky-300">Briefing voice active {audioSource === 'browser' ? '(Native Engine)' : '(ElevenLabs Engine)'}</span>
                        ) : 'Briefing transmission standing by'}
                      </h4>
                    </div>
                  </div>

                  {/* Soundwave + Controls */}
                  <div className="flex items-center gap-6">
                    {/* CSS soundwave anim */}
                    <div className={`soundwave-container ${isPlaying ? 'soundwave-active' : 'opacity-30'}`}>
                      <span className="soundwave-bar" />
                      <span className="soundwave-bar" />
                      <span className="soundwave-bar" />
                      <span className="soundwave-bar" />
                      <span className="soundwave-bar" />
                      <span className="soundwave-bar" />
                      <span className="soundwave-bar" />
                    </div>

                    <div className="flex items-center gap-1.5 rounded-lg border border-jarvis-border/60 bg-jarvis-panel/80 p-1">
                      <button
                        onClick={toggleVoiceEngine}
                        className={`rounded px-2 py-1 text-[10px] font-mono font-bold tracking-wider transition-all duration-200 border border-transparent hover:bg-jarvis-muted/10 ${
                          voiceEngine === 'elevenlabs' 
                            ? 'bg-jarvis-accent/10 text-jarvis-accent border-jarvis-accent/20' 
                            : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                        }`}
                        title="Toggle Voice Engine: ElevenLabs (Premium) vs Browser (Free)"
                      >
                        {voiceEngine === 'elevenlabs' ? '11LABS' : 'BROWSER (FREE)'}
                      </button>
                      <div className="h-4 w-px bg-jarvis-border/60 mx-0.5" />
                      <button
                        onClick={togglePlayPause}
                        className="rounded p-1.5 text-jarvis-muted hover:bg-jarvis-muted/10 hover:text-jarvis-text transition-colors"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause className="h-4 w-4 text-jarvis-accent" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={stopPlayback}
                        className="rounded p-1.5 text-jarvis-muted hover:bg-jarvis-muted/10 hover:text-jarvis-text transition-colors"
                        title="Stop"
                      >
                        <Square className="h-4 w-4" />
                      </button>
                      <button
                        onClick={toggleMute}
                        className="rounded p-1.5 text-jarvis-muted hover:bg-jarvis-muted/10 hover:text-jarvis-text transition-colors"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => bootBrief && startPlayback(bootBrief)}
                        className="rounded p-1.5 text-jarvis-muted hover:bg-jarvis-muted/10 hover:text-jarvis-text transition-colors"
                        title="Replay Voice Summary"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI generated briefs */}
                {bootBrief?.visualBrief && (
                  <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-sky-400/20 bg-sky-400/5 px-4 py-3.5">
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Primary focus</span>
                      </div>
                      <p className="text-sm text-jarvis-text leading-relaxed">
                        {bootBrief.visualBrief.primary}
                      </p>
                    </div>

                    <div className="rounded-xl border border-indigo-400/20 bg-indigo-400/5 px-4 py-3.5">
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                        <Activity className="h-3.5 w-3.5" />
                        <span>Secondary priority</span>
                      </div>
                      <p className="text-sm text-jarvis-text leading-relaxed">
                        {bootBrief.visualBrief.secondary}
                      </p>
                    </div>

                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3.5">
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold text-red-400 uppercase tracking-wider">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>System alert</span>
                      </div>
                      <p className="text-sm text-jarvis-text leading-relaxed">
                        {bootBrief.visualBrief.watchOuts}
                      </p>
                    </div>
                  </section>
                )}

                {/* Goals Progress and System Health */}
                {bootBrief?.visualBrief && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    {/* Goals progress */}
                    <div className="col-span-3 rounded-xl border border-jarvis-border/40 bg-jarvis-bg/40 p-4">
                      <div className="flex items-center gap-2 mb-2 text-[10px] font-semibold text-jarvis-muted uppercase tracking-wider">
                        <Target className="h-3.5 w-3.5" />
                        <span>Active Goals Context</span>
                      </div>
                      <p className="text-sm text-jarvis-text leading-relaxed">
                        {bootBrief.visualBrief.goalsSummary || 'Goals are hydrated and updating progress metrics.'}
                      </p>
                    </div>
                    
                    {/* System efficiency rating */}
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                        System Efficiency
                      </span>
                      <div className="text-3xl font-extrabold text-emerald-400">
                        {bootBrief.visualBrief.systemHealth || '90%'}
                      </div>
                      <span className="text-[9px] text-jarvis-muted uppercase tracking-wider">
                        Active Nominal Rating
                      </span>
                    </div>
                  </div>
                )}

                {/* detailed summaries grids */}
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-jarvis-muted" />
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-jarvis-muted">
                      System Diagnostics Metric Snapshots
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    <GridCard 
                      icon={Clock} 
                      title="Tasks Today" 
                      value={todayTasks.length} 
                      subtext={`${overdueTasks.length} Overdue, ${completedToday.length} Done`}
                      color={todayTasks.length > 0 ? 'text-sky-400' : 'text-emerald-400'} 
                    />
                    <GridCard 
                      icon={Target} 
                      title="Goals Active" 
                      value={activeGoals.length} 
                      subtext="Hydrated via goal tree" 
                      color="text-indigo-400"
                    />
                    <GridCard 
                      icon={Dumbbell} 
                      title="Fitness Logs" 
                      value={`${calories} kcal`} 
                      subtext={`${hydration}/${waterTarget} ml water`} 
                      color="text-amber-400"
                    />
                    <GridCard 
                      icon={ShoppingBag} 
                      title="Finance state" 
                      value={`₹${monthlySpending.toLocaleString()}`} 
                      subtext={`Balance: ₹${balance.toLocaleString()}`}
                      color="text-emerald-400" 
                    />
                    <GridCard 
                      icon={Code} 
                      title="Academics" 
                      value={solvedProblems} 
                      subtext={`Daily Target: ${targetProblems}`}
                      color="text-pink-400" 
                    />
                  </div>
                </section>

                {/* Overdue alert checklist */}
                {overdueTasks.length > 0 && (
                  <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <div className="mb-2.5 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-red-400">
                        Immediate Action items: Overdue Tasks
                      </h4>
                    </div>
                    <div className="space-y-1.5">
                      {overdueTasks.slice(0, 3).map(task => (
                        <div key={task.id} className="flex items-center gap-3 text-xs text-red-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                          <span className="flex-1 truncate">{task.title}</span>
                          {task.dueDate && (
                            <span className="text-[10px] text-red-400">
                              Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      ))}
                      {overdueTasks.length > 3 && (
                        <p className="text-[10px] text-red-400/70 pl-4">
                          and {overdueTasks.length - 3} other overdue items...
                        </p>
                      )}
                    </div>
                  </section>
                )}

                {/* Trigger reboot diagnostics buttons */}
                <div className="flex items-center justify-between border-t border-jarvis-border/40 pt-4">
                  <button
                    onClick={triggerReboot}
                    className="flex items-center gap-2 rounded-lg border border-jarvis-border/60 bg-jarvis-panel px-4 py-2 text-[12px] font-semibold text-jarvis-muted hover:border-jarvis-accent/50 hover:text-jarvis-accent hover:bg-jarvis-panel/90 transition-all duration-300"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Run Diagnostics System Diagnostics</span>
                  </button>
                  <button
                    onClick={handleClose}
                    className="rounded-lg bg-jarvis-accent px-5 py-2 text-[12px] font-semibold text-jarvis-bg hover:brightness-110 transition-all duration-200 shadow-md"
                  >
                    Confirm & Initialize Dashboard
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-jarvis-border/30 px-6 py-3 bg-black/20">
            <p className="text-center text-[10px] text-jarvis-muted/50 font-mono">
              JARVIS CORE v4.5 · ElevenLabs Neural Voice Synth · Secure Handshake Active
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
