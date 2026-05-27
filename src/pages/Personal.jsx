import { useMemo } from 'react';
import { useSelfCareStore } from '../store/selfCareStore';
import { useCommunicationStore } from '../store/communicationStore';
import { useSocialGrowthStore } from '../store/socialGrowthStore';
import { usePublicPersonaStore } from '../store/publicPersonaStore';
import { useMusicStore } from '../store/musicStore';
import { useWritingStore } from '../store/writingStore';
import { useReadingStore } from '../store/readingStore';
import { useVaultStore } from '../store/vaultStore';
import { useCrmStore } from '../store/crmStore';
import { useEntityStore } from '../store/entityStore';
import ModulePageLayout from '../components/layout/ModulePageLayout';
import EntityModal from '../components/modals/EntityModal';
import EntityForm from '../components/forms/EntityForm';
import { 
  Heart, 
  Mic2, 
  Users, 
  Globe, 
  Music, 
  PenTool, 
  BookOpen, 
  Lock, 
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  TrendingUp,
  ExternalLink,
  MessageSquare,
  Clock,
  Star
} from 'lucide-react';

function SectionHeader({ title, icon: Icon, onAdd }) {
  return (
    <div className="flex items-center justify-between border-b border-jarvis-border pb-2 mb-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-jarvis-accent" />
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-jarvis-text">{title}</h3>
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          className="rounded-lg border border-jarvis-border p-1 text-jarvis-muted transition hover:bg-white/5 hover:text-jarvis-text"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function ItemCard({ item, onEdit, onDelete, onToggle, children, icon: Icon }) {
  return (
    <div className="group relative rounded-xl border border-jarvis-border bg-black/20 p-4 transition hover:border-jarvis-muted/40">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {onToggle && (
              <button onClick={() => onToggle(item.id)} className="shrink-0 text-jarvis-muted hover:text-jarvis-accent transition">
                {item.completed ? <CheckCircle2 className="h-4 w-4 text-jarvis-accent" /> : <Circle className="h-4 w-4" />}
              </button>
            )}
            {Icon && <Icon className="h-3.5 w-3.5 text-jarvis-muted/60" />}
            <h4 className="truncate text-sm font-medium text-jarvis-text">
              {item.title || item.platform || item.username || 'Untitled'}
            </h4>
          </div>
          {item.notes && <p className="mt-1 text-xs text-jarvis-muted line-clamp-2">{item.notes}</p>}
          {item.content && <p className="mt-1 text-xs text-jarvis-muted line-clamp-2 italic">"{item.content}"</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <button onClick={() => onEdit(item)} className="p-1 text-jarvis-muted hover:text-jarvis-text">
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(item.id)} className="p-1 text-jarvis-muted hover:text-red-400">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {children}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.tags?.map(tag => (
          <span key={tag} className="rounded bg-jarvis-accent/10 px-1.5 py-0.5 text-[10px] text-jarvis-accent/80 uppercase tracking-wider font-semibold">
            {tag}
          </span>
        ))}
        {item.category && (
          <span className="rounded border border-jarvis-border px-1.5 py-0.5 text-[10px] text-jarvis-muted uppercase tracking-wider">
            {item.category}
          </span>
        )}
        {item.type && !item.category && (
          <span className="rounded border border-jarvis-border px-1.5 py-0.5 text-[10px] text-jarvis-muted uppercase tracking-wider">
            {item.type}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Personal() {
  const selfCareStore = useSelfCareStore();
  const communicationStore = useCommunicationStore();
  const socialGrowthStore = useSocialGrowthStore();
  const publicPersonaStore = usePublicPersonaStore();
  const musicStore = useMusicStore();
  const writingStore = useWritingStore();
  const readingStore = useReadingStore();
  const vaultStore = useVaultStore();
  const crmStore = useCrmStore();

  const {
    isModalOpen,
    activeType,
    selectedId,
    draftMode,
    openCreateModal,
    openEditModal,
    closeModal
  } = useEntityStore();

  const storeMap = {
    selfCare: selfCareStore,
    communication: communicationStore,
    socialGrowth: socialGrowthStore,
    publicPersona: publicPersonaStore,
    music: musicStore,
    writing: writingStore,
    reading: readingStore,
    vault: vaultStore
  };

  const handleAdd = (type) => openCreateModal(type);
  const handleEdit = (type, item) => openEditModal(type, item.id);
  
  const handleSubmit = async (data) => {
    const store = storeMap[activeType];
    if (!store) return;

    if (draftMode === 'create') {
      await store.addItem(data);
    } else {
      await store.updateItem(selectedId, data);
    }
    closeModal();
  };

  const selectedItem = useMemo(() => {
    if (!selectedId || !activeType) return null;
    const store = storeMap[activeType];
    if (!store) return null;
    
    // Some stores use 'routines', 'logs', 'records', etc.
    const items = store.routines || store.logs || store.records || store.platforms || store.practiceLogs || store.drafts || store.library || store.ideas || [];
    return items.find(i => i.id === selectedId);
  }, [selectedId, activeType, selfCareStore.routines, communicationStore.logs, socialGrowthStore.records, publicPersonaStore.platforms, musicStore.practiceLogs, writingStore.drafts, readingStore.library, vaultStore.ideas]);

  const personalTypes = Object.keys(storeMap);

  const insights = useMemo(() => {
    const streaks = selfCareStore.getStreaks();
    const commStats = communicationStore.getWeeklyStats();
    const activeBooks = readingStore.library.filter(b => b.status === 'reading').length;
    const totalIdeas = vaultStore.ideas.length;
    const recentSocial = socialGrowthStore.records.slice(0, 5);

    return { streaks, commStats, activeBooks, totalIdeas, recentSocial };
  }, [selfCareStore.routines, communicationStore.logs, readingStore.library, vaultStore.ideas, socialGrowthStore.records]);

  return (
    <ModulePageLayout
      title="Personal Evolution"
      subtitle="Identity & Self-Development Operating System"
    >
      <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
        
        {/* 1. SELF CARE */}
        <section className="space-y-4">
          <SectionHeader title="Self Care" icon={Heart} onAdd={() => handleAdd('selfCare')} />
          <div className="grid gap-3">
            {selfCareStore.routines.length === 0 && (
              <p className="text-xs text-jarvis-muted italic">No routines established.</p>
            )}
            {selfCareStore.routines.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleEdit('selfCare', item)} 
                onDelete={() => selfCareStore.deleteItem(item.id)}
                onToggle={() => selfCareStore.toggleComplete(item.id)}
              >
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-jarvis-muted uppercase tracking-wider">{item.routineType}</span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-jarvis-accent">
                    <TrendingUp className="h-3 w-3" />
                    {item.streak || 0} DAY STREAK
                  </div>
                </div>
              </ItemCard>
            ))}
          </div>
        </section>

        {/* 2. COMMUNICATION & VOICE */}
        <section className="space-y-4">
          <SectionHeader title="Communication & Voice" icon={Mic2} onAdd={() => handleAdd('communication')} />
          <div className="grid gap-3">
            {communicationStore.logs.length === 0 && (
              <p className="text-xs text-jarvis-muted italic">No practice logs found.</p>
            )}
            {communicationStore.logs.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleEdit('communication', item)} 
                onDelete={() => communicationStore.deleteItem(item.id)}
              >
                 <div className="mt-2 flex items-center gap-3 text-[10px] text-jarvis-muted uppercase tracking-wider">
                  <Clock className="h-3 w-3" />
                  <span>{item.duration}</span>
                  <span className="h-1 w-1 rounded-full bg-jarvis-border" />
                  <div className="flex items-center gap-0.5">
                    <Star className="h-2.5 w-2.5 fill-jarvis-accent text-jarvis-accent" />
                    <span>{item.rating}/5</span>
                  </div>
                </div>
              </ItemCard>
            ))}
          </div>
        </section>

        {/* 3. SOCIAL GROWTH */}
        <section className="space-y-4">
          <SectionHeader title="Social Growth" icon={Users} onAdd={() => handleAdd('socialGrowth')} />
          <div className="grid gap-3">
            {socialGrowthStore.records.length === 0 && (
              <p className="text-xs text-jarvis-muted italic">No growth records.</p>
            )}
            {socialGrowthStore.records.map(item => {
              const contact = crmStore.contacts.find(c => c.id === item.linkedContactId);
              return (
                <ItemCard 
                  key={item.id} 
                  item={item} 
                  onEdit={() => handleEdit('socialGrowth', item)} 
                  onDelete={() => socialGrowthStore.deleteItem(item.id)}
                >
                  <div className="mt-2 flex flex-col gap-1.5">
                    {contact && (
                      <div className="flex items-center gap-1.5 text-[10px] text-jarvis-accent font-medium">
                        <Users className="h-3 w-3" />
                        <span>WITH {contact.name.toUpperCase()}</span>
                      </div>
                    )}
                    <div className="text-[10px] text-jarvis-muted uppercase tracking-wider">
                      Confidence: <span className="text-jarvis-text font-bold">{item.confidenceLevel}/10</span>
                    </div>
                  </div>
                </ItemCard>
              );
            })}
          </div>
        </section>

        {/* 4. PUBLIC PERSONA */}
        <section className="space-y-4">
          <SectionHeader title="Public Persona" icon={Globe} onAdd={() => handleAdd('publicPersona')} />
          <div className="grid gap-3">
            {publicPersonaStore.platforms.length === 0 && (
              <p className="text-xs text-jarvis-muted italic">No platform presence tracked.</p>
            )}
            {publicPersonaStore.platforms.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleEdit('publicPersona', item)} 
                onDelete={() => publicPersonaStore.deleteItem(item.id)}
                icon={ExternalLink}
              >
                <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wider">
                  <span className="text-jarvis-muted font-medium">{item.platform}</span>
                  <span className="text-jarvis-accent font-bold">@{item.username}</span>
                </div>
              </ItemCard>
            ))}
          </div>
        </section>

        {/* 5. SINGING & MUSIC */}
        <section className="space-y-4">
          <SectionHeader title="Singing & Music" icon={Music} onAdd={() => handleAdd('music')} />
          <div className="grid gap-3">
            {musicStore.practiceLogs.length === 0 && (
              <p className="text-xs text-jarvis-muted italic">No music logs.</p>
            )}
            {musicStore.practiceLogs.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleEdit('music', item)} 
                onDelete={() => musicStore.deleteItem(item.id)}
              >
                <div className="mt-2 flex items-center gap-3 text-[10px] text-jarvis-muted uppercase tracking-wider">
                  <Clock className="h-3 w-3" />
                  <span>{item.duration}</span>
                  <span className="h-1 w-1 rounded-full bg-jarvis-border" />
                  <span className="text-jarvis-accent">{item.skillFocus}</span>
                </div>
              </ItemCard>
            ))}
          </div>
        </section>

        {/* 6. WRITING & CREATIVITY */}
        <section className="space-y-4">
          <SectionHeader title="Writing & Creativity" icon={PenTool} onAdd={() => handleAdd('writing')} />
          <div className="grid gap-3">
            {writingStore.drafts.length === 0 && (
              <p className="text-xs text-jarvis-muted italic">No creative drafts.</p>
            )}
            {writingStore.drafts.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleEdit('writing', item)} 
                onDelete={() => writingStore.deleteItem(item.id)}
              >
                <div className="mt-2 flex items-center justify-between text-[10px] text-jarvis-muted uppercase tracking-wider italic">
                  <span>{item.type}</span>
                  {item.mood && <span>MOOD: {item.mood}</span>}
                </div>
              </ItemCard>
            ))}
          </div>
        </section>

        {/* 7. READING & LEARNING */}
        <section className="space-y-4">
          <SectionHeader title="Reading & Learning" icon={BookOpen} onAdd={() => handleAdd('reading')} />
          <div className="grid gap-3">
            {readingStore.library.length === 0 && (
              <p className="text-xs text-jarvis-muted italic">No resources in library.</p>
            )}
            {readingStore.library.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleEdit('reading', item)} 
                onDelete={() => readingStore.deleteItem(item.id)}
              >
                <div className="mt-1 text-[11px] text-jarvis-muted italic">by {item.author}</div>
                <div className="mt-3 overflow-hidden rounded-full bg-jarvis-border/30 h-1">
                  <div 
                    className="bg-jarvis-accent h-full transition-all duration-500" 
                    style={{ width: `${item.progress || 0}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wider font-bold">
                  <span className={item.status === 'reading' ? 'text-jarvis-accent' : 'text-jarvis-muted'}>{item.status}</span>
                  <span className="text-jarvis-text">{item.progress || 0}%</span>
                </div>
              </ItemCard>
            ))}
          </div>
        </section>

        {/* 8. CREATIVE VAULT */}
        <section className="space-y-4">
          <SectionHeader title="Creative Vault" icon={Lock} onAdd={() => handleAdd('vault')} />
          <div className="grid gap-3">
            {vaultStore.ideas.length === 0 && (
              <p className="text-xs text-jarvis-muted italic">Vault is empty.</p>
            )}
            {vaultStore.ideas.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleEdit('vault', item)} 
                onDelete={() => vaultStore.deleteItem(item.id)}
              >
                <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wider">
                  <span className="text-jarvis-muted">TYPE: {item.type || 'RAW'}</span>
                  {item.pinned && <span className="text-jarvis-accent font-bold">PINNED</span>}
                </div>
              </ItemCard>
            ))}
          </div>
        </section>

        {/* 9. PERSONAL INSIGHTS */}
        <section className="space-y-4">
          <SectionHeader title="Personal Insights" icon={Sparkles} />
          <div className="rounded-xl border border-jarvis-border bg-black/20 p-6 space-y-6">
            
            {insights.streaks.length === 0 && insights.commStats.count === 0 && insights.recentSocial.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Sparkles className="mb-3 h-6 w-6 text-jarvis-muted/40" />
                <p className="text-[10px] text-jarvis-muted uppercase tracking-[0.2em]">
                  Awaiting operational data for insights...
                </p>
              </div>
            )}

            {insights.streaks.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-jarvis-muted uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Self-Care Streaks
                </h4>
                <div className="space-y-2">
                  {insights.streaks.map((s, i) => (
                    <div key={i} className="flex items-center justify-between rounded bg-white/5 p-2 border border-jarvis-border/50">
                      <span className="text-xs text-jarvis-text font-medium">{s.title}</span>
                      <span className="text-xs font-bold text-jarvis-accent">{s.streak}d</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {insights.commStats.count > 0 && (
              <div className="space-y-3 pt-2 border-t border-jarvis-border/30">
                <h4 className="text-[10px] font-bold text-jarvis-muted uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="h-3 w-3" />
                  Communication (Weekly)
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded bg-white/5 p-2 border border-jarvis-border/50">
                    <div className="text-[10px] text-jarvis-muted uppercase">Sessions</div>
                    <div className="text-sm font-bold text-jarvis-text">{insights.commStats.count}</div>
                  </div>
                  <div className="rounded bg-white/5 p-2 border border-jarvis-border/50">
                    <div className="text-[10px] text-jarvis-muted uppercase">Avg Rating</div>
                    <div className="text-sm font-bold text-jarvis-accent">{insights.commStats.averageRating}/5</div>
                  </div>
                </div>
              </div>
            )}

            {insights.recentSocial.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-jarvis-border/30">
                <h4 className="text-[10px] font-bold text-jarvis-muted uppercase tracking-widest flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Recent Social Growth
                </h4>
                <div className="space-y-2">
                  {insights.recentSocial.map((r, i) => (
                    <div key={i} className="text-[10px] flex justify-between border-b border-jarvis-border/20 pb-1">
                      <span className="text-jarvis-muted truncate w-32">{r.title}</span>
                      <span className="text-jarvis-accent font-bold">+{r.confidenceLevel} CONF</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-between items-center text-[10px] text-jarvis-muted uppercase font-bold border-t border-jarvis-border/30">
              <div className="flex items-center gap-2">
                <BookOpen className="h-3 w-3" />
                <span>Reading: {insights.activeBooks} active</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-3 w-3" />
                <span>Vault: {insights.totalIdeas} ideas</span>
              </div>
            </div>

          </div>
        </section>

      </div>

      <EntityModal
        isOpen={isModalOpen && personalTypes.includes(activeType)}
        onClose={closeModal}
        title={`${draftMode === 'create' ? 'Add' : 'Edit'} ${activeType ? activeType.replace(/([A-Z])/g, ' $1').trim() : ''}`}
      >
        <EntityForm
          initialData={selectedItem}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </EntityModal>

    </ModulePageLayout>
  );
}

