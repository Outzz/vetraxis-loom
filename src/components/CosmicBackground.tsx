import nebula from "@/assets/nebula.jpg";

/**
 * Ambient cosmic backdrop: nebula, pulsing core (Vetraxis), and floating particles.
 * Fixed to the viewport, purely decorative.
 */
export function CosmicBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Base radial */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-void-blue)_0%,var(--color-abyss)_70%)]" />

      {/* Nebula */}
      <div className="absolute inset-0 opacity-30 mix-blend-screen animate-[nebula-drift_24s_ease-in-out_infinite]">
        <img
          src={nebula}
          alt=""
          className="h-full w-full object-cover"
          loading="eager"
          width={1920}
          height={1080}
        />
      </div>

      {/* Pulsing prismatic core */}
      <div className="absolute left-1/2 top-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-prismatic/15 blur-[140px] animate-[pulse-core_9s_ease-in-out_infinite]" />

      {/* Gold accent glow */}
      <div className="absolute bottom-[-10%] right-[-10%] size-[30rem] rounded-full bg-ritual-gold/5 blur-[120px]" />

      {/* Floating cosmic particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="absolute block size-[2px] rounded-full bg-white/60 shadow-[0_0_6px_rgba(255,255,255,0.8)]"
            style={{
              left: `${(i * 53) % 100}%`,
              animation: `particle-drift ${15 + (i % 7) * 3}s linear ${i * 0.7}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,var(--color-abyss)_100%)]" />
    </div>
  );
}
