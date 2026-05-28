import React, { useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import GrowthOverview from '../components/academics/GrowthOverview';
import DiplomaDegreeSection from '../components/academics/DiplomaDegreeSection';
import CodingSystem from '../components/academics/CodingSystem';
import CareerSystem from '../components/academics/CareerSystem';
import StudyExecution from '../components/academics/StudyExecution';
import AiInsightsPanel from '../components/academics/AiInsightsPanel';

import EntityModal from '../components/modals/EntityModal';
import EntityForm from '../components/forms/EntityForm';
import { useEntityStore } from '../store/entityStore';
import { useAcademicStore } from '../store/academicStore';
import { useProfileStore } from '../store/profileStore';
import { useTaskStore } from '../store/taskStore';

export default function Academics() {
  const [isSaving, setIsSaving] = useState(false);

  const {
    isModalOpen,
    activeType,
    selectedId,
    draftMode,
    closeModal,
    initialData
  } = useEntityStore(useShallow(s => ({
    isModalOpen: s.isModalOpen,
    activeType: s.activeType,
    selectedId: s.selectedId,
    draftMode: s.draftMode,
    closeModal: s.closeModal,
    initialData: s.initialData
  })));

  const {
    skills,
    projects,
    subjects,
    techStack,
    activeLearning,
    dsaQuestions,
    codingProgress,
    certifications,
    portfolio,
    activeSemester,
    addSkill,
    updateSkill,
    addProject,
    updateProject,
    addSubject,
    updateSubject,
    addTechStack,
    updateTechStack,
    addActiveLearning,
    updateActiveLearning,
    addDsaQuestion,
    updateDsaQuestion,
    updateCodingProgress,
    addCertification,
    updateCertification,
    addPortfolioItem,
    updatePortfolioItem
  } = useAcademicStore(useShallow(s => ({
    skills: s.skills,
    projects: s.projects,
    subjects: s.subjects,
    techStack: s.techStack,
    activeLearning: s.activeLearning,
    dsaQuestions: s.dsaQuestions,
    codingProgress: s.codingProgress,
    certifications: s.certifications,
    portfolio: s.portfolio,
    activeSemester: s.activeSemester,
    addSkill: s.addSkill,
    updateSkill: s.updateSkill,
    addProject: s.addProject,
    updateProject: s.updateProject,
    addSubject: s.addSubject,
    updateSubject: s.updateSubject,
    addTechStack: s.addTechStack,
    updateTechStack: s.updateTechStack,
    addActiveLearning: s.addActiveLearning,
    updateActiveLearning: s.updateActiveLearning,
    addDsaQuestion: s.addDsaQuestion,
    updateDsaQuestion: s.updateDsaQuestion,
    updateCodingProgress: s.updateCodingProgress,
    addCertification: s.addCertification,
    updateCertification: s.updateCertification,
    addPortfolioItem: s.addPortfolioItem,
    updatePortfolioItem: s.updatePortfolioItem,
  })));

  const profile = useProfileStore(s => s.profile);
  const updateProfile = useProfileStore(s => s.updateProfile);

  const { createTask, updateTask, tasks } = useTaskStore(useShallow(s => ({
    createTask: s.createTask,
    updateTask: s.updateTask,
    tasks: s.tasks
  })));

  const selectedEntity = useMemo(() => {
    if (!selectedId && activeType !== 'dsaProgress') return initialData;

    switch (activeType) {
      case 'skill': return skills.find(s => s.id === selectedId);
      case 'project': return projects.find(p => p.id === selectedId);
      case 'subject': return subjects.find(s => s.id === selectedId);
      case 'techStack': return techStack.find(t => t.id === selectedId);
      case 'activeLearning': return activeLearning.find(l => l.id === selectedId);
      case 'dsa': return dsaQuestions.find(q => q.id === selectedId);
      case 'dsaProgress': return codingProgress;
      case 'certification': return certifications.find(c => c.id === selectedId);
      case 'portfolio': return portfolio.find(p => p.id === selectedId);
      case 'profile': return profile;
      case 'task': return tasks.find(t => t.id === selectedId);
      default: return null;
    }
  }, [activeType, selectedId, skills, projects, subjects, techStack, activeLearning, dsaQuestions, codingProgress, certifications, portfolio, profile, tasks, initialData]);

  const handleSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (draftMode === 'create') {
        switch (activeType) {
          case 'skill': await addSkill(data); break;
          case 'project': await addProject(data); break;
          case 'subject': await addSubject(data); break;
          case 'techStack': await addTechStack(data.name); break;
          case 'activeLearning': await addActiveLearning(data); break;
          case 'dsa': await addDsaQuestion(data); break;
          case 'certification': await addCertification(data); break;
          case 'portfolio': await addPortfolioItem(data); break;
          case 'task': await createTask(data); break;
        }
      } else {
        switch (activeType) {
          case 'skill': await updateSkill(selectedId, data); break;
          case 'project': await updateProject(selectedId, data); break;
          case 'subject': await updateSubject(selectedId, data); break;
          case 'techStack': await updateTechStack(selectedId, data); break;
          case 'activeLearning': await updateActiveLearning(selectedId, data); break;
          case 'dsa': await updateDsaQuestion(selectedId, data); break;
          case 'dsaProgress': await updateCodingProgress(data); break;
          case 'certification': await updateCertification(selectedId, data); break;
          case 'portfolio': await updatePortfolioItem(selectedId, data); break;
          case 'profile': await updateProfile(data); break;
          case 'task': await updateTask(selectedId, data); break;
        }
      }
      closeModal();
    } catch (err) {
      console.error('Failed to save entity:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const academicEntityTypes = ['skill', 'project', 'subject', 'techStack', 'activeLearning', 'dsa', 'dsaProgress', 'certification', 'portfolio', 'profile', 'task'];

  return (
    <ModulePageLayout
      title="Academic Cockpit"
      subtitle={`B.Tech Computer Engineering — Lateral Entry | ${activeSemester} Active`}
    >
      <div className="space-y-10 pb-10">
        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-jarvis-muted">01. Growth Overview</h2>
          <GrowthOverview />
        </section>

        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-jarvis-muted">02. Degree System & Subject Tracker</h2>
          <DiplomaDegreeSection />
        </section>

        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-jarvis-muted">03. Coding & Development</h2>
          <CodingSystem />
        </section>

        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-jarvis-muted">04. Career OS</h2>
          <CareerSystem semester={activeSemester} />
        </section>

        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-jarvis-muted">05. Study Task Queue</h2>
          <StudyExecution />
        </section>

        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-jarvis-muted">06. Neural Layer & Output Log</h2>
          <AiInsightsPanel />
        </section>
      </div>

      <EntityModal
        isOpen={isModalOpen && academicEntityTypes.includes(activeType)}
        onClose={closeModal}
        title={`${draftMode === 'create' ? 'Create' : 'Edit'} ${activeType}`}
      >
        <EntityForm
          initialData={selectedEntity}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isSubmitting={isSaving}
        />
      </EntityModal>
    </ModulePageLayout>
  );
}
