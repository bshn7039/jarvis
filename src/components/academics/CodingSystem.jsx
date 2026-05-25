import React from 'react';
import { useAcademicStore } from '../../store/academicStore';
import { useEntityStore } from '../../store/entityStore';
import PagePanel from '../ui/PagePanel';
import ProgressBar from '../ui/ProgressBar';
import { Plus, Code, ExternalLink, Pencil, Trash2, Terminal, Cpu, Database, Layout, ShieldCheck, Bug } from 'lucide-react';

export default function CodingSystem() {
  const { skills, projects, codingProgress, techStack, dsaQuestions, deleteSkill, deleteProject, deleteTechStack } = useAcademicStore();
  const { openCreateModal, openEditModal } = useEntityStore();

  const solvedCount = dsaQuestions.length;
  const dsaPct = Math.round((solvedCount / (codingProgress.targetProblems || 1)) * 100);

  // Categorize projects
  const academicProjects = projects.filter(p => p.category === 'Academic');
  const portfolioProjects = projects.filter(p => p.category !== 'Academic');

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* DSA TRACKER */}
        <PagePanel 
          title="DSA Tracker"
          actions={
            <div className="flex items-center gap-2">
              <button onClick={() => openEditModal('dsaProgress')} className="text-jarvis-muted hover:text-jarvis-text"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => openCreateModal('dsa')} className="text-jarvis-muted hover:text-jarvis-text"><Plus className="h-4 w-4" /></button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="text-center p-3 rounded-lg bg-jarvis-accent/5 border border-jarvis-accent/20">
              <p className="text-2xl font-bold text-jarvis-text">{solvedCount}</p>
              <p className="text-[10px] uppercase tracking-widest text-jarvis-muted">Solved Problems</p>
              <div className="mt-2">
                <ProgressBar value={dsaPct} height={4} />
                <p className="mt-1 text-[9px] text-jarvis-muted">Target: {codingProgress.targetProblems || 500}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-jarvis-muted">Current Focus</span>
                <span className="text-jarvis-text font-medium">{codingProgress.currentTopic || '—'}</span>
              </div>
              
              <div>
                <p className="text-[9px] text-jarvis-muted uppercase tracking-wider mb-1">Revision Queue</p>
                <div className="flex flex-wrap gap-1">
                  {codingProgress.revisionQueue?.length > 0 ? codingProgress.revisionQueue.map(q => (
                    <span key={q} className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 border border-jarvis-border/40 text-jarvis-muted">{q}</span>
                  )) : <p className="text-[9px] text-jarvis-muted italic">Empty</p>}
                </div>
              </div>
            </div>
          </div>
        </PagePanel>

        {/* CODING ROADMAP */}
        <PagePanel 
          title="Coding Roadmap"
          actions={<button onClick={() => openCreateModal('skill')} className="text-jarvis-muted hover:text-jarvis-text"><Plus className="h-4 w-4" /></button>}
        >
          <div className="space-y-3">
             <div className="grid grid-cols-2 gap-2">
                <div className="rounded border border-jarvis-border/40 bg-white/5 p-2 flex items-center gap-2">
                   <Layout className="h-3 w-3 text-blue-400" />
                   <span className="text-[10px] text-jarvis-text">Frontend</span>
                </div>
                <div className="rounded border border-jarvis-border/40 bg-white/5 p-2 flex items-center gap-2">
                   <Cpu className="h-3 w-3 text-orange-400" />
                   <span className="text-[10px] text-jarvis-text">Backend</span>
                </div>
             </div>

             <div className="space-y-2">
               {skills.map(skill => (
                 <div key={skill.id} className="group relative rounded border border-jarvis-border/30 p-2">
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
             </div>
          </div>
        </PagePanel>

        {/* JARVIS DEVELOPMENT */}
        <PagePanel 
          title="Jarvis Development"
          subtitle="System Evolution Tracking"
        >
          <div className="space-y-3">
             <div className="rounded-lg bg-black/40 border border-jarvis-border/60 p-3">
                <div className="flex items-center gap-2 mb-2">
                   <Bug className="h-3.5 w-3.5 text-red-400" />
                   <span className="text-[10px] uppercase font-bold text-jarvis-text">Pending Features</span>
                </div>
                <ul className="space-y-1.5">
                   <li className="text-[10px] text-jarvis-muted flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-jarvis-accent" /> AI Integration Layer</li>
                   <li className="text-[10px] text-jarvis-muted flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-jarvis-accent" /> Persistence Optimization</li>
                   <li className="text-[10px] text-jarvis-muted flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-jarvis-accent" /> Mobile Responsive Shell</li>
                </ul>
             </div>
             
             <div className="flex justify-between items-center text-[10px] p-2 rounded border border-dashed border-jarvis-border/40">
                <span className="text-jarvis-muted">Architecture Status</span>
                <span className="text-green-400 font-mono">STABLE v0.8</span>
             </div>
          </div>
        </PagePanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ACADEMIC PROJECTS */}
        <PagePanel 
          title="Academic Projects" 
          subtitle="Mini Projects & Lab Assignments"
          actions={<button onClick={() => openCreateModal('project', { category: 'Academic' })} className="text-jarvis-muted hover:text-jarvis-text"><Plus className="h-4 w-4" /></button>}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {academicProjects.length > 0 ? academicProjects.map(proj => (
              <ProjectCard key={proj.id} proj={proj} onEdit={openEditModal} onDelete={deleteProject} />
            )) : <p className="text-[10px] text-jarvis-muted italic py-4">No academic projects logged.</p>}
          </div>
        </PagePanel>

        {/* PORTFOLIO PROJECTS */}
        <PagePanel 
          title="Portfolio Projects" 
          subtitle="Personal & Employability Assets"
          actions={<button onClick={() => openCreateModal('project', { category: 'Portfolio' })} className="text-jarvis-muted hover:text-jarvis-text"><Plus className="h-4 w-4" /></button>}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {portfolioProjects.length > 0 ? portfolioProjects.map(proj => (
              <ProjectCard key={proj.id} proj={proj} onEdit={openEditModal} onDelete={deleteProject} />
            )) : <p className="text-[10px] text-jarvis-muted italic py-4">No portfolio projects logged.</p>}
          </div>
        </PagePanel>
      </div>

      {/* TECH STACK */}
      <PagePanel 
        title="Technology Stack" 
        actions={<button onClick={() => openCreateModal('techStack')} className="text-jarvis-muted hover:text-jarvis-text"><Plus className="h-4 w-4" /></button>}
      >
        <div className="flex flex-wrap gap-2">
          {techStack.map(tech => (
            <div key={tech.id} className="group relative px-3 py-1.5 rounded-lg border border-jarvis-border bg-black/20 text-xs text-jarvis-text flex items-center gap-2">
              <Terminal className="h-3 w-3 text-jarvis-muted" />
              <span>{tech.name}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <button onClick={() => openEditModal('techStack', tech.id)}><Pencil className="h-2.5 w-2.5 text-jarvis-muted" /></button>
                <button onClick={() => deleteTechStack(tech.id)}><Trash2 className="h-2.5 w-2.5 text-red-500/70" /></button>
              </div>
            </div>
          ))}
        </div>
      </PagePanel>
    </div>
  );
}

function ProjectCard({ proj, onEdit, onDelete }) {
  return (
    <div className="group relative rounded-xl border border-jarvis-border bg-black/20 p-3 flex flex-col justify-between">
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
      <div className="mt-4">
        <ProgressBar value={proj.progress} height={3} />
        <div className="mt-2 flex gap-3">
          {proj.github && <a href={proj.github} target="_blank" rel="noreferrer" className="text-jarvis-muted hover:text-jarvis-text"><Code className="h-3 w-3" /></a>}
          {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-jarvis-muted hover:text-jarvis-text"><ExternalLink className="h-3 w-3" /></a>}
        </div>
      </div>
    </div>
  );
}
