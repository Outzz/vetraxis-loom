import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  ATTRIBUTES,
  CLASSES,
  CLASS_CHOICE_CORRUPTION,
  CORRUPTION_TIERS,
  DIFFICULTIES,
  ELEMENTS,
  RELICS,
  SKILLS,
  attrModifier,
  corruptionTier,
  maxHP,
  maxPA,
  maxSanity,
  trackById,
  type AttributeKey,
  type CharacterClass,
  type CosmicElement,
  type Relic,
} from "@/lib/game-data";
import { rollTest, rollDice } from "@/lib/dice";
import { pushRoll } from "@/lib/dice-store";


export const Route = createFileRoute("/_authenticated/characters/$id")({
  head: () => ({
    meta: [
      { title: "Ficha do Portador — Anomalia Cósmica" },
      {
        name: "description",
        content: "Ficha completa de um Portador de Vetraxis.",
      },
    ],
  }),
  component: CharacterSheet,
});

type Character = {
  id: string;
  owner_id: string;
  campaign_id: string | null;
  name: string;
  concept: string | null;
  origin: string | null;
  level: number;
  xp: number;
  character_class: CharacterClass | null;
  track: string | null;
  element: CosmicElement | null;
  relic: Relic | null;

  str_score: number;
  dex_score: number;
  int_score: number;
  res_score: number;
  cha_score: number;
  per_score: number;
  hp_current: number;
  hp_max: number;
  sanity_current: number;
  sanity_max: number;
  pa_current: number;
  pa_max: number;
  corruption: number;
  disorders: string[];
  skills: Record<string, number>;
  inventory: { name: string; qty: number; note?: string }[];
  powers: { name: string; text: string }[];
  scars: string[];
  notes: string | null;
};

const ATTR_TO_SCORE: Record<AttributeKey, keyof Character> = {
  str: "str_score",
  dex: "dex_score",
  int: "int_score",
  cha: "cha_score",
  res: "res_score",
};


