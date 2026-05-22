import { useEffect, useMemo, useState } from 'react';
import EntityModal from '../modals/EntityModal';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import { deleteNodeAtPath, getNodeSnapshot, updateNodeAtPath } from '../../utils/canvasNodeOperations';

function PrimitiveEditor({ value, onChange }) {
  if (typeof value === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm text-jarvis-text">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
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
        className="w-full rounded border border-jarvis-border bg-black/20 px-3 py-2 text-sm text-jarvis-text"
      />
    );
  }
  return (
    <input
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-jarvis-border bg-black/20 px-3 py-2 text-sm text-jarvis-text"
    />
  );
}

export default function CanvasNodeActionModals({ actionState, combinedState, onClose }) {
  const [draftValue, setDraftValue] = useState(null);
  const [draftJson, setDraftJson] = useState('');
  const [error, setError] = useState('');

  const snapshot = useMemo(
    () => (actionState?.path ? getNodeSnapshot(combinedState, actionState.path) : null),
    [actionState?.path, combinedState],
  );

  useEffect(() => {
    if (!snapshot) return;
    const value = snapshot.value;
    setError('');
    if (value && typeof value === 'object') {
      setDraftJson(JSON.stringify(value, null, 2));
      setDraftValue(null);
    } else {
      setDraftValue(value ?? '');
      setDraftJson('');
    }
  }, [snapshot]);

  if (!actionState?.mode || !snapshot) return null;

  const label = snapshot.path?.split('.').pop() || 'node';
  const isObjectValue = snapshot.value && typeof snapshot.value === 'object';

  const submitEdit = async () => {
    try {
      const nextValue = isObjectValue ? JSON.parse(draftJson || 'null') : draftValue;
      await updateNodeAtPath({ path: snapshot.path, combinedState, nextValue });
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to save changes');
    }
  };

  const confirmDelete = async () => {
    await deleteNodeAtPath({ path: snapshot.path, combinedState });
  };

  return (
    <>
      <EntityModal
        isOpen={actionState.mode === 'edit'}
        onClose={onClose}
        title={`Edit ${label}`}
      >
        <div className="space-y-3">
          {isObjectValue ? (
            <textarea
              value={draftJson}
              onChange={(e) => setDraftJson(e.target.value)}
              rows={16}
              className="w-full rounded border border-jarvis-border bg-black/20 px-3 py-2 font-mono text-xs text-jarvis-text"
            />
          ) : (
            <PrimitiveEditor value={draftValue} onChange={setDraftValue} />
          )}
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={submitEdit}
              className="rounded border border-jarvis-border bg-white/10 px-3 py-1.5 text-xs text-jarvis-text hover:bg-white/15"
            >
              Save
            </button>
          </div>
        </div>
      </EntityModal>

      <DeleteConfirmModal
        open={actionState.mode === 'delete'}
        onClose={onClose}
        onConfirm={confirmDelete}
        title={`Delete ${label}?`}
        description="This action updates the recursive database graph and cannot be undone."
      />
    </>
  );
}
