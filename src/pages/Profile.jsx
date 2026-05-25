import { useState } from 'react';
import { User, Activity, GraduationCap, Target, Heart, ChevronDown, ChevronRight, Briefcase, Zap, Plus, Trash2, Languages, Shield, Info, LogOut } from 'lucide-react';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import { useProfileStore } from '../store/profileStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

function ProfileField({ label, value, onChange, type = "text", placeholder = "", readOnly = false, infoUrl = null }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-wider text-jarvis-muted">{label}</label>
        {infoUrl && (
          <a 
            href={infoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-jarvis-muted hover:text-jarvis-accent transition-colors"
            title="Calculator Tool"
          >
            <Info className="h-3 w-3" />
          </a>
        )}
      </div>
      <input
        type={type}
        value={value || ''}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) => !readOnly && onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        className={`rounded-lg border border-jarvis-border bg-black/20 px-3 py-2 text-sm text-jarvis-text transition-colors focus:outline-none ${readOnly ? 'opacity-60 cursor-not-allowed' : 'focus:border-jarvis-muted/40'}`}
      />
    </div>
  );
}

function SectionWrapper({ title, icon: Icon, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-jarvis-border bg-jarvis-panel overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-4 hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-jarvis-border p-1.5 text-jarvis-muted">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-medium uppercase tracking-widest text-jarvis-text">{title}</h3>
        </div>
        {isOpen ? <ChevronDown className="h-4 w-4 text-jarvis-muted" /> : <ChevronRight className="h-4 w-4 text-jarvis-muted" />}
      </button>
      {isOpen && <div className="px-6 pb-6 pt-2">{children}</div>}
    </div>
  );
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function Profile() {
  const profile = useProfileStore((s) => s.profile);
  const updateSection = useProfileStore((s) => s.updateSection);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!profile) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpdateLanguage = (index, field, value) => {
    const newLanguages = [...(profile.lifestyle?.languages || [])];
    newLanguages[index] = { ...newLanguages[index], [field]: value };
    updateSection('lifestyle', { languages: newLanguages });
  };

  const handleAddLanguage = () => {
    const newLanguages = [...(profile.lifestyle?.languages || []), { language: '', level: 'A1' }];
    updateSection('lifestyle', { languages: newLanguages });
  };

  const handleRemoveLanguage = (index) => {
    const newLanguages = profile.lifestyle?.languages?.filter((_, i) => i !== index);
    updateSection('lifestyle', { languages: newLanguages });
  };

  const handleUpdatePersonality = (index, field, value) => {
    const newProfiles = [...(profile.personalityProfiles || [])];
    newProfiles[index] = { ...newProfiles[index], [field]: value };
    updateSection('personalityProfiles', newProfiles);
  };

  const handleAddPersonality = () => {
    const newProfiles = [...(profile.personalityProfiles || []), { title: 'New Profile', description: '', tags: [] }];
    updateSection('personalityProfiles', newProfiles);
  };

  const handleRemovePersonality = (index) => {
    const newProfiles = profile.personalityProfiles?.filter((_, i) => i !== index);
    updateSection('personalityProfiles', newProfiles);
  };

  return (
    <ModulePageLayout title="User Profile" subtitle="Permanent identity core and lifestyle metadata.">
      <div className="mx-auto max-w-4xl space-y-6 pb-20">
        
        {/* ACCOUNT INFO */}
        <SectionWrapper title="Account" icon={Shield}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-jarvis-text">{user?.username || 'Unknown User'}</p>
              <p className="text-[10px] text-jarvis-muted uppercase tracking-widest">ID: {user?.userId}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-red-900/30 bg-red-900/10 px-4 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout Session
            </button>
          </div>
        </SectionWrapper>

        {/* IDENTITY */}
        <SectionWrapper title="Identity" icon={User}>
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileField label="Full Name" value={profile.identity?.fullName} readOnly />
            <ProfileField label="Display Name" value={profile.identity?.displayName} onChange={(v) => updateSection('identity', { displayName: v })} />
            <ProfileField label="Email" value={profile.identity?.email} readOnly />
            <ProfileField label="Phone" value={profile.identity?.phone} readOnly />
            <ProfileField label="Birthday" type="date" value={profile.identity?.birthday} onChange={(v) => updateSection('identity', { birthday: v })} />
            <ProfileField label="Age" type="number" value={profile.identity?.age} onChange={(v) => updateSection('identity', { age: v })} />
            <ProfileField label="Gender" value={profile.identity?.gender} onChange={(v) => updateSection('identity', { gender: v })} />
            <ProfileField label="Blood Group" value={profile.identity?.bloodGroup} onChange={(v) => updateSection('identity', { bloodGroup: v })} />
            <ProfileField label="Location" value={profile.identity?.location} onChange={(v) => updateSection('identity', { location: v })} />
            <ProfileField label="Timezone" value={profile.identity?.timezone} onChange={(v) => updateSection('identity', { timezone: v })} />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-jarvis-muted/5 p-3">
            <Shield className="h-3.5 w-3.5 text-jarvis-muted" />
            <p className="text-[10px] text-jarvis-muted italic">Identity fields are masked for development privacy.</p>
          </div>
        </SectionWrapper>

        {/* DIPLOMA */}
        <SectionWrapper title="Diploma" icon={GraduationCap}>
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileField label="College Name" value={profile.diploma?.collegeName} onChange={(v) => updateSection('diploma', { collegeName: v })} />
            <ProfileField label="Course Name" value={profile.diploma?.courseName} onChange={(v) => updateSection('diploma', { courseName: v })} />
            <ProfileField label="Semester" value={profile.diploma?.semester} onChange={(v) => updateSection('diploma', { semester: v })} />
            <ProfileField label="Percentage" type="number" value={profile.diploma?.percentage} onChange={(v) => updateSection('diploma', { percentage: v })} />
            <ProfileField label="Target %" type="number" value={profile.diploma?.targetPercentage} onChange={(v) => updateSection('diploma', { targetPercentage: v })} />
            <ProfileField label="Extra Info" value={profile.diploma?.extraInfo} onChange={(v) => updateSection('diploma', { extraInfo: v })} />
          </div>
        </SectionWrapper>

        {/* DEGREE */}
        <SectionWrapper title="Degree" icon={Briefcase}>
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileField label="College Name" value={profile.degree?.collegeName} onChange={(v) => updateSection('degree', { collegeName: v })} />
            <ProfileField label="Degree Name" value={profile.degree?.degreeName} onChange={(v) => updateSection('degree', { degreeName: v })} />
            <ProfileField label="Specialization" value={profile.degree?.specialization} onChange={(v) => updateSection('degree', { specialization: v })} />
            <ProfileField label="Semester" value={profile.degree?.semester} onChange={(v) => updateSection('degree', { semester: v })} />
            <ProfileField label="CGPA" type="number" value={profile.degree?.cgpa} onChange={(v) => updateSection('degree', { cgpa: v })} />
            <ProfileField label="Target CGPA" type="number" value={profile.degree?.targetCgpa} onChange={(v) => updateSection('degree', { targetCgpa: v })} />
            <div className="sm:col-span-2">
              <ProfileField label="Extra Info" value={profile.degree?.extraInfo} onChange={(v) => updateSection('degree', { extraInfo: v })} />
            </div>
          </div>
        </SectionWrapper>

        {/* PHYSICAL */}
        <SectionWrapper title="Physical Health" icon={Activity}>
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileField label="Height (cm)" type="number" value={profile.physical?.heightCm} onChange={(v) => updateSection('physical', { heightCm: v })} />
            <ProfileField label="Weight (kg)" type="number" value={profile.physical?.weightKg} onChange={(v) => updateSection('physical', { weightKg: v })} />
            <ProfileField 
              label="Body Fat %" 
              type="number" 
              value={profile.physical?.bodyFat} 
              onChange={(v) => updateSection('physical', { bodyFat: v })} 
              infoUrl="https://www.fittr.com/tools/body-fat-calculator/"
            />
            <ProfileField label="Body Type" value={profile.physical?.bodyType} onChange={(v) => updateSection('physical', { bodyType: v })} />
            <ProfileField label="Fitness Goal" value={profile.physical?.fitnessGoal} onChange={(v) => updateSection('physical', { fitnessGoal: v })} />
            <ProfileField label="Allergies" value={profile.physical?.allergies?.join(', ')} onChange={(v) => updateSection('physical', { allergies: v.split(',').map(s => s.trim()) })} />
            <div className="sm:col-span-2">
              <ProfileField label="Health Restrictions" value={profile.physical?.healthRestrictions} onChange={(v) => updateSection('physical', { healthRestrictions: v })} />
            </div>
          </div>
        </SectionWrapper>

        {/* PRODUCTIVITY */}
        <SectionWrapper title="Productivity" icon={Zap}>
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileField label="Wake Time" type="time" value={profile.productivity?.wakeTime} onChange={(v) => updateSection('productivity', { wakeTime: v })} />
            <ProfileField label="Sleep Time" type="time" value={profile.productivity?.sleepTime} onChange={(v) => updateSection('productivity', { sleepTime: v })} />
            <ProfileField label="Daily Task Hours Target" type="number" value={profile.productivity?.taskHoursTarget} onChange={(v) => updateSection('productivity', { taskHoursTarget: v })} />
            <ProfileField label="Preferred Study Method" value={profile.productivity?.preferredStudyMethod} onChange={(v) => updateSection('productivity', { preferredStudyMethod: v })} />
          </div>
        </SectionWrapper>

        {/* LIFESTYLE & LANGUAGES */}
        <SectionWrapper title="Lifestyle & Languages" icon={Languages}>
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField label="Hobbies" value={profile.lifestyle?.hobbies?.join(', ')} onChange={(v) => updateSection('lifestyle', { hobbies: v.split(',').map(s => s.trim()) })} />
              <ProfileField label="Favorite Music" value={profile.lifestyle?.favoriteMusic} onChange={(v) => updateSection('lifestyle', { favoriteMusic: v })} />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-wider text-jarvis-muted">Multilingual System</label>
                <button 
                  onClick={handleAddLanguage}
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-jarvis-accent hover:opacity-80 transition-opacity"
                >
                  <Plus className="h-3 w-3" /> Add Language
                </button>
              </div>
              <div className="space-y-2">
                {profile.lifestyle?.languages?.map((lang, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      value={lang.language}
                      onChange={(e) => handleUpdateLanguage(index, 'language', e.target.value)}
                      placeholder="Language"
                      className="flex-1 rounded-lg border border-jarvis-border bg-black/20 px-3 py-1.5 text-sm text-jarvis-text focus:border-jarvis-muted/40 focus:outline-none"
                    />
                    <select
                      value={lang.level}
                      onChange={(e) => handleUpdateLanguage(index, 'level', e.target.value)}
                      className="rounded-lg border border-jarvis-border bg-black/20 px-3 py-1.5 text-sm text-jarvis-text focus:border-jarvis-muted/40 focus:outline-none"
                    >
                      {CEFR_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                    <button 
                      onClick={() => handleRemoveLanguage(index)}
                      className="p-2 text-jarvis-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* PERSONALITY PROFILES */}
        <SectionWrapper title="Personality Profiles" icon={Target}>
          <div className="space-y-4">
            <div className="flex justify-end">
              <button 
                onClick={handleAddPersonality}
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-jarvis-accent hover:opacity-80 transition-opacity"
              >
                <Plus className="h-3 w-3" /> New Profile Card
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {profile.personalityProfiles?.map((p, index) => (
                <div key={index} className="relative rounded-xl border border-jarvis-border bg-white/[0.02] p-4 group">
                  <button 
                    onClick={() => handleRemovePersonality(index)}
                    className="absolute top-2 right-2 p-1.5 text-jarvis-muted opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <div className="space-y-3">
                    <input
                      value={p.title}
                      onChange={(e) => handleUpdatePersonality(index, 'title', e.target.value)}
                      placeholder="Profile Title (e.g. Architect)"
                      className="w-full bg-transparent text-sm font-medium text-jarvis-text focus:outline-none"
                    />
                    <textarea
                      value={p.description}
                      onChange={(e) => handleUpdatePersonality(index, 'description', e.target.value)}
                      placeholder="Description of traits and patterns..."
                      rows={3}
                      className="w-full bg-transparent text-[12px] text-jarvis-muted resize-none focus:outline-none"
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase tracking-widest text-jarvis-muted/60">Tags</label>
                      <input
                        value={p.tags?.join(', ')}
                        onChange={(e) => handleUpdatePersonality(index, 'tags', e.target.value.split(',').map(s => s.trim()))}
                        placeholder="Analytical, Strategic..."
                        className="w-full bg-transparent text-[11px] text-jarvis-accent focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      </div>
    </ModulePageLayout>
  );
}
