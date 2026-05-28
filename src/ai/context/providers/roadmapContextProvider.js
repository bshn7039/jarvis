import { usePersonalRoadmapStore } from '../../../store/personalRoadmapStore';

export function getRoadmapContext(prompt) {
  const state = usePersonalRoadmapStore.getState();
  const roadmaps = state.roadmaps || [];

  // For token efficiency, return a slim summary of each roadmap
  const p = prompt ? prompt.toLowerCase() : '';
  const wantsDetail = p.includes('roadmap') || p.includes('progress') || p.includes('phase') || p.includes('log');

  const summary = roadmaps
    .filter(r => r.active !== false)
    .slice(0, 6)
    .map(r => {
      const base = {
        id: r.id,
        title: r.title,
        category: r.category,
        description: r.description ? r.description.slice(0, 100) : '',
        microDose: r.microDose ? r.microDose.slice(0, 80) : '',
        active: r.active !== false,
      };

      if (wantsDetail) {
        // Include the rule and recent log keys when asked for detail
        base.rule = r.rule ? r.rule.slice(0, 150) : '';
        base.logKeys = r.customLogs ? Object.keys(r.customLogs).filter(k => {
          const val = r.customLogs[k];
          return Array.isArray(val) ? val.length > 0 : !!val;
        }) : [];
      }

      return base;
    });

  return {
    totalRoadmaps: roadmaps.length,
    activeRoadmaps: roadmaps.filter(r => r.active !== false).length,
    roadmaps: summary,
  };
}
