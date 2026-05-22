import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const modalRootId = 'jarvis-modal-root';
function ensureRoot() {
  let root = document.getElementById(modalRootId);
  if (!root) {
    root = document.createElement('div');
    root.id = modalRootId;
    document.body.appendChild(root);
  }
  return root;
}

export default function BaseModal({ open, onClose, children, size = 'md', ariaLabel = 'Modal' }) {
  const root = ensureRoot();
  const [visible, setVisible] = useState(open);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open) {
      setVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const t = setTimeout(() => setVisible(false), 220);
      document.body.style.overflow = '';
      return () => clearTimeout(t);
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!visible) return null;

  const sizes = {
    sm: { maxWidth: 420 },
    md: { maxWidth: 720 },
    lg: { maxWidth: 980 },
    full: { width: '100%', height: '100%' },
  };

  const containerStyle = {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflowY: 'auto',
    padding: '24px 0',
    zIndex: 10000,
  };

  const backdropStyle = {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', transition: 'opacity 180ms',
    opacity: open ? 1 : 0,
  };

  const panelStyle = {
    position: 'relative',
    background: '#0b0b0b',
    color: '#fff',
    borderRadius: 8,
    padding: 18,
    boxShadow: '0 8px 30px rgba(2,2,2,0.7)',
    transform: open ? 'translateY(0px) scale(1)' : 'translateY(8px) scale(0.99)',
    transition: 'all 220ms cubic-bezier(.2,.9,.3,1)',
    width: 'calc(100% - 48px)',
    maxWidth: sizes[size]?.maxWidth,
    height: sizes[size]?.height,
    maxHeight: 'calc(100vh - 48px)',
    overflow: 'hidden',
  };

  return createPortal(
    <div style={containerStyle} aria-hidden={!open} role="dialog" aria-label={ariaLabel}>
      <div style={backdropStyle} onClick={onClose} />
      <div ref={dialogRef} style={panelStyle} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    root
  );
}
