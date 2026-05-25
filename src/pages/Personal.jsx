import { useMemo } from 'react';
import { usePersonalStore } from '../store/personalStore';
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
  Circle
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

function ItemCard({ item, onEdit, onDelete, onToggle, children }) {
  return (
    <div className="group relative rounded-xl border border-jarvis-border bg-black/20 p-4 transition hover:border-jarvis-muted/40">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {onToggle && (
              <button onClick={() => onToggle(item.id)} className="shrink-0 text-jarvis-muted hover:text-jarvis-accent transition">
                {item.status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-jarvis-accent" /> : <Circle className="h-4 w-4" />}
              </button>
            )}
            <h4 className="truncate text-sm font-medium text-jarvis-text">
              {item.title || item.name || item.platform || 'Untitled'}
            </h4>
          </div>
          {item.description && <p className="mt-1 text-xs text-jarvis-muted line-clamp-2">{item.description}</p>}
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
        {item.subType && (
          <span className="rounded border border-jarvis-border px-1.5 py-0.5 text-[10px] text-jarvis-muted uppercase tracking-wider">
            {item.subType}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Personal() {
  const {
    selfCare,
    communication,
    socialGrowth,
    publicPersona,
    music,
    writing,
    reading,
    vault,
    addItem,
    updateItem,
    deleteItem,
    toggleStatus
  } = usePersonalStore();

  const {
    isModalOpen,
    activeType,
    selectedId,
    draftMode,
    openCreateModal,
    openEditModal,
    closeModal
  } = useEntityStore();

  const handleAdd = (type) => openCreateModal(type);
  const handleEdit = (type, item) => openEditModal(type, item.id);
  
  const handleSubmit = async (data) => {
    if (draftMode === 'create') {
      await addItem(activeType, data);
    } else {
      await updateItem(activeType, selectedId, data);
    }
    closeModal();
  };

  const selectedItem = useMemo(() => {
    if (!selectedId || !activeType) return null;
    return (usePersonalStore.getState()[activeType] || []).find(i => i.id === selectedId);
  }, [selectedId, activeType]);

  const personalTypes = ['selfCare', 'communication', 'socialGrowth', 'publicPersona', 'music', 'writing', 'reading', 'vault'];

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
            {selfCare.length === 0 && <p className="text-xs text-jarvis-muted italic">No routines established.</p>}
            {selfCare.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleEdit('selfCare', item)} 
                onDelete={() => deleteItem('selfCare', item.id)}
                onToggle={() => toggleStatus('selfCare', item.id)}
              >
                <div className="mt-2 text-[10px] text-jarvis-muted uppercase tracking-wider">
                  {item.frequency}
                </div>
              </ItemCard>
            ))}
          </div>
        </section>

        {/* 2. COMMUNICATION & VOICE */}
        <section className="space-y-4">
          <SectionHeader title="Communication & Voice" icon={Mic2} onAdd={() => handleAdd('communication')} />
          <div className="grid gap-3">
            {communication.length === 0 && <p className="text-xs text-jarvis-muted italic">No practice logs found.</p>}
            {communication.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleEdit('communication', item)} 
                onDelete={() => deleteItem('communication', item.id)}
              >
                 <div className="mt-2 flex items-center gap-3 text-[10px] text-jarvis-muted uppercase tracking-wider">
                  <span>{item.duration}</span>
                  <span className="h-1 w-1 rounded-full bg-jarvis-border" />
                  <span>{item.difficulty}</span>
                  <span className="h-1 w-1 rounded-full bg-jarvis-border" />
                  <span className="text-jarvis-accent">{item.progress}%</span>
                </div>
              </ItemCard>
            ))}
          </div>
        </section>

        {/* 3. SOCIAL GROWTH */}
        <section className="space-y-4">
          <SectionHeader title="Social Growth" icon={Users} onAdd={() => handleAdd('socialGrowth')} />
          <div className="grid gap-3">
            {socialGrowth.length === 0 && <p className="text-xs text-jarvis-muted italic">No growth records.</p>}
            {socialGrowth.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleEdit('socialGrowth', item)} 
                onDelete={() => deleteItem('socialGrowth', item.id)}
              >
                <div className="mt-2 text-[10px] text-jarvis-muted uppercase tracking-wider">
                  Confidence: <span className="text-jarvis-text">{item.confidenceRating}/10</span>
                </div>
              </ItemCard>
            ))}
          </div>
        </section>

        {/* 4. PUBLIC PERSONA */}
        <section className="space-y-4">
          <SectionHeader title="Public Persona" icon={Globe} onAdd={() => handleAdd('publicPersona')} />
          <div className="grid gap-3">
            {publicPersona.length === 0 && <p className="text-xs text-jarvis-muted italic">No platform presence tracked.</p>}
            {publicPersona.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleEdit('publicPersona', item)} 
                onDelete={() => deleteItem('publicPersona', item.id)}
              >
                <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wider">
                  <span className="text-jarvis-muted">{item.objective}</span>
                  <span className="text-jarvis-accent font-bold">{item.status}</span>
                </div>
              </ItemCard>
            ))}
          </div>
        </section>

        {/* 5. SINGING & MUSIC */}
        <section className="space-y-4">
          <SectionHeader title="Singing & Music" icon={Music} onAdd={() => handleAdd('music')} />
          <div className="grid gap-3">
            {music.length === 0 && <p className="text-xs text-jarvis-muted italic">No music logs.</p>}
            {music.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleEdit('music', item)} 
                onDelete={() => deleteItem('music', item.id)}
              >
                <div className="mt-2 flex items-center gap-3 text-[10px] text-jarvis-muted uppercase tracking-wider">
                  <span>{item.duration}</span>
                  <span className="text-jarvis-accent">{item.progress}%</span>
                </div>
              </ItemCard>
            ))}
          </div>
        </section>

        {/* 6. WRITING & CREATIVITY */}
        <section className="space-y-4">
          <SectionHeader title="Writing & Creativity" icon={PenTool} onAdd={() => handleAdd('writing')} />
          <div className="grid gap-3">
            {writing.length === 0 && <p className="text-xs text-jarvis-muted italic">No creative drafts.</p>}
            {writing.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleEdit('writing', item)} 
                onDelete={() => deleteItem('writing', item.id)}
              >
                {item.mood && <div className="mt-2 text-[10px] text-jarvis-muted uppercase tracking-wider italic">Mood: {item.mood}</div>}
              </ItemCard>
            ))}
          </div>
        </section>

        {/* 7. READING & LEARNING */}
        <section className="space-y-4">
          <SectionHeader title="Reading & Learning" icon={BookOpen} onAdd={() => handleAdd('reading')} />
          <div className="grid gap-3">
            {reading.length === 0 && <p className="text-xs text-jarvis-muted italic">No books in library.</p>}
            {reading.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleEdit('reading', item)} 
                onDelete={() => deleteItem('reading', item.id)}
              >
                <div className="mt-1 text-[11px] text-jarvis-muted italic">by {item.author}</div>
                <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wider">
                  <span className="text-jarvis-muted">{item.status}</span>
                  <span className="text-jarvis-accent">{item.progress}%</span>
                </div>
              </ItemCard>
            ))}
          </div>
        </section>

        {/* 8. CREATIVE VAULT */}
        <section className="space-y-4">
          <SectionHeader title="Creative Vault" icon={Lock} onAdd={() => handleAdd('vault')} />
          <div className="grid gap-3">
            {vault.length === 0 && <p className="text-xs text-jarvis-muted italic">Vault is empty.</p>}
            {vault.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleEdit('vault', item)} 
                onDelete={() => deleteItem('vault', item.id)}
              >
                <div className="mt-2 text-[10px] uppercase tracking-wider">
                  <span className={item.priority === 'high' ? 'text-red-400' : 'text-jarvis-muted'}>
                    {item.priority} priority
                  </span>
                </div>
              </ItemCard>
            ))}
          </div>
        </section>

        {/* 9. PERSONAL INSIGHTS */}
        <section className="space-y-4">
          <SectionHeader title="Personal Insights" icon={Sparkles} />
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-jarvis-border bg-black/10 p-8 text-center">
            <Sparkles className="mb-3 h-6 w-6 text-jarvis-muted" />
            <p className="text-xs text-jarvis-muted leading-relaxed">
              AI personal insights will appear here once enough operational data exists.
            </p>
          </div>
        </section>

      </div>

      <EntityModal
        isOpen={isModalOpen && personalTypes.includes(activeType)}
        onClose={closeModal}
        title={`${draftMode === 'create' ? 'Add' : 'Edit'} ${activeType}`}
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

