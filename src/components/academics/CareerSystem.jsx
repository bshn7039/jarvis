import React, { useState } from 'react';
import { useAcademicStore } from '../../store/academicStore';
import { useEntityStore } from '../../store/entityStore';
import PagePanel from '../ui/PagePanel';
import ProgressBar from '../ui/ProgressBar';
import {
  Plus, Pencil, Trash2, Link2, FileText, Briefcase,
  ExternalLink, GraduationCap, X, ChevronRight, Lock, Star
} from 'lucide-react';

// ─── Career OS Drawer ────────────────────────────────────────────────────────
function CareerOSDrawer({ isOpen, onClose }) {
  const { certifications, portfolio, skills, deleteCertification, deletePortfolioItem, deleteSkill } = useAcademicStore();
  const { openCreateModal, openEditModal } = useEntityStore();
  const [activeTab, setActiveTab] = useState('skills');

  const tabs = [
    { id: 'skills', label: 'Skills' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'handles', label: 'Social Handles' },
    { id: 'resume', label: 'Resume Builder' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-[#0a0a12] border-l border-jarvis-border shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-jarvis-border bg-black/40">
          <div>
            <h2 className="text-sm font-bold text-jarvis-text flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-jarvis-accent" />
              Career OS
            </h2>
            <p className="text-[10px] text-jarvis-muted mt-0.5">Professional readiness builder — prepare now, deploy later</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-jarvis-muted hover:text-jarvis-text hover:bg-white/10 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sem 3 Notice */}
        <div className="mx-6 mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
          <div className="flex items-start gap-2">
            <Lock className="h-3.5 w-3.5 text-yellow-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-yellow-400">Semester 3 — Build Mode</p>
              <p className="text-[9px] text-jarvis-muted mt-0.5 leading-relaxed">
                Active deployment of Resume, LinkedIn, and Internship Prep is locked until Semester 4. Use this space now to build your foundation — add skills, log certifications, and draft your portfolio items.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-6 mt-4 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-jarvis-accent/15 border border-jarvis-accent/40 text-jarvis-accent'
                  : 'border border-jarvis-border/40 text-jarvis-muted hover:border-jarvis-border hover:text-jarvis-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {activeTab === 'skills' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-jarvis-muted uppercase tracking-wider">Technical & Soft Skills</p>
                <button onClick={() => openCreateModal('skill')} className="flex items-center gap-1 text-[10px] text-jarvis-accent hover:text-jarvis-accent/80">
                  <Plus className="h-3.5 w-3.5" /> Add Skill
                </button>
              </div>
              <div className="space-y-2">
                {skills.map(skill => (
                  <div key={skill.id} className="group rounded-xl border border-jarvis-border/40 bg-white/[0.02] p-3">
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <p className="text-xs font-medium text-jarvis-text">{skill.name}</p>
                        <p className="text-[9px] text-jarvis-muted">{skill.category} · {skill.status}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={() => openEditModal('skill', skill.id)}><Pencil className="h-3 w-3 text-jarvis-muted" /></button>
                        <button onClick={() => deleteSkill(skill.id)}><Trash2 className="h-3 w-3 text-red-500/70" /></button>
                      </div>
                    </div>
                    <ProgressBar value={skill.progress} height={2} />
                    <p className="mt-1 text-[9px] text-jarvis-muted">{skill.progress}% proficiency</p>
                  </div>
                ))}
                {skills.length === 0 && <p className="text-[10px] text-jarvis-muted italic py-4 text-center">No skills logged yet. Start building your profile.</p>}
              </div>
            </div>
          )}

          {activeTab === 'certifications' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-jarvis-muted uppercase tracking-wider">Courses & Certifications</p>
                <button onClick={() => openCreateModal('certification')} className="flex items-center gap-1 text-[10px] text-jarvis-accent hover:text-jarvis-accent/80">
                  <Plus className="h-3.5 w-3.5" /> Add Cert
                </button>
              </div>
              <div className="space-y-2">
                {certifications.map(cert => (
                  <div key={cert.id} className="group rounded-xl border border-jarvis-border/40 bg-white/[0.02] p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs font-bold text-jarvis-text">{cert.course}</p>
                        <p className="text-[9px] text-jarvis-muted">{cert.platform}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={() => openEditModal('certification', cert.id)}><Pencil className="h-3 w-3 text-jarvis-muted" /></button>
                        <button onClick={() => deleteCertification(cert.id)}><Trash2 className="h-3 w-3 text-red-500/70" /></button>
                      </div>
                    </div>
                    <ProgressBar value={cert.progress} height={2} />
                    <div className="mt-2 flex justify-between text-[9px]">
                      <span className="text-jarvis-muted">{cert.status}</span>
                      {cert.certificateLink && <a href={cert.certificateLink} target="_blank" rel="noreferrer" className="text-jarvis-accent hover:underline flex items-center gap-1"><ExternalLink className="h-2.5 w-2.5" />View</a>}
                    </div>
                  </div>
                ))}
                {certifications.length === 0 && <p className="text-[10px] text-jarvis-muted italic py-4 text-center">No certifications yet.</p>}
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-jarvis-muted uppercase tracking-wider">Portfolio Items</p>
                <button onClick={() => openCreateModal('portfolio')} className="flex items-center gap-1 text-[10px] text-jarvis-accent hover:text-jarvis-accent/80">
                  <Plus className="h-3.5 w-3.5" /> Add Item
                </button>
              </div>
              <div className="rounded-xl border border-jarvis-accent/20 bg-jarvis-accent/5 p-3 mb-3">
                <p className="text-[9px] text-jarvis-accent leading-relaxed">
                  ✨ Portfolio projects are fully unlocked! Add, edit, and draft your academic and professional projects below.
                </p>
              </div>
              <div className="space-y-2">
                {portfolio.map(item => (
                  <div key={item.id} className="group rounded-xl border border-jarvis-border/40 bg-white/[0.02] p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-jarvis-text">{item.title}</p>
                        {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="text-[9px] text-jarvis-accent hover:underline flex items-center gap-1"><ExternalLink className="h-2.5 w-2.5" />Live</a>}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={() => openEditModal('portfolio', item.id)}><Pencil className="h-3 w-3 text-jarvis-muted" /></button>
                        <button onClick={() => deletePortfolioItem(item.id)}><Trash2 className="h-3 w-3 text-red-500/70" /></button>
                      </div>
                    </div>
                    {item.notes && <p className="mt-1 text-[10px] text-jarvis-muted">{item.notes}</p>}
                  </div>
                ))}
                {portfolio.length === 0 && <p className="text-[10px] text-jarvis-muted italic py-4 text-center">No portfolio items. Draft your ideas here.</p>}
              </div>
            </div>
          )}

          {activeTab === 'handles' && (
            <div className="space-y-3">
              <p className="text-[10px] text-jarvis-muted uppercase tracking-wider mb-2">Professional Presence</p>
              {[
                { label: 'LinkedIn', placeholder: 'linkedin.com/in/yourname', icon: '💼', color: 'text-blue-400' },
                { label: 'GitHub', placeholder: 'github.com/yourname', icon: '💻', color: 'text-gray-300' },
                { label: 'LeetCode', placeholder: 'leetcode.com/yourname', icon: '⚡', color: 'text-yellow-400' },
                { label: 'Email', placeholder: 'your@email.com', icon: '📧', color: 'text-green-400' },
              ].map(handle => (
                <div key={handle.label} className="flex items-center gap-3 p-3 rounded-xl border border-jarvis-border/40 bg-white/[0.02]">
                  <span className="text-base w-6 text-center">{handle.icon}</span>
                  <div className="flex-1">
                    <p className={`text-[9px] font-bold uppercase tracking-wider ${handle.color} mb-1`}>{handle.label}</p>
                    <input
                      type="text"
                      placeholder={handle.placeholder}
                      className="w-full bg-transparent text-[10px] text-jarvis-text placeholder-jarvis-muted/40 outline-none"
                    />
                  </div>
                </div>
              ))}
              <p className="text-[9px] text-jarvis-muted italic mt-2">Handle linking will be connected to the profile store in a future update.</p>
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="space-y-4">
              <p className="text-[10px] text-jarvis-muted uppercase tracking-wider mb-2">Resume Builder</p>
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-orange-400" />
                  <p className="text-xs font-bold text-orange-400">Status: Build Phase</p>
                </div>
                <p className="text-[10px] text-jarvis-muted leading-relaxed">
                  Your resume is being built from your skills, certifications, and projects. Active deployment starts in Semester 4. Focus on adding real skills and completing certifications now.
                </p>
              </div>
              {/* Resume sections preview */}
              <div className="space-y-2">
                {[
                  { section: 'Education', status: `B.Tech Computer Engineering, Lateral Entry`, ready: true },
                  { section: 'Technical Skills', status: `${useAcademicStore.getState().skills.length} skills logged`, ready: useAcademicStore.getState().skills.length > 0 },
                  { section: 'Projects', status: `${useAcademicStore.getState().projects.length} projects`, ready: useAcademicStore.getState().projects.length > 0 },
                  { section: 'Certifications', status: `${useAcademicStore.getState().certifications.length} certificates`, ready: useAcademicStore.getState().certifications.length > 0 },
                ].map(item => (
                  <div key={item.section} className="flex items-center justify-between p-2.5 rounded-lg border border-jarvis-border/30 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${item.ready ? 'bg-green-400' : 'bg-jarvis-border'}`} />
                      <span className="text-[10px] text-jarvis-text">{item.section}</span>
                    </div>
                    <span className="text-[9px] text-jarvis-muted">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main CareerSystem Component ─────────────────────────────────────────────
export default function CareerSystem({ semester }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isSem3 = !semester || semester === 'Sem 3';

  return (
    <>
      {/* Career OS Drawer */}
      <CareerOSDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {isSem3 ? (
        /* Archived state for Sem 3 */
        <div className="rounded-2xl border border-dashed border-jarvis-border/40 bg-black/10 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] border border-jarvis-border/40 shrink-0">
                <Briefcase className="h-6 w-6 text-jarvis-muted" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-jarvis-text mb-1">Career Hub</h3>
                <p className="text-xs text-jarvis-muted leading-relaxed max-w-2xl">
                  Career deployment is archived for Semester 3. Your focus right now should be on Data Structures, COA, and Discrete Math — the engineering foundations that will make everything else easier.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Resume', 'LinkedIn Optimization', 'Internship Prep'].map(item => (
                    <span key={item} className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-full bg-white/5 border border-jarvis-border/30 text-jarvis-muted/60">
                      <Lock className="h-2.5 w-2.5" />
                      {item} — Unlocks Sem 4
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-jarvis-accent/30 bg-jarvis-accent/5 text-jarvis-accent hover:bg-jarvis-accent/10 hover:border-jarvis-accent/50 hover:shadow-[0_0_16px_rgba(var(--color-accent)/0.2)] transition-all text-xs font-medium shrink-0"
              >
                Open Career OS
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-jarvis-border/20">
              {[
                { label: 'Skills Logged', value: useAcademicStore.getState().skills.length },
                { label: 'Certifications', value: useAcademicStore.getState().certifications.length },
                { label: 'Portfolio Items', value: useAcademicStore.getState().portfolio.length },
              ].map(stat => (
                <div key={stat.label} className="text-center py-2">
                  <p className="text-lg font-bold text-jarvis-text">{stat.value}</p>
                  <p className="text-[9px] text-jarvis-muted uppercase tracking-wide mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Full Career System for Sem 4+ */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-jarvis-text">Career System — Active</h3>
              <p className="text-[10px] text-jarvis-muted">Full career deployment operational from Semester 4</p>
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-jarvis-accent/40 bg-jarvis-accent/10 text-jarvis-accent hover:bg-jarvis-accent/20 transition-all text-xs font-medium"
            >
              Open Career OS
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
