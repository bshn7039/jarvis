import { create } from 'zustand';
import { academicService } from '../database/services/academicService';
import { localDb } from '../database/core/localDatabase';
import { deepClone } from '../utils/deepClone';

const initialState = {
  currentSemester: 'Semester 6',
  termEndDate: '2026-07-30',
  subjects: [],
  assignments: [],
  practicals: [],
  revisionLogs: [],
  codingProgress: {
    solvedProblems: 0,
    targetProblems: 260,
    streakDays: 0,
    weeklySolved: 0,
  },
  projects: [],
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

      const semInfo = meta.find(m => m.id === 'semester-info');
      const codingInfo = meta.find(m => m.id === 'coding-progress');
      
      set({ 
        subjects, 
        assignments,
        practicals,
        revisionLogs: revisionLogs.sort((a, b) => b.date.localeCompare(a.date)),
        projects,
        currentSemester: semInfo?.currentSemester || 'Semester 6',
        termEndDate: semInfo?.termEndDate || '2026-07-30',
        codingProgress: codingInfo || initialState.codingProgress,
        selectedSubjectId: subjects[0]?.id ?? null,
        isHydrated: true 
      });
    } catch (err) {
      console.error('Failed to hydrate academics:', err);
    }
  },

  setSelectedSubjectId: (subjectId) => set({ selectedSubjectId: subjectId }),

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

    // Ideally use assignmentService
    set({ assignments: assignments.map(a => a.id === assignmentId ? updatedAssignment : a) });
  },

  addRevisionLog: async (logData) => {
    const next = {
      date: logData.date || '2026-05-21',
      subjectId: logData.subjectId || get().selectedSubjectId,
      topic: logData.topic || 'Quick revision note',
      confidence: Math.max(1, Math.min(10, Number(logData.confidence) || 6)),
      hours: Math.max(0.1, Number(logData.hours) || 0.5),
    };
    
    // Ideally use revisionLogService
    set((state) => ({
      revisionLogs: [
        { id: `rev-local-${Date.now()}`, ...next },
        ...state.revisionLogs,
      ],
    }));
  },

  addSubject: async (subjectData) => {
    const next = {
      name: subjectData.name || 'New Subject',
      code: subjectData.code || 'CSXXX',
      credits: Number(subjectData.credits) || 3,
      instructor: subjectData.instructor || 'TBD',
      category: subjectData.category || 'Core',
    };
    
    const savedSubject = await academicService.create(next);
    set((state) => ({
      subjects: [...state.subjects, savedSubject],
      selectedSubjectId: savedSubject.id,
    }));
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
    
    // We should probably have an assignmentService or use localDb directly if baseService handles it
    // For now use localDb to simulate what academicService might do for assignments
    const saved = await localDb.put('academicAssignments', next);
    set((state) => ({
      assignments: [...state.assignments, saved],
    }));
  },
}));

