import { useMemo, useState, useEffect, useRef } from 'react';
import { useGoalStore } from '../store/goalStore';
import { useTaskStore } from '../store/taskStore';
import { usePersonalRoadmapStore } from '../store/personalRoadmapStore';
import { useEntityStore } from '../store/entityStore';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import EntityModal from '../components/modals/EntityModal';
import EntityForm from '../components/forms/EntityForm';
import { 
  Heart, 
  Mic2, 
  Users, 
  Globe, 
  Music, 
  PenTool, 
  BookOpen, 
  Lock, 
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  TrendingUp,
  ExternalLink,
  MessageSquare,
  Clock,
  Star,
  Map,
  ClipboardList,
  Volume2,
  VolumeX,
  Play,
  Square,
  RefreshCw,
  Scissors,
  Check,
  ChevronRight,
  Shield,
  Moon,
  Compass,
  ArrowRight,
  Coffee,
  Sparkle,
  Smile,
  ListTodo
} from 'lucide-react';

// CHORD FREQUENCIES for Instruments Web Audio Drone (Fundamental + Fifth + Octave)
const CHORD_FREQS = {
  G: [196.00, 293.66, 392.00], // G3, D4, G4
  C: [130.81, 196.00, 261.63], // C3, G3, C4
  D: [146.83, 220.00, 293.66], // D3, A3, D4
  Em: [164.81, 246.94, 329.63] // E3, B3, E4
};

const SOCIAL_CHALLENGES = [
  { text: "Compliment a classmate's shoes or style and walk away.", level: "Low Stakes" },
  { text: "Ask a stranger for the time in Hindi.", level: "Low Stakes" },
  { text: "Order coffee or a meal and ask the barista a question in English.", level: "Medium Stakes" },
  { text: "Ask someone one good question about themselves and actively listen for 2 minutes.", level: "Introvert Cheat Code" },
  { text: "Pause for a full 2 seconds and take a deep breath before answering a question.", level: "Internal Filter" },
  { text: "Hum a low resonance hum in the bathroom or car before meeting a group.", level: "Voice Presence" },
  { text: "Lower the Pedestal: Talk to someone you find intimidating as if they are a simple peer.", level: "Mindset Shift" }
];

