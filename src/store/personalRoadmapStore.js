import { create } from 'zustand';
import { personalRoadmapService } from '../database/services/personalRoadmapService';
import { useActivityStore } from './activityStore';

const SEED_BLUEPRINTS = [
  {
    goalId: 'goal-roadmap-reading',
    parentId: 'area-7', // Personal Evolution
    category: 'Reading & Learning',
    title: 'Reading & Learning: The "One Action" Rule',
    description: 'You bought the exact right books (Atomic Habits, Deep Work, Psychology of Money), but you treated them like novels instead of instruction manuals.',
    phases: [
      {
        objectiveId: 'obj-reading-p1',
        title: 'Phase 1: Environment Setup',
        steps: [
          { subGoalId: 'sub-reading-p1-s1', text: 'Set your book in an obvious, visible place (e.g. bedside table or desk)' },
          { subGoalId: 'sub-reading-p1-s2', text: 'Remove distraction triggers (e.g. put phone in another room while reading)' }
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
    description: 'Your voice sounds thin when you breathe from your chest and shoulders. We want to drop the power down to your stomach (your diaphragm). Hum low resonance notes to find your chest vibration and slow down speaking pace deliberately.',
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
    parentId: 'area-3', // Confidence
    category: 'Fighting & Confidence',
    title: 'Fighting (Confidence Booster & Physical Anchor)',
    description: 'Knowing you can throw a punch changes how you walk into a room. Build confidence, defense, and striking.',
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
    description: "Real writing doesn't happen on the first try. Writing forces chaotic thoughts into clean, structured sentences.",
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
    description: 'Since you are a total rookie, the goal is just to make some noise, train your ear, and have fun.',
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
    parentId: 'area-3', // Social Confidence
    category: 'Social Confidence',
    title: 'Social Confidence & Desensitization',
    description: "Overcome high anxiety around unfamiliar girls, adults, and groups. Lower the pedestal, practice low-stakes interactions, and use the introvert's cheat code (ask and listen).",
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
          { subGoalId: 'sub-social-p2-s7', text: "compliment a classmate's shoes and walk away" },
          { subGoalId: 'sub-social-p2-s8', text: "Introvert's Cheat Code: ask one good question about them and just listen" }
        ]
      },
      {
        objectiveId: 'obj-social-p3',
        title: 'Phase 3: The Professional & Digital Persona',
        steps: [
          { subGoalId: 'sub-social-p3-s9', text: "Document, Don't Create: Set up LinkedIn and Twitter profiles" },
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
    description: 'At 5\'10" and 80kg, you have a solid frame. Go for clothes that fit perfectly on the shoulders and chest, but drape slightly loose around the midsection.',
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
    description: 'Keep it simple so you actually stick to it. Cleanser, moisturizer, sunscreen, and regular cuts.',
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
    description: 'Your sleep and diet goals are heavily connected. Shift your bedtime to 9 PM-5 AM and finish dinner by 7:30 PM.',
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
  },
  {
    goalId: 'goal-roadmap-creative',
    parentId: 'area-4', // Creative Skills
    category: 'Creative Thinking',
    title: 'Creative Thinking: The Idea Muscle',
    description: 'To be creative—whether writing code, proposing cool projects, or being witty in conversation—you need good inputs and forced outputs.',
    phases: [
      {
        objectiveId: 'obj-creative-p1',
        title: 'Phase 1: Input & Capture',
        steps: [
          { subGoalId: 'sub-creative-p1-s1', text: 'Write down 3 weird or interesting ideas daily in your notebook' },
          { subGoalId: 'sub-creative-p1-s2', text: 'Read or consume high-quality essays, designs, or code repositories for 15 minutes' }
        ]
      }
    ]
  },
  {
    goalId: 'goal-roadmap-discipline',
    parentId: 'area-6', // Productivity & Discipline
    category: 'Discipline & Baseline Reset',
    title: 'The Operating System: Discipline & Baseline Reset',
    description: 'Fix momentum over motivation, break the dopamine traps (PMO, daydreaming), adopt fitness as a physical anchor, and execute the daily non-negotiable 3.',
    phases: [
      {
        objectiveId: 'obj-discipline-p1',
        title: 'Phase 1: Fixing the "Start" (Momentum over Motivation)',
        steps: [
          { subGoalId: 'sub-discipline-p1-s1', text: 'The 5-Minute Contract: Open the IDE or book for exactly 5 minutes without studying obligation.' },
          { subGoalId: 'sub-discipline-p1-s2', text: 'Calibrate the Rewards: Tie personal rewards strictly to the end of the day.' }
        ]
      },
      {
        objectiveId: 'obj-discipline-p2',
        title: 'Phase 2: Breaking the Dopamine Trap',
        steps: [
          { subGoalId: 'sub-discipline-p2-s3', text: 'Identify the Trigger: Note down what bored/tired states trigger PMO/wasted loops.' },
          { subGoalId: 'sub-discipline-p2-s4', text: 'The Circuit Breaker: Physically change environment/do 10 pushups when loop triggers.' },
          { subGoalId: 'sub-discipline-p2-s5', text: 'Neutralize the Daydreaming: Direct romantic/aesthetic frustrations into building yourself up.' }
        ]
      },
      {
        objectiveId: 'obj-discipline-p3',
        title: 'Phase 3: The Physical Anchor',
        steps: [
          { subGoalId: 'sub-discipline-p3-s6', text: 'Reframing Fitness: Use gym as the ultimate direct feedback training ground for consistency.' },
          { subGoalId: 'sub-discipline-p3-s7', text: 'The Spillover Effect: Build self-trust by working out so confidence spreads to coding/social.' }
        ]
      },
      {
        objectiveId: 'obj-discipline-p4',
        title: 'Phase 4: Simple Execution (The Daily 3)',
        steps: [
          { subGoalId: 'sub-discipline-p4-s8', text: 'The Night Before: Avoid micro-schedules; define exactly 3 non-negotiable tasks.' },
          { subGoalId: 'sub-discipline-p4-s9', text: 'The Target: Write down the 3 non-negotiables on a physical paper.' },
          { subGoalId: 'sub-discipline-p4-s10', text: 'Execution: Wake up and execute the 3 non-negotiables first to win the day.' }
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
        b.goalId === 'goal-roadmap-sleep' ? 'Sleep Shifting: Bedtime shifted back by 15-30 minutes every few days. The Dinner Rule: Finish dinner by 7 PM or 7:30 PM. Cooking for yourself is a superpower.' :
        b.goalId === 'goal-roadmap-creative' ? 'Establish a routine for high-quality inputs (reading, visual feeds) and forced output drafts daily.' :
        'Momentum over motivation: 5-minute contract to start. Break PMO/daydreaming circuit. Fitness is the ultimate consistency metric.',
  example: b.goalId === 'goal-roadmap-reading' ? 'You read Atomic Habits about "Environment Design." Stop reading. Go disable your YouTube Shorts or set your guitar on its stand. Once that action is taken, you earn the right to read the next chapter.' :
           b.goalId === 'goal-roadmap-voice' ? 'Lie flat on floor with heavy book on stomach (Floor Test). Hum low low Low note before starting the day. Slow speed by 10%.' :
           b.goalId === 'goal-roadmap-fighting' ? 'Before gym: Look up boxing stance and jab-cross on YouTube. Spend 5 mins shadowboxing in front of a mirror focusing on keeping hands up and moving feet.' :
           b.goalId === 'goal-roadmap-writing' ? 'For video: take a 5-minute video of walking/talking, cut it down to exactly 30 seconds of only the best parts.' :
           b.goalId === 'goal-roadmap-music' ? 'Strum one chord, let it ring out, and try to match that exact pitch with your voice: "Laaaaa." Just hold it. Week 1 flute: blow across the hole to make a clean sound without getting dizzy.' :
           b.goalId === 'goal-roadmap-social' ? 'Pause 2 seconds before speaking. Shadow speak aloud to an empty room. Ask a stranger for the time in Hindi, ask barista in English, compliment shoes and walk away.' :
           b.goalId === 'goal-roadmap-style' ? 'An open overshirt or flannel over a solid-colored t-shirt squares off shoulders and hides stomach weight.' :
           b.goalId === 'goal-roadmap-skincare' ? 'Wash face in morning, apply moisturizer and sunscreen. Wash face at night, apply moisturizer. Cut sides of hair every 3-4 weeks.' :
           b.goalId === 'goal-roadmap-sleep' ? 'Log everything you eat. If bedtime is currently 12 AM, shift to 11:45 PM for a few days, then 11:30 PM, until hitting 9 PM.' :
           b.goalId === 'goal-roadmap-creative' ? 'Sit down and write 10 ideas about a single simple prompt (e.g. 10 app ideas, 10 lyrics, 10 ways to style flannels).' :
           'Whenever the urge to browse PMO or waste time daydreaming hits, immediately close the laptop, walk out, drink cold water, or drop for 10 pushups.',
  microDose: b.goalId === 'goal-roadmap-reading' ? 'Read just 5 pages a day. Do not try to read for an hour. Consistency beats volume.' :
             b.goalId === 'goal-roadmap-voice' ? 'Morning Resonance Hum: Hum low Low note for 3 minutes. Project your voice physically to the wall behind the listener. Deliberate 10% speaking slow-down.' :
             b.goalId === 'goal-roadmap-fighting' ? 'Shadowbox for 5 minutes in front of a mirror daily.' :
             b.goalId === 'goal-roadmap-writing' ? 'Refine 1 brain dump entry. Practice cutting video down to 30s to learn pacing/storytelling.' :
             b.goalId === 'goal-roadmap-music' ? 'Strum and hum pitch for 5 minutes. Practice flute breathing for 5 minutes.' :
             b.goalId === 'goal-roadmap-social' ? 'Pause 2 seconds before speaking. Actively shadow speak for 5 minutes. Read aloud for 10 minutes.' :
             b.goalId === 'goal-roadmap-style' ? 'Mindset: Don\'t wait until you lose weight to dress well. Dress sharp today to build immediate confidence.' :
             b.goalId === 'goal-roadmap-skincare' ? 'Wash face morning/night. Wear sunscreen daily. Get a haircut every 3-4 weeks.' :
             b.goalId === 'goal-roadmap-sleep' ? 'Finish dinner by 7:30 PM. Log meals. Shift bedtime by 15 mins if shifting.' :
             b.goalId === 'goal-roadmap-creative' ? 'Input: Read a design essay or technical article for 10 mins. Output: Jot down 3 ideas in Jarvis.' :
             'Use the 5-minute transition contract. Clear daily 3 non-negotiables. Tie rewards strictly to the end of the day.',
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
      const dbRoadmaps = await personalRoadmapService.getRoadmaps();
      
      // Deduplicate: Keep one roadmap per category, preferring the copy that has custom logs
      const uniqueCategoryMap = new Map();
      const idsToDelete = [];
      
      const sortedRoadmaps = [...dbRoadmaps].sort((a, b) => {
        const aLogsCount = Object.values(a.customLogs || {}).flat().length;
        const bLogsCount = Object.values(b.customLogs || {}).flat().length;
        return bLogsCount - aLogsCount;
      });
      
      const keptRoadmaps = [];
      
      for (const r of sortedRoadmaps) {
        const key = r.category.toLowerCase().trim();
        if (uniqueCategoryMap.has(key)) {
          idsToDelete.push(r.id);
        } else {
          uniqueCategoryMap.set(key, r);
          keptRoadmaps.push(r);
        }
      }
      
      // Delete duplicates
      if (idsToDelete.length > 0) {
        console.log(`[Roadmap Store] Deduplicating, deleting ${idsToDelete.length} duplicates...`);
        for (const id of idsToDelete) {
          await personalRoadmapService.delete(id);
          try {
            const { useGoalStore } = await import('./goalStore');
            await useGoalStore.getState().deleteGoal(id);
          } catch (e) {}
        }
      }

      // Check for and add any missing seed roadmaps
      let dbRoadmapsFinal = [...keptRoadmaps];
      const missingSeeds = SEED_ROADMAPS_METADATA.filter(seed => {
        const key = seed.category.toLowerCase().trim();
        return !uniqueCategoryMap.has(key);
      });
      
      if (missingSeeds.length > 0) {
        console.log(`[Roadmap Store] Seeding ${missingSeeds.length} missing roadmaps...`);
        const savedPromises = missingSeeds.map(async (r) => {
          return personalRoadmapService.saveRoadmap(r);
        });
        const newlySaved = await Promise.all(savedPromises);
        dbRoadmapsFinal = [...dbRoadmapsFinal, ...newlySaved];
      }
      
      // Auto-update existing roadmaps to have the latest custom titles and descriptions
      dbRoadmapsFinal = await Promise.all(dbRoadmapsFinal.map(async (r) => {
        const matchSeed = SEED_ROADMAPS_METADATA.find(s => s.category.toLowerCase().trim() === r.category.toLowerCase().trim());
        if (matchSeed && (r.description !== matchSeed.description || r.title !== matchSeed.title)) {
          console.log(`[Roadmap Store] Auto-updating ${r.category} metadata in DB...`);
          const updated = await personalRoadmapService.updateRoadmap(r.id, {
            title: matchSeed.title,
            description: matchSeed.description,
            rule: matchSeed.rule,
            example: matchSeed.example,
            microDose: matchSeed.microDose
          });
          return updated || r;
        }
        return r;
      }));
      
      set({ roadmaps: dbRoadmapsFinal, isHydrated: true });
      
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

      // Sync SEED blueprints directly into J.A.R.V.I.S. goals hierarchy
      for (const blueprint of SEED_BLUEPRINTS) {
        // 2. Sync Main Goal
        const existingGoal = currentGoals.find(g => g.id === blueprint.goalId);
        if (!existingGoal) {
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
        } else if (existingGoal.title !== blueprint.title || existingGoal.description !== blueprint.description) {
          await goalStore.updateGoal(existingGoal.id, {
            title: blueprint.title,
            description: blueprint.description
          });
          goalUpdated = true;
        }

        // 3. Sync Phase (Objective)
        for (const phase of blueprint.phases) {
          const existingObjective = currentGoals.find(g => g.id === phase.objectiveId);
          if (!existingObjective) {
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
          } else if (existingObjective.title !== phase.title) {
            await goalStore.updateGoal(existingObjective.id, { title: phase.title });
            goalUpdated = true;
          }

          // 4. Sync Phase Step (Sub-Goal instead of Task)
          for (const step of phase.steps) {
            const existingSubGoal = currentGoals.find(g => g.id === step.subGoalId);
            if (!existingSubGoal) {
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
            } else if (existingSubGoal.title !== step.text) {
              await goalStore.updateGoal(existingSubGoal.id, { title: step.text });
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
    let parentAreaId = data.parentId || 'area-7';
    if (!data.parentId) {
      if (data.category?.includes('Communication') || data.category?.includes('Voice') || data.category?.includes('Fighting')) parentAreaId = 'area-3';
      else if (data.category?.includes('Writing') || data.category?.includes('Music') || data.category?.includes('Singing')) parentAreaId = 'area-4';
    }

    const next = {
      id: goalId,
      category: data.category || 'Reading & Learning',
      title: data.title || 'New Roadmap',
      description: data.description || '',
      rule: data.rule || '',
      example: data.example || '',
      microDose: data.microDose || '',
      parentId: parentAreaId,
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
