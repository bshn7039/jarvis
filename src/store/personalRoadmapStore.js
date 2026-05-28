import { create } from 'zustand';
import { personalRoadmapService } from '../database/services/personalRoadmapService';
import { useActivityStore } from './activityStore';

const SEED_BLUEPRINTS = [
  {
    goalId: 'goal-roadmap-reading',
    parentId: 'area-7', // Personal Evolution
    category: 'Reading & Learning',
    title: 'Reading & Learning: The "One Action" Rule',
    description: 'Treat self-development books as instruction manuals instead of novels.',
    phases: [
      {
        objectiveId: 'obj-reading-p1',
        title: 'Phase 1: Environment Setup',
        steps: [
          { subGoalId: 'sub-reading-p1-s1', text: 'Set your book in an obvious, visible place (e.g. bedside table or desk)' },
          { text: 'Remove distraction triggers (e.g. put phone in another room while reading)', subGoalId: 'sub-reading-p1-s2' }
        ]
      },
      {
        objectiveId: 'obj-reading-p2',
        title: 'Phase 2: Execution & Application',
        steps: [
          { subGoalId: 'sub-reading-p2-s3', text: 'Read exactly 5 pages of your selected book today' },
          { subGoalId: 'sub-reading-p2-s4', text: 'Identify one action item from the chapter' },
          { subGoalId: 'sub-reading-p2-s5', text: 'Apply the action item to real life before turning the page' }
        ]
      }
    ]
  },
  {
    goalId: 'goal-roadmap-voice',
    parentId: 'area-3', // Communication
    category: 'Voice & Breath Control',
    title: 'Voice & Breath Control: The Deep Default',
    description: 'Shift voice power down to your diaphragm and find low chest resonance to speak confidently.',
    phases: [
      {
        objectiveId: 'obj-voice-p1',
        title: 'Phase 1: Diaphragm Alignment',
        steps: [
          { subGoalId: 'sub-voice-p1-s1', text: 'Lie flat on your back and place a heavy book on your stomach (Floor Test)' },
          { subGoalId: 'sub-voice-p1-s2', text: 'Breathe in so the book rises, not your chest' }
        ]
      },
      {
        objectiveId: 'obj-voice-p2',
        title: 'Phase 2: Resonance & Vocal Weight',
        steps: [
          { subGoalId: 'sub-voice-p2-s3', text: 'Morning Resonance Hum: Hum low "Mmmmm" for 3 minutes' },
          { subGoalId: 'sub-voice-p2-s4', text: 'Vocal Padding: Imagine touching the wall behind the listener with your voice' },
          { subGoalId: 'sub-voice-p2-s5', text: 'Slow down speaking speed deliberately by 10%' }
        ]
      },
      {
        objectiveId: 'obj-voice-p3',
        title: 'Phase 3: Real World Integration',
        steps: [
          { subGoalId: 'sub-voice-p3-s6', text: 'Sing in the car/shower holding deep stomach notes' },
          { subGoalId: 'sub-voice-p3-s7', text: 'Project confidently from the stomach in high-stakes conversations' }
        ]
      }
    ]
  },
  {
    goalId: 'goal-roadmap-fighting',
    parentId: 'area-3', // Communication / Confidence
    category: 'Fighting & Confidence',
    title: 'Fighting (Confidence Booster & Physical Anchor)',
    description: 'Knowing you can throw a punch changes how you walk into a room. Learn stance, striking, and defense.',
    phases: [
      {
        objectiveId: 'obj-fighting-p1',
        title: 'Phase 1: The Solo Start (At Home)',
        steps: [
          { subGoalId: 'sub-fighting-p1-s1', text: 'Look up basic boxing stance and simple "1-2" (jab, cross) on YouTube' },
          { subGoalId: 'sub-fighting-p1-s2', text: 'Practice shadowboxing 5 mins a day in front of a mirror (hands up, move feet)' }
        ]
      },
      {
        objectiveId: 'obj-fighting-p2',
        title: 'Phase 2: Gym Integration',
        steps: [
          { subGoalId: 'sub-fighting-p2-s3', text: 'Find a local boxing, kickboxing, or MMA gym near you' },
          { subGoalId: 'sub-fighting-p2-s4', text: 'Commit to going a couple of days a week for basic stance, defense, and striking' }
        ]
      }
    ]
  },
  {
    goalId: 'goal-roadmap-writing',
    parentId: 'area-4', // Creative Skills
    category: 'Writing & Creativity',
    title: 'Writing, Poetry & Video Editing (The Output)',
    description: 'Organize chaotic thoughts into clear sentences, prune lyrics, and master video pacing.',
    phases: [
      {
        objectiveId: 'obj-writing-p1',
        title: 'Phase 1: Raw Output & The Brain Dump',
        steps: [
          { subGoalId: 'sub-writing-p1-s1', text: 'Dump strong feelings, awkward situations, or cool ideas immediately in phone' },
          { subGoalId: 'sub-writing-p1-s2', text: 'Edit your phone notes: cut words by half, try to rhyme (poetry/lyrics)' }
        ]
      },
      {
        objectiveId: 'obj-writing-p2',
        title: 'Phase 2: Video Flow & Pacing',
        steps: [
          { subGoalId: 'sub-writing-p2-s3', text: 'Shoot a 5-min walk/talk video' },
          { subGoalId: 'sub-writing-p2-s4', text: 'Challenge yourself to cut it to exactly 30s of pure value' }
        ]
      }
    ]
  },
  {
    goalId: 'goal-roadmap-music',
    parentId: 'area-4', // Creative Skills
    category: 'Singing & Instruments',
    title: 'Instruments (Guitar/Flute) & Singing',
    description: 'Learn G-C-D-Em chords, match pitch with singing, and master flute breath control.',
    phases: [
      {
        objectiveId: 'obj-music-p1',
        title: 'Phase 1: Guitar Chord Foundations',
        steps: [
          { subGoalId: 'sub-music-p1-s1', text: 'Learn G and C basic chords on guitar' },
          { subGoalId: 'sub-music-p1-s2', text: 'Learn D and E minor basic chords on guitar' }
        ]
      },
      {
        objectiveId: 'obj-music-p2',
        title: 'Phase 2: Ear Training & Pitch Matching',
        steps: [
          { subGoalId: 'sub-music-p2-s3', text: 'Strum a single chord, let it ring, and match pitch with "Laaaaa"' }
        ]
      },
      {
        objectiveId: 'obj-music-p3',
        title: 'Phase 3: Breath Control (Flute)',
        steps: [
          { subGoalId: 'sub-music-p3-s4', text: 'Spend 2 weeks learning to blow across the flute hole to get a clean sound without getting dizzy' }
        ]
      }
    ]
  },
  {
    goalId: 'goal-roadmap-social',
    parentId: 'area-3', // Communication / Social Confidence
    category: 'Social Confidence',
    title: 'Social Confidence & Desensitization',
    description: 'Overcome anxiety around strangers, lower the pedestal, and practice low-stakes desensitization.',
    phases: [
      {
        objectiveId: 'obj-social-p1',
        title: 'Phase 1: Internal Filter & Vocabulary Engine',
        steps: [
          { subGoalId: 'sub-social-p1-s1', text: 'The 2-Second Rule: Take a visible calm breath before answering questions' },
          { subGoalId: 'sub-social-p1-s2', text: 'Shadow Speaking: pick a topic, explain it out loud to an empty room in English/Hindi (5 mins)' },
          { subGoalId: 'sub-social-p1-s3', text: 'Read Aloud: spend 10 mins a day reading a book or article out loud in English' }
        ]
      },
      {
        objectiveId: 'obj-social-p2',
        title: 'Phase 2: Desensitization & Social Confidence',
        steps: [
          { subGoalId: 'sub-social-p2-s4', text: 'Lower the Pedestal: treat everyone like an engineering student trying to get by' },
          { subGoalId: 'sub-social-p2-s5', text: 'Low-Stakes Interaction: ask stranger for time in Hindi' },
          { subGoalId: 'sub-social-p2-s6', text: 'Low-Stakes Interaction: ask barista a question in English' },
          { subGoalId: 'sub-social-p2-s7', text: 'Low-Stakes Interaction: compliment a classmate\'s shoes and walk away' },
          { subGoalId: 'sub-social-p2-s8', text: 'Introvert\'s Cheat Code: ask one good question about them and just listen' }
        ]
      },
      {
        objectiveId: 'obj-social-p3',
        title: 'Phase 3: The Professional & Digital Persona',
        steps: [
          { subGoalId: 'sub-social-p3-s9', text: 'Document, Don\'t Create: Set up LinkedIn and Twitter profiles' },
          { subGoalId: 'sub-social-p3-s10', text: 'Write short posts documenting your B.Tech transition, Java learnings, or JARVIS system' },
          { subGoalId: 'sub-social-p3-s11', text: 'Write journal entries in English to organize chaotic thoughts' }
        ]
      }
    ]
  },
  {
    goalId: 'goal-roadmap-style',
    parentId: 'area-7', // Personal Evolution
    category: 'Style & Presentation',
    title: 'Style & Presentation (Dressing the Current Frame)',
    description: 'Buy clothes that fit perfectly on chest but drape slightly loose around stomach, and adopt flannels/overshirts.',
    phases: [
      {
        objectiveId: 'obj-style-p1',
        title: 'Phase 1: Sizing & Wardrobe Refresh',
        steps: [
          { subGoalId: 'sub-style-p1-s1', text: 'Identify shirts that fit perfectly on shoulders/chest but are loose around midsection' },
          { subGoalId: 'sub-style-p1-s2', text: 'Buy a few straight-leg or athletic-fit jeans/trousers (avoid skinny jeans)' }
        ]
      },
      {
        objectiveId: 'obj-style-p2',
        title: 'Phase 2: Layering & Daily Presentation',
        steps: [
          { subGoalId: 'sub-style-p2-s3', text: 'Adopt layering: open overshirt, flannel, or light jacket over a solid t-shirt' },
          { subGoalId: 'sub-style-p2-s4', text: 'Walk out dressed in a way that makes you feel confident and sharp' }
        ]
      }
    ]
  },
  {
    goalId: 'goal-roadmap-skincare',
    parentId: 'area-7', // Personal Evolution
    category: 'Skincare & Haircare',
    title: 'Skincare & Haircare (Immediate Upgrades)',
    description: 'Build simple skin cleansing habits (Cleanser/Moisturizer/Sunscreen) and clean haircut routines.',
    phases: [
      {
        objectiveId: 'obj-skincare-p1',
        title: 'Phase 1: Basic Skincare Habits',
        steps: [
          { subGoalId: 'sub-skincare-p1-s1', text: 'Acquire a basic gentle facial cleanser, moisturizer, and sunscreen' },
          { subGoalId: 'sub-skincare-p1-s2', text: 'Wash face with cleanser morning and night' },
          { subGoalId: 'sub-skincare-p1-s3', text: 'Apply sunscreen every morning before going out' }
        ]
      },
      {
        objectiveId: 'obj-skincare-p2',
        title: 'Phase 2: Haircare & Grooming Discipline',
        steps: [
          { subGoalId: 'sub-skincare-p2-s4', text: 'Find a shampoo fitting your hair type and a conditioner' },
          { subGoalId: 'sub-skincare-p2-s5', text: 'Schedule a haircut every 3-4 weeks to keep the sides clean' }
        ]
      }
    ]
  },
  {
    goalId: 'goal-roadmap-sleep',
    parentId: 'area-7', // Personal Evolution
    category: 'Nutrition & Sleep',
    title: 'Nutrition & Sleep System (The Engine)',
    description: 'Shift bedtime to 9:00 PM - 5:00 AM by 15-minute increments and apply 7:30 PM dinner rules.',
    phases: [
      {
        objectiveId: 'obj-sleep-p1',
        title: 'Phase 1: Meal Tracking & The Dinner Rule',
        steps: [
          { subGoalId: 'sub-sleep-p1-s1', text: 'Start logging what you eat for a few days without changing anything' },
          { subGoalId: 'sub-sleep-p1-s2', text: 'Set dinner limit: Finish eating by 7:00 PM or 7:30 PM' }
        ]
      },
      {
        objectiveId: 'obj-sleep-p2',
        title: 'Phase 2: Sleep Bedtime Shift',
        steps: [
          { subGoalId: 'sub-sleep-p2-s3', text: 'Determine current sleep timing and shift bedtime earlier by 15-30 mins' },
          { subGoalId: 'sub-sleep-p2-s4', text: 'Maintain consistent 9:00 PM to 5:00 AM sleep schedule once reached' }
        ]
      },
      {
        objectiveId: 'obj-sleep-p3',
        title: 'Phase 3: Nutritional Substitution',
        steps: [
          { subGoalId: 'sub-sleep-p3-s5', text: 'Start making healthy substitutions (low sugar, low oil)' },
          { subGoalId: 'sub-sleep-p3-s6', text: 'Cook for yourself to control portions and ingredients' }
        ]
      }
    ]
  }
];

