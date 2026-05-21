import { useMemo } from 'react';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import PagePanel from '../components/ui/PagePanel';
import SubjectCard from '../components/academics/SubjectCard';
import AssignmentBoard from '../components/academics/AssignmentBoard';
import RevisionLogTable from '../components/academics/RevisionLogTable';
import ProgressBar from '../components/ui/ProgressBar';
import { useAcademicStore } from '../store/academicStore';

function daysUntil(dateValue) {
  const today = new Date('2026-05-21T00:00:00');
  const date = new Date(`${dateValue}T00:00:00`);
  return Math.max(0, Math.ceil((date - today) / (1000 * 60 * 60 * 24)));
}

export default function Academics() {
  const currentSemester = useAcademicStore((s) => s.currentSemester);
  const termEndDate = useAcademicStore((s) => s.termEndDate);
  const subjects = useAcademicStore((s) => s.subjects);
  const assignments = useAcademicStore((s) => s.assignments);
  const practicals = useAcademicStore((s) => s.practicals);
  const revisionLogs = useAcademicStore((s) => s.revisionLogs);
  const codingProgress = useAcademicStore((s) => s.codingProgress);
  const projects = useAcademicStore((s) => s.projects);
  const selectedSubjectId = useAcademicStore((s) => s.selectedSubjectId);
  const setSelectedSubjectId = useAcademicStore((s) => s.setSelectedSubjectId);
  const updateAssignmentProgress = useAcademicStore((s) => s.updateAssignmentProgress);
  const addSubject = useAcademicStore((s) => s.addSubject);
  const addAssignment = useAcademicStore((s) => s.addAssignment);

  const subjectMap = useMemo(
    () => Object.fromEntries(subjects.map((subject) => [subject.id, subject.name])),
    [subjects],
  );
  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId) ?? subjects[0];
  const selectedAssignments = assignments.filter((assignment) => assignment.subjectId === selectedSubject?.id);
  const selectedRevision = revisionLogs.filter((log) => log.subjectId === selectedSubject?.id);
  const completedPracticals = practicals.filter((practical) => practical.status === 'completed').length;
  const codingPct = Math.round(
    (codingProgress.solvedProblems / Math.max(codingProgress.targetProblems, 1)) * 100,
  );

  return (
    <ModulePageLayout title="Academics" subtitle="Semester control center for CS progress and revision discipline.">
      <PagePanel title={currentSemester} subtitle={`Term ends on ${termEndDate} (${daysUntil(termEndDate)} days left)`}>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-jarvis-border bg-black/20 p-3">
            <p className="text-xs text-jarvis-muted">Coding Tracker</p>
            <p className="mt-1 text-sm text-jarvis-text">
              {codingProgress.solvedProblems} / {codingProgress.targetProblems} solved
            </p>
            <div className="mt-2">
              <ProgressBar value={codingPct} />
            </div>
          </div>
          <div className="rounded-xl border border-jarvis-border bg-black/20 p-3">
            <p className="text-xs text-jarvis-muted">Problem Solving Streak</p>
            <p className="mt-1 text-sm text-jarvis-text">{codingProgress.streakDays} days</p>
          </div>
          <div className="rounded-xl border border-jarvis-border bg-black/20 p-3">
            <p className="text-xs text-jarvis-muted">Practicals Completed</p>
            <p className="mt-1 text-sm text-jarvis-text">
              {completedPracticals} / {practicals.length}
            </p>
          </div>
        </div>
      </PagePanel>

      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <PagePanel 
          title="Subjects"
          actions={
            <button
              type="button"
              onClick={() => addSubject({ name: 'Computer Networks', code: 'CS601' })}
              className="rounded-lg border border-jarvis-border bg-white/5 px-3 py-1.5 text-xs text-jarvis-text"
            >
              New Subject
            </button>
          }
        >
          <div className="space-y-2">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                selected={subject.id === selectedSubject?.id}
                onSelect={setSelectedSubjectId}
              />
            ))}
          </div>
        </PagePanel>

        <div className="space-y-4">
          <PagePanel
            title={`${selectedSubject?.name || 'Subject'} Assignments`}
            subtitle="Assignments, practicals, and project progress."
            actions={
              <button
                type="button"
                onClick={() => addAssignment({ title: 'New Lab Work' })}
                className="rounded-lg border border-jarvis-border bg-white/5 px-3 py-1.5 text-xs text-jarvis-text"
              >
                New Assignment
              </button>
            }
          >
            <AssignmentBoard
              assignments={selectedAssignments}
              onUpdateProgress={updateAssignmentProgress}
            />
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {projects.map((project) => (
                <article key={project.id} className="rounded-xl border border-jarvis-border bg-black/20 p-3">
                  <p className="text-sm text-jarvis-text">{project.name}</p>
                  <p className="mt-1 text-xs text-jarvis-muted">Status: {project.status}</p>
                  <div className="mt-2">
                    <ProgressBar value={project.progress} />
                  </div>
                </article>
              ))}
            </div>
          </PagePanel>

          <PagePanel title="Revision Tracker" subtitle="Logs, confidence, and study-hour trail.">
            <RevisionLogTable logs={selectedRevision} subjectMap={subjectMap} />
          </PagePanel>
        </div>
      </div>
    </ModulePageLayout>
  );
}
