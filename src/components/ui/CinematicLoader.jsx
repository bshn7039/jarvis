import { useEffect, useState } from 'react';

const MESSAGES = [
  'Syncing operational memory...',
  'Loading personal systems...',
  'Initializing AI layer...',
  'Analyzing metrics stack...',
  'Calibrating workspace grid...',
  'Verifying identity signatures...',
];

export default function CinematicLoader({ message, size = 'md' }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Cycle messages if no specific message is provided
    if (message) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % MESSAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [message]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const displayMessage = message || MESSAGES[currentIdx];

  const sizeClasses = {
    sm: 'text-[10px] py-1.5 px-3',
    md: 'text-[12px] py-3 px-5',
    lg: 'text-sm py-5 px-8',
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 text-center select-none">
      <div 
        className={[
          'relative overflow-hidden rounded-xl border border-jarvis-accent/20 bg-jarvis-accent/5 font-mono tracking-wider text-jarvis-accent/90 shadow-[0_0_15px_rgba(125,211,252,0.05)] jarvis-glass',
          sizeClasses[size]
        ].join(' ')}
      >
        {/* Horizontal glowing scanner line sweep */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-jarvis-accent to-transparent animate-scanner-sweep" />

        <div className="flex items-center justify-center gap-3">
          <div className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jarvis-accent opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-jarvis-accent"></span>
          </div>

          <div className="flex items-baseline font-semibold uppercase tracking-[0.1em]">
            <span>{displayMessage.replace(/\.\.\./, '')}</span>
            <span className="w-5 text-left ml-0.5">{dots}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