const SEED_ROADMAPS_METADATA = SEED_BLUEPRINTS.map(b => ({
  id: b.goalId,
  category: b.category,
  title: b.title,
  description: b.description,
  rule: b.goalId === 'goal-roadmap-reading' ? 'You are forbidden from reading a new chapter until you have applied one specific thing from the previous chapter to your real life.' :
        b.goalId === 'goal-roadmap-voice' ? 'Breathing from the diaphragm, low resonance note agreements, and projecting your voice to "touch" the wall behind the listener.' :
        b.goalId === 'goal-roadmap-fighting' ? 'The Solo Start: basic boxing stance and "1-2" (jab, cross) combo. Gym Integration: local boxing/kickboxing/MMA gym for basic defense.' :
        b.goalId === 'goal-roadmap-writing' ? 'The Brain Dump: Whenever you have a strong emotion, awkward encounter, or cool thought, dump it into your phone. Later, edit it (rhyme, cut half the words to make it hit harder).' :
        b.goalId === 'goal-roadmap-music' ? 'Month 1 Guitar: G, C, D, E minor. Match pitch with G/C/D/Em chord. Flute: breath control meditation.' :
        b.goalId === 'goal-roadmap-social' ? 'Phase 1: 2-Second rule + Shadow speaking + Read aloud. Phase 2: Lower the pedestal + Low stakes interactions. Phase 3: Document B.Tech on LinkedIn/Twitter.' :
        b.goalId === 'goal-roadmap-style' ? 'Avoid overly tight or massive baggy clothes. Use open overshirt/flannel/jacket layering. Avoid skinny jeans; use straight-leg/athletic-fit.' :
        b.goalId === 'goal-roadmap-skincare' ? 'Face: Cleanser (morning and night) + Moisturizer + Sunscreen (day). Hair: Shampoo + Conditioner + regular cuts.' :
        'Sleep Shifting: Bedtime shifted back by 15-30 minutes every few days. The Dinner Rule: Finish dinner by 7 PM or 7:30 PM. Cooking for yourself is a superpower.',
  example: b.goalId === 'goal-roadmap-reading' ? 'You read Atomic Habits about "Environment Design." Stop reading. Go disable your YouTube Shorts or set your guitar on its stand. Once that action is taken, you earn the right to read the next chapter.' :
           b.goalId === 'goal-roadmap-voice' ? 'Lie flat on floor with heavy book on stomach (Floor Test). Hum low low Low note before starting the day. Slow speed by 10%.' :
           b.goalId === 'goal-roadmap-fighting' ? 'Before gym: Look up boxing stance and jab-cross on YouTube. Spend 5 mins shadowboxing in front of a mirror focusing on keeping hands up and moving feet.' :
           b.goalId === 'goal-roadmap-writing' ? 'For video: take a 5-minute video of walking/talking, cut it down to exactly 30 seconds of only the best parts.' :
           b.goalId === 'goal-roadmap-music' ? 'Strum one chord, let it ring out, and try to match that exact pitch with your voice: "Laaaaa." Just hold it. Week 1 flute: blow across the hole to make a clean sound without getting dizzy.' :
           b.goalId === 'goal-roadmap-social' ? 'Pause 2 seconds before speaking. Shadow speak aloud to an empty room. Ask a stranger for the time in Hindi, ask barista in English, compliment shoes and walk away.' :
           b.goalId === 'goal-roadmap-style' ? 'An open overshirt or flannel over a solid-colored t-shirt squares off shoulders and hides stomach weight.' :
           b.goalId === 'goal-roadmap-skincare' ? 'Wash face in morning, apply moisturizer and sunscreen. Wash face at night, apply moisturizer. Cut sides of hair every 3-4 weeks.' :
           'Log everything you eat. If bedtime is currently 12 AM, shift to 11:45 PM for a few days, then 11:30 PM, until hitting 9 PM.',
  microDose: b.goalId === 'goal-roadmap-reading' ? 'Read just 5 pages a day. Do not try to read for an hour. Consistency beats volume.' :
             b.goalId === 'goal-roadmap-voice' ? 'Morning Resonance Hum: Hum low Low note for 3 minutes. Project your voice physically to the wall behind the listener. Deliberate 10% speaking slow-down.' :
             b.goalId === 'goal-roadmap-fighting' ? 'Shadowbox for 5 minutes in front of a mirror daily.' :
             b.goalId === 'goal-roadmap-writing' ? 'Refine 1 brain dump entry. Practice cutting video down to 30s to learn pacing/storytelling.' :
             b.goalId === 'goal-roadmap-music' ? 'Strum and hum pitch for 5 minutes. Practice flute breathing for 5 minutes.' :
             b.goalId === 'goal-roadmap-social' ? 'Pause 2 seconds before speaking. Actively shadow speak for 5 minutes. Read aloud for 10 minutes.' :
             b.goalId === 'goal-roadmap-style' ? 'Mindset: Don\'t wait until you lose weight to dress well. Dress sharp today to build immediate confidence.' :
             b.goalId === 'goal-roadmap-skincare' ? 'Wash face morning/night. Wear sunscreen daily. Get a haircut every 3-4 weeks.' :
             'Finish dinner by 7:30 PM. Log meals. Shift bedtime by 15 mins if shifting.',
  customLogs: {
    appliedActions: [],
    breathingSessions: [],
    ideaDrills: [],
    brainDumps: [],
    pitchMatches: [],
    shadowboxSessions: [],
    socialChallenges: [],
    styleLogs: [],
    skincareLogs: [],
    sleepLogs: [],
    currentBedtime: '12:00 AM',
    targetBedtime: '09:00 PM'
  },
  active: true
}));

