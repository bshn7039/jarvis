export default function AmbientBackground({ accelerated = false }) {
  const particles = Array.from({ length: 24 }, (_, index) => ({
    id: index,
    left: `${(index * 17 + 8) % 100}%`,
    top: `${(index * 23 + 12) % 100}%`,
    delay: `${(index % 8) * 0.8}s`,
    duration: accelerated ? `${6 + (index % 4)}s` : `${14 + (index % 6) * 2}s`,
    size: index % 3 === 0 ? 2 : 1,
  }));

  return (
    <div
      className={[
        'pointer-events-none absolute inset-0 overflow-hidden transition-all duration-700',
        accelerated ? 'opacity-90 blur-[1px]' : 'opacity-100',
      ].join(' ')}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />

      {particles.map((particle) => (
        <span
          key={particle.id}
          className={[
            'absolute rounded-full bg-white/20',
            accelerated ? 'animate-[float-fast_6s_ease-in-out_infinite]' : 'animate-[float_18s_ease-in-out_infinite]',
          ].join(' ')}
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}

      <svg
        className={[
          'absolute inset-0 h-full w-full transition-opacity duration-700',
          accelerated ? 'opacity-[0.12]' : 'opacity-[0.06]',
        ].join(' ')}
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="0" y1="20%" x2="100%" y2="22%" stroke="white" strokeWidth="0.5" />
        <line x1="0" y1="55%" x2="100%" y2="58%" stroke="white" strokeWidth="0.5" />
        <line x1="0" y1="82%" x2="100%" y2="80%" stroke="white" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
