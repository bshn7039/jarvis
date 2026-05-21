import { mockDatabase } from '../data/mockDatabase';
import { createPersistedStore } from './persistHelpers';

const initialState = {
  currentSemester: mockDatabase.academics.currentSemester,
  termEndDate: mockDatabase.academics.termEndDate,
  subjects: mockDatabase.academics.subjects,
  assignments: mockDatabase.academics.assignments,
  practicals: mockDatabase.academics.practicals,
  revisionLogs: mockDatabase.academics.revisionLogs,
  codingProgress: mockDatabase.academics.codingProgress,
  projects: mockDatabase.academics.projects,
  selectedSubjectId: mockDatabase.academics.subjects[0]?.id ?? null,
};

export const useAcademicStore = createPersistedStore({
  name: 'jarvis-academics',
  initialState,
  partialize: (state) => ({
    currentSemester: state.currentSemester,
    termEndDate: state.termEndDate,
    subjects: state.subjects,
    assignments: state.assignments,
    practicals: state.practicals,
    revisionLogs: state.revisionLogs,
    codingProgress: state.codingProgress,
    projects: state.projects,
    selectedSubjectId: state.selectedSubjectId,
  }),
  actions: (set) => ({
    setSelectedSubjectId: (subjectId) => set({ selectedSubjectId: subjectId }),
    updateAssignmentProgress: (assignmentId, progress) =>
      set((state) => ({
        assignments: state.assignments.map((assignment) =>
          assignment.id === assignmentId
            ? {
                ...assignment,
                progress: Math.max(0, Math.min(100, Number(progress) || 0)),
                status:
                  Number(progress) >= 100
                    ? 'completed'
                    : assignment.progress > 0
                      ? 'in_progress'
                      : 'pending',
              }
            : assignment,
        ),
      })),
    addRevisionLog: (log) =>
      set((state) => ({
        revisionLogs: [
          {
            id: `rev-local-${Date.now()}`,
            date: log.date || '2026-05-21',
            subjectId: log.subjectId || state.selectedSubjectId,
            topic: log.topic || 'Quick revision note',
            confidence: Math.max(1, Math.min(10, Number(log.confidence) || 6)),
            hours: Math.max(0.1, Number(log.hours) || 0.5),
          },
          ...state.revisionLogs,
        ],
      })),
  }),
});