function CharacterSheet() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [c, setC] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const [tab, setTab] = useState<"stats" | "skills" | "inventory" | "powers" | "notes">(
    "stats",
  );

  async function load() {
    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data) {
      setLoading(false);
      return;
    }
    // JSONB fields come back as any
    const ch = data as unknown as Character;
    ch.disorders = ch.disorders ?? [];
    ch.skills = ch.skills ?? {};
    ch.inventory = ch.inventory ?? [];
    ch.powers = ch.powers ?? [];
    ch.scars = ch.scars ?? [];
    setC(ch);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function update(patch: Partial<Character>) {
    if (!c) return;
    setC({ ...c, ...patch });
    const { error } = await supabase
      .from("characters")
      .update(patch as never)
      .eq("id", c.id);
    if (error) toast.error(error.message);
  }

  function addLog(line: string) {
    setLog((l) => [line, ...l].slice(0, 12));
  }

  function rollAttr(key: AttributeKey) {
    if (!c) return;
    const mod = attrModifier(c[ATTR_TO_SCORE[key]] as number);
    const r = rollDice(1, 20, mod);
    pushRoll(r, { label: ATTRIBUTES[key].name });
    addLog(
      `${ATTRIBUTES[key].name}: ${r.formula} = [${r.rolls[0]}] ${mod >= 0 ? "+" : ""}${mod} = ${r.total}${
        r.critical === "success" ? " ⭐" : r.critical === "fumble" ? " ☠" : ""
      }`,
    );
  }

  function rollSkill(skillKey: string, cd: number) {
    if (!c) return;
    const skill = SKILLS.find((s) => s.key === skillKey)!;
    const mod = attrModifier(c[ATTR_TO_SCORE[skill.attr]] as number);
    const bonus = c.skills[skillKey] ?? 0;
    const r = rollTest(mod, bonus, cd);
    pushRoll(r, { label: skill.name, cd, passed: r.passed });
    addLog(
      `${skill.name} vs CD ${cd}: [${r.rolls[0]}] ${mod >= 0 ? "+" : ""}${mod}${bonus ? "+" + bonus : ""} = ${r.total} · ${
        r.passed ? "SUCESSO" : "FALHA"
      }${r.critical === "success" ? " ⭐" : r.critical === "fumble" ? " ☠" : ""}`,
    );
  }

  function rollSanity() {
    if (!c) return;
    const mod = attrModifier(c.int_score);
    const r = rollTest(mod, 0, 15);
    pushRoll(r, { label: "Teste de Sanidade", cd: 15, passed: r.passed });
    addLog(
      `Sanidade vs CD 15: [${r.rolls[0]}]${mod >= 0 ? "+" : ""}${mod} = ${r.total} · ${
        r.passed ? "SUCESSO" : "PERDE SANIDADE"
      }`,
    );
  }

  function rollCorruption(intensity: number) {
    if (!c) return;
    const mod = attrModifier(c.res_score);
    const cd = 10 + intensity;
    const r = rollTest(mod, 0, cd);
    pushRoll(r, { label: "Teste de Corrupção", cd, passed: r.passed });
    addLog(
      `Corrupção vs CD ${cd}: [${r.rolls[0]}]${mod >= 0 ? "+" : ""}${mod} = ${r.total} · ${
        r.passed ? "RESISTE" : "GANHA CORRUPÇÃO"
      }`,
    );
  }

  const derived = useMemo(() => {
    if (!c) return null;
    return {
      hp: maxHP(c.res_score),
      sanity: maxSanity(c.int_score),
      pa: maxPA(c.int_score),
    };
  }, [c]);

  async function recalcMax() {
    if (!c || !derived) return;
    await update({
      hp_max: derived.hp,
      sanity_max: derived.sanity,
      pa_max: derived.pa,
      hp_current: Math.min(c.hp_current, derived.hp),
      sanity_current: Math.min(c.sanity_current, derived.sanity),
      pa_current: Math.min(c.pa_current, derived.pa),
    });
    toast.success("Recursos recalculados.");
  }

  async function handleDelete() {
    if (!c) return;
    if (!confirm(`Apagar ${c.name}? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from("characters").delete().eq("id", c.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Fragmento dissipado.");
      navigate({ to: "/characters" });
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="ritual-eyebrow animate-pulse">Invocando…</p>
      </div>
    );
  }
  if (!c) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="ritual-eyebrow">Portador perdido</p>
        <Link to="/characters" className="mt-4 inline-block text-xs uppercase text-ritual-gold">
          ← Voltar
        </Link>
      </div>
    );
  }

  const el = c.element ? ELEMENTS[c.element] : null;
  const relic = c.relic ? RELICS[c.relic] : null;
  const tier = corruptionTier(c.corruption);

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/characters"
          className="text-[10px] uppercase tracking-widest text-white/40 hover:text-ritual-gold"
        >
          ← Portadores
        </Link>
        <button
          onClick={handleDelete}
          className="text-[10px] uppercase tracking-widest text-white/30 hover:text-corruption"
        >
          Dissipar Fragmento
        </button>
      </div>

      {/* Header */}
      <header
        className="glass-panel mb-6 rounded-2xl p-6"
        style={{ animation: "fade-up 0.6s var(--ease-out-expo) both" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <input
              value={c.name}
              onChange={(e) => setC({ ...c, name: e.target.value })}
              onBlur={() => update({ name: c.name })}
              className="ritual-title w-full bg-transparent text-4xl text-foreground focus:outline-none"
            />
            <input
              value={c.concept ?? ""}
              placeholder="Conceito…"
              onChange={(e) => setC({ ...c, concept: e.target.value })}
              onBlur={() => update({ concept: c.concept })}
              className="mt-1 w-full bg-transparent text-sm italic text-white/50 focus:outline-none"
            />
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-2">
                <span className="text-white/40">Nível</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={c.level}
                  onChange={(e) => update({ level: Math.max(1, Math.min(20, +e.target.value)) })}
                  className="w-14 rounded border border-white/10 bg-black/40 px-2 py-1 text-center font-mono"
                />
              </label>
              {el && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest"
                  style={{ background: el.color + "22", color: el.color }}
                >
                  {el.name} · {el.epithet}
                </span>
              )}
              {relic && (
                <span className="text-[10px] uppercase tracking-widest text-ritual-gold">
                  ⟡ {relic.name}
                </span>
              )}
              <button
                onClick={recalcMax}
                className="ml-auto text-[10px] uppercase tracking-widest text-white/40 hover:text-ritual-gold"
                title="Recalcula PV/PS/PA máximos com base nos atributos e nível"
              >
                ↻ Recalcular máx
              </button>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <ResourceControl
            label="Vitalidade"
            short="PV"
            color="#84cc16"
            current={c.hp_current}
            max={c.hp_max}
            onChange={(v) => update({ hp_current: v })}
          />
          <ResourceControl
            label="Sanidade"
            short="PS"
            color="#38bdf8"
            current={c.sanity_current}
            max={c.sanity_max}
            onChange={(v) => update({ sanity_current: v })}
          />
          <ResourceControl
            label="Pts. Anomalia"
            short="PA"
            color="#a78bfa"
            current={c.pa_current}
            max={c.pa_max}
            onChange={(v) => update({ pa_current: v })}
          />
          <div className="rounded-xl border border-white/5 bg-black/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40">Corrupção</p>
                <p className="ritual-title text-2xl" style={{ color: tier.color }}>
                  {c.corruption}%
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => update({ corruption: Math.min(100, c.corruption + 5) })}
                  className="size-6 rounded border border-white/10 text-xs text-white/60 hover:border-corruption hover:text-corruption"
                >
                  +
                </button>
                <button
                  onClick={() => update({ corruption: Math.max(0, c.corruption - 5) })}
                  className="size-6 rounded border border-white/10 text-xs text-white/60 hover:border-white/40"
                >
                  −
                </button>
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full transition-all"
                style={{
                  width: `${c.corruption}%`,
                  background: tier.color,
                  boxShadow: `0 0 8px ${tier.color}`,
                }}
              />
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-widest" style={{ color: tier.color }}>
              {tier.name}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-white/50">{tier.effects}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Attributes */}
          <section className="glass-panel rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="ritual-eyebrow">Atributos</p>
              <span className="text-[10px] text-white/40">clique para rolar 1d20 + mod</span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {(Object.entries(ATTRIBUTES) as [AttributeKey, typeof ATTRIBUTES.str][]).map(
                ([key, meta]) => {
                  const score = c[ATTR_TO_SCORE[key]] as number;
                  const mod = attrModifier(score);
                  return (
                    <button
                      key={key}
                      onClick={() => rollAttr(key)}
                      className="group rounded-xl border border-white/10 bg-black/30 p-3 text-center transition-all hover:border-ritual-gold/50 hover:bg-ritual-gold/5"
                    >
                      <p className="text-[10px] uppercase tracking-widest text-white/40">
                        {meta.short}
                      </p>
                      <p className="ritual-title text-3xl text-foreground">{score}</p>
                      <p className="font-mono text-xs text-ritual-gold">
                        {mod >= 0 ? "+" : ""}
                        {mod}
                      </p>
                    </button>
                  );
                },
              )}
            </div>
          </section>

          {/* Tabs */}
          <section className="glass-panel rounded-2xl">
            <div className="flex flex-wrap border-b border-white/5">
              {(
                [
                  ["stats", "Testes"],
                  ["skills", "Perícias"],
                  ["inventory", "Inventário"],
                  ["powers", "Poderes"],
                  ["notes", "Anotações"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`px-5 py-3 text-[10px] uppercase tracking-widest transition-colors ${
                    tab === k
                      ? "border-b-2 border-ritual-gold text-ritual-gold"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {tab === "stats" && (
                <div className="space-y-6">
                  <div>
                    <p className="ritual-eyebrow mb-3">Testes especiais</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={rollSanity}
                        className="rounded-md border border-white/10 bg-black/30 px-4 py-2 text-xs text-foreground hover:border-prismatic/60 hover:bg-prismatic/10"
                      >
                        Sanidade (CD 15)
                      </button>
                      {[1, 3, 5, 8].map((intensity) => (
                        <button
                          key={intensity}
                          onClick={() => rollCorruption(intensity)}
                          className="rounded-md border border-white/10 bg-black/30 px-4 py-2 text-xs text-foreground hover:border-corruption/60 hover:bg-corruption/10"
                        >
                          Corrupção +{intensity} (CD {10 + intensity})
                        </button>
                      ))}
                    </div>
                  </div>
                  {el && (
                    <div>
                      <p className="ritual-eyebrow mb-2">Passiva Elemental</p>
                      <p className="text-sm text-white/70">{el.passive}</p>
                    </div>
                  )}
                  {relic && (
                    <div>
                      <p className="ritual-eyebrow mb-2">Relíquia — {relic.name}</p>
                      <p className="text-sm text-white/70">{relic.effect}</p>
                      <p className="mt-1 font-mono text-[10px] uppercase text-ritual-gold/60">
                        {relic.cost}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {tab === "skills" && (
                <SkillsPanel c={c} onUpdate={update} onRoll={rollSkill} />
              )}

              {tab === "inventory" && <InventoryPanel c={c} onUpdate={update} />}

              {tab === "powers" && <PowersPanel c={c} onUpdate={update} />}

              {tab === "notes" && (
                <div className="space-y-4">
                  <div>
                    <p className="ritual-eyebrow mb-2">Cicatrizes Narrativas</p>
                    <ScarsPanel c={c} onUpdate={update} />
                  </div>
                  <div>
                    <p className="ritual-eyebrow mb-2">Notas do Portador</p>
                    <textarea
                      value={c.notes ?? ""}
                      onChange={(e) => setC({ ...c, notes: e.target.value })}
                      onBlur={() => update({ notes: c.notes })}
                      rows={8}
                      className="w-full rounded-lg border border-white/5 bg-black/40 p-4 text-sm text-foreground focus:border-prismatic/40 focus:outline-none"
                      placeholder="Segredos, contatos, obsessões…"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Corruption tiers reference */}
          <section className="glass-panel rounded-2xl p-6">
            <p className="ritual-eyebrow mb-3">Faixas de Corrupção</p>
            <div className="space-y-2">
              {CORRUPTION_TIERS.map((t) => (
                <div
                  key={t.name}
                  className={`flex items-center gap-3 rounded border-l-2 pl-3 text-xs ${
                    c.corruption <= t.max && c.corruption > (CORRUPTION_TIERS.find((x) => x.max === t.max - 20)?.max ?? -1)
                      ? "opacity-100"
                      : "opacity-40"
                  }`}
                  style={{ borderColor: t.color }}
                >
                  <span className="ritual-title w-32 text-sm" style={{ color: t.color }}>
                    {t.name}
                  </span>
                  <span className="font-mono text-[10px] text-white/50">≤ {t.max}%</span>
                  <span className="text-white/60">{t.effects}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          
          <div className="glass-panel rounded-2xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="ritual-eyebrow">Registro do Ritual</p>
              {log.length > 0 && (
                <button
                  onClick={() => setLog([])}
                  className="text-[10px] text-white/40 hover:text-corruption"
                >
                  Limpar
                </button>
              )}
            </div>
            {log.length === 0 ? (
              <p className="text-xs text-white/30">
                Role atributos, perícias ou testes especiais e o resultado aparece aqui.
              </p>
            ) : (
              <ul className="space-y-1 font-mono text-[11px]">
                {log.map((l, i) => (
                  <li
                    key={i}
                    className={i === 0 ? "text-foreground" : "text-white/50"}
                  >
                    {l}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="glass-panel rounded-2xl p-4">
            <p className="ritual-eyebrow mb-2">Rolar teste rápido</p>
            <div className="space-y-2">
              {DIFFICULTIES.map((d) => (
                <div key={d.label} className="flex justify-between text-xs">
                  <span className="text-white/60">{d.label}</span>
                  <span className="font-mono text-ritual-gold">CD {d.cd}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ResourceControl({
  label,
  short,
  color,
  current,
  max,
  onChange,
}: {
  label: string;
  short: string;
  color: string;
  current: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const pct = Math.max(0, Math.min(100, (current / Math.max(1, max)) * 100));
  return (
    <div className="rounded-xl border border-white/5 bg-black/30 p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/40">
            {label}
          </p>
          <p className="ritual-title text-2xl" style={{ color }}>
            {current}
            <span className="text-sm text-white/40"> / {max}</span>
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onChange(Math.min(max, current + 1))}
            className="size-6 rounded border border-white/10 text-xs text-white/60 hover:border-ritual-gold hover:text-ritual-gold"
          >
            +
          </button>
          <button
            onClick={() => onChange(Math.max(0, current - 1))}
            className="size-6 rounded border border-white/10 text-xs text-white/60 hover:border-corruption hover:text-corruption"
          >
            −
          </button>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full transition-all"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
      <p className="mt-1 text-right font-mono text-[9px] uppercase text-white/30">
        {short}
      </p>
    </div>
  );
}

function SkillsPanel({
  c,
  onUpdate,
  onRoll,
}: {
  c: Character;
  onUpdate: (p: Partial<Character>) => void;
  onRoll: (key: string, cd: number) => void;
}) {
  const [cd, setCd] = useState(10);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-[10px] uppercase tracking-widest text-white/40">
          CD do teste:
        </label>
        <div className="flex gap-1">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.cd}
              onClick={() => setCd(d.cd)}
              className={`rounded px-2 py-1 text-[10px] font-mono ${
                cd === d.cd
                  ? "bg-ritual-gold text-abyss"
                  : "border border-white/10 text-white/60 hover:border-white/30"
              }`}
            >
              {d.cd}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {SKILLS.map((s) => {
          const bonus = c.skills[s.key] ?? 0;
          const score = c[ATTR_TO_SCORE[s.attr]] as number;
          const mod = attrModifier(score);
          const total = mod + bonus;
          return (
            <div
              key={s.key}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 p-2 pl-3"
            >
              <button
                onClick={() => onRoll(s.key, cd)}
                className="flex-1 text-left hover:text-ritual-gold"
              >
                <span className="text-sm text-foreground">{s.name}</span>
                <span className="ml-2 text-[10px] uppercase text-white/40">
                  {ATTRIBUTES[s.attr].short}
                </span>
              </button>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-ritual-gold">
                  {total >= 0 ? "+" : ""}
                  {total}
                </span>
                <input
                  type="number"
                  value={bonus}
                  onChange={(e) => {
                    const val = +e.target.value || 0;
                    onUpdate({ skills: { ...c.skills, [s.key]: val } });
                  }}
                  className="w-12 rounded border border-white/10 bg-black/40 px-1 py-0.5 text-center font-mono text-xs"
                  title="Bônus de perícia"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InventoryPanel({
  c,
  onUpdate,
}: {
  c: Character;
  onUpdate: (p: Partial<Character>) => void;
}) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item"
          className="flex-1 rounded border border-white/10 bg-black/40 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, +e.target.value))}
          className="w-16 rounded border border-white/10 bg-black/40 px-2 py-2 text-center text-sm"
        />
        <button
          onClick={() => {
            if (!name.trim()) return;
            onUpdate({ inventory: [...c.inventory, { name, qty }] });
            setName("");
            setQty(1);
          }}
          className="rounded border border-ritual-gold/40 px-3 text-xs uppercase text-ritual-gold hover:bg-ritual-gold/10"
        >
          + Add
        </button>
      </div>
      {c.inventory.length === 0 ? (
        <p className="text-xs text-white/30">Nenhum item vinculado.</p>
      ) : (
        <ul className="space-y-1">
          {c.inventory.map((item, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded border border-white/5 bg-black/20 p-2 pl-3 text-sm"
            >
              <span>
                <span className="font-mono text-white/50">×{item.qty}</span> {item.name}
              </span>
              <button
                onClick={() =>
                  onUpdate({ inventory: c.inventory.filter((_, j) => j !== i) })
                }
                className="text-white/30 hover:text-corruption"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PowersPanel({
  c,
  onUpdate,
}: {
  c: Character;
  onUpdate: (p: Partial<Character>) => void;
}) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do poder"
          className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Efeito, custo, alcance…"
          rows={2}
          className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm"
        />
        <button
          onClick={() => {
            if (!name.trim()) return;
            onUpdate({ powers: [...c.powers, { name, text }] });
            setName("");
            setText("");
          }}
          className="rounded border border-ritual-gold/40 px-3 py-1 text-xs uppercase text-ritual-gold hover:bg-ritual-gold/10"
        >
          + Adicionar Poder
        </button>
      </div>
      {c.powers.length === 0 ? (
        <p className="text-xs text-white/30">Nenhum poder registrado.</p>
      ) : (
        <ul className="space-y-2">
          {c.powers.map((p, i) => (
            <li key={i} className="rounded border border-white/5 bg-black/20 p-3">
              <div className="mb-1 flex items-start justify-between">
                <p className="ritual-title text-sm text-ritual-gold">{p.name}</p>
                <button
                  onClick={() =>
                    onUpdate({ powers: c.powers.filter((_, j) => j !== i) })
                  }
                  className="text-white/30 hover:text-corruption"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-white/60">{p.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ScarsPanel({
  c,
  onUpdate,
}: {
  c: Character;
  onUpdate: (p: Partial<Character>) => void;
}) {
  const [text, setText] = useState("");
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Uma marca que restou…"
          className="flex-1 rounded border border-white/10 bg-black/40 px-3 py-2 text-sm"
        />
        <button
          onClick={() => {
            if (!text.trim()) return;
            onUpdate({ scars: [...c.scars, text] });
            setText("");
          }}
          className="rounded border border-corruption/40 px-3 text-xs uppercase text-corruption hover:bg-corruption/10"
        >
          + Marcar
        </button>
      </div>
      {c.scars.length === 0 ? (
        <p className="text-xs text-white/30">Nenhuma cicatriz narrativa.</p>
      ) : (
        <ul className="space-y-1">
          {c.scars.map((s, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded border-l-2 border-corruption/60 bg-black/20 py-1.5 pl-3 pr-2 text-sm text-white/70"
            >
              <span>{s}</span>
              <button
                onClick={() => onUpdate({ scars: c.scars.filter((_, j) => j !== i) })}
                className="text-white/30 hover:text-corruption"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
