import { createFileRoute, Link } from "@tanstack/react-router";
import { CosmicBackground } from "@/components/CosmicBackground";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Anomalia Cósmica RPG — Portal de Vetraxis" },
      {
        name: "description",
        content:
          "Entre no portal de Vetraxis. Uma plataforma completa para o RPG Anomalia Cósmica: fichas, corrupção, sanidade e combate automatizados.",
      },
      {
        property: "og:title",
        content: "Anomalia Cósmica RPG — Portal de Vetraxis",
      },
      {
        property: "og:description",
        content:
          "Portadores, ritos e horrores cósmicos. Uma plataforma completa para Mestres e Jogadores.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <CosmicBackground />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
        <div
          className="w-full max-w-2xl space-y-10"
          style={{
            animation: "fade-up 1.2s var(--ease-out-expo) both",
          }}
        >
          <div className="space-y-6">
            <p className="ritual-eyebrow">Fragmento da Anomalia</p>
            <h1 className="ritual-title text-balance text-6xl italic leading-[0.95] text-foreground md:text-8xl">
              Vetraxis
            </h1>
            <div className="mx-auto h-px w-24 bg-ritual-gold/40" />
            <p className="mx-auto max-w-md text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              O planeta respira. As anomalias reescrevem a realidade. Você é um Portador —
              e sua sanidade é a última moeda que resta.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/auth"
              className="group relative w-full overflow-hidden rounded-md bg-foreground px-8 py-3.5 text-xs uppercase tracking-[0.25em] text-abyss transition-all duration-500 hover:bg-ritual-gold sm:w-auto"
            >
              <span className="relative z-10">Manifestar-se</span>
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="w-full rounded-md border border-border px-8 py-3.5 text-xs uppercase tracking-[0.25em] text-foreground transition-colors hover:border-ritual-gold/50 hover:text-ritual-gold sm:w-auto"
            >
              Iniciar Ritual
            </Link>
          </div>
        </div>

        <footer className="pointer-events-none absolute bottom-6 left-0 right-0 flex justify-between px-8 font-mono text-[10px] uppercase tracking-tighter text-white/20">
          <span>Lat: 41.24.03 · Long: -2.10.88</span>
          <span className="hidden md:inline">Vetraxis Protocol 2.8.4</span>
          <span>Void-State: Stable</span>
        </footer>
      </main>
    </div>
  );
}
