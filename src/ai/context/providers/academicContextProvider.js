import { useAcademicStore } from '../../../store/academicStore';

export function getAcademicContext(prompt) {
  const state = useAcademicStore.getState();
  const activeSemester = state.activeSemester || 'Sem 3';

  // Only include subjects for the currently active semester to keep context clean and highly efficient
  const subjectsSummary = (state.subjects || [])
    .filter(s => s.semester === activeSemester)
    .map(s => ({
      id: s.id,
      name: s.name,
      code: s.code,
      instructor: s.instructor,
      attendance: s.attendance || 0,
      status: s.status || 'Ongoing'
    }));

  const activeAssignments = (state.assignments || [])
    .filter(a => a.status !== 'completed' && a.progress < 100)
    .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''))
    .slice(0, 5)
    .map(a => ({
      id: a.id,
      title: a.title,
      deadline: a.deadline,
      progress: a.progress || 0,
      priority: a.priority || 'Medium',
      subjectId: a.subjectId
    }));

  const activeProjects = (state.projects || [])
    .filter(p => p.status !== 'completed' && p.status !== 'archived')
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      progress: p.progress || 0,
      stack: p.stack
    }));

  // Context efficiency: only load DSA questions list if user explicitly talks about coding progress or solved problems
  const p = prompt ? prompt.toLowerCase() : '';
  const needsDsaDetail = p.includes('dsa') || p.includes('leet') || p.includes('solve') || p.includes('problem') || p.includes('coding');
  
  const recentDsaSolved = needsDsaDetail && state.dsaQuestions?.length > 0
    ? state.dsaQuestions.slice(-5).map(q => ({ id: q.id, title: q.title, platform: q.platform, difficulty: q.difficulty, date: q.date }))
    : undefined;

  return {
    semesterInfo: {
      activeSemester,
      termEndDate: state.termEndDate || 'TBD'
    },
    coding: {
      solvedDsaCount: state.codingProgress?.solvedProblems || 0,
      targetDsaCount: state.codingProgress?.targetProblems || 0,
      streakDays: state.codingProgress?.streakDays || 0,
      currentTopic: state.codingProgress?.currentTopic || ''
    },
    recentSolvedQuestions: recentDsaSolved,
    subjects: subjectsSummary,
    pendingAssignments: activeAssignments,
    ongoingProjects: activeProjects,
    techStack: (state.techStack || []).slice(0, 10).map(t => t.name),
    certificationsInProgress: (state.certifications || [])
      .filter(c => c.status !== 'Completed')
      .map(c => ({ course: c.course, platform: c.platform, progress: c.progress || 0 }))
  };
}
