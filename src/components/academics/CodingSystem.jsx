import React, { useState } from 'react';
import { useAcademicStore } from '../../store/academicStore';
import { useEntityStore } from '../../store/entityStore';
import PagePanel from '../ui/PagePanel';
import ProgressBar from '../ui/ProgressBar';
import {
  Plus, Code, ExternalLink, Pencil, Trash2,
  Terminal, Lock, Target, Zap, BookOpen, ChevronRight
} from 'lucide-react';

const DSA_PHASE_TOPICS = [
  { id: 'arrays', label: 'Arrays', done: false },
  { id: 'strings', label: 'Strings', done: false },
  { id: 'loops', label: 'Loops & Logic', done: false },
  { id: 'recursion', label: 'Recursion Basics', done: false },
];

const LANGUAGE_TRACKS = [
  { id: 'java', label: 'Java', icon: '☕', color: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/5', desc: 'Primary – OOP Foundation' },
  { id: 'cpp', label: 'C++', icon: '⚡', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5', desc: 'DSA & Competitive Coding' },
];

export default function CodingSystem() {
  const {
    skills, projects, codingProgress, techStack, dsaQuestions,
    deleteSkill, deleteProject, deleteTechStack, activeSemester
  } = useAcademicStore();
  const { openCreateModal, openEditModal } = useEntityStore();

  const solvedCount = dsaQuestions.length;
  const target = codingProgress.targetProblems || 50;
  const dsaPct = Math.min(100, Math.round((solvedCount / target) * 100));
  const isPhase1Locked = false; // Portfolio projects are fully unlocked

  const handleLanguageClick = (langId) => {
    const matched = skills.find(s => s.name?.toLowerCase().includes(langId === 'cpp' ? 'c++' : 'java'));
    if (matched) {
      openEditModal('skill', matched.id);
    } else {
      openCreateModal('skill', 'full', {
        name: langId === 'java' ? 'Java Programming' : 'C++ Programming',
        category: 'Programming',
        progress: 0,
        difficulty: 'Medium',
        status: 'Learning',
        notes: `${langId === 'java' ? 'Java OOP' : 'C++ DSA'} mastery track`
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* DSA TRACKER */}
        <PagePanel
          title="DSA Tracker"
          subtitle={codingProgress.targetLabel || 'Phase 1: 50 Problems'}
          actions={
            <div className="flex items-center gap-2">
              <button onClick={() => openEditModal('dsaProgress')} className="text-jarvis-muted hover:text-jarvis-text"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => openCreateModal('dsa')} className="text-jarvis-muted hover:text-jarvis-text"><Plus className="h-4 w-4" /></button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Counter */}
            <div className="text-center p-4 rounded-xl bg-jarvis-accent/5 border border-jarvis-accent/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-jarvis-accent/5 to-transparent pointer-events-none" />
              <p className="text-4xl font-bold text-jarvis-text font-mono relative z-10">{solvedCount}</p>
              <p className="text-[10px] uppercase tracking-widest text-jarvis-muted mt-1 relative z-10">Problems Solved</p>
              <div className="mt-3 relative z-10">
                <ProgressBar value={dsaPct} height={4} />
                <p className="mt-1.5 text-[9px] text-jarvis-muted">
                  {solvedCount} / {target} — {codingProgress.targetPhase || 'Arrays, Strings & Loops'}
                </p>
              </div>
            </div>

            {/* Phase Topics */}
            <div>
              <p className="text-[9px] uppercase tracking-wider text-jarvis-muted mb-2">Phase 1 Topics</p>
              <div className="space-y-1.5">
                {DSA_PHASE_TOPICS.map(t => (
                  <div key={t.id} className="flex items-center gap-2 text-[10px] py-1 px-2 rounded bg-white/[0.03] border border-jarvis-border/30">
                    <div className={`h-1.5 w-1.5 rounded-full ${t.done ? 'bg-green-400' : 'bg-jarvis-accent'}`} />
                    <span className="text-jarvis-text">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current focus */}
            {codingProgress.currentTopic && (
              <div className="flex justify-between items-center text-[11px] bg-white/5 rounded p-2">
                <span className="text-jarvis-muted">Current Focus</span>
                <span className="text-jarvis-accent font-medium">{codingProgress.currentTopic}</span>
              </div>
            )}

            {/* Recent solves */}
            {dsaQuestions.slice(0, 3).length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-wider text-jarvis-muted mb-2">Recent Solves</p>
                {dsaQuestions.slice(0, 3).map(q => (
                  <div key={q.id} className="flex items-center justify-between py-1 text-[10px] border-b border-jarvis-border/20 last:border-0">
                    <span className="text-jarvis-text truncate">{q.title}</span>
                    <span className={`ml-2 shrink-0 text-[8px] px-1.5 py-0.5 rounded ${
                      q.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                      q.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                    }`}>{q.difficulty}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PagePanel>

        {/* LANGUAGE MASTERY */}
        <PagePanel
          title="Language Mastery"
          subtitle="Java & C++ Core Tracks"
          actions={<button onClick={() => openCreateModal('skill')} className="text-jarvis-muted hover:text-jarvis-text"><Plus className="h-4 w-4" /></button>}
        >
          <div className="space-y-4">
            {/* Language Cards */}
            <div className="space-y-3">
              {LANGUAGE_TRACKS.map(lang => {
                const hasSkill = skills.some(s => s.name?.toLowerCase().includes(lang.id === 'cpp' ? 'c++' : 'java'));
                const value = lang.id === 'java'
                  ? Math.min(100, Math.round(skills.filter(s => s.name?.toLowerCase().includes('java')).reduce((a, s) => a + s.progress, 0) / Math.max(1, skills.filter(s => s.name?.toLowerCase().includes('java')).length)))
                  : Math.min(100, Math.round(skills.filter(s => s.name?.toLowerCase().includes('c++')).reduce((a, s) => a + s.progress, 0) / Math.max(1, skills.filter(s => s.name?.toLowerCase().includes('c++')).length)));

                return (
                  <div
                    key={lang.id}
                    onClick={() => handleLanguageClick(lang.id)}
                    className={`group/lang rounded-xl border p-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06] hover:shadow-lg ${lang.border} ${lang.bg}`}
                    title={hasSkill ? `Click to edit ${lang.label} skill` : `Click to initialize ${lang.label} skill`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{lang.icon}</span>
                        <div>
                          <p className={`text-xs font-bold ${lang.color}`}>{lang.label}</p>
                          <p className="text-[9px] text-jarvis-muted">{lang.desc}</p>
                        </div>
                      </div>
                      <span className="opacity-0 group-hover/lang:opacity-100 text-[8px] px-1.5 py-0.5 rounded bg-jarvis-accent/10 text-jarvis-accent border border-jarvis-accent/20 transition-opacity">
                        {hasSkill ? 'Edit Track' : 'Initialize'}
                      </span>
                    </div>
                    <ProgressBar value={value || 0} height={3} />
                  </div>
                );
              })}
            </div>

            {/* Skills list */}
            <div className="space-y-2">
              {skills.map(skill => (
                <div key={skill.id} className="group relative rounded border border-jarvis-border/30 p-2 hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-medium text-jarvis-text">{skill.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <button onClick={() => openEditModal('skill', skill.id)}><Pencil className="h-2.5 w-2.5 text-jarvis-muted" /></button>
                      <button onClick={() => deleteSkill(skill.id)}><Trash2 className="h-2.5 w-2.5 text-red-500/70" /></button>
                    </div>
                  </div>
                  <ProgressBar value={skill.progress} height={2} />
                </div>
              ))}
              {skills.length === 0 && (
                <p className="text-[10px] text-jarvis-muted italic py-2 text-center">Add your first skill to track</p>
              )}
            </div>
          </div>
        </PagePanel>

        {/* TECH STACK */}
        <PagePanel
          title="Tech Stack"
          subtitle="Languages & Tools"
          actions={<button onClick={() => openCreateModal('techStack')} className="text-jarvis-muted hover:text-jarvis-text"><Plus className="h-4 w-4" /></button>}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {techStack.map(tech => (
                <div key={tech.id} className="group relative px-2.5 py-1 rounded-lg border border-jarvis-border bg-black/20 text-xs text-jarvis-text flex items-center gap-1.5 hover:border-jarvis-accent/40 transition-colors">
                  <Terminal className="h-3 w-3 text-jarvis-muted" />
                  <span>{tech.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 ml-1">
                    <button onClick={() => openEditModal('techStack', tech.id)}><Pencil className="h-2.5 w-2.5 text-jarvis-muted" /></button>
                    <button onClick={() => deleteTechStack(tech.id)}><Trash2 className="h-2.5 w-2.5 text-red-500/70" /></button>
                  </div>
                </div>
              ))}
              {techStack.length === 0 && <p className="text-[10px] text-jarvis-muted italic">No tech stack added yet.</p>}
            </div>
          </div>
        </PagePanel>
      </div>

      {/* ACADEMIC PROJECTS */}
      <PagePanel
        title="Academic Projects"
        subtitle="Lab Work & Mini Assignments"
        actions={<button onClick={() => openCreateModal('project', { category: 'Academic' })} className="text-jarvis-muted hover:text-jarvis-text"><Plus className="h-4 w-4" /></button>}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.filter(p => p.category === 'Academic').length > 0
            ? projects.filter(p => p.category === 'Academic').map(proj => (
                <ProjectCard key={proj.id} proj={proj} onEdit={openEditModal} onDelete={deleteProject} />
              ))
            : <p className="text-[10px] text-jarvis-muted italic py-4 col-span-3">No academic projects logged yet.</p>
          }
        </div>
      </PagePanel>

      {/* PORTFOLIO — LOCKED for Sem 3 */}
      <div className={`rounded-2xl border transition-all duration-300 ${
        isPhase1Locked
          ? 'border-dashed border-jarvis-border/40 bg-black/10'
          : 'border-jarvis-border bg-black/20'
      }`}>
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
              isPhase1Locked ? 'bg-white/5 border border-jarvis-border/40' : 'bg-jarvis-accent/10 border border-jarvis-accent/20'
            }`}>
              <Lock className={`h-5 w-5 ${isPhase1Locked ? 'text-jarvis-muted' : 'text-jarvis-accent'}`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-jarvis-text mb-1">Portfolio Projects</h3>
              {isPhase1Locked ? (
                <>
                  <p className="text-xs text-jarvis-muted leading-relaxed max-w-lg">
                    🔒 Locked until Semester 4. Focus on DS & OOP foundations first.
                  </p>
                  <p className="mt-2 text-[10px] text-jarvis-muted/60 italic">
                    Once you complete Sem 3, this section will unlock for full portfolio project management.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-jarvis-muted/60">
                    <Target className="h-3 w-3" />
                    <span>Current priority: Data Structures + Java OOP mastery</span>
                  </div>
                </>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 mt-2">
                  {projects.filter(p => p.category !== 'Academic').map(proj => (
                    <ProjectCard key={proj.id} proj={proj} onEdit={openEditModal} onDelete={deleteProject} />
                  ))}
                  <button
                    onClick={() => openCreateModal('project', { category: 'Portfolio' })}
                    className="border border-dashed border-jarvis-border/40 rounded-xl p-4 text-[10px] text-jarvis-muted hover:border-jarvis-accent/40 hover:text-jarvis-accent transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Portfolio Project
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ proj, onEdit, onDelete }) {
  return (
    <div className="group relative rounded-xl border border-jarvis-border bg-black/20 p-3 flex flex-col justify-between hover:border-jarvis-accent/30 transition-colors">
      <div>
        <div className="flex justify-between items-start">
          <h4 className="text-xs font-bold text-jarvis-text">{proj.name}</h4>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
            <button onClick={() => onEdit('project', proj.id)}><Pencil className="h-2.5 w-2.5 text-jarvis-muted" /></button>
            <button onClick={() => onDelete(proj.id)}><Trash2 className="h-2.5 w-2.5 text-red-500/70" /></button>
          </div>
        </div>
        <p className="mt-1 text-[10px] text-jarvis-muted line-clamp-2">{proj.description}</p>
        <div className="mt-2 flex gap-1 flex-wrap">
          {proj.stack?.split(',').map(s => (
            <span key={s} className="text-[8px] bg-white/5 border border-jarvis-border/40 px-1.5 py-0.5 rounded text-jarvis-muted uppercase">{s.trim()}</span>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <ProgressBar value={proj.progress} height={3} />
        <div className="mt-2 flex gap-3">
          {proj.github && <a href={proj.github} target="_blank" rel="noreferrer" className="text-jarvis-muted hover:text-jarvis-text"><Code className="h-3 w-3" /></a>}
          {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-jarvis-muted hover:text-jarvis-text"><ExternalLink className="h-3 w-3" /></a>}
        </div>
      </div>
    </div>
  );
}
