import { create } from 'zustand';
import { academicService } from '../database/services/academicService';
import { localDb } from '../database/core/localDatabase';
import { deepClone } from '../utils/deepClone';
import { useActivityStore } from './activityStore';

// ─── Curriculum Definitions per Semester ────────────────────────────────────
export const SEMESTER_CURRICULUM = {
  'Sem 3': [
    { id: 'sem3-001', name: 'Engineering Mathematics III', code: 'CS301', credits: 4, category: 'Core', status: 'Ongoing', semester: 'Sem 3', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [], syllabus: '', internalMarks: '', practicals: '', vivaPrep: '' },
    { id: 'sem3-002', name: 'Data Structures', code: 'CS302', credits: 4, category: 'Core', status: 'Ongoing', semester: 'Sem 3', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [], syllabus: '', internalMarks: '', practicals: '', vivaPrep: '' },
    { id: 'sem3-003', name: 'Discrete Structures & Graph Theory', code: 'CS303', credits: 4, category: 'Core', status: 'Ongoing', semester: 'Sem 3', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [], syllabus: '', internalMarks: '', practicals: '', vivaPrep: '' },
    { id: 'sem3-004', name: 'Computer Organization & Architecture', code: 'CS304', credits: 4, category: 'Core', status: 'Ongoing', semester: 'Sem 3', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [], syllabus: '', internalMarks: '', practicals: '', vivaPrep: '' },
    { id: 'sem3-005', name: 'Computer Graphics', code: 'CS305', credits: 3, category: 'Core', status: 'Ongoing', semester: 'Sem 3', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [], syllabus: '', internalMarks: '', practicals: '', vivaPrep: '' },
    { id: 'sem3-006', name: 'Java Programming Lab', code: 'CS306', credits: 2, category: 'Lab', status: 'Ongoing', semester: 'Sem 3', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [], syllabus: '', internalMarks: '', practicals: '', vivaPrep: '' },
  ],
  'Sem 4': [
    { id: 'sem4-001', name: 'Operating Systems', code: 'CS401', credits: 4, category: 'Core', status: 'Upcoming', semester: 'Sem 4', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
    { id: 'sem4-002', name: 'Database Management Systems', code: 'CS402', credits: 4, category: 'Core', status: 'Upcoming', semester: 'Sem 4', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
    { id: 'sem4-003', name: 'Computer Networks', code: 'CS403', credits: 4, category: 'Core', status: 'Upcoming', semester: 'Sem 4', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
    { id: 'sem4-004', name: 'Theoretical Computer Science', code: 'CS404', credits: 4, category: 'Core', status: 'Upcoming', semester: 'Sem 4', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
    { id: 'sem4-005', name: 'Microprocessor & Peripherals', code: 'CS405', credits: 3, category: 'Core', status: 'Upcoming', semester: 'Sem 4', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
    { id: 'sem4-006', name: 'Python Programming Lab', code: 'CS406', credits: 2, category: 'Lab', status: 'Upcoming', semester: 'Sem 4', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
  ],
  'Sem 5': [
    { id: 'sem5-001', name: 'Analysis of Algorithms', code: 'CS501', credits: 4, category: 'Core', status: 'Upcoming', semester: 'Sem 5', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
    { id: 'sem5-002', name: 'Software Engineering', code: 'CS502', credits: 4, category: 'Core', status: 'Upcoming', semester: 'Sem 5', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
    { id: 'sem5-003', name: 'Advanced Database Management', code: 'CS503', credits: 4, category: 'Core', status: 'Upcoming', semester: 'Sem 5', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
    { id: 'sem5-004', name: 'Artificial Intelligence', code: 'CS504', credits: 4, category: 'Core', status: 'Upcoming', semester: 'Sem 5', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
    { id: 'sem5-005', name: 'Department Elective I', code: 'CS505', credits: 3, category: 'Elective', status: 'Upcoming', semester: 'Sem 5', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
  ],
  'Sem 6': [
    { id: 'sem6-001', name: 'Cryptography & System Security', code: 'CS601', credits: 4, category: 'Core', status: 'Upcoming', semester: 'Sem 6', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
    { id: 'sem6-002', name: 'Mobile Computing', code: 'CS602', credits: 4, category: 'Core', status: 'Upcoming', semester: 'Sem 6', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
    { id: 'sem6-003', name: 'AI & Data Science', code: 'CS603', credits: 4, category: 'Core', status: 'Upcoming', semester: 'Sem 6', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
    { id: 'sem6-004', name: 'Software Engineering & PM', code: 'CS604', credits: 4, category: 'Core', status: 'Upcoming', semester: 'Sem 6', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
    { id: 'sem6-005', name: 'Mini Project', code: 'CS605', credits: 3, category: 'Project', status: 'Upcoming', semester: 'Sem 6', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
  ],
  'Sem 7': [
    { id: 'sem7-001', name: 'Cloud Computing', code: 'CS701', credits: 4, category: 'Core', status: 'Upcoming', semester: 'Sem 7', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
    { id: 'sem7-002', name: 'Distributed Systems', code: 'CS702', credits: 4, category: 'Core', status: 'Upcoming', semester: 'Sem 7', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
    { id: 'sem7-003', name: 'Big Data Analytics', code: 'CS703', credits: 4, category: 'Core', status: 'Upcoming', semester: 'Sem 7', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
    { id: 'sem7-004', name: 'Major Project Phase A', code: 'CS704', credits: 6, category: 'Project', status: 'Upcoming', semester: 'Sem 7', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
  ],
  'Sem 8': [
    { id: 'sem8-001', name: 'Distributed Computing', code: 'CS801', credits: 4, category: 'Core', status: 'Upcoming', semester: 'Sem 8', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
    { id: 'sem8-002', name: 'Human Machine Interaction', code: 'CS802', credits: 4, category: 'Core', status: 'Upcoming', semester: 'Sem 8', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
    { id: 'sem8-003', name: 'Major Project Phase B', code: 'CS803', credits: 8, category: 'Project', status: 'Upcoming', semester: 'Sem 8', attendedDays: 0, totalDays: 0, revisionStatus: 'Not Started', weakTopics: [] },
  ],
};

const SEMESTERS = ['Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];

const initialState = {
  activeSemester: 'Sem 3',
  termEndDate: '',
  subjects: [],
  assignments: [],
  practicals: [],
  revisionLogs: [],
  codingProgress: {
    solvedProblems: 0,
    targetProblems: 50,
    targetLabel: 'Phase 1: 50 Problems',
    targetPhase: 'Arrays, Strings & Loops',
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
  // Productivity Contracts
  fiveMinuteContract: false,
  daily3: [
    { id: 'd3-1', text: '', checked: false },
    { id: 'd3-2', text: '', checked: false },
    { id: 'd3-3', text: '', checked: false },
  ],
  dailyWalk: false,
  // Identity & Evolution
  outputLogs: [],
  readingRule: { pagesRead: false, actionApplied: false, appliedAction: '' },
  voiceSocial: { twoSecondRule: false, vocalHum: false },
  aiInsights: { text: '', timestamp: '' },
  selectedSubjectId: null,
  isHydrated: false,
};

export const useAcademicStore = create((set, get) => ({
  ...deepClone(initialState),

  hydrate: async () => {
    try {
      const subjectsRaw = await academicService.getAll();
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
      const contractInfo = meta.find(m => m.id === 'productivity-contracts');
      const identityInfo = meta.find(m => m.id === 'identity-evolution');

      const activeSemester = semInfo?.activeSemester || 'Sem 3';

      // Seed all semesters if no subjects with semester field exist
      const hasSemesterData = subjectsRaw.some(s => s.semester);
      let subjects = subjectsRaw;
      if (!hasSemesterData || subjectsRaw.length === 0) {
        const allSeeded = Object.values(SEMESTER_CURRICULUM).flat();
        await localDb.bulkPut('academicSubjects', allSeeded);
        subjects = allSeeded;
      } else {
        // Ensure all semesters have their subjects seeded
        for (const [sem, curriculum] of Object.entries(SEMESTER_CURRICULUM)) {
          const hasSem = subjects.some(s => s.semester === sem);
          if (!hasSem) {
            await localDb.bulkPut('academicSubjects', curriculum);
            subjects = [...subjects, ...curriculum];
          }
        }
      }

      const codingProgress = {
        ...initialState.codingProgress,
        ...(codingInfo || {}),
        // Ensure Phase 1 defaults if missing
        targetProblems: codingInfo?.targetProblems || 50,
        targetLabel: codingInfo?.targetLabel || 'Phase 1: 50 Problems',
        targetPhase: codingInfo?.targetPhase || 'Arrays, Strings & Loops',
      };
      codingProgress.solvedProblems = dsaQuestions.length;

      // Load output logs
      const outputLogs = await localDb.getAll('academicOutputLogs').catch(() => []);

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
        activeSemester,
        termEndDate: semInfo?.termEndDate || '',
        codingProgress,
        // Contracts
        fiveMinuteContract: contractInfo?.fiveMinuteContract || false,
        daily3: contractInfo?.daily3 || initialState.daily3,
        dailyWalk: contractInfo?.dailyWalk || false,
        // Identity & Evolution
        outputLogs: outputLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
        readingRule: identityInfo?.readingRule || initialState.readingRule,
        voiceSocial: identityInfo?.voiceSocial || initialState.voiceSocial,
        aiInsights: identityInfo?.aiInsights || initialState.aiInsights,
        selectedSubjectId: subjects.find(s => s.semester === activeSemester)?.id ?? null,
        isHydrated: true,
      });
    } catch (err) {
      console.error('Failed to hydrate academics:', err);
    }
  },

  setActiveSemester: async (sem) => {
    set({ activeSemester: sem });
    const meta = await localDb.getAll('academicMeta');
    const semInfo = meta.find(m => m.id === 'semester-info') || { id: 'semester-info' };
    await localDb.put('academicMeta', { ...semInfo, activeSemester: sem });
  },

  setSelectedSubjectId: (subjectId) => set({ selectedSubjectId: subjectId }),

  logActivity: async ({ action, type = 'academic', entityType = 'assignment', entityId, metadata = {} }) => {
    const activityStore = useActivityStore.getState();
    await activityStore.logActivity({ type, action, entityType, entityId, metadata });
  },

  // ─── Attendance System ──────────────────────────────────────────────────────
  markAttendance: async (subjectId, isPresent) => {
    const subjects = get().subjects;
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const next = {
      ...subject,
      totalDays: (subject.totalDays || 0) + 1,
      attendedDays: isPresent ? (subject.attendedDays || 0) + 1 : (subject.attendedDays || 0),
    };

    await academicService.update(subjectId, next);
    set({ subjects: subjects.map(s => s.id === subjectId ? next : s) });
  },

  undoAttendance: async (subjectId, wasPresent) => {
    const subjects = get().subjects;
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject || (subject.totalDays || 0) === 0) return;

    const next = {
      ...subject,
      totalDays: Math.max(0, (subject.totalDays || 0) - 1),
      attendedDays: wasPresent ? Math.max(0, (subject.attendedDays || 0) - 1) : (subject.attendedDays || 0),
    };

    await academicService.update(subjectId, next);
    set({ subjects: subjects.map(s => s.id === subjectId ? next : s) });
  },

  // ─── Productivity Contracts ─────────────────────────────────────────────────
  toggleFiveMinuteContract: async () => {
    const next = !get().fiveMinuteContract;
    set({ fiveMinuteContract: next });
    await get()._saveContracts({ fiveMinuteContract: next });
  },

  toggleDailyWalk: async () => {
    const next = !get().dailyWalk;
    set({ dailyWalk: next });
    await get()._saveContracts({ dailyWalk: next });
  },

  updateDaily3Task: async (idx, text) => {
    const daily3 = [...get().daily3];
    daily3[idx] = { ...daily3[idx], text };
    set({ daily3 });
    await get()._saveContracts({ daily3 });
  },

  toggleDaily3Check: async (idx) => {
    const daily3 = [...get().daily3];
    daily3[idx] = { ...daily3[idx], checked: !daily3[idx].checked };
    set({ daily3 });
    await get()._saveContracts({ daily3 });
  },

  _saveContracts: async (partial) => {
    const meta = await localDb.getAll('academicMeta');
    const existing = meta.find(m => m.id === 'productivity-contracts') || { id: 'productivity-contracts' };
    const state = get();
    await localDb.put('academicMeta', {
      ...existing,
      fiveMinuteContract: state.fiveMinuteContract,
      daily3: state.daily3,
      dailyWalk: state.dailyWalk,
      ...partial,
    });
  },

  // ─── Identity & Evolution ───────────────────────────────────────────────────
  addOutputLog: async (text) => {
    if (!text?.trim()) return;
    const entry = {
      id: `log-${Date.now()}`,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    try {
      await localDb.put('academicOutputLogs', entry);
    } catch {
      // store may not exist yet - add to ACADEMIC_META as fallback
    }
    set(state => ({ outputLogs: [entry, ...state.outputLogs] }));
  },

  deleteOutputLog: async (id) => {
    try { await localDb.delete('academicOutputLogs', id); } catch {}
    set(state => ({ outputLogs: state.outputLogs.filter(l => l.id !== id) }));
  },

  updateReadingRule: async (updates) => {
    const next = { ...get().readingRule, ...updates };
    set({ readingRule: next });
    await get()._saveIdentity({ readingRule: next });
  },

  toggleVoiceSocial: async (key) => {
    const voiceSocial = { ...get().voiceSocial, [key]: !get().voiceSocial[key] };
    set({ voiceSocial });
    await get()._saveIdentity({ voiceSocial });
  },

  setAiInsights: async (text) => {
    const aiInsights = { text, timestamp: new Date().toISOString() };
    set({ aiInsights });
    await get()._saveIdentity({ aiInsights });
  },

  _saveIdentity: async (partial) => {
    const meta = await localDb.getAll('academicMeta');
    const existing = meta.find(m => m.id === 'identity-evolution') || { id: 'identity-evolution' };
    const state = get();
    await localDb.put('academicMeta', {
      ...existing,
      readingRule: state.readingRule,
      voiceSocial: state.voiceSocial,
      aiInsights: state.aiInsights,
      ...partial,
    });
  },

  // ─── Subject CRUD ───────────────────────────────────────────────────────────
  addSubject: async (subjectData) => {
    const activeSemester = get().activeSemester;
    const next = {
      name: subjectData.name || 'New Subject',
      code: subjectData.code || 'CSXXX',
      credits: Number(subjectData.credits) || 3,
      instructor: subjectData.instructor || 'TBD',
      category: subjectData.category || 'Core',
      status: subjectData.status || 'Ongoing',
      semester: subjectData.semester || activeSemester,
      syllabus: subjectData.syllabus || '',
      attendedDays: Number(subjectData.attendedDays) || 0,
      totalDays: Number(subjectData.totalDays) || 0,
      revisionStatus: subjectData.revisionStatus || 'Not Started',
      weakTopics: subjectData.weakTopics || [],
      internalMarks: subjectData.internalMarks || '',
      practicals: subjectData.practicals || '',
      vivaPrep: subjectData.vivaPrep || '',
    };
    const savedSubject = await academicService.create(next);
    set(state => ({ subjects: [...state.subjects, savedSubject], selectedSubjectId: savedSubject.id }));
    await get().logActivity({ action: 'created', entityType: 'subject', entityId: savedSubject.id, metadata: { name: savedSubject.name } });
  },

  updateSubject: async (id, updates) => {
    const subject = get().subjects.find(s => s.id === id);
    if (!subject) return;
    const next = { ...subject, ...updates };
    await academicService.update(id, next);
    set(state => ({ subjects: state.subjects.map(s => s.id === id ? next : s) }));
  },

  deleteSubject: async (id) => {
    const existing = get().subjects.find(s => s.id === id);
    if (existing) {
      const { trashService } = await import('../database/services/trashService');
      await trashService.moveToTrash('academicSubjects', existing);
    }
    await academicService.delete(id);
    set(state => ({
      subjects: state.subjects.filter(s => s.id !== id),
      selectedSubjectId: state.selectedSubjectId === id ? (state.subjects.find(s => s.id !== id)?.id || null) : state.selectedSubjectId,
    }));
    await get().logActivity({ action: 'deleted', entityType: 'subject', entityId: id, metadata: { name: existing?.name } });
  },

  // ─── Assignment CRUD ────────────────────────────────────────────────────────
  updateAssignmentProgress: async (assignmentId, progress) => {
    const assignments = get().assignments;
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    const nextProgress = Math.max(0, Math.min(100, Number(progress) || 0));
    const updatedAssignment = { ...assignment, progress: nextProgress, status: nextProgress >= 100 ? 'completed' : nextProgress > 0 ? 'in_progress' : 'pending' };
    set({ assignments: assignments.map(a => a.id === assignmentId ? updatedAssignment : a) });
    await localDb.put('academicAssignments', updatedAssignment);
    await get().logActivity({ action: updatedAssignment.status === 'completed' ? 'completed' : 'progress_updated', entityId: assignmentId, metadata: { title: assignment.title, progress: nextProgress } });
  },

  addAssignment: async (assignmentData) => {
    const next = { subjectId: assignmentData.subjectId || get().selectedSubjectId, title: assignmentData.title || 'New Assignment', deadline: assignmentData.deadline || '', status: 'pending', progress: 0, priority: assignmentData.priority || 'Medium' };
    const saved = await localDb.put('academicAssignments', next);
    set(state => ({ assignments: [...state.assignments, saved] }));
    await get().logActivity({ action: 'created', entityType: 'assignment', entityId: saved.id, metadata: { title: saved.title } });
  },

  deleteAssignment: async (id) => {
    const existing = get().assignments.find(a => a.id === id);
    if (existing) { const { trashService } = await import('../database/services/trashService'); await trashService.moveToTrash('academicAssignments', existing); }
    await localDb.delete('academicAssignments', id);
    set(state => ({ assignments: state.assignments.filter(a => a.id !== id) }));
  },

  addRevisionLog: async (logData) => {
    const id = `rev-local-${Date.now()}`;
    const next = { id, date: logData.date || new Date().toISOString().slice(0, 10), subjectId: logData.subjectId || get().selectedSubjectId, topic: logData.topic || 'Quick revision note', confidence: Math.max(1, Math.min(10, Number(logData.confidence) || 6)), hours: Math.max(0.1, Number(logData.hours) || 0.5) };
    await localDb.put('academicRevisionLogs', next);
    set(state => ({ revisionLogs: [next, ...state.revisionLogs] }));
    await get().logActivity({ action: 'created', entityType: 'revisionLog', entityId: id, metadata: { topic: next.topic } });
  },

  // ─── DSA CRUD ───────────────────────────────────────────────────────────────
  addDsaQuestion: async (data) => {
    const next = { id: `dsa-${Date.now()}`, title: 'New Problem', platform: 'LeetCode', difficulty: 'Easy', notes: '', date: new Date().toISOString().slice(0, 10), linkedTaskIds: [], ...data };
    await localDb.put('academicDsa', next);
    set(state => ({ dsaQuestions: [...state.dsaQuestions, next], codingProgress: { ...state.codingProgress, solvedProblems: state.codingProgress.solvedProblems + 1 } }));
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

  updateCodingProgress: async (updates) => {
    const next = { ...get().codingProgress, ...updates };
    set({ codingProgress: next });
    await localDb.put('academicMeta', { id: 'coding-progress', ...next });
  },

  // ─── Skill CRUD ─────────────────────────────────────────────────────────────
  addSkill: async (skillData) => {
    const next = { id: `skill-${Date.now()}`, name: 'New Skill', category: 'General', progress: 0, difficulty: 'Medium', status: 'Learning', notes: '', linkedGoalIds: [], linkedTaskIds: [], resources: [], ...skillData };
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
    if (existing) { const { trashService } = await import('../database/services/trashService'); await trashService.moveToTrash('academicSkills', existing); }
    await localDb.delete('academicSkills', id);
    set(state => ({ skills: state.skills.filter(s => s.id !== id) }));
  },

  // ─── Project CRUD ───────────────────────────────────────────────────────────
  addProject: async (data) => {
    const next = { id: `proj-${Date.now()}`, name: 'New Project', description: '', stack: '', status: 'idea', progress: 0, github: '', link: '', roadmap: '', notes: '', linkedGoalIds: [], linkedTaskIds: [], ...data };
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
    if (existing) { const { trashService } = await import('../database/services/trashService'); await trashService.moveToTrash('academicProjects', existing); }
    await localDb.delete('academicProjects', id);
    set(state => ({ projects: state.projects.filter(p => p.id !== id) }));
  },

  // ─── TechStack CRUD ─────────────────────────────────────────────────────────
  addTechStack: async (tech) => {
    const next = { id: `tech-${Date.now()}`, name: tech, category: 'General', proficiency: 'Beginner', currentlyLearning: true, notes: '' };
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
    if (existing) { const { trashService } = await import('../database/services/trashService'); await trashService.moveToTrash('academicTechStack', existing); }
    await localDb.delete('academicTechStack', id);
    set(state => ({ techStack: state.techStack.filter(t => t.id !== id) }));
  },

  // ─── Active Learning CRUD ───────────────────────────────────────────────────
  addActiveLearning: async (data) => {
    const next = { id: `learn-${Date.now()}`, topic: 'New Subject', source: 'Resource', progress: 0, consistency: 0, notes: '', linkedGoalIds: [], linkedTaskIds: [], ...data };
    await localDb.put('academicLearning', next);
    set(state => ({ activeLearning: [...state.activeLearning, next] }));
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
    if (existing) { const { trashService } = await import('../database/services/trashService'); await trashService.moveToTrash('academicLearning', existing); }
    await localDb.delete('academicLearning', id);
    set(state => ({ activeLearning: state.activeLearning.filter(i => i.id !== id) }));
  },

  // ─── Certification CRUD ─────────────────────────────────────────────────────
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
    if (existing) { const { trashService } = await import('../database/services/trashService'); await trashService.moveToTrash('academicCertifications', existing); }
    await localDb.delete('academicCertifications', id);
    set(state => ({ certifications: state.certifications.filter(c => c.id !== id) }));
  },

  // ─── Portfolio CRUD ─────────────────────────────────────────────────────────
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
    if (existing) { const { trashService } = await import('../database/services/trashService'); await trashService.moveToTrash('academicPortfolio', existing); }
    await localDb.delete('academicPortfolio', id);
    set(state => ({ portfolio: state.portfolio.filter(p => p.id !== id) }));
  },
}));

export { SEMESTERS };
