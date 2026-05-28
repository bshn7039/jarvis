import React, { useState } from 'react';
import { useProfileStore } from '../../store/profileStore';
import { useAcademicStore, SEMESTERS } from '../../store/academicStore';
import { useEntityStore } from '../../store/entityStore';
import PagePanel from '../ui/PagePanel';
import ProgressBar from '../ui/ProgressBar';
import {
  BookOpen, Plus, Pencil, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle, Clock, UserCheck, UserX,
  RotateCcw, GraduationCap, Trash2, Check, X, FolderOpen, BookMarked
} from 'lucide-react';

// ─── Unit / Topic / Subtopic inline editor ───────────────────────────────────
function SubjectContentEditor({ subject, onSave }) {
  const [units, setUnits] = useState(() => subject.units || []);
  const [addingUnit, setAddingUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [expandedUnit, setExpandedUnit] = useState(null);
  const [addingTopic, setAddingTopic] = useState(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [addingSubtopic, setAddingSubtopic] = useState(null);
  const [newSubtopicName, setNewSubtopicName] = useState('');
  const [dirty, setDirty] = useState(false);

  const save = (nextUnits) => {
    setUnits(nextUnits);
    setDirty(true);
  };

  const handleAddUnit = () => {
    if (!newUnitName.trim()) return;
    const next = [...units, { id: `u-${Date.now()}`, name: newUnitName.trim(), topics: [] }];
    save(next);
    setNewUnitName('');
    setAddingUnit(false);
  };

  const handleDeleteUnit = (uid) => save(units.filter(u => u.id !== uid));

  const handleAddTopic = (uid) => {
    if (!newTopicName.trim()) return;
    const next = units.map(u => u.id === uid
      ? { ...u, topics: [...u.topics, { id: `t-${Date.now()}`, name: newTopicName.trim(), subtopics: [], done: false }] }
      : u
    );
    save(next);
    setNewTopicName('');
    setAddingTopic(null);
  };

  const toggleTopicDone = (uid, tid) => {
    const next = units.map(u => u.id === uid
      ? { ...u, topics: u.topics.map(t => t.id === tid ? { ...t, done: !t.done } : t) }
      : u
    );
    save(next);
  };

  const handleDeleteTopic = (uid, tid) => {
    const next = units.map(u => u.id === uid
      ? { ...u, topics: u.topics.filter(t => t.id !== tid) }
      : u
    );
    save(next);
  };

  const handleAddSubtopic = (uid, tid) => {
    if (!newSubtopicName.trim()) return;
    const next = units.map(u => u.id === uid
      ? {
          ...u,
          topics: u.topics.map(t => t.id === tid
            ? { ...t, subtopics: [...(t.subtopics || []), newSubtopicName.trim()] }
            : t
          )
        }
      : u
    );
    save(next);
    setNewSubtopicName('');
    setAddingSubtopic(null);
  };

  const handleDeleteSubtopic = (uid, tid, sidx) => {
    const next = units.map(u => u.id === uid
      ? {
          ...u,
          topics: u.topics.map(t => t.id === tid
            ? { ...t, subtopics: t.subtopics.filter((_, i) => i !== sidx) }
            : t
          )
        }
      : u
    );
    save(next);
  };

  return (
    <div className="border-t border-jarvis-border/50 bg-white/[0.02] p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FolderOpen className="h-3 w-3 text-jarvis-accent" />
          <span className="text-[9px] uppercase tracking-wider font-bold text-jarvis-accent">Units & Topics</span>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              onClick={() => { onSave(units); setDirty(false); }}
              className="flex items-center gap-1 text-[9px] px-2 py-1 rounded bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25 transition-all"
            >
              <Check className="h-2.5 w-2.5" />
              Save
            </button>
          )}
          <button
            onClick={() => setAddingUnit(true)}
            className="flex items-center gap-1 text-[9px] text-jarvis-muted hover:text-jarvis-accent transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add Unit
          </button>
        </div>
      </div>

      {/* Add Unit Input */}
      {addingUnit && (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={newUnitName}
            onChange={e => setNewUnitName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddUnit()}
            placeholder="Unit name (e.g. Unit 1: Arrays)"
            className="flex-1 bg-black/30 border border-jarvis-accent/30 rounded px-2 py-1 text-[10px] text-jarvis-text placeholder-jarvis-muted/50 outline-none"
          />
          <button onClick={handleAddUnit} className="text-green-400 hover:text-green-300 p-1"><Check className="h-3 w-3" /></button>
          <button onClick={() => { setAddingUnit(false); setNewUnitName(''); }} className="text-jarvis-muted hover:text-red-400 p-1"><X className="h-3 w-3" /></button>
        </div>
      )}

      {/* Units List */}
      <div className="space-y-2">
        {units.length === 0 && !addingUnit && (
          <p className="text-[9px] text-jarvis-muted italic">No units added yet. Click "Add Unit" to start structuring this subject.</p>
        )}

        {units.map((unit, uidx) => {
          const doneTopics = unit.topics.filter(t => t.done).length;
          return (
            <div key={unit.id} className="rounded-lg border border-jarvis-border/30 bg-black/20 overflow-hidden">
              {/* Unit header */}
              <div className="flex items-center gap-2 px-2.5 py-2">
                <button
                  onClick={() => setExpandedUnit(expandedUnit === unit.id ? null : unit.id)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  {expandedUnit === unit.id
                    ? <ChevronUp className="h-3 w-3 text-jarvis-muted shrink-0" />
                    : <ChevronDown className="h-3 w-3 text-jarvis-muted shrink-0" />
                  }
                  <span className="text-[10px] font-semibold text-jarvis-text">{unit.name}</span>
                  {unit.topics.length > 0 && (
                    <span className="text-[8px] text-jarvis-muted ml-1">
                      {doneTopics}/{unit.topics.length} topics
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { setAddingTopic(unit.id); setExpandedUnit(unit.id); }}
                  className="text-jarvis-muted hover:text-jarvis-accent p-0.5"
                  title="Add topic"
                >
                  <Plus className="h-2.5 w-2.5" />
                </button>
                <button
                  onClick={() => handleDeleteUnit(unit.id)}
                  className="text-jarvis-muted hover:text-red-400 p-0.5"
                  title="Delete unit"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              </div>

              {/* Topics */}
              {expandedUnit === unit.id && (
                <div className="border-t border-jarvis-border/30 px-3 py-2 space-y-1.5">
                  {unit.topics.map(topic => (
                    <div key={topic.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleTopicDone(unit.id, topic.id)}
                          className={`shrink-0 h-3 w-3 rounded border transition-all ${topic.done ? 'bg-green-500 border-green-500' : 'border-jarvis-border/60 hover:border-jarvis-accent'}`}
                        >
                          {topic.done && <Check className="h-2.5 w-2.5 text-white" />}
                        </button>
                        <span className={`text-[10px] flex-1 ${topic.done ? 'line-through text-jarvis-muted' : 'text-jarvis-text'}`}>
                          {topic.name}
                        </span>
                        <button
                          onClick={() => { setAddingSubtopic(topic.id); }}
                          className="text-jarvis-muted/50 hover:text-jarvis-accent p-0.5"
                          title="Add subtopic"
                        >
                          <Plus className="h-2 w-2" />
                        </button>
                        <button
                          onClick={() => handleDeleteTopic(unit.id, topic.id)}
                          className="text-jarvis-muted/50 hover:text-red-400 p-0.5"
                        >
                          <X className="h-2 w-2" />
                        </button>
                      </div>

                      {/* Subtopics */}
                      {topic.subtopics?.length > 0 && (
                        <div className="ml-5 space-y-0.5">
                          {topic.subtopics.map((st, sidx) => (
                            <div key={sidx} className="flex items-center gap-1.5 group">
                              <div className="h-1 w-1 rounded-full bg-jarvis-border shrink-0" />
                              <span className="text-[9px] text-jarvis-muted flex-1">{st}</span>
                              <button
                                onClick={() => handleDeleteSubtopic(unit.id, topic.id, sidx)}
                                className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-400"
                              >
                                <X className="h-2 w-2" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add subtopic input */}
                      {addingSubtopic === topic.id && (
                        <div className="ml-5 flex items-center gap-1.5">
                          <input
                            autoFocus
                            value={newSubtopicName}
                            onChange={e => setNewSubtopicName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleAddSubtopic(unit.id, topic.id); if (e.key === 'Escape') { setAddingSubtopic(null); setNewSubtopicName(''); } }}
                            placeholder="Subtopic..."
                            className="flex-1 bg-black/30 border border-jarvis-border/30 rounded px-1.5 py-0.5 text-[9px] text-jarvis-text placeholder-jarvis-muted/40 outline-none"
                          />
                          <button onClick={() => handleAddSubtopic(unit.id, topic.id)} className="text-green-400"><Check className="h-2.5 w-2.5" /></button>
                          <button onClick={() => { setAddingSubtopic(null); setNewSubtopicName(''); }} className="text-jarvis-muted"><X className="h-2.5 w-2.5" /></button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add topic input */}
                  {addingTopic === unit.id && (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        autoFocus
                        value={newTopicName}
                        onChange={e => setNewTopicName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddTopic(unit.id); if (e.key === 'Escape') { setAddingTopic(null); setNewTopicName(''); } }}
                        placeholder="Topic name..."
                        className="flex-1 bg-black/30 border border-jarvis-border/30 rounded px-2 py-1 text-[9px] text-jarvis-text placeholder-jarvis-muted/40 outline-none"
                      />
                      <button onClick={() => handleAddTopic(unit.id)} className="text-green-400"><Check className="h-3 w-3" /></button>
                      <button onClick={() => { setAddingTopic(null); setNewTopicName(''); }} className="text-jarvis-muted"><X className="h-3 w-3" /></button>
                    </div>
                  )}

                  {unit.topics.length === 0 && !addingTopic && (
                    <p className="text-[9px] text-jarvis-muted/50 italic">No topics yet.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DiplomaDegreeSection() {
  const profile = useProfileStore(s => s.profile);
  const { subjects, activeSemester, setActiveSemester, markAttendance, undoAttendance, updateSubject } = useAcademicStore();
  const openEditModal = useEntityStore(s => s.openEditModal);
  const openCreateModal = useEntityStore(s => s.openCreateModal);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [undoMap, setUndoMap] = useState({});

  if (!profile) return null;
  const { degree } = profile;

  const semSubjects = subjects.filter(s => s.semester === activeSemester);

  const getAttendancePct = (sub) => {
    if (!sub.totalDays || sub.totalDays === 0) return 0;
    return Math.round(((sub.attendedDays || 0) / sub.totalDays) * 100);
  };

  const handleMarkPresent = async (subId) => {
    await markAttendance(subId, true);
    setUndoMap(prev => ({ ...prev, [subId]: 'present' }));
    setTimeout(() => setUndoMap(prev => { const next = { ...prev }; delete next[subId]; return next; }), 4000);
  };

  const handleMarkAbsent = async (subId) => {
    await markAttendance(subId, false);
    setUndoMap(prev => ({ ...prev, [subId]: 'absent' }));
    setTimeout(() => setUndoMap(prev => { const next = { ...prev }; delete next[subId]; return next; }), 4000);
  };

  const handleUndo = async (subId) => {
    const wasPresent = undoMap[subId] === 'present';
    await undoAttendance(subId, wasPresent);
    setUndoMap(prev => { const next = { ...prev }; delete next[subId]; return next; });
  };

  const handleSaveUnits = async (subId, units) => {
    await updateSubject(subId, { units });
  };

  return (
    <div className="space-y-6">
      {/* Degree Overview */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Diploma (Archival) */}
        <PagePanel title="Diploma System" subtitle="Archival — Completed">
          <div className="flex items-center gap-4 p-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30 text-green-400 shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-jarvis-text flex items-center gap-2">
                Diploma Completed
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 font-semibold font-mono uppercase tracking-wider">Verified</span>
              </h4>
              <p className="text-xs text-jarvis-muted mt-0.5">Computer Engineering Diploma</p>
              <p className="mt-2 text-[10px] text-jarvis-muted/60 italic leading-relaxed">
                Shantiniketan Polytechnic — College shut down. Survived on self-learning.
              </p>
            </div>
          </div>
        </PagePanel>

        {/* B.Tech Degree */}
        <PagePanel
          title="B.Tech Degree System"
          subtitle="Lateral Entry — Operational"
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
                <p className="text-[9px] text-jarvis-muted uppercase tracking-wider mb-0.5">College</p>
                <p className="font-semibold text-jarvis-text">{degree.collegeName || 'Pillai New Panvel'}</p>
              </div>
              <div>
                <p className="text-[9px] text-jarvis-muted uppercase tracking-wider mb-0.5">Entry Mode</p>
                <p className="font-semibold text-jarvis-text">{degree.entry || 'Lateral Entry (DSE)'}</p>
              </div>
              <div>
                <p className="text-[9px] text-jarvis-muted uppercase tracking-wider mb-0.5">Duration</p>
                <p className="font-semibold text-jarvis-text">{degree.durationYears || 3} Years ({degree.totalSemesters || 6} Sems)</p>
              </div>
              <div>
                <p className="text-[9px] text-jarvis-muted uppercase tracking-wider mb-0.5">Current CGPA</p>
                <p className="font-semibold text-jarvis-text">{degree.cgpa || '—'} / {degree.targetCgpa || 8}</p>
              </div>
            </div>
            <div className="rounded-lg border border-jarvis-border/30 bg-white/5 p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-jarvis-text">{activeSemester} Foundation</span>
                <span className="text-xs font-mono text-jarvis-muted">Target: {degree.targetCgpa || 8} CGPA</span>
              </div>
              <ProgressBar value={degree.cgpa ? ((degree.cgpa / (degree.targetCgpa || 8)) * 100) : 0} />
            </div>
          </div>
        </PagePanel>
      </div>

      {/* Semester Toggle Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <GraduationCap className="h-4 w-4 text-jarvis-muted shrink-0" />
        <span className="text-[10px] uppercase tracking-widest text-jarvis-muted mr-1">Semester:</span>
        {SEMESTERS.map(sem => (
          <button
            key={sem}
            onClick={() => setActiveSemester(sem)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-200 border ${
              activeSemester === sem
                ? 'bg-jarvis-accent/20 border-jarvis-accent/60 text-jarvis-accent shadow-[0_0_12px_rgba(var(--color-accent)/0.3)]'
                : 'border-jarvis-border/40 text-jarvis-muted hover:border-jarvis-border hover:text-jarvis-text bg-white/[0.02]'
            }`}
          >
            {sem}
          </button>
        ))}
      </div>

      {/* Subjects Grid */}
      <PagePanel
        title={`${activeSemester} Subjects`}
        subtitle={`${semSubjects.length} subjects — Click a subject to add units, topics & subtopics`}
        actions={
          <button onClick={() => openCreateModal('subject')} className="rounded p-1 text-jarvis-muted hover:bg-white/10 hover:text-jarvis-text">
            <Plus className="h-4 w-4" />
          </button>
        }
      >
        {semSubjects.length === 0 ? (
          <div className="py-8 text-center text-jarvis-muted text-xs italic">No subjects found for {activeSemester}.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {semSubjects.map(sub => {
              const pct = getAttendancePct(sub);
              const isCritical = sub.totalDays > 0 && pct < 75;
              const canUndo = !!undoMap[sub.id];
              const isOpen = expandedSubject === sub.id;

              return (
                <div
                  key={sub.id}
                  className={`group relative rounded-xl border overflow-hidden transition-all duration-300 ${
                    isCritical
                      ? 'border-red-500/40 bg-red-500/5 shadow-[0_0_16px_rgba(239,68,68,0.08)]'
                      : 'border-jarvis-border bg-black/20'
                  }`}
                >
                  {/* Critical Strip */}
                  {isCritical && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border-b border-red-500/20">
                      <AlertTriangle className="h-3 w-3 text-red-400 animate-pulse shrink-0" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-red-400">Critical — Below 75%</span>
                    </div>
                  )}

                  <div className="p-3">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-jarvis-text leading-tight">{sub.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-jarvis-muted uppercase tracking-wide">{sub.code}</span>
                          {sub.category === 'Lab' && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Lab</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button onClick={() => openEditModal('subject', sub.id)} className="opacity-0 group-hover:opacity-100 p-1 text-jarvis-muted hover:text-jarvis-text rounded">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => setExpandedSubject(isOpen ? null : sub.id)}
                          className="p-1 text-jarvis-muted hover:text-jarvis-text rounded"
                          title="Open subject details"
                        >
                          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Attendance Stats */}
                    <div className="rounded-lg bg-black/30 border border-white/[0.05] p-2.5 mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] uppercase tracking-wider text-jarvis-muted">Attendance</span>
                        <span className={`text-sm font-bold font-mono ${isCritical ? 'text-red-400' : pct >= 85 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {pct}%
                        </span>
                      </div>
                      <ProgressBar value={pct} height={3} />
                      <div className="flex justify-between mt-1.5 text-[9px] text-jarvis-muted">
                        <span>{sub.attendedDays || 0} attended</span>
                        <span>{sub.totalDays || 0} total</span>
                      </div>
                    </div>

                    {/* Attendance Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMarkPresent(sub.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all text-[10px] font-medium"
                      >
                        <UserCheck className="h-3 w-3" />
                        Present
                      </button>
                      <button
                        onClick={() => handleMarkAbsent(sub.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-[10px] font-medium"
                      >
                        <UserX className="h-3 w-3" />
                        Absent
                      </button>
                      {canUndo && (
                        <button
                          onClick={() => handleUndo(sub.id)}
                          title="Undo last entry"
                          className="flex items-center justify-center p-1.5 rounded-lg bg-white/5 border border-jarvis-border/40 text-jarvis-muted hover:text-jarvis-text transition-all"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Content — Units, Topics, Subtopics */}
                  {isOpen && (
                    <>
                      {/* Subject meta */}
                      <div className="border-t border-jarvis-border/30 bg-white/[0.015] px-3 py-2 grid grid-cols-2 gap-2">
                        <div className="rounded border border-jarvis-border/30 p-2">
                          <p className="text-[8px] uppercase text-jarvis-muted">Credits</p>
                          <p className="text-[11px] text-jarvis-text">{sub.credits} cr</p>
                        </div>
                        <div className="rounded border border-jarvis-border/30 p-2">
                          <p className="text-[8px] uppercase text-jarvis-muted">Internal Marks</p>
                          <p className="text-[11px] text-jarvis-text">{sub.internalMarks || '—'}</p>
                        </div>
                        <div className="col-span-2 rounded border border-jarvis-border/30 p-2">
                          <p className="text-[8px] uppercase text-jarvis-muted">Revision Status</p>
                          <p className="text-[11px] text-jarvis-text">{sub.revisionStatus || 'Not Started'}</p>
                        </div>
                        {sub.weakTopics?.length > 0 && (
                          <div className="col-span-2">
                            <p className="text-[8px] uppercase text-jarvis-muted mb-1">Weak Topics</p>
                            <div className="flex flex-wrap gap-1">
                              {sub.weakTopics.map(t => (
                                <span key={t} className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Units / Topics / Subtopics editor */}
                      <SubjectContentEditor
                        subject={sub}
                        onSave={(units) => handleSaveUnits(sub.id, units)}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </PagePanel>
    </div>
  );
}
