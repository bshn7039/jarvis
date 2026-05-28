import { useEffect, useState } from 'react';

const LETTERS = ['J', 'A', 'R', 'V', 'I', 'S'];

export default function JarvisLetterAnimation({ triggered, onSettle }) {
  const [phase, setPhase] = useState(() => {
    return triggered ? 'animating' : 'idle';
  });

  // Handle triggered transitioning dynamically (if ever updated)
  useEffect(() => {
    if (triggered && phase === 'idle') {
      setPhase('animating');
    }
  }, [triggered, phase]);

  // Handle the animation end settlement
  useEffect(() => {
    if (phase === 'animating') {
      // 2.5s duration + 5 * 150ms delay = 3.25s. 3.5s is the perfect settle duration.
      const timer = setTimeout(() => {
        setPhase('settled');
        onSettle?.();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [phase, onSettle]);

  const isSettled   = phase === 'settled';
  const isAnimating = phase === 'animating';

  return (
    <h2
      className={isSettled
        ? "jarvis-title text-4xl font-bold tracking-[0.35em] sm:text-5xl select-none jarvis-pulse-active"
        : "text-4xl font-bold tracking-[0.35em] text-jarvis-text sm:text-5xl select-none"
      }
      style={!isSettled && triggered && phase === 'idle' ? { opacity: 0 } : undefined}
    >
      {LETTERS.map((letter, i) => {
        if (isAnimating) {
          return (
            <span key={i} className={`jfly-letter-${i}`}>
              {letter}
            </span>
          );
        }

        const spanStyle = (!isSettled && triggered && phase === 'idle')
          ? { display: 'inline-block', opacity: 0 }
          : { display: 'inline-block' };

        return (
          <span key={i} style={spanStyle}>
            {letter}
          </span>
        );
      })}
    </h2>
  );
}
