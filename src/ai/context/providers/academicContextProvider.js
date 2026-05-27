import { useAcademicStore } from '../../../store/academicStore';

export function getAcademicContext() {
  const state = useAcademicStore.getState();

  const subjectsSummary = (state.subjects || []).map(s => ({
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

  return {
    semesterInfo: {
      currentSemester: state.currentSemester || 'Sem 1',
      termEndDate: state.termEndDate || 'TBD'
    },
    coding: {
      solvedDsaCount: state.codingProgress?.solvedProblems || 0,
      targetDsaCount: state.codingProgress?.targetProblems || 0,
      streakDays: state.codingProgress?.streakDays || 0,
      currentTopic: state.codingProgress?.currentTopic || ''
    },
    subjects: subjectsSummary,
    pendingAssignments: activeAssignments,
    ongoingProjects: activeProjects,
    techStack: (state.techStack || []).slice(0, 10).map(t => t.name),
    certificationsInProgress: (state.certifications || [])
      .filter(c => c.status !== 'Completed')
      .map(c => ({ course: c.course, platform: c.platform, progress: c.progress || 0 }))
  };
}
