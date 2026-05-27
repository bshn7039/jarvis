import { usePersonalStore } from '../../../store/personalStore';
import { useSelfCareStore } from '../../../store/selfCareStore';

export function getPersonalContext() {
  const pState = usePersonalStore.getState();
  const scState = useSelfCareStore.getState();

  const routinesSummary = (scState.routines || []).map(r => ({
    id: r.id,
    title: r.title,
    routineType: r.routineType,
    completed: r.completed,
    streak: r.streak || 0
  }));

  const musicSummary = (pState.music || []).slice(0, 5).map(m => ({
    instrument: m.instrument || m.title || 'Instrument',
    sessionCount: m.sessionCount || 0,
    practiceNotes: m.practiceNotes || m.notes || ''
  }));

  const readingSummary = (pState.reading || []).slice(0, 5).map(r => ({
    title: r.title || 'Book',
    author: r.author || '',
    progress: r.progress || 0,
    status: r.status || 'Pending'
  }));

  const writingSummary = (pState.writing || []).slice(0, 5).map(w => ({
    title: w.title || 'Piece',
    genre: w.genre || '',
    wordCount: w.wordCount || 0,
    status: w.status || 'Draft'
  }));

  const socialSummary = (pState.socialGrowth || []).slice(0, 5).map(s => ({
    metricName: s.metricName || s.title || 'Skill',
    value: s.value || '',
    notes: s.notes || ''
  }));

  return {
    selfCareRoutines: routinesSummary.slice(0, 5),
    recentReading: readingSummary,
    recentWriting: writingSummary,
    recentMusicPractice: musicSummary,
    recentSocialGrowth: socialSummary,
    vaultItemsCount: (pState.vault || []).length
  };
}
