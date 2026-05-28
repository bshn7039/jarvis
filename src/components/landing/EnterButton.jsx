import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EnterButton({ onTransitionStart }) {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  const handleClick = () => {
    if (isExiting) return;
    setIsExiting(true);
    onTransitionStart?.();
    sessionStorage.setItem('jarvis_entrance', '1');
    window.setTimeout(() => navigate('/home', { state: { fromLanding: true } }), 1000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isExiting}
      className={[
        'inline-flex items-center justify-center rounded-full border px-8 py-3',
        'text-sm font-medium tracking-wide transition-all duration-500',
        isExiting
          ? 'border-jarvis-accent/40 bg-jarvis-accent/10 text-jarvis-accent shadow-[0_0_24px_rgba(125,211,252,0.15)]'
          : 'border-jarvis-border text-jarvis-text hover:border-jarvis-muted/50 hover:bg-white/[0.03]',
      ].join(' ')}
    >
      Enter The Matrix
    </button>
  );
}
