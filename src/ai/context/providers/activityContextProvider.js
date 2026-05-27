import { useActivityStore } from '../../../store/activityStore';

export function getActivityContext() {
  const state = useActivityStore.getState();
  const activities = state.activities || [];

  const recentActions = activities.slice(0, 15).map(act => {
    const time = act.timestamp ? act.timestamp.slice(11, 16) : '00:00';
    const action = act.action || 'performed';
    const type = act.entityType || act.type || 'system';
    
    let detail = '';
    if (act.metadata) {
      detail = act.metadata.title || act.metadata.name || act.metadata.meal || act.metadata.topic || act.metadata.amount || '';
      if (typeof detail === 'object') {
        detail = JSON.stringify(detail);
      }
    }
    const detailStr = detail ? `: '${detail}'` : '';
    
    return `[${time}] ${action} ${type}${detailStr}`;
  });

  const countsByAction = {};
  activities.slice(0, 50).forEach(act => {
    const key = `${act.action} ${act.entityType || act.type || 'item'}`;
    countsByAction[key] = (countsByAction[key] || 0) + 1;
  });

  return {
    recentActions,
    last50Summary: Object.entries(countsByAction)
      .map(([action, count]) => `${action} (${count}x)`)
      .slice(0, 5)
  };
}