export const usePersonalRoadmapStore = create((set, get) => ({
  roadmaps: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      let dbRoadmaps = await personalRoadmapService.getRoadmaps();
      if (!dbRoadmaps || dbRoadmaps.length === 0) {
        console.log('[Roadmap Store] Seeding default metadata...');
        const savedPromises = SEED_ROADMAPS_METADATA.map(async (r) => {
          return personalRoadmapService.saveRoadmap(r);
        });
        dbRoadmaps = await Promise.all(savedPromises);
      }
      set({ roadmaps: dbRoadmaps, isHydrated: true });
      
      // Sync Goals and Sub-Goals into J.A.R.V.I.S. Goals system
      await get().preSeedIntoJarvis();
    } catch (err) {
      console.error('Failed to hydrate personal roadmaps:', err);
    }
  },

  preSeedIntoJarvis: async () => {
    try {
      const { useGoalStore } = await import('./goalStore');
      const { useTaskStore } = await import('./taskStore');

      const goalStore = useGoalStore.getState();
      const taskStore = useTaskStore.getState();

      if (!goalStore.isHydrated || !taskStore.isHydrated) {
        setTimeout(() => get().preSeedIntoJarvis(), 200);
        return;
      }

      const currentGoals = goalStore.goals;
      const currentTasks = taskStore.tasks;

      console.log('[Roadmap Store] Fusing Blueprints as native Goals, Objectives, and Sub-Goals...');

      let goalUpdated = false;
      let taskUpdated = false;

      // 1. Clean up old legacy task-steps to avoid cluttering J.A.R.V.I.S.
      const oldTaskPrefixes = ['task-reading-', 'task-voice-', 'task-fighting-', 'task-writing-', 'task-music-', 'task-social-', 'task-style-', 'task-skincare-', 'task-sleep-'];
      const tasksToClean = currentTasks.filter(t => oldTaskPrefixes.some(prefix => t.id.startsWith(prefix)));
      if (tasksToClean.length > 0) {
        console.log(`[Roadmap Store] Cleaning up ${tasksToClean.length} legacy task-steps...`);
        for (const t of tasksToClean) {
          await taskStore.deleteTask(t.id);
        }
        taskUpdated = true;
      }

      for (const blueprint of SEED_BLUEPRINTS) {
        // 2. Sync Main Goal
        const mainGoalExists = currentGoals.some(g => g.id === blueprint.goalId);
        if (!mainGoalExists) {
          await goalStore.addGoal({
            id: blueprint.goalId,
            parentId: blueprint.parentId,
            type: 'goal',
            title: blueprint.title,
            description: blueprint.description,
            progress: 0,
            completed: false,
            linkedTaskIds: []
          });
          goalUpdated = true;
        }

        // 3. Sync Phase (Objective)
        for (const phase of blueprint.phases) {
          const objectiveExists = currentGoals.some(g => g.id === phase.objectiveId);
          if (!objectiveExists) {
            await goalStore.addGoal({
              id: phase.objectiveId,
              parentId: blueprint.goalId,
              type: 'objective',
              title: phase.title,
              description: `Objective phase under ${blueprint.title}`,
              progress: 0,
              completed: false,
              linkedTaskIds: []
            });
            goalUpdated = true;
          }

          // 4. Sync Phase Step (Sub-Goal instead of Task)
          for (const step of phase.steps) {
            const subGoalExists = currentGoals.some(g => g.id === step.subGoalId);
            if (!subGoalExists) {
              await goalStore.addGoal({
                id: step.subGoalId,
                parentId: phase.objectiveId,
                type: 'sub_goal',
                title: step.text,
                description: `Action step under ${phase.title}`,
                progress: 0,
                completed: false,
                linkedTaskIds: []
              });
              goalUpdated = true;
            }
          }
        }
      }

      if (goalUpdated) await goalStore.hydrate();
      if (taskUpdated) await taskStore.refreshFromDb();
      
      console.log('[Roadmap Store] Native Goals hierarchy sync verified.');
    } catch (e) {
      console.error('Failed to sync blueprint goals:', e);
    }
  },

  addRoadmap: async (data) => {
    const goalId = `goal-roadmap-${Date.now()}`;
    const next = {
      id: goalId,
      category: data.category || 'Reading & Learning',
      title: data.title || 'New Roadmap',
      description: data.description || '',
      rule: data.rule || '',
      example: data.example || '',
      microDose: data.microDose || '',
      customLogs: data.customLogs || {},
      active: true
    };
    
    // Save metadata
    const saved = await personalRoadmapService.saveRoadmap(next);
    set((state) => ({ roadmaps: [saved, ...state.roadmaps] }));

    // Create Goals structure in J.A.R.V.I.S.
    try {
      const { useGoalStore } = await import('./goalStore');
      const goalStore = useGoalStore.getState();

      let parentAreaId = 'area-7';
      if (data.category?.includes('Communication') || data.category?.includes('Voice') || data.category?.includes('Fighting')) parentAreaId = 'area-3';
      else if (data.category?.includes('Writing') || data.category?.includes('Music') || data.category?.includes('Singing')) parentAreaId = 'area-4';

      await goalStore.addGoal({
        id: goalId,
        parentId: parentAreaId,
        type: 'goal',
        title: data.title,
        description: data.description,
        progress: 0,
        completed: false,
        linkedTaskIds: []
      });

      // Create Phase Objective
      const objectiveId = `obj-custom-${Date.now()}`;
      await goalStore.addGoal({
        id: objectiveId,
        parentId: goalId,
        type: 'objective',
        title: 'Phase 1: Foundations',
        description: `Custom phase objective`,
        progress: 0,
        completed: false,
        linkedTaskIds: []
      });

      // Create Phase Step Sub-Goal
      const subGoalId = `sub-custom-${Date.now()}`;
      await goalStore.addGoal({
        id: subGoalId,
        parentId: objectiveId,
        type: 'sub_goal',
        title: 'Kickstart this roadmap',
        description: `Apply the rule and initiate`,
        progress: 0,
        completed: false,
        linkedTaskIds: []
      });

      await goalStore.hydrate();
    } catch(e) {
      console.error('Failed to create custom roadmap goals', e);
    }

    await useActivityStore.getState().logActivity({
      type: 'personal',
      action: 'created',
      entityType: 'personalRoadmap',
      entityId: saved.id,
      metadata: { title: saved.title, category: saved.category }
    });
    return saved;
  },

  updateRoadmap: async (id, updates) => {
    const updated = await personalRoadmapService.updateRoadmap(id, updates);
    if (updated) {
      set((state) => ({
        roadmaps: state.roadmaps.map((r) => (r.id === id ? updated : r))
      }));
    }
  },

  deleteRoadmap: async (id) => {
    await personalRoadmapService.delete(id);
    set((state) => ({
      roadmaps: state.roadmaps.filter((r) => r.id !== id)
    }));

    try {
      const { useGoalStore } = await import('./goalStore');
      await useGoalStore.getState().deleteGoal(id);
    } catch (e) {}
  },

  addCustomLog: async (roadmapId, logKey, logEntry) => {
    const roadmap = get().roadmaps.find((r) => r.id === roadmapId);
    if (!roadmap) return;

    const customLogs = JSON.parse(JSON.stringify(roadmap.customLogs || {}));
    if (!customLogs[logKey]) customLogs[logKey] = [];
    customLogs[logKey].unshift({
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
      ...logEntry
    });

    await get().updateRoadmap(roadmapId, { customLogs });
  },

  updateCustomLogFields: async (roadmapId, fields) => {
    const roadmap = get().roadmaps.find((r) => r.id === roadmapId);
    if (!roadmap) return;

    const customLogs = {
      ...(roadmap.customLogs || {}),
      ...fields
    };

    await get().updateRoadmap(roadmapId, { customLogs });
  }
}));
