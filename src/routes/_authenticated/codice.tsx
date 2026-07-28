import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ATTRIBUTES,
  CORRUPTION_TIERS,
  DIFFICULTIES,
  ELEMENTS,
  RELICS,
  SKILLS,
  type CosmicElement,
  type Relic,
} from "@/lib/game-data";

export const Route = createFileRoute("/_authenticated/codice")({
  head: () => ({
    meta: [
      { title: "O Códice — Anomalia Cósmica" },
      {
        name: "description",
        content:
          "As leis do universo de Vetraxis: testes, sanidade, corrupção, elementos cósmicos e relíquias.",
      },
    ],
  }),
  component: Codice,
});

function Codice() {
  return (
    <div className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <Link
        to="/dashboard"
        className="text-[10px] uppercase tracking-widest text-white/40 hover:text-ritual-gold"
      >
        ← Portal
      </Link>

      <header
        className="mt-4 mb-12 space-y-3"
        style={{ animation: "fade-up 0.6s var(--ease-out-expo) both" }}
      >
        <p className="ritual-eyebrow">Leis Fundamentais</p>
        <h1 className="ritual-title text-6xl text-foreground">O Códice</h1>
        <p className="max-w-2xl text-sm italic text-white/60">
          "Em Vetraxis a realidade reage. Toda ação é uma tentativa de impor
          ordem ao caos." — Livro de Regras, Ed. 1.1
        </p>
      </header>

      <Section title="1 · Testes">
        <p className="text-sm text-white/70">
          Formato padrão: <span className="font-mono text-ritual-gold">1d20 + Atributo + Perícia ≥ CD</span>.
          Empate favorece o defensor.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
          {DIFFICULTIES.map((d) => (
            <div
              key={d.label}
              className="rounded-lg border border-white/5 bg-black/30 p-3 text-center"
            >
              <p className="text-[10px] uppercase tracking-widest text-white/40">
                {d.label}
              </p>
              <p className="ritual-title text-2xl text-ritual-gold">CD {d.cd}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="2 · Atributos">
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(ATTRIBUTES).map(([key, meta]) => (
            <div key={key} className="rounded-lg border border-white/5 bg-black/20 p-3">
              <p className="ritual-title text-lg text-foreground">
                {meta.name}{" "}
                <span className="font-mono text-xs text-white/40">({meta.short})</span>
              </p>
              <p className="text-xs text-white/60">{meta.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="3 · Perícias">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm md:grid-cols-3">
          {SKILLS.map((s) => (
            <div key={s.key} className="flex justify-between border-b border-white/5 py-1">
              <span className="text-white/70">{s.name}</span>
              <span className="font-mono text-[10px] uppercase text-white/40">
                {ATTRIBUTES[s.attr].short}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="4 · Sanidade e Corrupção">
        <div className="space-y-3 text-sm text-white/70">
          <p>
            <strong className="text-prismatic">Sanidade</strong>: 1d20 + Intelecto vs CD
            do evento. Falha perde PS e pode ganhar transtorno temporário. PS = 0 causa
            Colapso Mental.
          </p>
          <p>
            <strong className="text-corruption">Corrupção</strong>: 1d20 + Resiliência vs
            CD (10 + intensidade). Falha ganha Corrupção acumulativa.
          </p>
        </div>
        <div className="mt-4 space-y-2">
          {CORRUPTION_TIERS.map((t) => (
            <div
              key={t.name}
              className="rounded-lg border-l-4 bg-black/30 p-3 pl-4"
              style={{ borderColor: t.color }}
            >
              <div className="flex items-center justify-between">
                <p className="ritual-title text-lg" style={{ color: t.color }}>
                  {t.name}
                </p>
                <span className="font-mono text-xs text-white/50">≤ {t.max}%</span>
              </div>
              <p className="mt-1 text-xs text-white/60">{t.effects}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="5 · Os Sete Elementos Cósmicos">
        <div className="grid gap-3 md:grid-cols-2">
          {(Object.entries(ELEMENTS) as [CosmicElement, typeof ELEMENTS.prisma][]).map(
            ([key, meta]) => (
              <div
                key={key}
                className="rounded-xl border border-white/10 bg-black/20 p-4"
                style={{ borderLeftWidth: 3, borderLeftColor: meta.color }}
              >
                <p className="ritual-title text-xl" style={{ color: meta.color }}>
                  {meta.name}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-white/40">
                  {meta.epithet}
                </p>
                <p className="mt-2 text-xs text-white/70">{meta.description}</p>
                <p className="mt-3 border-t border-white/5 pt-2 text-xs text-white/60">
                  <span className="text-ritual-gold">Passiva:</span> {meta.passive}
                </p>
              </div>
            ),
          )}
        </div>
      </Section>

      <Section title="6 · As Sete Relíquias — Os Deuses Cristalizados">
        <div className="grid gap-3 md:grid-cols-2">
          {(Object.entries(RELICS) as [Relic, typeof RELICS.prisma_harmonia][]).map(
            ([key, meta]) => (
              <div key={key} className="rounded-xl border border-ritual-gold/20 bg-black/20 p-4">
                <p className="ritual-title text-lg text-foreground">⟡ {meta.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-ritual-gold/70">
                  {meta.god}
                </p>
                <p className="mt-2 text-xs text-white/70">{meta.effect}</p>
                <p className="mt-2 font-mono text-[10px] uppercase text-white/40">
                  {meta.cost}
                </p>
              </div>
            ),
          )}
        </div>
      </Section>

      <Section title="7 · Recuperação de PA">
        <ul className="space-y-2 text-sm text-white/70">
          <li>
            <strong className="text-ritual-gold">Descanso longo (8h):</strong> recupera PA
            completo.
          </li>
          <li>
            <strong className="text-ritual-gold">Meditar com Relíquia sintonizada
            (1 Ação Principal):</strong> recupera 1 PA.
          </li>
        </ul>
      </Section>

      <p className="mt-16 text-center text-[10px] uppercase tracking-widest text-white/30">
        Anomalia Cósmica RPG · Ed. 1.1
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="mb-10 glass-panel rounded-2xl p-6"
      style={{ animation: "fade-up 0.6s var(--ease-out-expo) both" }}
    >
      <h2 className="ritual-title mb-4 text-3xl text-foreground">{title}</h2>
      {children}
    </section>
  );
}
