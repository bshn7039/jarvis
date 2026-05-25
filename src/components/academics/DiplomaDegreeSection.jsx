import React, { useState } from 'react';
import { useProfileStore } from '../../store/profileStore';
import { useAcademicStore } from '../../store/academicStore';
import { useEntityStore } from '../../store/entityStore';
import PagePanel from '../ui/PagePanel';
import ProgressBar from '../ui/ProgressBar';
import { CheckCircle, Pencil, ChevronDown, ChevronUp, BookOpen, Clock, AlertCircle } from 'lucide-react';

export default function DiplomaDegreeSection() {
  const profile = useProfileStore((s) => s.profile);
  const { subjects } = useAcademicStore();
  const openEditModal = useEntityStore((s) => s.openEditModal);
  const openCreateModal = useEntityStore((s) => s.openCreateModal);
  const [expandedSubject, setExpandedSubject] = useState(null);
  
  if (!profile) return null;

  const { degree } = profile;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* PHASE 3: DIPLOMA SYSTEM (ARCHIVAL) */}
        <PagePanel title="Diploma System" subtitle="Archival / Completed">
          <div className="flex items-center gap-4 rounded-xl border border-jarvis-border/50 bg-black/20 p-4 h-full">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-400 shrink-0">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-jarvis-text">Diploma Completed</h4>
              <p className="text-xs text-jarvis-muted">Computer Engineering Diploma Completed Successfully</p>
              <p className="mt-1 text-[10px] text-jarvis-muted italic">Government Polytechnic</p>
            </div>
          </div>
        </PagePanel>

        {/* PHASE 4: DEGREE SYSTEM (OPERATIONAL) */}
        <PagePanel 
          title="Degree System" 
          subtitle={`${degree.semester} - ${degree.degreeName}`}
          actions={
            <button 
              onClick={() => openEditModal('profile', 'root-profile')}
              className="rounded p-1 text-jarvis-muted hover:bg-white/10 hover:text-jarvis-text"
            >
              <Pencil className="h-4 w-4" />
            </button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-jarvis-muted">College</p>
                <p className="font-medium text-jarvis-text">{degree.collegeName || 'Pillai College'}</p>
              </div>
              <div>
                <p className="text-jarvis-muted">Goal</p>
                <p className="font-medium text-jarvis-text">{degree.academicGoal || 'Adapt to degree-level workload'}</p>
              </div>
              <div>
                <p className="text-jarvis-muted">Entry</p>
                <p className="font-medium text-jarvis-text">{degree.entry || 'Direct Second Year'}</p>
              </div>
              <div>
                <p className="text-jarvis-muted">Duration</p>
                <p className="font-medium text-jarvis-text">{degree.durationYears} Years ({degree.totalSemesters} Sems)</p>
              </div>
            </div>

            <div className="rounded-lg border border-jarvis-border/30 bg-white/5 p-3">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-jarvis-text">{degree.semester} Foundation</span>
                  <span className="text-xs font-mono text-jarvis-muted">Target CGPA: {degree.targetCgpa || 10}</span>
               </div>
               <ProgressBar value={(degree.cgpa / (degree.targetCgpa || 10)) * 100} />
            </div>
          </div>
        </PagePanel>
      </div>

      {/* SUBJECTS SYSTEM */}
      <PagePanel 
        title="Subjects System" 
        subtitle="Operational Sem 1 Academic Objects"
        actions={
          <button onClick={() => openCreateModal('subject')} className="rounded p-1 text-jarvis-muted hover:bg-white/10 hover:text-jarvis-text">
            <BookOpen className="h-4 w-4" />
          </button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((sub) => (
            <div key={sub.id} className="group relative rounded-xl border border-jarvis-border bg-black/20 overflow-hidden">
              <div className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-jarvis-text truncate">{sub.name}</h4>
                    <p className="text-[9px] text-jarvis-muted uppercase">{sub.code}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => openEditModal('subject', sub.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-jarvis-muted hover:text-jarvis-text"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={() => setExpandedSubject(expandedSubject === sub.id ? null : sub.id)}
                      className="p-1 text-jarvis-muted hover:text-jarvis-text"
                    >
                      {expandedSubject === sub.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] mb-2">
                  <span className="text-jarvis-muted">Attendance</span>
                  <span className={`${sub.attendance < 75 ? 'text-red-400' : 'text-green-400'}`}>{sub.attendance}%</span>
                </div>
                <ProgressBar value={sub.attendance} height={3} className={sub.attendance < 75 ? 'bg-red-500/20' : ''} />
                
                <div className="mt-3 flex gap-2">
                  <div className="flex items-center gap-1 text-[9px] text-jarvis-muted">
                    <Clock className="h-2.5 w-2.5" />
                    <span>{sub.revisionStatus || 'Not Started'}</span>
                  </div>
                </div>
              </div>

              {expandedSubject === sub.id && (
                <div className="border-t border-jarvis-border/50 bg-white/[0.02] p-3 space-y-3">
                  {sub.syllabus && (
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-jarvis-muted mb-1">Syllabus / Topics</p>
                      <p className="text-[10px] text-jarvis-text leading-relaxed whitespace-pre-wrap">{sub.syllabus}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded border border-jarvis-border/40 p-2">
                      <p className="text-[8px] uppercase text-jarvis-muted">Internal Marks</p>
                      <p className="text-[10px] text-jarvis-text">{sub.internalMarks || '—'}</p>
                    </div>
                    <div className="rounded border border-jarvis-border/40 p-2">
                      <p className="text-[8px] uppercase text-jarvis-muted">Practicals</p>
                      <p className="text-[10px] text-jarvis-text">{sub.practicals || '—'}</p>
                    </div>
                  </div>
                  {sub.weakTopics?.length > 0 && (
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-jarvis-muted mb-1">Weak Topics</p>
                      <div className="flex flex-wrap gap-1">
                        {sub.weakTopics.map(topic => (
                          <span key={topic} className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">{topic}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {sub.vivaPrep && (
                    <div className="rounded-lg bg-jarvis-accent/5 border border-jarvis-accent/20 p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <AlertCircle className="h-3 w-3 text-jarvis-accent" />
                        <p className="text-[9px] uppercase font-bold text-jarvis-accent">Viva Prep</p>
                      </div>
                      <p className="text-[10px] text-jarvis-text">{sub.vivaPrep}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </PagePanel>
    </div>
  );
}