export default function Personal() {
  const [selectedRoadmapCategory, setSelectedRoadmapCategory] = useState('All');
  const [activeWorkspaceRoadmapId, setActiveWorkspaceRoadmapId] = useState(null);
  const [inlineTaskTitles, setInlineTaskTitles] = useState({}); // { subGoalId: "New Task" }

  const goals = useGoalStore(s => s.goals);
  const tasks = useTaskStore(s => s.tasks);
  const calculateNodeProgress = useGoalStore(s => s.calculateNodeProgress);
  const roadmapStore = usePersonalRoadmapStore();

  const {
    isModalOpen,
    activeType,
    closeModal
  } = useEntityStore();

  const handleAdd = (type) => {
    useEntityStore.getState().openCreateModal(type);
  };

  // ROADMAP FILTERED DATA
  const filteredRoadmaps = useMemo(() => {
    if (selectedRoadmapCategory === 'All') return roadmapStore.roadmaps;
    return roadmapStore.roadmaps.filter(r => r.category === selectedRoadmapCategory);
  }, [roadmapStore.roadmaps, selectedRoadmapCategory]);

  const roadmapCategories = [
    'All',
    'Reading & Learning',
    'Voice & Breath Control',
    'Fighting & Confidence',
    'Writing & Creativity',
    'Singing & Instruments',
    'Social Confidence',
    'Style & Presentation',
    'Skincare & Haircare',
    'Nutrition & Sleep',
    'Creative Thinking',
    'Discipline & Baseline Reset'
  ];

  // TIMERS & WEB AUDIO STATES (for interactive mini-systems)
  const audioCtxRef = useRef(null);
  const [playingChord, setPlayingChord] = useState(null);
  const [droneVolume, setDroneVolume] = useState(0.3);
  
  // Voice breathing state
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale'); 
  const [breathProgress, setBreathProgress] = useState(0); 
  const breathIntervalRef = useRef(null);
  
  // Voice Hum Countdown
  const [humTimer, setHumTimer] = useState(180); // 3 mins
  const [humActive, setHumActive] = useState(false);
  const humIntervalRef = useRef(null);

  // Fighting Round Timer
  const [fightTimer, setFightTimer] = useState(300); // 5 mins
  const [fightActive, setFightActive] = useState(false);
  const [fightPrompt, setFightPrompt] = useState("Get in stance! Hands up by your face!");
  const fightIntervalRef = useRef(null);

  // Writing brain dump states
  const [draftDumpText, setDraftDumpText] = useState("");
  const [refinedDumpText, setRefinedDumpText] = useState("");
  const [draftDumpTitle, setDraftDumpTitle] = useState("");
  const [isTrimChallengeActive, setIsTrimChallengeActive] = useState(false);

  // Sleep shifting states
  const [currentBedInput, setCurrentBedInput] = useState("12:00 AM");
  const [targetBedInput, setTargetBedInput] = useState("09:00 PM");
  const [sleepPlan, setSleepPlan] = useState([]);

  // Reading logger inputs
  const [readingBook, setReadingBook] = useState("");
  const [readingChapter, setReadingChapter] = useState("");
  const [readingAction, setReadingAction] = useState("");

  // Social Challenge State
  const [activeSocialChallenge, setActiveSocialChallenge] = useState(null);

  // Skincare date tracking
  const [haircutDate, setHaircutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 12); 
    return d.toISOString().slice(0, 10);
  });

  // CLEANUP TIMERS ON UNMOUNT
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      if (humIntervalRef.current) clearInterval(humIntervalRef.current);
      if (fightIntervalRef.current) clearInterval(fightIntervalRef.current);
    };
  }, []);

  // SYNTH DRONE PLAYER
  const startPitchDrone = (chordName) => {
    try {
      if (playingChord === chordName) {
        stopPitchDrone();
        return;
      }
      stopPitchDrone();

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const freqs = CHORD_FREQS[chordName];
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(droneVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);

      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle'; 
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        oscGain.gain.setValueAtTime(0.12, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
      });

      setPlayingChord(chordName);
    } catch (e) {
      console.error("Audio Context failed", e);
    }
  };

  const stopPitchDrone = () => {
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setPlayingChord(null);
  };

  // Visual Breathing Loop (4s inhale, 4s hold, 4s exhale, 4s hold)
  const toggleBreathing = () => {
    if (breathingActive) {
      clearInterval(breathIntervalRef.current);
      setBreathingActive(false);
      setBreathProgress(0);
    } else {
      setBreathingActive(true);
      let timeElapsed = 0;
      let phase = 'Inhale';
      setBreathPhase('Inhale');

      breathIntervalRef.current = setInterval(() => {
        timeElapsed += 100;
        const progressPercent = Math.min(((timeElapsed % 4000) / 4000) * 100, 100);
        setBreathProgress(progressPercent);

        if (timeElapsed >= 16000) timeElapsed = 0;

        if (timeElapsed < 4000) {
          if (phase !== 'Inhale') { phase = 'Inhale'; setBreathPhase('Inhale'); }
        } else if (timeElapsed < 8000) {
          if (phase !== 'Hold') { phase = 'Hold'; setBreathPhase('Hold'); }
        } else if (timeElapsed < 12000) {
          if (phase !== 'Exhale') { phase = 'Exhale'; setBreathPhase('Exhale'); }
        } else {
          if (phase !== 'Hold2') { phase = 'Hold2'; setBreathPhase('Hold (Diaphragm Full)'); }
        }
      }, 100);
    }
  };

  // 3-Minute Voice Hum Timer
  const toggleHumTimer = () => {
    if (humActive) {
      clearInterval(humIntervalRef.current);
      setHumActive(false);
    } else {
      setHumActive(true);
      humIntervalRef.current = setInterval(() => {
        setHumTimer((prev) => {
          if (prev <= 1) {
            clearInterval(humIntervalRef.current);
            setHumActive(false);
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.frequency.setValueAtTime(440, ctx.currentTime);
              gain.gain.setValueAtTime(0.1, ctx.currentTime);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.8);
            } catch (e) {}
            return 180;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Fighting Round Timer
  const FIGHTING_PROMPTS = [
    "1-2 combo! (Jab, Cross!)",
    "Keep your hands high, protect your chin!",
    "Move your feet, circle to the left!",
    "Slip left, slip right! Keep head moving!",
    "Double jab, cross! Move out!",
    "1-2-1-2! Power combination!",
    "Focus on foot stance, square off shoulders!",
    "Meditation shadow boxing, breathe deeply!",
    "Hands up! Don't let them drop!"
  ];

  const toggleFightTimer = () => {
    if (fightActive) {
      clearInterval(fightIntervalRef.current);
      setFightActive(false);
    } else {
      setFightActive(true);
      fightIntervalRef.current = setInterval(() => {
        setFightTimer((prev) => {
          if (prev <= 1) {
            clearInterval(fightIntervalRef.current);
            setFightActive(false);
            setFightPrompt("Round Complete! Respect. Hands down.");
            return 300;
          }
          if (prev % 15 === 0) {
            const randomPrompt = FIGHTING_PROMPTS[Math.floor(Math.random() * FIGHTING_PROMPTS.length)];
            setFightPrompt(randomPrompt);
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Sleep Shift Plan Generator
  const handleGenerateSleepPlan = () => {
    const parseTime = (str) => {
      const match = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 720;
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const formatMinutes = (mins) => {
      let h = Math.floor(mins / 60);
      const m = mins % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      if (h === 0) h = 12;
      return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    const startMins = parseTime(currentBedInput);
    let targetMins = parseTime(targetBedInput);

    if (targetMins > startMins) {
      targetMins -= 24 * 60; 
    }

    const diff = startMins - targetMins;
    const intervalMins = 15;
    const cycles = Math.ceil(diff / intervalMins);

    const plan = [];
    let currentMins = startMins;

    for (let i = 0; i <= cycles; i++) {
      plan.push({
        phase: i + 1,
        title: `Bedtime Phase ${i + 1}`,
        time: formatMinutes(currentMins),
        dinnerTime: formatMinutes(currentMins - 4 * 60)
      });
      currentMins -= intervalMins;
    }
    setSleepPlan(plan);
  };

  // Roll Social Challenge
  const rollSocialChallenge = () => {
    const challenge = SOCIAL_CHALLENGES[Math.floor(Math.random() * SOCIAL_CHALLENGES.length)];
    setActiveSocialChallenge(challenge);
  };

  const currentRoadmap = useMemo(() => {
    if (!activeWorkspaceRoadmapId) return null;
    return roadmapStore.roadmaps.find(r => r.id === activeWorkspaceRoadmapId);
  }, [activeWorkspaceRoadmapId, roadmapStore.roadmaps]);

  // INLINE TASK CREATOR UNDER SUB-GOALS
  const handleAddSubGoalTask = async (e, subGoalId, category) => {
    e.preventDefault();
    const title = inlineTaskTitles[subGoalId];
    if (!title || !title.trim()) return;

    await useTaskStore.getState().createTask({
      title: title.trim(),
      description: `Task assigned to Personal Roadmap sub-goal`,
      completed: false,
      progress: 0,
      bucket: 'undefined',
      priority: 'medium',
      category: category,
      linkedGoalIds: [subGoalId]
    });

    setInlineTaskTitles(prev => ({ ...prev, [subGoalId]: "" }));
    
    // Refresh J.A.R.V.I.S. Goals
    await useGoalStore.getState().hydrate();
  };

  // TOGGLE SUB-GOAL COMPLETION DIRECTLY
  const handleToggleSubGoal = async (subGoal) => {
    const nextCompleted = !subGoal.completed;
    await useGoalStore.getState().updateGoal(subGoal.id, {
      completed: nextCompleted,
      progress: nextCompleted ? 100 : 0
    });
    await useGoalStore.getState().hydrate();
  };

  return (
    <ModulePageLayout
      title="Personal Evolution"
      subtitle="Identity & Self-Development Operating System"
    >
      
      <div className="space-y-6 animate-fadeIn">
        {/* CATEGORY FILTERS */}
        <div className="flex flex-wrap gap-2 py-1 border-b border-jarvis-border/40">
          {roadmapCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedRoadmapCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all ${
                setSelectedRoadmapCategory === cat
                  ? 'bg-jarvis-accent/15 border-jarvis-accent text-jarvis-accent shadow-lg shadow-jarvis-accent/5'
                  : 'bg-black/10 border-jarvis-border text-jarvis-muted hover:border-jarvis-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ROADMAP GRID */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredRoadmaps.length === 0 && (
            <div className="md:col-span-2 xl:col-span-3 flex flex-col items-center justify-center p-12 border border-jarvis-border/50 bg-black/10 rounded-2xl">
              <Compass className="h-10 w-10 text-jarvis-muted/40 mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-jarvis-muted">No operational roadmaps active in this filter.</p>
              <p className="text-xs text-jarvis-muted/60 mt-1">Click the primary Add button or adjust your filters.</p>
            </div>
          )}
          
          {filteredRoadmaps.map(roadmap => {
            // NATIVE TASK-DERIVED PROGRESS
            const roadmapGoal = goals.find(g => g.id === roadmap.id);
            const progress = roadmapGoal ? calculateNodeProgress(roadmap.id, goals, tasks) : 0;
            
            // Find active phase Objective
            const phaseObjectives = goals.filter(g => g.parentId === roadmap.id && g.type === 'objective');
            const activePhaseNode = phaseObjectives.find(p => {
              const subGoals = goals.filter(sg => sg.parentId === p.id && sg.type === 'sub_goal');
              return subGoals.some(sg => !sg.completed);
            }) || phaseObjectives[0];

            return (
              <div 
                key={roadmap.id}
                className="group relative rounded-2xl border border-jarvis-border bg-black/20 p-5 transition-all hover:border-jarvis-accent/40"
              >
                <div className="flex items-start justify-between">
                  <span className="rounded bg-jarvis-accent/10 border border-jarvis-accent/20 px-2 py-0.5 text-[10px] font-bold text-jarvis-accent uppercase tracking-wider">
                    {roadmap.category}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-jarvis-accent">{progress}% PROGRESS</span>
                </div>

                <h3 className="mt-3 text-base font-bold text-jarvis-text group-hover:text-jarvis-accent transition-colors">
                  {roadmap.title}
                </h3>
                <p className="mt-1 text-xs text-jarvis-muted line-clamp-2 leading-relaxed">
                  {roadmap.description}
                </p>

                {/* PROGRESS GRAPH */}
                <div className="mt-4 overflow-hidden rounded-full bg-jarvis-border/40 h-1.5">
                  <div 
                    className="bg-jarvis-accent h-full transition-all duration-700" 
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {activePhaseNode && (
                  <div className="mt-3 text-[10px] uppercase font-bold text-jarvis-muted flex items-center justify-between">
                    <span>ACTIVE TARGET:</span>
                    <span className="text-jarvis-text">{activePhaseNode.title}</span>
                  </div>
                )}

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => setActiveWorkspaceRoadmapId(roadmap.id)}
                    className="flex-1 rounded-xl bg-white/5 border border-jarvis-border py-2 px-3 text-center text-xs font-semibold text-jarvis-text hover:bg-jarvis-accent hover:text-jarvis-bg hover:border-jarvis-accent transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    Open Connected Workspace
                  </button>
                  <button
                    onClick={() => roadmapStore.deleteRoadmap(roadmap.id)}
                    className="p-2 border border-jarvis-border rounded-xl text-jarvis-muted hover:text-red-400 hover:border-red-400/40 transition"
                    title="Delete Roadmap"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* WORKSPACE DRAWER COCKPIT */}
        {activeWorkspaceRoadmapId && currentRoadmap && (() => {
          const roadmapGoal = goals.find(g => g.id === currentRoadmap.id);
          const progress = roadmapGoal ? calculateNodeProgress(currentRoadmap.id, goals, tasks) : 0;
          const phasesList = goals.filter(g => g.parentId === currentRoadmap.id && g.type === 'objective');

          return (
            <div className="mt-8 rounded-2xl border border-jarvis-accent/30 bg-black/45 p-6 backdrop-blur-md space-y-6 animate-fadeIn">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-jarvis-border/40 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-jarvis-accent/15 px-2 py-0.5 text-[10px] font-bold text-jarvis-accent uppercase tracking-wider">
                      {currentRoadmap.category}
                    </span>
                    <span className="text-xs text-jarvis-muted">Synced with Strategic Goal Tree</span>
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-jarvis-text flex items-center gap-2">
                    {currentRoadmap.title}
                    <span className="text-sm font-mono font-bold text-jarvis-accent">({progress}% NATIVE)</span>
                  </h2>
                  <p className="mt-1 text-sm text-jarvis-muted">{currentRoadmap.description}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveWorkspaceRoadmapId(null)}
                    className="rounded-xl border border-jarvis-border bg-white/5 px-4 py-2 text-xs font-semibold text-jarvis-text hover:bg-white/10"
                  >
                    Close Workspace
                  </button>
                </div>
              </div>

              {/* RULES BLOCK */}
              <div className="grid gap-4 md:grid-cols-3">
                {currentRoadmap.rule && (
                  <div className="rounded-xl border border-jarvis-accent/30 bg-jarvis-accent/5 p-4 md:col-span-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-jarvis-accent flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      THE MANDATORY RULE
                    </h4>
                    <p className="mt-2 text-sm font-semibold text-jarvis-text leading-relaxed">
                      {currentRoadmap.rule}
                    </p>
                  </div>
                )}
                
                {currentRoadmap.microDose && (
                  <div className="rounded-xl border border-jarvis-border bg-black/20 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-jarvis-muted flex items-center gap-2">
                      <Sparkle className="h-4 w-4 text-jarvis-accent" />
                      DAILY MICRO-DOSING
                    </h4>
                    <p className="mt-2 text-xs text-jarvis-muted leading-relaxed font-medium">
                      {currentRoadmap.microDose}
                    </p>
                  </div>
                )}
              </div>

              {currentRoadmap.example && (
                <div className="rounded-xl border border-jarvis-border bg-white/5 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-jarvis-accent flex items-center gap-2">
                    <Compass className="h-4 w-4" />
                    REAL-LIFE APPLICATION EXAMPLE
                  </h4>
                  <p className="mt-2 text-xs text-jarvis-muted leading-relaxed italic">
                    "{currentRoadmap.example}"
                  </p>
                </div>
              )}

              {/* TWO COLUMN COCKPIT PORTAL */}
              <div className="grid gap-6 lg:grid-cols-2 pt-2">
                
                {/* TIMELINE PHASES BIDIRECTIONAL STEP CHECKER */}
                <div className="space-y-4 rounded-xl border border-jarvis-border bg-black/20 p-5">
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-jarvis-muted flex items-center gap-2">
                    <Compass className="h-4 w-4 text-jarvis-accent" />
                    CONNECTED PHASES & NATIVE TO-DOS
                  </h4>
                  
                  <div className="space-y-4">
                    {phasesList.map((phase) => {
                      const phaseSubGoals = goals.filter(sg => sg.parentId === phase.id && sg.type === 'sub_goal');
                      const isCompleted = phaseSubGoals.length > 0 && phaseSubGoals.every(sg => sg.completed);

                      return (
                        <div 
                          key={phase.id}
                          className={`rounded-xl border p-4 transition ${
                            isCompleted ? 'border-jarvis-accent/40 bg-jarvis-accent/5' : 'border-jarvis-border/60 bg-black/10'
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-jarvis-border/20 pb-2 mb-3">
                            <h5 className={`text-xs uppercase tracking-wider font-bold ${isCompleted ? 'text-jarvis-accent' : 'text-jarvis-text'}`}>
                              {phase.title}
                            </h5>
                            {isCompleted && (
                              <span className="rounded bg-jarvis-accent/10 px-1.5 py-0.5 text-[9px] font-bold text-jarvis-accent uppercase">
                                PHASE COMPLETED
                              </span>
                            )}
                          </div>
                          
                          {/* ROADMAP STEPS (J.A.R.V.I.S. SUB-GOALS) */}
                          <div className="space-y-4">
                            {phaseSubGoals.map((subGoal) => {
                              // Fetch any child tasks linked directly to this Sub-Goal
                              const subGoalTasks = tasks.filter(t => (t.linkedGoalIds || []).includes(subGoal.id));
                              const completedTasksCount = subGoalTasks.filter(t => t.completed).length;
                              
                              // Check if subGoal is completed (either directly or derived from children tasks)
                              const subGoalProgress = subGoalTasks.length 
                                ? Math.round((completedTasksCount / subGoalTasks.length) * 100)
                                : (subGoal.completed ? 100 : 0);
                                
                              const isSubGoalDone = subGoalProgress === 100;

                              return (
                                <div key={subGoal.id} className="rounded-lg bg-white/5 border border-jarvis-border/40 p-3 space-y-2">
                                  
                                  {/* SUB-GOAL STEP HEADER */}
                                  <div className="flex items-center justify-between">
                                    <button
                                      onClick={() => handleToggleSubGoal(subGoal)}
                                      disabled={subGoalTasks.length > 0} // Disable direct check if tasks exist
                                      className="flex items-start gap-2.5 text-xs text-left hover:text-jarvis-accent transition font-semibold"
                                      title={subGoalTasks.length > 0 ? "Progress calculated from tasks below" : "Toggle completion"}
                                    >
                                      {isSubGoalDone ? (
                                        <CheckCircle2 className="h-4.5 w-4.5 text-jarvis-accent shrink-0" />
                                      ) : (
                                        <Circle className="h-4.5 w-4.5 text-jarvis-muted shrink-0" />
                                      )}
                                      <span className={isSubGoalDone ? 'line-through text-jarvis-muted/70' : 'text-jarvis-text/95'}>
                                        {subGoal.title}
                                      </span>
                                    </button>

                                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-jarvis-muted">
                                      <span>{subGoalProgress}%</span>
                                    </div>
                                  </div>

                                  {/* NESTED TASKS CHECKLIST (THE EXECUTION LAYER) */}
                                  {subGoalTasks.length > 0 && (
                                    <div className="pl-6 space-y-1.5 pt-1.5 border-t border-jarvis-border/10">
                                      <div className="text-[9px] font-bold uppercase tracking-wider text-jarvis-accent/75 flex items-center gap-1">
                                        <ListTodo className="h-2.5 w-2.5" />
                                        Task Execution
                                      </div>
                                      {subGoalTasks.map(task => (
                                        <div key={task.id} className="group/task flex items-center justify-between text-[11px] text-jarvis-muted hover:text-jarvis-text transition">
                                          <button
                                            onClick={() => useTaskStore.getState().toggleTaskCompletion(task.id)}
                                            className="flex items-center gap-2 text-left"
                                          >
                                            {task.completed ? (
                                              <CheckCircle2 className="h-3.5 w-3.5 text-jarvis-accent shrink-0" />
                                            ) : (
                                              <Circle className="h-3.5 w-3.5 text-jarvis-muted/50 shrink-0" />
                                            )}
                                            <span className={task.completed ? 'line-through text-jarvis-muted/60' : 'text-jarvis-text/80'}>
                                              {task.title}
                                            </span>
                                          </button>
                                          
                                          <button
                                            onClick={() => useTaskStore.getState().deleteTask(task.id)}
                                            className="opacity-0 group-hover/task:opacity-100 p-0.5 text-jarvis-muted hover:text-red-400 transition"
                                            title="Delete Task"
                                          >
                                            <Trash2 className="h-2.5 w-2.5" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* TASK DOCK CREATOR UNDER EACH STEP */}
                                  <form 
                                    onSubmit={(e) => handleAddSubGoalTask(e, subGoal.id, currentRoadmap.category)}
                                    className="flex gap-1.5 pl-6 pt-1.5 border-t border-jarvis-border/5"
                                  >
                                    <input
                                      className="flex-1 bg-black/35 border border-jarvis-border/30 rounded px-2 py-0.5 text-[10px] text-jarvis-text placeholder:text-jarvis-muted/60 focus:outline-none focus:border-jarvis-accent"
                                      placeholder="Add TO-DO task under this step..."
                                      value={inlineTaskTitles[subGoal.id] || ""}
                                      onChange={e => setInlineTaskTitles(prev => ({ ...prev, [subGoal.id]: e.target.value }))}
                                    />
                                    <button
                                      type="submit"
                                      className="bg-jarvis-accent/15 hover:bg-jarvis-accent/30 border border-jarvis-accent/30 text-jarvis-accent rounded px-2 py-0.5 text-[9px] font-bold transition"
                                    >
                                      + Task
                                    </button>
                                  </form>

                                </div>
                              );
                            })}

                            {phaseSubGoals.length === 0 && (
                              <p className="text-[11px] text-jarvis-muted italic">No step objectives established.</p>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* THE ACTIVE HABIT TRAINER WIDGET COMPONENT */}
                <div className="rounded-xl border border-jarvis-accent/25 bg-black/30 p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-jarvis-accent flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Evolution Trainer Widget
                  </h4>

                  {/* 1. READING SYSTEM */}
                  {currentRoadmap.id === 'goal-roadmap-reading' && (
                    <div className="space-y-4">
                      <div className="rounded bg-white/5 border border-jarvis-border p-3 space-y-2 text-xs">
                        <div className="flex items-center gap-1.5 text-jarvis-accent font-bold">
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>CHAPTER UNLOCK CONTEXT</span>
                        </div>
                        <p className="text-[11px] text-jarvis-muted italic">
                          "Forbidden from reading a new chapter until you have applied one specific thing to your real life."
                        </p>
                      </div>

                      <div className="space-y-3 pt-2">
                        <input
                          className="w-full bg-black/30 border border-jarvis-border rounded-lg px-3 py-2 text-xs text-jarvis-text placeholder:text-jarvis-muted focus:outline-none focus:border-jarvis-accent"
                          placeholder="Current Book Title (e.g. Atomic Habits)"
                          value={readingBook}
                          onChange={e => setReadingBook(e.target.value)}
                        />
                        <input
                          className="w-full bg-black/30 border border-jarvis-border rounded-lg px-3 py-2 text-xs text-jarvis-text placeholder:text-jarvis-muted focus:outline-none focus:border-jarvis-accent"
                          placeholder="Chapter Number/Name (e.g. Chapter 2: Identity)"
                          value={readingChapter}
                          onChange={e => setReadingChapter(e.target.value)}
                        />
                        <textarea
                          className="w-full bg-black/30 border border-jarvis-border rounded-lg px-3 py-2 text-xs text-jarvis-text placeholder:text-jarvis-muted focus:outline-none focus:border-jarvis-accent"
                          placeholder="Specific action applied in your real life..."
                          rows={3}
                          value={readingAction}
                          onChange={e => setReadingAction(e.target.value)}
                        />
                        <button
                          onClick={async () => {
                            if (!readingBook || !readingChapter || !readingAction) return;
                            await roadmapStore.addCustomLog('goal-roadmap-reading', 'appliedActions', {
                              book: readingBook,
                              chapter: readingChapter,
                              action: readingAction
                            });
                            setReadingAction("");
                            setReadingChapter("");
                          }}
                          className="w-full bg-jarvis-accent hover:bg-jarvis-accent/80 text-jarvis-bg font-bold py-2 rounded-lg text-xs transition"
                        >
                          Log Real-Life Application
                        </button>
                      </div>

                      {/* Log output */}
                      <div className="space-y-2 pt-2 border-t border-jarvis-border/20">
                        <p className="text-[10px] uppercase font-bold text-jarvis-muted">Application History</p>
                        <div className="max-h-[160px] overflow-y-auto space-y-2">
                          {(currentRoadmap.customLogs?.appliedActions || []).length === 0 && (
                            <p className="text-[11px] text-jarvis-muted italic">No applied actions logged yet.</p>
                          )}
                          {(currentRoadmap.customLogs?.appliedActions || []).map((log, i) => (
                            <div key={log.id || i} className="bg-white/5 border border-jarvis-border/50 rounded-lg p-2.5 space-y-1">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-jarvis-accent font-bold uppercase">{log.book} - {log.chapter}</span>
                                <span className="text-jarvis-muted">{new Date(log.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs text-jarvis-text italic">"Applied: {log.action}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. VOICE & BREATH CONTROL */}
                  {currentRoadmap.id === 'goal-roadmap-voice' && (
                    <div className="space-y-5">
                      {/* Visual breath circle */}
                      <div className="flex flex-col items-center justify-center py-4 bg-white/5 rounded-xl border border-jarvis-border">
                        <div className="text-[10px] uppercase font-bold text-jarvis-muted tracking-widest mb-3">Diaphragm Alignment</div>
                        
                        <div 
                          className="relative flex items-center justify-center rounded-full bg-jarvis-accent/15 border-2 border-jarvis-accent shadow-2xl transition-all duration-300"
                          style={{
                            width: breathingActive ? (breathPhase === 'Inhale' ? '120px' : breathPhase === 'Hold' ? '140px' : '90px') : '100px',
                            height: breathingActive ? (breathPhase === 'Inhale' ? '120px' : breathPhase === 'Hold' ? '140px' : '90px') : '100px',
                            transform: breathingActive && breathPhase === 'Hold' ? 'scale(1.1)' : 'scale(1)'
                          }}
                        >
                          <span className="text-xs font-extrabold text-jarvis-accent">{breathPhase}</span>
                          {breathingActive && (
                            <div 
                              className="absolute inset-0 rounded-full border border-jarvis-accent/30 animate-ping"
                              style={{ animationDuration: '3s' }}
                            />
                          )}
                        </div>

                        <div className="mt-4 flex gap-3 text-xs">
                          <button
                            onClick={toggleBreathing}
                            className="bg-jarvis-accent/10 border border-jarvis-accent px-4 py-1.5 rounded-lg text-jarvis-accent font-bold hover:bg-jarvis-accent hover:text-jarvis-bg transition"
                          >
                            {breathingActive ? 'Stop Breath Coach' : 'Start Diaphragm Cycle'}
                          </button>
                        </div>
                      </div>

                      {/* Hum Timer */}
                      <div className="bg-white/5 border border-jarvis-border rounded-xl p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-jarvis-accent flex items-center gap-1.5">
                            <Mic2 className="h-3.5 w-3.5" />
                            Resonance Hum Practice
                          </div>
                          <p className="text-[10px] text-jarvis-muted">Hum low low "Mmmmm" note for 3 minutes.</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-base font-bold text-jarvis-text">
                            {Math.floor(humTimer / 60)}:{(humTimer % 60).toString().padStart(2, '0')}
                          </span>
                          <button
                            onClick={toggleHumTimer}
                            className="p-2 border border-jarvis-border hover:bg-white/5 rounded-lg text-jarvis-text transition"
                          >
                            {humActive ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. FIGHTING SYSTEM */}
                  {currentRoadmap.id === 'goal-roadmap-fighting' && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-jarvis-border bg-white/5 p-4 text-center space-y-3">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-jarvis-accent">
                          🥋 SHADOWBOXING 5-MIN ROUND TRAINER
                        </div>

                        <div className="text-3xl font-mono font-extrabold text-jarvis-text">
                          {Math.floor(fightTimer / 60)}:{(fightTimer % 60).toString().padStart(2, '0')}
                        </div>

                        <div className="rounded bg-black/40 border border-jarvis-border p-3 min-h-[50px] flex items-center justify-center">
                          <p className="text-xs font-semibold text-jarvis-accent animate-pulse leading-relaxed">
                            {fightPrompt}
                          </p>
                        </div>

                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={toggleFightTimer}
                            className="bg-jarvis-accent text-jarvis-bg font-bold py-1.5 px-4 rounded-lg text-xs hover:bg-jarvis-accent/80 transition"
                          >
                            {fightActive ? 'Pause Round' : 'Start Boxing Round'}
                          </button>
                          <button
                            onClick={() => {
                              clearInterval(fightIntervalRef.current);
                              setFightActive(false);
                              setFightTimer(300);
                              setFightPrompt("Round reset. Get in boxing stance.");
                            }}
                            className="bg-white/5 border border-jarvis-border font-bold py-1.5 px-3 rounded-lg text-xs hover:bg-white/10 transition"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      {/* Stance details */}
                      <div className="bg-white/5 border border-jarvis-border rounded-xl p-3.5 space-y-2 text-xs">
                        <div className="font-bold text-jarvis-text flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-jarvis-accent" />
                          Boxing Foundation reference
                        </div>
                        <ul className="space-y-1 text-jarvis-muted list-disc list-inside text-[11px]">
                          <li>Stance: Hands up by cheekbones, elbows tucked, chin down.</li>
                          <li>Footwork: Back heel elevated. Never cross your feet.</li>
                          <li>1-2: Jab (lead arm straight), Cross (rotate back hip/heel).</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* 4. WRITING & CREATIVITY */}
                  {currentRoadmap.id === 'goal-roadmap-writing' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <input
                          className="w-full bg-black/30 border border-jarvis-border rounded-lg px-3 py-2 text-xs text-jarvis-text placeholder:text-jarvis-muted focus:outline-none"
                          placeholder="Brain Dump Title (e.g. Awkward Encounter at College)"
                          value={draftDumpTitle}
                          onChange={e => setDraftDumpTitle(e.target.value)}
                        />
                        <textarea
                          className="w-full bg-black/30 border border-jarvis-border rounded-lg px-3 py-2 text-xs text-jarvis-text placeholder:text-jarvis-muted focus:outline-none"
                          placeholder="Dump your chaotic thoughts, strong feelings, or cool poetry lines..."
                          rows={4}
                          value={draftDumpText}
                          onChange={e => setDraftDumpText(e.target.value)}
                        />
                        <div className="flex justify-between items-center text-[10px] text-jarvis-muted">
                          <span>Word Count: {draftDumpText ? draftDumpText.split(/\s+/).filter(Boolean).length : 0}</span>
                          {draftDumpText && (
                            <button
                              onClick={() => {
                                setRefinedDumpText(draftDumpText);
                                setIsTrimChallengeActive(true);
                              }}
                              className="text-jarvis-accent font-bold hover:underline flex items-center gap-1"
                            >
                              <Scissors className="h-3 w-3" />
                              Start 50% Word Trim Challenge
                            </button>
                          )}
                        </div>
                      </div>

                      {isTrimChallengeActive && (
                        <div className="border border-jarvis-accent/30 bg-jarvis-accent/5 rounded-xl p-3.5 space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-jarvis-accent">Trim Challenge Workspace</span>
                            <span className="font-mono font-bold">
                              Goal: &lt;{Math.round(draftDumpText.split(/\s+/).filter(Boolean).length * 0.5)} words (Current: {refinedDumpText.split(/\s+/).filter(Boolean).length})
                            </span>
                          </div>
                          <textarea
                            className="w-full bg-black/45 border border-jarvis-accent/30 rounded-lg px-3 py-2 text-xs text-jarvis-text focus:outline-none focus:border-jarvis-accent"
                            placeholder="Edit and cut down the text to be short, punchy, rhyming, or structured..."
                            rows={4}
                            value={refinedDumpText}
                            onChange={e => setRefinedDumpText(e.target.value)}
                          />
                          <button
                            onClick={async () => {
                              await roadmapStore.addCustomLog('goal-roadmap-writing', 'brainDumps', {
                                title: draftDumpTitle || 'Untitled brain dump',
                                text: draftDumpText,
                                trimmedText: refinedDumpText
                              });
                              setDraftDumpTitle("");
                              setDraftDumpText("");
                              setRefinedDumpText("");
                              setIsTrimChallengeActive(false);
                            }}
                            className="w-full bg-jarvis-accent hover:bg-jarvis-accent/80 text-jarvis-bg font-bold py-1.5 rounded-lg text-xs transition"
                          >
                            Save Trimmed Output!
                          </button>
                        </div>
                      )}

                      {/* Log lists */}
                      <div className="space-y-2 pt-2 border-t border-jarvis-border/20">
                        <p className="text-[10px] uppercase font-bold text-jarvis-muted">Refined Writings</p>
                        <div className="max-h-[140px] overflow-y-auto space-y-2">
                          {(currentRoadmap.customLogs?.brainDumps || []).length === 0 && (
                            <p className="text-[11px] text-jarvis-muted italic">No drafts saved.</p>
                          )}
                          {(currentRoadmap.customLogs?.brainDumps || []).map((log, i) => (
                            <div key={log.id || i} className="bg-white/5 border border-jarvis-border/50 rounded-lg p-2.5 text-xs">
                              <div className="flex justify-between items-center text-[10px] font-bold text-jarvis-accent">
                                <span>{log.title}</span>
                                <span className="text-jarvis-muted">{new Date(log.date).toLocaleDateString()}</span>
                              </div>
                              <p className="mt-1 text-jarvis-muted text-[11px] line-clamp-1 italic">"Raw: {log.text}"</p>
                              {log.trimmedText && (
                                <p className="mt-1 text-jarvis-text font-medium text-[11px]">"Trimmed: {log.trimmedText}"</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. INSTRUMENTS & SINGING */}
                  {currentRoadmap.id === 'goal-roadmap-music' && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-jarvis-border bg-white/5 p-4 space-y-4 text-center">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-jarvis-accent">
                          🎸 VOCAL PITCH-MATCHING DRONE
                        </div>
                        <p className="text-[11px] text-jarvis-muted">
                          Play a warm drone chord fundamental, let it ring, match pitch with "Laaaaa", and rate accuracy.
                        </p>

                        <div className="grid grid-cols-4 gap-2">
                          {['G', 'C', 'D', 'Em'].map((chord) => (
                            <button
                              key={chord}
                              onClick={() => startPitchDrone(chord)}
                              className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                                playingChord === chord
                                  ? 'bg-jarvis-accent text-jarvis-bg border-jarvis-accent animate-pulse shadow-md shadow-jarvis-accent/20'
                                  : 'bg-white/5 border-jarvis-border text-jarvis-text hover:border-jarvis-muted'
                              }`}
                            >
                              {chord} Chord
                            </button>
                          ))}
                        </div>

                        {playingChord && (
                          <div className="flex items-center gap-3 justify-center pt-2">
                            <span className="text-xs text-jarvis-muted">Drone Volume:</span>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={droneVolume}
                              onChange={(e) => {
                                const v = parseFloat(e.target.value);
                                setDroneVolume(v);
                              }}
                              className="h-1.5 bg-jarvis-border rounded-lg appearance-none cursor-pointer accent-jarvis-accent"
                            />
                            <button
                              onClick={stopPitchDrone}
                              className="p-1 text-red-400 hover:bg-white/5 rounded"
                            >
                              <VolumeX className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                        {playingChord && (
                          <div className="pt-3 border-t border-jarvis-border/20 space-y-2">
                            <div className="text-[10px] uppercase text-jarvis-muted font-bold">Rate Pitch Match Accuracy</div>
                            <div className="flex justify-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={async () => {
                                    await roadmapStore.addCustomLog('goal-roadmap-music', 'pitchMatches', {
                                      chord: playingChord,
                                      successRating: star
                                    });
                                    stopPitchDrone();
                                  }}
                                  className="text-jarvis-muted hover:text-jarvis-accent transition-colors"
                                >
                                  <Star className="h-5 w-5 fill-current hover:fill-jarvis-accent" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Log history */}
                      <div className="space-y-2 pt-2 border-t border-jarvis-border/20">
                        <p className="text-[10px] uppercase font-bold text-jarvis-muted">Pitch Drone History</p>
                        <div className="max-h-[140px] overflow-y-auto space-y-2">
                          {(currentRoadmap.customLogs?.pitchMatches || []).length === 0 && (
                            <p className="text-[11px] text-jarvis-muted italic">No pitch matches logged.</p>
                          )}
                          {(currentRoadmap.customLogs?.pitchMatches || []).map((log, i) => (
                            <div key={log.id || i} className="bg-white/5 border border-jarvis-border/50 rounded-lg p-2 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-jarvis-accent">{log.chord} Chord</span> Match
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-jarvis-text">{log.successRating}/5 Rating</span>
                                <span className="text-[10px] text-jarvis-muted">{new Date(log.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 6. SOCIAL CONFIDENCE */}
                  {currentRoadmap.id === 'goal-roadmap-social' && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-jarvis-border bg-white/5 p-4 text-center space-y-4">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-jarvis-accent">
                          🤝 DESENSITIZATION CHALLENGE GENERATOR
                        </div>
                        <p className="text-[11px] text-jarvis-muted">
                          Spin standard low-stakes social tasks to construct confidence.
                        </p>

                        <button
                          onClick={rollSocialChallenge}
                          className="bg-jarvis-accent text-jarvis-bg font-bold py-2 px-5 rounded-xl text-xs hover:bg-jarvis-accent/80 transition flex items-center gap-1.5 mx-auto"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Roll Daily Challenge
                        </button>

                        {activeSocialChallenge && (
                          <div className="border border-jarvis-accent/30 bg-jarvis-accent/5 rounded-xl p-4 space-y-3 transition-all animate-scaleUp">
                            <span className="rounded bg-jarvis-accent/20 px-2 py-0.5 text-[9px] font-bold text-jarvis-accent uppercase">
                              {activeSocialChallenge.level}
                            </span>
                            <p className="text-sm text-jarvis-text font-bold leading-relaxed">
                              "{activeSocialChallenge.text}"
                            </p>
                            <button
                              onClick={async () => {
                                await roadmapStore.addCustomLog('goal-roadmap-social', 'socialChallenges', {
                                  challenge: activeSocialChallenge.text,
                                  outcome: 'Completed and lowered the pedestal!'
                                });
                                setActiveSocialChallenge(null);
                              }}
                              className="bg-white/10 hover:bg-white/20 border border-jarvis-border text-jarvis-text font-bold py-1.5 px-4 rounded-lg text-xs transition"
                            >
                              I Finished This Challenge!
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Log details */}
                      <div className="space-y-2 pt-2 border-t border-jarvis-border/20">
                        <p className="text-[10px] uppercase font-bold text-jarvis-muted">Completed Courage Logs</p>
                        <div className="max-h-[140px] overflow-y-auto space-y-2">
                          {(currentRoadmap.customLogs?.socialChallenges || []).length === 0 && (
                            <p className="text-[11px] text-jarvis-muted italic">No social challenges logged yet.</p>
                          )}
                          {(currentRoadmap.customLogs?.socialChallenges || []).map((log, i) => (
                            <div key={log.id || i} className="bg-white/5 border border-jarvis-border/50 rounded-lg p-2.5 text-xs">
                              <div className="flex justify-between items-center text-[10px] text-jarvis-accent font-bold">
                                <span>COURAGE CHECKOFF</span>
                                <span className="text-jarvis-muted">{new Date(log.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-jarvis-text italic">"Challenge: {log.challenge}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 7. STYLE & PRESENTATION */}
                  {currentRoadmap.id === 'goal-roadmap-style' && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-jarvis-border bg-white/5 p-4 space-y-3 text-xs">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-jarvis-accent">
                          👔 DAILY STYLE RULES CHECKLIST
                        </div>

                        <div className="space-y-2 pt-1.5">
                          <div className="flex items-start gap-2.5">
                            <input type="checkbox" className="h-4 w-4 mt-0.5 accent-jarvis-accent" defaultChecked />
                            <div>
                              <p className="font-bold text-jarvis-text">Sizing</p>
                              <p className="text-[11px] text-jarvis-muted">Fits perfectly on shoulders/chest, loose on midsection.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <input type="checkbox" className="h-4 w-4 mt-0.5 accent-jarvis-accent" defaultChecked />
                            <div>
                              <p className="font-bold text-jarvis-text">Layering</p>
                              <p className="text-[11px] text-jarvis-muted">Open flannel, jacket, or overshirt over solid tee.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <input type="checkbox" className="h-4 w-4 mt-0.5 accent-jarvis-accent" defaultChecked />
                            <div>
                              <p className="font-bold text-jarvis-text">Bottoms</p>
                              <p className="text-[11px] text-jarvis-muted">Straight-leg or athletic-fit jeans (no skinny jeans).</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <input
                          className="w-full bg-black/30 border border-jarvis-border rounded-lg px-3 py-2 text-xs text-jarvis-text focus:outline-none"
                          placeholder="Outfit description (e.g. Green flannel, black tee, athletic jeans)"
                          id="style-outfit-desc"
                        />
                        <button
                          onClick={async () => {
                            const input = document.getElementById('style-outfit-desc');
                            if (!input || !input.value) return;
                            await roadmapStore.addCustomLog('goal-roadmap-style', 'styleLogs', {
                              outfitDescription: input.value,
                              confidenceRating: 10
                            });
                            input.value = "";
                          }}
                          className="w-full bg-jarvis-accent hover:bg-jarvis-accent/80 text-jarvis-bg font-bold py-2 rounded-lg text-xs transition"
                        >
                          Log Daily Dress Confidence
                        </button>
                      </div>

                      {/* Log history */}
                      <div className="space-y-2 pt-2 border-t border-jarvis-border/20">
                        <p className="text-[10px] uppercase font-bold text-jarvis-muted">Style dressing history</p>
                        <div className="max-h-[120px] overflow-y-auto space-y-2">
                          {(currentRoadmap.customLogs?.styleLogs || []).length === 0 && (
                            <p className="text-[11px] text-jarvis-muted italic">No style outfits logged.</p>
                          )}
                          {(currentRoadmap.customLogs?.styleLogs || []).map((log, i) => (
                            <div key={log.id || i} className="bg-white/5 border border-jarvis-border/50 rounded-lg p-2 text-xs flex justify-between items-center">
                              <div>Outfit: <span className="font-semibold text-jarvis-text">{log.outfitDescription}</span></div>
                              <span className="text-[10px] text-jarvis-muted">{new Date(log.date).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 8. SKINCARE & HAIRCARE */}
                  {currentRoadmap.id === 'goal-roadmap-skincare' && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-jarvis-border bg-white/5 p-4 space-y-3 text-xs">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-jarvis-accent">
                          🧼 CLEANSE & HAIR UPKEEP TRACKER
                        </div>

                        <div className="space-y-2 pt-1 border-t border-jarvis-border/10">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="h-4 w-4 accent-jarvis-accent" />
                            <span>Morning Skincare (Cleanser + Sunscreen + Moisturizer)</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="h-4 w-4 accent-jarvis-accent" />
                            <span>Night Skincare (Cleanser + Moisturizer)</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="h-4 w-4 accent-jarvis-accent" />
                            <span>Hair Conditioner Applied (Wash Day)</span>
                          </label>
                        </div>

                        <div className="pt-2 border-t border-jarvis-border/10 space-y-1">
                          <div className="flex justify-between font-bold text-jarvis-text">
                            <span>Haircut Alarm Status</span>
                            <span className="text-jarvis-accent">Every 3-4 Weeks</span>
                          </div>
                          <div className="flex gap-2 items-center">
                            <span className="text-jarvis-muted text-[11px]">Last haircut:</span>
                            <input
                              type="date"
                              className="bg-black/30 border border-jarvis-border rounded px-2 py-0.5 text-xs text-jarvis-text"
                              value={haircutDate}
                              onChange={e => setHaircutDate(e.target.value)}
                            />
                          </div>
                          <p className="text-[10px] text-jarvis-muted pt-1">
                            {Math.max(0, 25 - Math.round((new Date() - new Date(haircutDate)) / (1000 * 60 * 60 * 24)))} days left until clean trim is due!
                          </p>
                        </div>

                        <button
                          onClick={async () => {
                            await roadmapStore.addCustomLog('goal-roadmap-skincare', 'skincareLogs', {
                              status: 'Grooming completed!'
                            });
                          }}
                          className="w-full bg-jarvis-accent text-jarvis-bg font-bold py-1.5 rounded-lg text-xs hover:bg-jarvis-accent/80 transition"
                        >
                          Log Daily Grooming Routine Done
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 9. NUTRITION & SLEEP SYSTEM */}
                  {currentRoadmap.id === 'goal-roadmap-sleep' && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-jarvis-border bg-white/5 p-4 space-y-3 text-xs">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-jarvis-accent">
                          🌙 Bedtime Shift Calculator
                        </div>
                        <p className="text-[11px] text-jarvis-muted leading-relaxed">
                          To shift from 12 AM to 5 AM wakes, shift bedroom bedtime backward by 15-30 minutes every few days.
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          <label className="block space-y-1">
                            <span className="text-[10px] text-jarvis-muted uppercase font-bold">Current Bedtime</span>
                            <input
                              className="w-full bg-black/30 border border-jarvis-border rounded px-2 py-1 text-xs text-jarvis-text"
                              value={currentBedInput}
                              onChange={e => setCurrentBedInput(e.target.value)}
                            />
                          </label>
                          <label className="block space-y-1">
                            <span className="text-[10px] text-jarvis-muted uppercase font-bold">Target Bedtime</span>
                            <input
                              className="w-full bg-black/30 border border-jarvis-border rounded px-2 py-1 text-xs text-jarvis-text"
                              value={targetBedInput}
                              onChange={e => setTargetBedInput(e.target.value)}
                            />
                          </label>
                        </div>

                        <button
                          onClick={handleGenerateSleepPlan}
                          className="w-full bg-jarvis-accent text-jarvis-bg font-bold py-1.5 rounded-lg text-xs hover:bg-jarvis-accent/80 transition"
                        >
                          Generate Shift Schedule
                        </button>

                        {sleepPlan.length > 0 && (
                          <div className="pt-2 border-t border-jarvis-border/20 space-y-2">
                            <span className="font-bold text-jarvis-accent text-[11px] uppercase tracking-wider">Shifting Progress Steps</span>
                            <div className="max-h-[150px] overflow-y-auto space-y-1.5">
                              {sleepPlan.map((step) => (
                                <div key={step.phase} className="flex justify-between items-center bg-black/40 border border-jarvis-border/50 p-2 rounded">
                                  <div>
                                    <p className="font-bold text-jarvis-text text-[11px]">{step.title}</p>
                                    <p className="text-[9px] text-jarvis-accent uppercase">Finish Dinner by: {step.dinnerTime}</p>
                                  </div>
                                  <button
                                    onClick={async () => {
                                      await roadmapStore.addCustomLog('goal-roadmap-sleep', 'sleepLogs', {
                                        bedtime: step.time,
                                        waketime: '5:00 AM'
                                      });
                                      setSleepPlan([]);
                                    }}
                                    className="rounded border border-jarvis-accent text-jarvis-accent hover:bg-jarvis-accent hover:text-jarvis-bg py-0.5 px-2 text-[9px] font-extrabold transition-all"
                                  >
                                    Hit {step.time}!
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Log history */}
                      <div className="space-y-2 pt-2 border-t border-jarvis-border/20">
                        <p className="text-[10px] uppercase font-bold text-jarvis-muted">Early Sleep Success Log</p>
                        <div className="max-h-[120px] overflow-y-auto space-y-2">
                          {(currentRoadmap.customLogs?.sleepLogs || []).length === 0 && (
                            <p className="text-[11px] text-jarvis-muted italic">No sleep shifts logged.</p>
                          )}
                          {(currentRoadmap.customLogs?.sleepLogs || []).map((log, i) => (
                            <div key={log.id || i} className="bg-white/5 border border-jarvis-border/50 rounded-lg p-2 text-xs flex justify-between items-center">
                              <div>Bedtime: <span className="font-semibold text-jarvis-accent">{log.bedtime}</span></div>
                              <span className="text-[10px] text-jarvis-muted">{new Date(log.date).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          );
        })()}

        {/* ROADMAP CREATION TRIGGER BUTTON */}
        <div className="flex justify-end pt-4">
          <button
            onClick={() => handleAdd('personalRoadmap')}
            className="flex items-center gap-2 rounded-xl bg-jarvis-accent text-jarvis-bg px-4 py-2.5 text-xs font-bold hover:bg-jarvis-accent/80 transition-all shadow-md shadow-jarvis-accent/15"
          >
            <Plus className="h-4 w-4" />
            Create Custom Personal Roadmap
          </button>
        </div>
      </div>

      {/* POPUP ENTITY FORMS */}
      <EntityModal
        isOpen={isModalOpen && activeType === 'personalRoadmap'}
        onClose={closeModal}
        title="Add Custom Personal Roadmap"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const title = e.target.title.value;
            const category = e.target.category.value;
            const parentId = e.target.parentId.value;
            const desc = e.target.description.value;
            const rule = e.target.rule.value;
            const micro = e.target.microDose.value;
            const example = e.target.example.value;
            
            if (!title) return;
            
            await roadmapStore.addRoadmap({
              title,
              category,
              parentId,
              description: desc,
              rule,
              microDose: micro,
              example
            });
            closeModal();
          }}
          className="space-y-4"
        >
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wide text-jarvis-muted">Roadmap Title</span>
            <input
              name="title"
              required
              className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-accent"
              placeholder="e.g. Creative Public Speaking Mastery"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-jarvis-muted">Category Area</span>
              <select
                name="category"
                required
                className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-accent"
              >
                {roadmapCategories.slice(1).map(c => (
                  <option key={c} value={c} className="bg-jarvis-panel">{c}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-jarvis-muted">Parent Main Goal / Area</span>
              <select
                name="parentId"
                required
                className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-accent"
              >
                {(() => {
                  const areas = goals.filter(g => g.type === 'area');
                  const items = [];
                  areas.forEach(area => {
                    items.push({ id: area.id, title: `[Area] ${area.title}` });
                    const childGoals = goals.filter(g => g.parentId === area.id && g.type === 'goal');
                    childGoals.forEach(goal => {
                      items.push({ id: goal.id, title: `  └─ [Goal] ${goal.title}` });
                    });
                  });
                  return items.map(item => (
                    <option key={item.id} value={item.id} className="bg-jarvis-panel text-jarvis-text">
                      {item.title}
                    </option>
                  ));
                })()}
              </select>
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wide text-jarvis-muted">Description</span>
            <textarea
              name="description"
              required
              rows={2}
              className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-accent"
              placeholder="Core focus and targets..."
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wide text-jarvis-muted">The Mandatory Rule</span>
            <textarea
              name="rule"
              required
              rows={2}
              className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-accent"
              placeholder="e.g. Forbidden to move forward without logging X action..."
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wide text-jarvis-muted">Micro-Dose Frequency</span>
            <input
              name="microDose"
              required
              className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-accent"
              placeholder="e.g. Do 5 minutes shadowboxing daily"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wide text-jarvis-muted">Example Action / Real-Life Application</span>
            <textarea
              name="example"
              required
              rows={2}
              className="w-full rounded-lg border border-jarvis-border bg-black/25 px-3 py-2 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-accent"
              placeholder="e.g. Stop reading after the chapter and put your phone in another room..."
            />
          </label>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-jarvis-border/20">
            <button
              type="button"
              onClick={closeModal}
              className="rounded border border-jarvis-border px-3 py-1.5 text-xs text-jarvis-muted transition hover:text-jarvis-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-jarvis-accent text-jarvis-bg px-4 py-1.5 text-xs font-bold hover:bg-jarvis-accent/90"
            >
              Create Connected Roadmap
            </button>
          </div>
        </form>
      </EntityModal>

    </ModulePageLayout>
  );
}
