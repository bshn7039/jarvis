import React from 'react';
import { useAcademicStore } from '../../store/academicStore';
import { useEntityStore } from '../../store/entityStore';
import PagePanel from '../ui/PagePanel';
import ProgressBar from '../ui/ProgressBar';
import { Plus, Pencil, Trash2, Link2, FileText, Briefcase, Send, MessageSquare, GraduationCap } from 'lucide-react';

export default function CareerSystem() {
  const { certifications, portfolio, deleteCertification, deletePortfolioItem } = useAcademicStore();
  const { openCreateModal, openEditModal } = useEntityStore();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* RESUME SECTION */}
        <PagePanel title="Resume" subtitle="Employability Documentation">
          <div className="space-y-3">
            <div className="rounded-lg border border-jarvis-border/40 bg-white/5 p-3">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-bold text-jarvis-text">Current Status</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400">Needs Update</span>
               </div>
               <div className="space-y-1.5">
                  <p className="text-[10px] text-jarvis-muted flex items-center gap-2"><FileText className="h-2.5 w-2.5" /> Latest projects added: 0</p>
                  <p className="text-[10px] text-jarvis-muted flex items-center gap-2"><FileText className="h-2.5 w-2.5" /> Skills updated: 0</p>
               </div>
               <button className="mt-3 w-full py-1.5 rounded bg-white/5 border border-jarvis-border hover:bg-white/10 text-[10px] text-jarvis-text transition-colors">
                  Upload New Version
               </button>
            </div>
          </div>
        </PagePanel>

        {/* LINKEDIN SECTION */}
        <PagePanel title="LinkedIn" subtitle="Professional Presence">
          <div className="space-y-3">
             <div className="rounded-lg border border-linkedin/20 bg-linkedin/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                   <Link2 className="h-3.5 w-3.5 text-linkedin" />
                   <span className="text-[10px] uppercase font-bold text-linkedin">Optimization</span>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px]">
                      <span className="text-jarvis-muted">Profile Score</span>
                      <span className="text-linkedin">65%</span>
                   </div>
                   <ProgressBar value={65} height={2} className="bg-linkedin/10" />
                </div>
                <div className="mt-3 space-y-1">
                   <p className="text-[9px] text-jarvis-muted">• Update headline to Computer Engineering</p>
                   <p className="text-[9px] text-jarvis-muted">• Add Sem 1 subjects to skills</p>
                </div>
             </div>
          </div>
        </PagePanel>

        {/* INTERNSHIP PREP */}
        <PagePanel title="Internship Prep" subtitle="Pre-Placement Readiness">
          <div className="space-y-3">
             <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="rounded border border-jarvis-border/40 p-2 text-center">
                   <p className="text-jarvis-muted uppercase text-[8px]">Aptitude</p>
                   <p className="font-bold text-jarvis-text">L0 - New</p>
                </div>
                <div className="rounded border border-jarvis-border/40 p-2 text-center">
                   <p className="text-jarvis-muted uppercase text-[8px]">Interview</p>
                   <p className="font-bold text-jarvis-text">L0 - New</p>
                </div>
             </div>
             <div className="rounded-lg bg-black/40 border border-jarvis-border/60 p-3">
                <div className="flex items-center gap-2 mb-2">
                   <Briefcase className="h-3.5 w-3.5 text-jarvis-accent" />
                   <span className="text-[10px] uppercase font-bold text-jarvis-text">Strategy</span>
                </div>
                <ul className="space-y-1.5">
                   <li className="text-[9px] text-jarvis-muted flex items-center gap-2"><Send className="h-2.5 w-2.5" /> 0 Resumes Sent</li>
                   <li className="text-[9px] text-jarvis-muted flex items-center gap-2"><MessageSquare className="h-2.5 w-2.5" /> 0 Referrals Requested</li>
                </ul>
             </div>
          </div>
        </PagePanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* CERTIFICATIONS */}
        <PagePanel 
          title="Certifications" 
          actions={<button onClick={() => openCreateModal('certification')} className="text-jarvis-muted hover:text-jarvis-text"><Plus className="h-4 w-4" /></button>}
        >
          <div className="space-y-3">
            {certifications.length > 0 ? certifications.map(cert => (
              <div key={cert.id} className="group relative rounded-xl border border-jarvis-border bg-black/20 p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-jarvis-text">{cert.course}</h4>
                    <p className="text-[9px] text-jarvis-muted">{cert.platform}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button onClick={() => openEditModal('certification', cert.id)}><Pencil className="h-2.5 w-2.5 text-jarvis-muted" /></button>
                    <button onClick={() => deleteCertification(cert.id)}><Trash2 className="h-2.5 w-2.5 text-red-500/70" /></button>
                  </div>
                </div>
                <ProgressBar value={cert.progress} height={2} />
                <div className="mt-2 flex justify-between items-center text-[9px]">
                  <span className="text-jarvis-muted">{cert.status}</span>
                  {cert.certificateLink && <a href={cert.certificateLink} target="_blank" rel="noreferrer" className="text-jarvis-accent hover:underline">View Certificate</a>}
                </div>
              </div>
            )) : <p className="text-[10px] text-jarvis-muted italic py-4">No certifications logged.</p>}
          </div>
        </PagePanel>

        {/* PORTFOLIO ITEMS */}
        <PagePanel 
          title="Portfolio Items" 
          actions={<button onClick={() => openCreateModal('portfolio')} className="text-jarvis-muted hover:text-jarvis-text"><Plus className="h-4 w-4" /></button>}
        >
          <div className="space-y-3">
            {portfolio.length > 0 ? portfolio.map(item => (
              <div key={item.id} className="group relative rounded-xl border border-jarvis-border bg-black/20 p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-jarvis-text">{item.title}</h4>
                    {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="text-[9px] text-jarvis-accent hover:underline flex items-center gap-1 mt-0.5"><ExternalLink className="h-2 w-2" /> Live Link</a>}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button onClick={() => openEditModal('portfolio', item.id)}><Pencil className="h-2.5 w-2.5 text-jarvis-muted" /></button>
                    <button onClick={() => deletePortfolioItem(item.id)}><Trash2 className="h-2.5 w-2.5 text-red-500/70" /></button>
                  </div>
                </div>
                {item.notes && <p className="mt-2 text-[10px] text-jarvis-muted">{item.notes}</p>}
              </div>
            )) : <p className="text-[10px] text-jarvis-muted italic py-4">No portfolio items added.</p>}
          </div>
        </PagePanel>
      </div>
    </div>
  );
}
