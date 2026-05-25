import { create } from 'zustand';
import { academicService } from '../database/services/academicService';
import { localDb } from '../database/core/localDatabase';
import { deepClone } from '../utils/deepClone';
import { useActivityStore } from './activityStore';
import { trashService } from '../database/services/trashService';

const initialState = {
  currentSemester: '',
  termEndDate: '',
  subjects: [],
  assignments: [],
  practicals: [],
  revisionLogs: [],
  codingProgress: {
    solvedProblems: 0,
    targetProblems: 0,
    streakDays: 0,
    weeklySolved: 0,
    currentTopic: '',
    weakTopics: [],
    revisionQueue: [],
    contestHistory: [],
  },
  skills: [],
  activeLearning: [],
  projects: [],
  dsaQuestions: [],
  techStack: [],
  certifications: [],
  portfolio: [],
  selectedSubjectId: null,
  isHydrated: false,
};

export const useAcademicStore = create((set, get) => ({
  ...deepClone(initialState),

  hydrate: async () => {
    try {
      const subjects = await academicService.getAll();
      const assignments = await academicService.getAssignments();
      const practicals = await academicService.getPracticals();
      const revisionLogs = await academicService.getRevisionLogs();
      const projects = await localDb.getAll('academicProjects');
      const meta = await localDb.getAll('academicMeta');

      const skills = await localDb.getAll('academicSkills');
      const activeLearning = await localDb.getAll('academicLearning');
      const dsaQuestions = await localDb.getAll('academicDsa');
      const techStack = await localDb.getAll('academicTechStack');
      const certifications = await localDb.getAll('academicCertifications');
      const portfolio = await localDb.getAll('academicPortfolio');

      const semInfo = meta.find(m => m.id === 'semester-info');
      const codingInfo = meta.find(m => m.id === 'coding-progress');
      
      const codingProgress = codingInfo || initialState.codingProgress;
      // Force solvedProblems to be live from the actual list length
      codingProgress.solvedProblems = dsaQuestions.length;

      set({ 
        subjects, 
        assignments,
        practicals,
        revisionLogs: revisionLogs.sort((a, b) => b.date.localeCompare(a.date)),
        projects,
        skills,
        activeLearning,
        dsaQuestions,
        techStack,
        certifications,
        portfolio,
        currentSemester: semInfo?.currentSemester || '',
        termEndDate: semInfo?.termEndDate || '',
        codingProgress,
        selectedSubjectId: subjects[0]?.id ?? null,
        isHydrated: true 
      });
    } catch (err) {
      console.error('Failed to hydrate academics:', err);
    }
  },

  setSelectedSubjectId: (subjectId) => set({ selectedSubjectId: subjectId }),

  logActivity: async ({ action, type = 'academic', entityType = 'assignment', entityId, metadata = {} }) => {
    const activityStore = useActivityStore.getState();
    await activityStore.logActivity({
      type,
      action,
      entityType,
      entityId,
      metadata
    });
  },

  updateAssignmentProgress: async (assignmentId, progress) => {
    const assignments = get().assignments;
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const nextProgress = Math.max(0, Math.min(100, Number(progress) || 0));
    const updatedAssignment = {
      ...assignment,
      progress: nextProgress,
      status: nextProgress >= 100 ? 'completed' : nextProgress > 0 ? 'in_progress' : 'pending'
    };

    set({ assignments: assignments.map(a => a.id === assignmentId ? updatedAssignment : a) });
    await localDb.put('academicAssignments', updatedAssignment);
    await get().logActivity({ 
      action: updatedAssignment.status === 'completed' ? 'completed' : 'progress_updated', 
      entityId: assignmentId,
      metadata: { title: assignment.title, progress: nextProgress }
    });
  },

  addRevisionLog: async (logData) => {
    const id = `rev-local-${Date.now()}`;
    const next = {
      id,
      date: logData.date || '2026-05-21',
      subjectId: logData.subjectId || get().selectedSubjectId,
      topic: logData.topic || 'Quick revision note',
      confidence: Math.max(1, Math.min(10, Number(logData.confidence) || 6)),
      hours: Math.max(0.1, Number(logData.hours) || 0.5),
    };
    
    await localDb.put('academicRevisionLogs', next);
    set((state) => ({
      revisionLogs: [next, ...state.revisionLogs],
    }));
    await get().logActivity({ 
      action: 'created', 
      entityType: 'revisionLog',
      entityId: id,
      metadata: { topic: next.topic, subjectId: next.subjectId, hours: next.hours }
    });
  },

  addSubject: async (subjectData) => {
    const next = {
      name: subjectData.name || 'New Subject',
      code: subjectData.code || 'CSXXX',
      credits: Number(subjectData.credits) || 3,
      instructor: subjectData.instructor || 'TBD',
      category: subjectData.category || 'Core',
      status: subjectData.status || 'Ongoing',
      syllabus: subjectData.syllabus || '',
      attendance: Number(subjectData.attendance) || 0,
      revisionStatus: subjectData.revisionStatus || 'Not Started',
      weakTopics: subjectData.weakTopics || [],
      internalMarks: subjectData.internalMarks || '',
      practicals: subjectData.practicals || '',
      vivaPrep: subjectData.vivaPrep || '',
    };
    
    const savedSubject = await academicService.create(next);
    set((state) => ({
      subjects: [...state.subjects, savedSubject],
      selectedSubjectId: savedSubject.id,
    }));
    await get().logActivity({ 
      action: 'created', 
      entityType: 'subject',
      entityId: savedSubject.id,
      metadata: { name: savedSubject.name, code: savedSubject.code }
    });
  },

  updateSubject: async (id, updates) => {
    const subject = get().subjects.find(s => s.id === id);
    if (!subject) return;
    const next = { ...subject, ...updates };
    await academicService.update(id, next);
    set(state => ({ subjects: state.subjects.map(s => s.id === id ? next : s) }));
  },

  addAssignment: async (assignmentData) => {
    const next = {
      subjectId: assignmentData.subjectId || get().selectedSubjectId,
      title: assignmentData.title || 'New Assignment',
      deadline: assignmentData.deadline || '2026-05-30',
      status: 'pending',
      progress: 0,
      priority: assignmentData.priority || 'Medium',
    };
    
    const saved = await localDb.put('academicAssignments', next);
    set((state) => ({
      assignments: [...state.assignments, saved],
    }));
    await get().logActivity({ 
      action: 'created', 
      entityType: 'assignment',
      entityId: saved.id,
      metadata: { title: saved.title, subjectId: saved.subjectId }
    });
  },

  // GROWTH ENGINE ACTIONS
  addSkill: async (skillData) => {
    const next = { 
      id: `skill-${Date.now()}`, 
      name: 'New Skill',
      category: 'General',
      progress: 0, 
      difficulty: 'Medium',
      status: 'Learning', 
      notes: '', 
      linkedGoalIds: [],
      linkedTaskIds: [],
      resources: [],
      ...skillData 
    };
    await localDb.put('academicSkills', next);
    set(state => ({ skills: [...state.skills, next] }));
    await get().logActivity({ action: 'created', entityType: 'skill', entityId: next.id, metadata: { name: next.name } });
  },

  updateSkill: async (id, updates) => {
    const skill = get().skills.find(s => s.id === id);
    if (!skill) return;
    const next = { ...skill, ...updates };
    await localDb.put('academicSkills', next);
    set(state => ({ skills: state.skills.map(s => s.id === id ? next : s) }));
  },

  deleteSkill: async (id) => {
    const existing = get().skills.find(s => s.id === id);
    if (existing) {
      const { trashService } = await import('../database/services/trashService');
      await trashService.moveToTrash('academicSkills', existing);
    }
    await localDb.delete('academicSkills', id);
    set(state => ({ skills: state.skills.filter(s => s.id !== id) }));
  },

  addActiveLearning: async (data) => {
    const next = { 
      id: `learn-${Date.now()}`, 
      topic: 'New Subject',
      source: 'Resource',
      progress: 0,
      consistency: 0, 
      notes: '', 
      linkedGoalIds: [],
      linkedTaskIds: [],
      ...data 
    };
    await localDb.put('academicLearning', next);
    set(state => ({ activeLearning: [...state.activeLearning, next] }));
    await get().logActivity({ action: 'created', entityType: 'learning', entityId: next.id, metadata: { topic: next.topic } });
  },

  updateActiveLearning: async (id, updates) => {
    const item = get().activeLearning.find(i => i.id === id);
    if (!item) return;
    const next = { ...item, ...updates };
    await localDb.put('academicLearning', next);
    set(state => ({ activeLearning: state.activeLearning.map(i => i.id === id ? next : i) }));
  },

  deleteActiveLearning: async (id) => {
    const existing = get().activeLearning.find(i => i.id === id);
    if (existing) {
      const { trashService } = await import('../database/services/trashService');
      await trashService.moveToTrash('academicLearning', existing);
    }
    await localDb.delete('academicLearning', id);
    set(state => ({ activeLearning: state.activeLearning.filter(i => i.id !== id) }));
  },

  addProject: async (data) => {
    const next = { 
      id: `proj-${Date.now()}`, 
      name: 'New Project',
      description: '',
      stack: '',
      status: 'idea', 
      progress: 0, 
      github: '',
      link: '',
      roadmap: '',
      notes: '',
      linkedGoalIds: [],
      linkedTaskIds: [],
      ...data 
    };
    await localDb.put('academicProjects', next);
    set(state => ({ projects: [...state.projects, next] }));
    await get().logActivity({ action: 'created', entityType: 'project', entityId: next.id, metadata: { name: next.name } });
  },

  updateProject: async (id, updates) => {
    const proj = get().projects.find(p => p.id === id);
    if (!proj) return;
    const next = { ...proj, ...updates };
    await localDb.put('academicProjects', next);
    set(state => ({ projects: state.projects.map(p => p.id === id ? next : p) }));
  },

  deleteProject: async (id) => {
    const existing = get().projects.find(p => p.id === id);
    if (existing) {
      const { trashService } = await import('../database/services/trashService');
      await trashService.moveToTrash('academicProjects', existing);
    }
    await localDb.delete('academicProjects', id);
    set(state => ({ projects: state.projects.filter(p => p.id !== id) }));
  },

  addDsaQuestion: async (data) => {
    const next = { 
      id: `dsa-${Date.now()}`, 
      title: 'New Problem',
      platform: 'LeetCode',
      difficulty: 'Easy',
      notes: '',
      date: new Date().toISOString().slice(0, 10), 
      linkedTaskIds: [],
      ...data 
    };
    await localDb.put('academicDsa', next);
    set(state => ({ 
      dsaQuestions: [...state.dsaQuestions, next],
      codingProgress: { ...state.codingProgress, solvedProblems: state.codingProgress.solvedProblems + 1 }
    }));
    await localDb.put('academicMeta', { id: 'coding-progress', ...get().codingProgress });
    await get().logActivity({ action: 'solved_dsa', entityType: 'dsa', entityId: next.id, metadata: { title: next.title } });
  },

  updateDsaQuestion: async (id, updates) => {
    const q = get().dsaQuestions.find(q => q.id === id);
    if (!q) return;
    const next = { ...q, ...updates };
    await localDb.put('academicDsa', next);
    set(state => ({ dsaQuestions: state.dsaQuestions.map(q => q.id === id ? next : q) }));
  },

  addTechStack: async (tech) => {
    const next = { 
      id: `tech-${Date.now()}`, 
      name: tech,
      category: 'General',
      proficiency: 'Beginner',
      currentlyLearning: true,
      notes: ''
    };
    await localDb.put('academicTechStack', next);
    set(state => ({ techStack: [...state.techStack, next] }));
  },

  updateTechStack: async (id, updates) => {
    const tech = get().techStack.find(t => t.id === id);
    if (!tech) return;
    const next = { ...tech, ...updates };
    await localDb.put('academicTechStack', next);
    set(state => ({ techStack: state.techStack.map(t => t.id === id ? next : t) }));
  },

  deleteTechStack: async (id) => {
    const existing = get().techStack.find(t => t.id === id);
    if (existing) {
      const { trashService } = await import('../database/services/trashService');
      await trashService.moveToTrash('academicTechStack', existing);
    }
    await localDb.delete('academicTechStack', id);
    set(state => ({ techStack: state.techStack.filter(t => t.id !== id) }));
  },

  addCertification: async (data) => {
    const next = { id: `cert-${Date.now()}`, course: 'New Certification', platform: 'Udemy', progress: 0, status: 'In Progress', certificateLink: '', notes: '', ...data };
    await localDb.put('academicCertifications', next);
    set(state => ({ certifications: [...state.certifications, next] }));
    await get().logActivity({ action: 'created', entityType: 'certification', entityId: next.id, metadata: { course: next.course } });
  },

  updateCertification: async (id, updates) => {
    const cert = get().certifications.find(c => c.id === id);
    if (!cert) return;
    const next = { ...cert, ...updates };
    await localDb.put('academicCertifications', next);
    set(state => ({ certifications: state.certifications.map(c => c.id === id ? next : c) }));
  },

  deleteCertification: async (id) => {
    const existing = get().certifications.find(c => c.id === id);
    if (existing) {
      const { trashService } = await import('../database/services/trashService');
      await trashService.moveToTrash('academicCertifications', existing);
    }
    await localDb.delete('academicCertifications', id);
    set(state => ({ certifications: state.certifications.filter(c => c.id !== id) }));
  },

  updateCodingProgress: async (updates) => {
    const next = { ...get().codingProgress, ...updates };
    set({ codingProgress: next });
    await localDb.put('academicMeta', { id: 'coding-progress', ...next });
  },

  addPortfolioItem: async (data) => {
    const next = { id: `port-${Date.now()}`, title: 'New Item', link: '', notes: '', ...data };
    await localDb.put('academicPortfolio', next);
    set(state => ({ portfolio: [...state.portfolio, next] }));
  },

  updatePortfolioItem: async (id, updates) => {
    const item = get().portfolio.find(p => p.id === id);
    if (!item) return;
    const next = { ...item, ...updates };
    await localDb.put('academicPortfolio', next);
    set(state => ({ portfolio: state.portfolio.map(p => p.id === id ? next : p) }));
  },

  deletePortfolioItem: async (id) => {
    const existing = get().portfolio.find(p => p.id === id);
    if (existing) {
      const { trashService } = await import('../database/services/trashService');
      await trashService.moveToTrash('academicPortfolio', existing);
    }
    await localDb.delete('academicPortfolio', id);
    set(state => ({ portfolio: state.portfolio.filter(p => p.id !== id) }));
  },
}));
