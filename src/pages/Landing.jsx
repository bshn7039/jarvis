import { useState } from 'react';
import AmbientBackground from '../components/landing/AmbientBackground';
import EnterButton from '../components/landing/EnterButton';

export default function Landing() {
  const [isExiting, setIsExiting] = useState(false);

  return (
    <div
      className={[
        'relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-jarvis-bg px-6 transition-all duration-1000',
        isExiting ? 'scale-[1.02] opacity-0 blur-sm' : 'opacity-100',
      ].join(' ')}
    >
      <AmbientBackground accelerated={isExiting} />

      <div
        className={[
          'relative z-10 flex max-w-lg flex-col items-center text-center transition-all duration-1000',
          isExiting ? 'translate-y-[-8px] opacity-0' : 'translate-y-0 opacity-100',
        ].join(' ')}
      >
        <h1 className="jarvis-title text-4xl font-semibold tracking-[0.35em] text-jarvis-text sm:text-5xl">
          JARVIS
        </h1>
        <p className="mt-5 text-sm text-jarvis-muted sm:text-base">
          Personal AI Operating System
        </p>
        <div className="mt-12">
          <EnterButton onTransitionStart={() => setIsExiting(true)} />
        </div>
      </div>
    </div>
  );
}
