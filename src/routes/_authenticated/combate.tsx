import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CREATURES, THREATS } from "@/lib/bestiary";
import { ELEMENTS } from "@/lib/game-data";
import {
  EMPTY_ENCOUNTER,
  combatantFromCharacter,
  combatantFromCreature,
  drainQueue,
  loadEncounter,
  logEntry,
  resourceKey,
  rollAttack,
  rollFormula,
  saveEncounter,
  sortByInitiative,
  type CharacterLike,
  type Combatant,
  type EncounterState,
} from "@/lib/combat";

export const Route = createFileRoute("/_authenticated/combate")({
  head: () => ({
    meta: [
      { title: "Mesa de Combate — Anomalia Cósmica" },
      {
        name: "description",
        content:
          "Gerencie encontros de Anomalia Cósmica: iniciativa automática, rolagens de ataque e dano das criaturas, controle de PV e Pontos de Ação por turno.",
      },
      { property: "og:title", content: "Mesa de Combate — Anomalia Cósmica" },
      {
        property: "og:description",
        content:
          "Iniciativa, ataques, dano e Pontos de Ação calculados automaticamente para criaturas do Bestiário e Portadores.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Combate,
});

function elColor(el?: string) {
  return el ? ELEMENTS[el as keyof typeof ELEMENTS]?.color : undefined;
}

function Combate() {
  const [state, setState] = useState<EncounterState>(EMPTY_ENCOUNTER);
  const [chars, setChars] = useState<CharacterLike[]>([]);
  const [query, setQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const syncedRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const loaded = loadEncounter();
    const queued = drainQueue();
    if (queued.length) {
      const added = queued
        .map((id) => CREATURES.find((c) => c.id === id))
        .filter(Boolean)
        .map((c) => combatantFromCreature(c!, elColor(c!.element)));
      loaded.combatants = [...loaded.combatants, ...added];
      loaded.log = [
        logEntry(
          "Mesa",
          `${added.length} criatura(s) enviada(s) do Bestiário`,
          "system",
        ),
        ...loaded.log,
      ];
    }
    setState(loaded);
    setHydrated(true);

    supabase
      .from("characters")
      .select(
        "id,name,concept,element,hp_current,hp_max,sanity_current,sanity_max,pa_current,pa_max,corruption,dex_score",
      )
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const list = (data as CharacterLike[]) ?? [];
        setChars(list);
        // A ficha é a fonte da verdade ao abrir a mesa.
        setState((s) => ({
          ...s,
          combatants: s.combatants.map((c) => {
            if (c.kind !== "character") return c;
            const ch = list.find((x) => x.id === c.sourceId);
            if (!ch) return c;
            const synced: Combatant = {
              ...c,
              hpCurrent: ch.hp_current,
              hpMax: ch.hp_max,
              sanityCurrent: ch.sanity_current ?? c.sanityCurrent,
              sanityMax: ch.sanity_max ?? c.sanityMax,
              paCurrent: ch.pa_current,
              paMax: ch.pa_max,
              corruption: ch.corruption ?? c.corruption,
              defeated: ch.hp_current === 0,
            };
            syncedRef.current[c.sourceId] = resourceKey(synced);
            return synced;
          }),
        }));
      });
  }, []);

  useEffect(() => {
    if (hydrated) saveEncounter(state);
  }, [state, hydrated]);

  // Sincroniza PV/PS/PA/Corrupção dos Portadores de volta para as fichas.
  useEffect(() => {
    if (!hydrated) return;
    const pending = state.combatants.filter(
      (c) => c.kind === "character" && syncedRef.current[c.sourceId] !== resourceKey(c),
    );
    if (pending.length === 0) return;

    const timer = setTimeout(async () => {
      for (const c of pending) {
        const key = resourceKey(c);
        syncedRef.current[c.sourceId] = key;
        const patch = {
          hp_current: c.hpCurrent,
          pa_current: c.paCurrent,
          ...(c.sanityCurrent !== undefined ? { sanity_current: c.sanityCurrent } : {}),
          ...(c.corruption !== undefined ? { corruption: c.corruption } : {}),
        };

        const { error } = await supabase.from("characters").update(patch).eq("id", c.sourceId);
        if (error) {
          delete syncedRef.current[c.sourceId];
          toast.error(`Falha ao sincronizar ${c.name}: ${error.message}`);
          continue;
        }
        setChars((list) =>
          list.map((ch) =>
            ch.id === c.sourceId
              ? {
                  ...ch,
                  hp_current: c.hpCurrent,
                  pa_current: c.paCurrent,
                  sanity_current: c.sanityCurrent ?? ch.sanity_current,
                  corruption: c.corruption ?? ch.corruption,
                }
              : ch,
          ),
        );
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [state.combatants, hydrated]);


  const order = useMemo(
    () => (state.started ? sortByInitiative(state.combatants) : state.combatants),
    [state.combatants, state.started],
  );
  const activeId = state.started ? order[state.turnIndex % (order.length || 1)]?.id : null;

  function pushLog(actor: string, text: string, tone: Parameters<typeof logEntry>[2], detail?: string) {
    setState((s) => ({ ...s, log: [logEntry(actor, text, tone, detail), ...s.log].slice(0, 60) }));
  }

  function update(id: string, patch: Partial<Combatant>) {
    setState((s) => ({
      ...s,
      combatants: s.combatants.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }

  function addCreature(id: string) {
    const c = CREATURES.find((x) => x.id === id);
    if (!c) return;
    const same = state.combatants.filter((x) => x.sourceId === c.id).length;
    const comb = combatantFromCreature(c, elColor(c.element));
    if (same) comb.name = `${c.name} ${same + 1}`;
    setState((s) => ({ ...s, combatants: [...s.combatants, comb] }));
    pushLog("Mesa", `${comb.name} entra no encontro`, "system", `PV ${c.hp} · CA ${c.ca}`);
  }

  function addCharacter(ch: CharacterLike) {
    if (state.combatants.some((c) => c.kind === "character" && c.sourceId === ch.id)) {
      toast.error("Este Portador já está na mesa.");
      return;
    }
    const comb = combatantFromCharacter(ch, elColor(ch.element ?? undefined));
    setState((s) => ({ ...s, combatants: [...s.combatants, comb] }));
    pushLog("Mesa", `${ch.name} assume posição`, "system", `PV ${ch.hp_current}/${ch.hp_max}`);
  }

  function rollInitiative() {
    setState((s) => {
      const combatants = s.combatants.map((c) => {
        const r = rollFormula(c.initiativeFormula);
        return { ...c, initiative: r.total };
      });
      return {
        ...s,
        combatants,
        started: true,
        round: 1,
        turnIndex: 0,
        log: [logEntry("Mesa", "Iniciativa rolada — o encontro começa", "system"), ...s.log],
      };
    });
  }

  function nextTurn() {
    setState((s) => {
      const list = sortByInitiative(s.combatants);
      const nextIndex = s.turnIndex + 1;
      const wrapped = nextIndex >= list.length;
      const idx = wrapped ? 0 : nextIndex;
      const round = wrapped ? s.round + 1 : s.round;
      const upcoming = list[idx];
      const combatants = s.combatants.map((c) =>
        c.id === upcoming?.id ? { ...c, paCurrent: c.paMax } : c,
      );
      return {
        ...s,
        combatants,
        turnIndex: idx,
        round,
        log: [
          logEntry(
            upcoming?.name ?? "Mesa",
            wrapped ? `Rodada ${round} inicia — turno de ${upcoming?.name}` : `Turno de ${upcoming?.name}`,
            "system",
            `PA restaurados: ${upcoming?.paMax}`,
          ),
          ...s.log,
        ],
      };
    });
  }

  function attack(c: Combatant, index: number) {
    const a = c.attacks[index];
    const atk = rollAttack(a.roll);
    const dmg = rollFormula(a.damage.replace(/[^0-9dD+\-\s]/g, "").trim() || "1d4");
    const tone = atk.critical === "success" ? "critical" : atk.critical === "fumble" ? "fumble" : "roll";
    pushLog(
      c.name,
      `${a.name} → ${atk.total} vs CA${atk.critical === "success" ? " (CRÍTICO)" : atk.critical === "fumble" ? " (FALHA CRÍTICA)" : ""}`,
      tone,
      `Dano ${dmg.formula}: [${dmg.rolls.join(", ")}] = ${atk.critical === "success" ? dmg.total * 2 : dmg.total}${a.note ? ` · ${a.note}` : ""}`,
    );
    if (c.paCurrent > 0) update(c.id, { paCurrent: c.paCurrent - 1 });
  }

  function applyHp(c: Combatant, delta: number) {
    const hp = Math.max(0, Math.min(c.hpMax, c.hpCurrent + delta));
    update(c.id, { hpCurrent: hp, defeated: hp === 0 });
    pushLog(
      c.name,
      delta < 0 ? `sofre ${Math.abs(delta)} de dano` : `recupera ${delta} PV`,
      delta < 0 ? "damage" : "heal",
      `PV ${hp}/${c.hpMax}${hp === 0 ? " · abatido" : ""}${c.kind === "character" ? " · ficha sincronizada" : ""}`,
    );
  }

  function applySanity(c: Combatant, delta: number) {
    if (c.sanityCurrent === undefined || c.sanityMax === undefined) return;
    const ps = Math.max(0, Math.min(c.sanityMax, c.sanityCurrent + delta));
    update(c.id, { sanityCurrent: ps });
    pushLog(
      c.name,
      delta < 0 ? `perde ${Math.abs(delta)} de Sanidade` : `recupera ${delta} PS`,
      delta < 0 ? "damage" : "heal",
      `PS ${ps}/${c.sanityMax} · ficha sincronizada`,
    );
  }

  function applyCorruption(c: Combatant, delta: number) {
    const value = Math.max(0, Math.min(100, (c.corruption ?? 0) + delta));
    update(c.id, { corruption: value });
    pushLog(
      c.name,
      delta > 0 ? `acumula ${delta} de Corrupção` : `purga ${Math.abs(delta)} de Corrupção`,
      delta > 0 ? "damage" : "heal",
      `Corrupção ${value}/100 · ficha sincronizada`,
    );
  }


  const filtered = CREATURES.filter((c) =>
    `${c.name} ${c.epithet}`.toLowerCase().includes(query.trim().toLowerCase()),
  ).slice(0, 8);

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-16">
      <Link to="/dashboard" className="text-[10px] uppercase tracking-widest text-white/40 hover:text-ritual-gold">
        ← Portal
      </Link>

      <header className="mt-4 mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="ritual-eyebrow">Ritual de Confronto</p>
          <h1 className="ritual-title text-6xl text-foreground">Mesa de Combate</h1>
          <p className="max-w-xl text-sm italic text-white/55">
            Iniciativa, ataques, dano e Pontos de Ação resolvidos automaticamente.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {state.started && (
            <div className="rounded-xl border border-white/10 px-4 py-2 text-center font-mono">
              <p className="text-[9px] uppercase tracking-widest text-white/40">Rodada</p>
              <p className="text-2xl text-ritual-gold">{state.round}</p>
            </div>
          )}
          <button
            onClick={rollInitiative}
            disabled={state.combatants.length === 0}
            className="rounded-md bg-ritual-gold px-5 py-3 text-xs uppercase tracking-[0.2em] text-abyss transition-colors hover:bg-ritual-gold/90 disabled:opacity-40"
          >
            {state.started ? "Rerrolar Iniciativa" : "Iniciar Combate"}
          </button>
          {state.started && (
            <button
              onClick={nextTurn}
              className="rounded-md border border-white/20 px-5 py-3 text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-ritual-gold hover:text-ritual-gold"
            >
              Próximo Turno →
            </button>
          )}
          {state.combatants.length > 0 && (
            <button
              onClick={() => setState(EMPTY_ENCOUNTER)}
              className="text-[10px] uppercase tracking-widest text-white/35 hover:text-corruption"
            >
              Encerrar
            </button>
          )}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {order.length === 0 && (
            <p className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-white/40">
              A mesa está vazia. Adicione criaturas do Bestiário ou seus Portadores ao lado.
            </p>
          )}
          {order.map((c) => (
            <CombatantCard
              key={c.id}
              c={c}
              active={c.id === activeId}
              onAttack={(i) => attack(c, i)}
              onHp={(d) => applyHp(c, d)}
              onSanity={(d) => applySanity(c, d)}
              onCorruption={(d) => applyCorruption(c, d)}
              onPa={(d) =>
                update(c.id, { paCurrent: Math.max(0, Math.min(c.paMax, c.paCurrent + d)) })
              }
              onRemove={() =>
                setState((s) => ({ ...s, combatants: s.combatants.filter((x) => x.id !== c.id) }))
              }
            />
          ))}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <div className="glass-panel space-y-3 rounded-2xl p-5">
            <p className="ritual-eyebrow">Adicionar Anomalia</p>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar criatura…"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-white/25 focus:border-prismatic/60"
            />
            <div className="max-h-56 space-y-1 overflow-y-auto">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => addCreature(c.id)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-xs text-white/70 transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  <span>{c.name}</span>
                  <span className="font-mono text-[10px]" style={{ color: THREATS[c.threat].color }}>
                    PV {c.hp}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel space-y-2 rounded-2xl p-5">
            <p className="ritual-eyebrow">Seus Portadores</p>
            {chars.length === 0 && (
              <p className="text-xs text-white/40">Nenhuma ficha disponível ainda.</p>
            )}
            {chars.map((ch) => (
              <button
                key={ch.id}
                onClick={() => addCharacter(ch)}
                className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-xs text-white/70 transition-colors hover:bg-white/5 hover:text-foreground"
              >
                <span>{ch.name}</span>
                <span className="font-mono text-[10px] text-ritual-gold">
                  {ch.hp_current}/{ch.hp_max}
                </span>
              </button>
            ))}
          </div>

          <div className="glass-panel space-y-2 rounded-2xl p-5" ref={logRef}>
            <p className="ritual-eyebrow">Registro Ritual</p>
            <div className="max-h-80 space-y-1.5 overflow-y-auto">
              {state.log.length === 0 && (
                <p className="text-xs text-white/35">Nenhum evento registrado.</p>
              )}
              {state.log.map((l) => (
                <div
                  key={l.id}
                  className={`rounded-md px-2 py-1.5 text-xs ${
                    l.tone === "critical"
                      ? "bg-ritual-gold/10 text-ritual-gold"
                      : l.tone === "fumble" || l.tone === "damage"
                        ? "bg-corruption/10 text-corruption"
                        : l.tone === "heal"
                          ? "bg-prismatic/10 text-prismatic"
                          : "text-white/55"
                  }`}
                >
                  <p>
                    <span className="text-white/40">{l.actor}</span> {l.text}
                  </p>
                  {l.detail && <p className="font-mono text-[10px] text-white/40">{l.detail}</p>}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CombatantCard({
  c,
  active,
  onAttack,
  onHp,
  onPa,
  onRemove,
}: {
  c: Combatant;
  active: boolean;
  onAttack: (i: number) => void;
  onHp: (delta: number) => void;
  onPa: (delta: number) => void;
  onRemove: () => void;
}) {
  const [amount, setAmount] = useState(5);
  const pct = Math.round((c.hpCurrent / Math.max(1, c.hpMax)) * 100);

  return (
    <div
      className={`glass-panel rounded-2xl p-5 transition-all ${
        active ? "border-ritual-gold/60 shadow-[0_0_40px_-20px_var(--color-ritual-gold)]" : ""
      } ${c.defeated ? "opacity-50" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {c.initiative !== null && (
            <span className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-black/40 font-mono text-sm text-ritual-gold">
              {c.initiative}
            </span>
          )}
          <div>
            <h3 className="ritual-title text-2xl text-foreground">{c.name}</h3>
            <p className="text-xs italic text-white/45">
              {c.subtitle} · CA {c.ca}
              {c.sanityDC ? ` · Sanidade CD ${c.sanityDC}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right font-mono">
            <p className="text-[9px] uppercase tracking-widest text-white/35">PA</p>
            <div className="flex items-center gap-1">
              <button onClick={() => onPa(-1)} className="px-1 text-white/40 hover:text-corruption">
                −
              </button>
              <span className="text-sm text-prismatic">
                {c.paCurrent}/{c.paMax}
              </span>
              <button onClick={() => onPa(1)} className="px-1 text-white/40 hover:text-prismatic">
                +
              </button>
            </div>
          </div>
          <button onClick={onRemove} className="text-[10px] uppercase text-white/30 hover:text-corruption">
            ✕
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <div className="h-2 overflow-hidden rounded-full bg-black/50">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              backgroundColor: pct > 50 ? "var(--color-ritual-gold)" : pct > 25 ? "#fb923c" : "var(--color-corruption)",
            }}
          />
        </div>
        <div className="flex items-center justify-between font-mono text-[11px] text-white/50">
          <span>
            PV {c.hpCurrent}/{c.hpMax}
          </span>
          <span className="flex items-center gap-1">
            <button
              onClick={() => onHp(-amount)}
              className="rounded border border-corruption/40 px-2 py-0.5 text-corruption hover:bg-corruption/10"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Math.max(1, +e.target.value || 1))}
              className="w-14 rounded border border-white/10 bg-black/40 px-2 py-0.5 text-center text-foreground focus:outline-none"
            />
            <button
              onClick={() => onHp(amount)}
              className="rounded border border-prismatic/40 px-2 py-0.5 text-prismatic hover:bg-prismatic/10"
            >
              +
            </button>
          </span>
        </div>
      </div>

      {c.attacks.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {c.attacks.map((a, i) => (
            <button
              key={a.name}
              onClick={() => onAttack(i)}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-left text-xs transition-colors hover:border-ritual-gold/60 hover:text-ritual-gold"
            >
              <span className="block text-foreground">{a.name}</span>
              <span className="font-mono text-[10px] text-white/45">
                {a.roll} · {a.damage}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
