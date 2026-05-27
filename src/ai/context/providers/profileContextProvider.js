import { useProfileStore } from '../../../store/profileStore';

export function getProfileContext() {
  const state = useProfileStore.getState();
  const profile = state.profile || {};

  return {
    identity: {
      displayName: profile.identity?.displayName || 'Bhu',
      location: profile.identity?.location || 'Panvel, India',
      timezone: profile.identity?.timezone || 'IST'
    },
    physical: {
      heightCm: profile.physical?.heightCm || 175,
      weightKg: profile.physical?.weightKg || 72,
      bodyType: profile.physical?.bodyType || '',
      fitnessGoal: profile.physical?.fitnessGoal || ''
    },
    productivity: {
      taskHoursTarget: profile.productivity?.taskHoursTarget || 4,
      preferredStudyMethod: profile.productivity?.preferredStudyMethod || 'Feynman Technique'
    },
    lifestyle: {
      hobbies: profile.lifestyle?.hobbies || [],
      languages: (profile.lifestyle?.languages || []).map(l => `${l.language} (${l.level || 'Beginner'})`)
    },
    personality: (profile.personalityProfiles || []).map(p => ({
      title: p.title,
      description: p.description
    }))
  };
}
