import { createFileRoute, Link } from "@tanstack/react-router";
import { FUMBLE_TABLE } from "@/lib/dice";
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
          "As leis do universo de Vetraxis: Atributo + Perícia, DT, passos, críticos, sanidade, corrupção, elementos cósmicos e relíquias.",
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

      <Section title="1 · Testes: Atributo + Perícia">
        <p className="text-sm text-white/70">
          Role <span className="font-mono text-ritual-gold">dado de Atributo + dado de Perícia</span> e some.
          Resultado <strong>igual ou maior que a DT</strong> = sucesso; menor = falha. A DT padrão é{" "}
          <span className="font-mono text-ritual-gold">7</span>.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {DIFFICULTIES.map((d) => (
            <div key={d.label} className="rounded-lg border border-white/5 bg-black/30 p-3 text-center">
              <p className="text-[10px] uppercase tracking-widest text-white/40">{d.label}</p>
              <p className="ritual-title text-2xl text-ritual-gold">DT {d.cd}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-white/40">* Adaptação: o texto de referência define apenas DT 7 (padrão) e DT 10 (alcance longo).</p>
      </Section>

      <Section title="2 · Atributos (d4 → d12)">
        <div className="grid gap-3 md:grid-cols-3">
          {Object.entries(ATTRIBUTES).map(([key, meta]) => (
            <div key={key} className="rounded-lg border border-white/5 bg-black/20 p-3">
              <p className="ritual-title text-lg text-foreground">{meta.name} <span className="font-mono text-xs text-white/40">({meta.short})</span></p>
              <p className="text-xs text-white/60">{meta.description}</p>
            </div>
          ))}
        </div>
        <Scale rows={[["d4","Abaixo da média"],["d6","Média humana"],["d8","Acima da média"],["d10","Muito acima da média"],["d12","Ápice humano"]]} />
      </Section>

      <Section title="3 · Perícias">
        <Scale rows={[["d4","Destreinado"],["d6","Treinado"],["d8","Especialista"],["d10","Mestre"],["d12","Grão-mestre"]]} />
        <div className="mt-4 grid gap-x-6 gap-y-1 text-sm md:grid-cols-2">
          {SKILLS.map((s) => (
            <div key={s.key} className="flex justify-between gap-3 border-b border-white/5 py-1">
              <span className="text-white/80">{s.name} <span className="text-[11px] text-white/45">— {s.use}</span></span>
              <span className="font-mono text-[10px] uppercase text-white/40">{ATTRIBUTES[s.attr].short}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-white/55">
          O atributo-base é uma referência: o Mestre pode pedir outro atributo conforme a ação descrita. Escolha a perícia que corresponde à ação, não a de maior dado.
        </p>
      </Section>

      <Section title="3b · Regras adicionais das rolagens">
        <ul className="space-y-2 text-sm text-white/70">
          <li><strong className="text-ritual-gold">RA / RB:</strong> maior / menor resultado individual dos dados.</li>
          <li><strong className="text-ritual-gold">Teste oposto:</strong> ambos rolam; vence o maior resultado. <em className="text-white/40">Empate (adaptação): favorece quem defende.</em></li>
          <li><strong className="text-ritual-gold">Ajudar:</strong> gasta uma ação, usa perícia coerente com pelo menos d6. d6/d8 = +1 passo no dado do aliado; d10/d12 = +2 passos; d4 não ajuda.</li>
          <li><strong className="text-ritual-gold">Passos:</strong> d4 → d6 → d8 → d10 → d12. Aumento sobe uma posição; redução desce. Limites d4 e d12; efeitos anômalos excepcionais podem chegar a d20.</li>
          <li><strong className="text-ritual-gold">Dados adicionais:</strong> role até 4 dados, some no máximo os 3 maiores. Diferente de aumentar passo.</li>
          <li><strong className="text-ritual-gold">Sucesso crítico:</strong> 2+ dados com o mesmo valor, sendo ele 6 ou mais — passa automaticamente. Em ataques, o dano soma as duas maiores rolagens.</li>
          <li><strong className="text-corruption">Falha crítica:</strong> todos os dados em 1 — falha automática + penalidade (Mestre decide ou rola 1d8).</li>
        </ul>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs text-white/55">
          {FUMBLE_TABLE.map((f) => <li key={f}>{f}</li>)}
        </ol>
        <p className="mt-1 text-[10px] text-white/40">Tabela de falha crítica adaptada a Vetraxis (PS no lugar de PD; Corrupção como eco anômalo).</p>
      </Section>

      <Section title="3c · Combate">
        <ul className="space-y-2 text-sm text-white/70">
          <li>Corpo a corpo/desarmado: <span className="font-mono text-ritual-gold">Físico + Luta</span>. Disparo/arremesso: <span className="font-mono text-ritual-gold">Físico + Pontaria</span>.</li>
          <li>DT básica para acertar: <strong>7</strong>. Alcance longo: <strong>10</strong>.</li>
          <li>Dano = <span className="font-mono text-ritual-gold">RA do ataque + modificador da arma</span>.</li>
        </ul>
      </Section>

      <Section title="3d · Adaptações (interpretação — lacunas do texto)">
        <ul className="space-y-2 text-xs text-white/60">
          <li>• <strong>Defesa:</strong> DT para ser acertado = 7 + bônus de proteção. Bônus antigos de Defesa foram reduzidos à metade (arred. p/ cima). CA de criaturas → Defesa = 7 + metade do que passava de 10.</li>
          <li>• <strong>CDs antigas → DT</strong> = CD ÷ 2 (ex.: CD 15 → DT 8; CD 20 → DT 10).</li>
          <li>• <strong>Bônus/penalidades em testes</strong> (+1/+2 → 1 passo; +3/+4 → 2 passos). Vantagem → +1 dado adicional; desvantagem → −1 passo.</li>
          <li>• <strong>Iniciativa:</strong> Físico + Acrobacia. <strong>Sanidade:</strong> Emoção + Disciplina. <strong>Corrupção:</strong> Físico + Vigor (DT 7 + metade da intensidade).</li>
          <li>• <strong>Criaturas</strong> atacam com dados derivados do bônus antigo: ≤+1 d6+d4 · +2/+3 d6+d6 · +4/+5 d8+d6 · +6/+7 d8+d8 · +8/+9 d10+d8 · +10 d12+d10. Seus danos listados são mantidos; no crítico somam a RA do ataque.</li>
          <li>• <strong>PV/PS/PA</strong> usam o passo do dado (d4=0 … d12=4) no lugar do antigo valor do atributo.</li>
          <li>• <strong>Criação:</strong> atributos em d6, 2 aumentos de passo (máx. d10), reduzir para d4 dá +1 aumento; perícias começam em d4.</li>
        </ul>
      </Section>

      <Section title="4 · Sanidade e Corrupção">
        <div className="space-y-3 text-sm text-white/70">
          <p>
            <strong className="text-prismatic">Sanidade</strong>: Emoção + Disciplina vs DT
            do evento. Falha perde PS e pode ganhar transtorno temporário. PS = 0 causa
            Colapso Mental.
          </p>
          <p>
            <strong className="text-corruption">Corrupção</strong>: Físico + Vigor vs
            DT (7 + metade da intensidade). Falha ganha Corrupção acumulativa.
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

function Scale({ rows }: { rows: [string, string][] }) {
  return (
    <div className="mt-4 grid grid-cols-5 gap-2">
      {rows.map(([d, t]) => (
        <div key={d} className="rounded-lg border border-white/5 bg-black/30 p-2 text-center">
          <p className="ritual-title text-xl text-ritual-gold">{d}</p>
          <p className="text-[10px] text-white/50">{t}</p>
        </div>
      ))}
    </div>
  );
}
