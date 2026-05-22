import BaseModal from './BaseModal';

export default function EntityModal({ isOpen, onClose, title, children }) {
  return (
    <BaseModal open={isOpen} onClose={onClose} size="lg" ariaLabel={title || 'Entity modal'}>
      <div className="flex max-h-[calc(100vh-96px)] flex-col">
        <div className="flex items-center justify-between border-b border-jarvis-border pb-2">
          <h2 className="text-sm font-medium uppercase tracking-wide text-jarvis-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-jarvis-border px-2 py-1 text-xs text-jarvis-muted transition hover:text-jarvis-text"
          >
            Close
          </button>
        </div>
        <div className="mt-4 overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </BaseModal>
  );
}
