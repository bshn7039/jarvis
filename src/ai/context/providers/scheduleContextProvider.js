import { useAiStore } from '../../../store/aiStore';

export function getScheduleContext() {
  const state = useAiStore.getState();
  const dailySchedule = state.dailySchedule || [];

  return {
    dailySchedule: dailySchedule.map(item => ({
      id: item.id,
      time: item.time,
      label: item.label,
      category: item.category,
      status: item.status
    }))
  };
}
