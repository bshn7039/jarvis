import { useState } from 'react';
import { User, Activity, GraduationCap, Target, Heart, ChevronDown, ChevronRight, Briefcase, Zap } from 'lucide-react';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import { useProfileStore } from '../store/profileStore';

function ProfileField({ label, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-wider text-jarvis-muted">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        className="rounded-lg border border-jarvis-border bg-black/20 px-3 py-2 text-sm text-jarvis-text transition-colors focus:border-jarvis-muted/40 focus:outline-none"
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

export default function Profile() {
  const profile = useProfileStore((s) => s.profile);
  const updateSection = useProfileStore((s) => s.updateSection);

  if (!profile) return null;

  return (
    <ModulePageLayout title="User Profile" subtitle="Permanent identity core and lifestyle metadata.">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* IDENTITY */}
        <SectionWrapper title="Identity" icon={User}>
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileField label="Full Name" value={profile.identity?.fullName} onChange={(v) => updateSection('identity', { fullName: v })} />
            <ProfileField label="Display Name" value={profile.identity?.displayName} onChange={(v) => updateSection('identity', { displayName: v })} />
            <ProfileField label="Birthday" type="date" value={profile.identity?.birthday} onChange={(v) => updateSection('identity', { birthday: v })} />
            <ProfileField label="Age" type="number" value={profile.identity?.age} onChange={(v) => updateSection('identity', { age: v })} />
            <ProfileField label="Gender" value={profile.identity?.gender} onChange={(v) => updateSection('identity', { gender: v })} />
            <ProfileField label="Blood Group" value={profile.identity?.bloodGroup} onChange={(v) => updateSection('identity', { bloodGroup: v })} />
            <ProfileField label="Phone" value={profile.identity?.phone} onChange={(v) => updateSection('identity', { phone: v })} />
            <ProfileField label="Email" value={profile.identity?.email} onChange={(v) => updateSection('identity', { email: v })} />
            <ProfileField label="Location" value={profile.identity?.location} onChange={(v) => updateSection('identity', { location: v })} />
            <ProfileField label="Timezone" value={profile.identity?.timezone} onChange={(v) => updateSection('identity', { timezone: v })} />
          </div>
        </SectionWrapper>

        {/* PHYSICAL */}
        <SectionWrapper title="Physical Health" icon={Activity}>
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileField label="Height (cm)" type="number" value={profile.physical?.heightCm} onChange={(v) => updateSection('physical', { heightCm: v })} />
            <ProfileField label="Weight (kg)" type="number" value={profile.physical?.weightKg} onChange={(v) => updateSection('physical', { weightKg: v })} />
            <ProfileField label="Body Fat %" type="number" value={profile.physical?.bodyFat} onChange={(v) => updateSection('physical', { bodyFat: v })} />
            <ProfileField label="Body Type" value={profile.physical?.bodyType} onChange={(v) => updateSection('physical', { bodyType: v })} />
            <ProfileField label="Fitness Goal" value={profile.physical?.fitnessGoal} onChange={(v) => updateSection('physical', { fitnessGoal: v })} />
            <ProfileField label="Allergies" value={profile.physical?.allergies?.join(', ')} onChange={(v) => updateSection('physical', { allergies: v.split(',').map(s => s.trim()) })} />
            <ProfileField label="Health Restrictions" value={profile.physical?.healthRestrictions} onChange={(v) => updateSection('physical', { healthRestrictions: v })} />
          </div>
        </SectionWrapper>

        {/* ACADEMICS */}
        <SectionWrapper title="Academics" icon={GraduationCap}>
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileField label="College" value={profile.academics?.college} onChange={(v) => updateSection('academics', { college: v })} />
            <ProfileField label="Degree" value={profile.academics?.degree} onChange={(v) => updateSection('academics', { degree: v })} />
            <ProfileField label="Semester" value={profile.academics?.semester} onChange={(v) => updateSection('academics', { semester: v })} />
            <ProfileField label="Specialization" value={profile.academics?.specialization} onChange={(v) => updateSection('academics', { specialization: v })} />
            <ProfileField label="CGPA" type="number" value={profile.academics?.cgpa} onChange={(v) => updateSection('academics', { cgpa: v })} />
            <ProfileField label="Target Career" value={profile.academics?.targetCareer} onChange={(v) => updateSection('academics', { targetCareer: v })} />
          </div>
        </SectionWrapper>

        {/* PRODUCTIVITY */}
        <SectionWrapper title="Productivity" icon={Zap}>
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileField label="Wake Time" type="time" value={profile.productivity?.wakeTime} onChange={(v) => updateSection('productivity', { wakeTime: v })} />
            <ProfileField label="Sleep Time" type="time" value={profile.productivity?.sleepTime} onChange={(v) => updateSection('productivity', { sleepTime: v })} />
            <ProfileField label="Deep Work Hours" type="number" value={profile.productivity?.deepWorkHours} onChange={(v) => updateSection('productivity', { deepWorkHours: v })} />
            <ProfileField label="Preferred Study Method" value={profile.productivity?.preferredStudyMethod} onChange={(v) => updateSection('productivity', { preferredStudyMethod: v })} />
          </div>
        </SectionWrapper>

        {/* LIFESTYLE */}
        <SectionWrapper title="Lifestyle" icon={Heart}>
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileField label="Hobbies" value={profile.lifestyle?.hobbies?.join(', ')} onChange={(v) => updateSection('lifestyle', { hobbies: v.split(',').map(s => s.trim()) })} />
            <ProfileField label="Languages" value={profile.lifestyle?.languages?.join(', ')} onChange={(v) => updateSection('lifestyle', { languages: v.split(',').map(s => s.trim()) })} />
            <ProfileField label="Favorite Music" value={profile.lifestyle?.favoriteMusic} onChange={(v) => updateSection('lifestyle', { favoriteMusic: v })} />
            <ProfileField label="Favorite Books" value={profile.lifestyle?.favoriteBooks?.join(', ')} onChange={(v) => updateSection('lifestyle', { favoriteBooks: v.split(',').map(s => s.trim()) })} />
            <ProfileField label="Personality Notes" value={profile.lifestyle?.personalityNotes} onChange={(v) => updateSection('lifestyle', { personalityNotes: v })} />
          </div>
        </SectionWrapper>
      </div>
    </ModulePageLayout>
  );
}
