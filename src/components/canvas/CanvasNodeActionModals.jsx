import { useEffect, useMemo, useState } from 'react';
import EntityModal from '../modals/EntityModal';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import { deleteNodeAtPath, getNodeSnapshot, updateNodeAtPath } from '../../utils/canvasNodeOperations';

function PrimitiveEditor({ value, onChange, fieldName }) {
  if (typeof value === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm text-jarvis-text cursor-pointer select-none">
        <input 
          type="checkbox" 
          checked={Boolean(value)} 
          onChange={(e) => onChange(e.target.checked)} 
          className="rounded border-jarvis-border bg-black/20 text-jarvis-accent outline-none"
        />
        <span>{value ? 'True' : 'False'}</span>
      </label>
    );
  }
  if (typeof value === 'number') {
    return (
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded border border-jarvis-border bg-black/20 px-3 py-2 text-sm text-jarvis-text outline-none focus:border-jarvis-accent"
      />
    );
  }

  const isTextArea = fieldName === 'vivaPrep' || fieldName === 'syllabus' || fieldName === 'notes' || (typeof value === 'string' && value.length > 50);
  if (isTextArea) {
    return (
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className="w-full rounded border border-jarvis-border bg-black/20 px-3 py-2 text-sm text-jarvis-text outline-none focus:border-jarvis-accent font-sans resize-y"
      />
    );
  }

  return (
    <input
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-jarvis-border bg-black/20 px-3 py-2 text-sm text-jarvis-text outline-none focus:border-jarvis-accent"
    />
  );
}

export default function CanvasNodeActionModals({ actionState, combinedState, onClose }) {
  const [draftValue, setDraftValue] = useState(null);
  const [draftJson, setDraftJson] = useState('');
  const [error, setError] = useState('');

  // Academics-specific edit state
  const [attendedDays, setAttendedDays] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  const snapshot = useMemo(
    () => (actionState?.path ? getNodeSnapshot(combinedState, actionState.path) : null),
    [actionState?.path, combinedState],
  );

  const isAttendanceNode = useMemo(() => snapshot?.path?.endsWith('.attendance'), [snapshot]);

  const isUnitOrTopic = useMemo(() => {
    const val = snapshot?.value;
    return val && typeof val === 'object' && ('name' in val) && (String(val.id).startsWith('u-') || String(val.id).startsWith('t-'));
  }, [snapshot]);

  useEffect(() => {
    if (!snapshot) return;
    const value = snapshot.value;
    setError('');

    if (isAttendanceNode) {
      const subject = snapshot.resolved?.parent;
      setAttendedDays(subject?.attendedDays || 0);
      setTotalDays(subject?.totalDays || 0);
    } else if (isUnitOrTopic) {
      setDraftValue(value?.name || '');
      setDraftJson('');
    } else if (value && typeof value === 'object') {
      setDraftJson(JSON.stringify(value, null, 2));
      setDraftValue(null);
    } else {
      setDraftValue(value ?? '');
      setDraftJson('');
    }
  }, [snapshot, isAttendanceNode, isUnitOrTopic]);

  if (!actionState?.mode || !snapshot) return null;

  const label = snapshot.path?.split('.').pop() || 'node';
  const isObjectValue = snapshot.value && typeof snapshot.value === 'object';
  
  const displayLabel = isAttendanceNode 
    ? 'Attendance' 
    : (isUnitOrTopic ? (String(snapshot.value.id).startsWith('u-') ? 'Unit Name' : 'Topic Name') : label);

  const submitEdit = async () => {
    try {
      let nextValue;
      if (isAttendanceNode) {
        nextValue = { attendedDays, totalDays };
      } else if (isUnitOrTopic) {
        nextValue = { ...snapshot.value, name: draftValue };
      } else {
        nextValue = isObjectValue ? JSON.parse(draftJson || 'null') : draftValue;
      }
      
      await updateNodeAtPath({ path: snapshot.path, combinedState, nextValue });
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to save changes');
    }
  };

  const confirmDelete = async () => {
    await deleteNodeAtPath({ path: snapshot.path, combinedState });
    onClose();
  };

  return (
    <>
      <EntityModal
        isOpen={actionState.mode === 'edit'}
        onClose={onClose}
        title={`Edit ${displayLabel}`}
      >
        <div className="space-y-4">
          {isAttendanceNode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-jarvis-muted mb-1.5 uppercase tracking-wider">Attended Days</label>
                <input
                  type="number"
                  min="0"
                  value={attendedDays}
                  onChange={(e) => setAttendedDays(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full rounded border border-jarvis-border bg-black/20 px-3 py-2 text-sm text-jarvis-text outline-none focus:border-jarvis-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-jarvis-muted mb-1.5 uppercase tracking-wider">Total Days</label>
                <input
                  type="number"
                  min="0"
                  value={totalDays}
                  onChange={(e) => setTotalDays(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full rounded border border-jarvis-border bg-black/20 px-3 py-2 text-sm text-jarvis-text outline-none focus:border-jarvis-accent"
                />
              </div>
              <div className="text-[10px] text-jarvis-muted bg-white/[0.02] border border-jarvis-border/40 rounded p-2.5 flex items-center justify-between">
                <span className="uppercase tracking-wide font-medium">Calculated Percentage:</span>
                <span className="text-xs font-bold font-mono text-jarvis-accent">
                  {totalDays > 0 ? Math.round((attendedDays / totalDays) * 100) : 0}%
                </span>
              </div>
            </div>
          ) : isUnitOrTopic ? (
            <div>
              <label className="block text-xs font-bold text-jarvis-muted mb-1.5 uppercase tracking-wider">Title / Name</label>
              <input
                value={draftValue ?? ''}
                onChange={(e) => setDraftValue(e.target.value)}
                className="w-full rounded border border-jarvis-border bg-black/20 px-3 py-2 text-sm text-jarvis-text outline-none focus:border-jarvis-accent"
              />
            </div>
          ) : isObjectValue ? (
            <textarea
              value={draftJson}
              onChange={(e) => setDraftJson(e.target.value)}
              rows={16}
              className="w-full rounded border border-jarvis-border bg-black/20 px-3 py-2 font-mono text-xs text-jarvis-text"
            />
          ) : (
            <PrimitiveEditor value={draftValue} onChange={setDraftValue} fieldName={label} />
          )}
          
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
          
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-jarvis-border/50 bg-white/5 px-3 py-1.5 text-xs text-jarvis-text hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitEdit}
              className="rounded bg-jarvis-accent/20 border border-jarvis-accent/60 px-4 py-1.5 text-xs text-jarvis-accent hover:bg-jarvis-accent/30 font-medium transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </EntityModal>

      <DeleteConfirmModal
        open={actionState.mode === 'delete'}
        onClose={onClose}
        onConfirm={confirmDelete}
        title={`Delete ${displayLabel}?`}
        description="This action updates the recursive database graph and cannot be undone."
      />
    </>
  );
}
