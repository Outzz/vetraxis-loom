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
  ATTR_SCALE,
  SKILL_SCALE,
  classBonuses,
  corruptionTier,
  derivedStats,
  trackById,

  type AttributeKey,
  type CharacterClass,
  type CosmicElement,
  type Relic,
} from "@/lib/game-data";
import { rollTest, stepDie, helpSteps, FUMBLE_TABLE, rollDie, DT_PADRAO, type TestResult } from "@/lib/dice";
import { pushRoll } from "@/lib/dice-store";
import { prepareCharacterPortrait } from "@/lib/character-image";


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
  portrait_url: string | null;
};

const ATTR_TO_SCORE: Record<AttributeKey, keyof Character> = {
  fis: "str_score",
  men: "int_score",
  emo: "cha_score",
};

export type RollMods = { attrSteps: number; skillSteps: number; extraDice: number; help: number };
const NO_MODS: RollMods = { attrSteps: 0, skillSteps: 0, extraDice: 0, help: 0 };

function describe(label: string, r: TestResult) {
  const kept = r.rolls.length > 3 ? ` (soma 3 maiores)` : "";
  const res = r.passed == null ? "" : r.passed ? " · SUCESSO" : " · FALHA";
  const crit = r.critical === "success" ? " ⭐ CRÍTICO" : r.critical === "fumble" ? ` ☠ FALHA CRÍTICA — ${FUMBLE_TABLE[rollDie(8) - 1]}` : "";
  return `${label}${r.dt != null ? ` vs DT ${r.dt}` : ""}: ${r.formula} = [${r.rolls.join(", ")}]${kept} = ${r.total} · RA ${r.ra} · RB ${r.rb}${res}${crit}`;
}


function CharacterSheet() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [c, setC] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const [preparingPortrait, setPreparingPortrait] = useState(false);
  const [tab, setTab] = useState<
    "stats" | "skills" | "class" | "inventory" | "powers" | "notes"
  >("stats");


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

  function skillDie(key: string) {
    return Number(c?.skills[key] ?? 4) || 4;
  }

  function runTest(label: string, attr: AttributeKey, skillKey: string | null, dt: number | undefined, mods: RollMods = NO_MODS) {
    if (!c) return null;
    const attrDie = c[ATTR_TO_SCORE[attr]] as number;
    const sDie = skillKey ? skillDie(skillKey) : 4;
    const r = rollTest({
      attrDie,
      skillDie: sDie,
      attrSteps: mods.attrSteps,
      skillSteps: mods.skillSteps + mods.help,
      extraDice: Array.from({ length: mods.extraDice }, () => stepDie(sDie, mods.skillSteps + mods.help)),
      dt,
    });
    pushRoll(r, { label, cd: r.dt, passed: r.passed });
    addLog(describe(label, r));
    return r;
  }

  function rollAttr(key: AttributeKey) {
    // Teste sem perícia aplicável: Atributo + d4 (destreinado).
    runTest(`${ATTRIBUTES[key].name} (destreinado)`, key, null, undefined);
  }

  function rollSkill(skillKey: string, cd: number, attr?: AttributeKey, mods?: RollMods) {
    const skill = SKILLS.find((s) => s.key === skillKey)!;
    const a = attr ?? skill.attr;
    runTest(`${ATTRIBUTES[a].name} + ${skill.name}`, a, skillKey, cd, mods);
  }

  function rollSanity() {
    runTest("Sanidade (Emoção + Disciplina)", "emo", "disciplina", DT_PADRAO);
  }

  function rollCorruption(intensity: number) {
    // Adaptação: DT 7 + metade da intensidade (antiga CD 10 + intensidade ÷ 2).
    const dt = DT_PADRAO + Math.ceil(intensity / 2);
    runTest("Corrupção (Físico + Vigor)", "fis", "vigor", dt);
  }

  const derived = useMemo(() => {
    if (!c) return null;
    return derivedStats({
      fis: c.str_score,
      men: c.int_score,
      emo: c.cha_score,
      cls: c.character_class,
    });
  }, [c]);

  const bonuses = classBonuses(c?.character_class ?? null);

  async function recalcMax(silent = false) {
    if (!c || !derived) return;
    const gainHp = Math.max(0, derived.hp - c.hp_max);
    const gainPs = Math.max(0, derived.sanity - c.sanity_max);
    const gainPa = Math.max(0, derived.pa - c.pa_max);
    await update({
      hp_max: derived.hp,
      sanity_max: derived.sanity,
      pa_max: derived.pa,
      hp_current: Math.min(derived.hp, c.hp_current + gainHp),
      sanity_current: Math.min(derived.sanity, c.sanity_current + gainPs),
      pa_current: Math.min(derived.pa, c.pa_current + gainPa),
    });
    if (!silent) toast.success("Recursos recalculados.");
  }

  // Aplica automaticamente os bônus de classe assim que a classe é escolhida/alterada.
  useEffect(() => {
    if (!c || !derived) return;
    if (
      c.hp_max === derived.hp &&
      c.sanity_max === derived.sanity &&
      c.pa_max === derived.pa
    )
      return;
    recalcMax(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c?.character_class, derived?.hp, derived?.sanity, derived?.pa]);


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
        <div className="flex flex-wrap items-start gap-5">
          <div className="group relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-abyss text-3xl text-white/25">
            {c.portrait_url ? (
              <img src={c.portrait_url} alt={`Retrato de ${c.name}`} className="h-full w-full object-cover" />
            ) : (
              "◇"
            )}
            <label className="absolute inset-x-0 bottom-0 cursor-pointer bg-abyss/90 py-2 text-center text-[9px] uppercase tracking-widest text-white/70 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              {preparingPortrait ? "Preparando…" : "Trocar imagem"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={preparingPortrait}
                className="sr-only"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setPreparingPortrait(true);
                  try {
                    await update({ portrait_url: await prepareCharacterPortrait(file) });
                    toast.success("Retrato atualizado.");
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Imagem inválida.");
                  } finally {
                    setPreparingPortrait(false);
                  }
                }}
              />
            </label>
          </div>
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
              {c.character_class && (
                <span className="rounded-full bg-ritual-gold/15 px-2 py-0.5 text-[10px] uppercase tracking-widest text-ritual-gold">
                  {CLASSES[c.character_class].name}
                  {c.track ? ` · ${trackById(c.character_class, c.track)?.name ?? ""}` : ""}
                </span>
              )}
              <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/60">
                Defesa {derived?.defense ?? 10}
              </span>

              <button
                onClick={() => recalcMax()}
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
              <span className="text-[10px] text-white/40">clique para rolar Atributo + d4</span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-3">
              {(Object.entries(ATTRIBUTES) as [AttributeKey, typeof ATTRIBUTES.fis][]).map(
                ([key, meta]) => {
                  const score = c[ATTR_TO_SCORE[key]] as number;
                  return (
                    <div key={key} className="rounded-xl border border-white/10 bg-black/30 p-3 text-center">
                    <button
                      onClick={() => rollAttr(key)}
                      className="group w-full rounded-lg p-1 transition-all hover:bg-ritual-gold/5"
                    >
                      <p className="text-[10px] uppercase tracking-widest text-white/40">
                        {meta.short}
                      </p>
                      <p className="ritual-title text-3xl text-foreground">d{score}</p>
                      <p className="text-[10px] text-ritual-gold">{ATTR_SCALE[score] ?? ""}</p>
                    </button>
                    <div className="mt-1 flex justify-center gap-2">
                      <button aria-label={`Reduzir passo de ${meta.name}`} onClick={() => update({ [ATTR_TO_SCORE[key]]: stepDie(score, -1) } as Partial<Character>)} className="size-6 rounded-full border border-white/10 text-white/50 hover:text-corruption">−</button>
                      <button aria-label={`Aumentar passo de ${meta.name}`} onClick={() => update({ [ATTR_TO_SCORE[key]]: stepDie(score, 1) } as Partial<Character>)} className="size-6 rounded-full border border-white/10 text-white/50 hover:text-ritual-gold">+</button>
                    </div>
                    </div>
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
                  ["class", "Classe & Trilha"],

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
                        Sanidade (Emoção + Disciplina · DT 7)
                      </button>
                      {[1, 3, 5, 8].map((intensity) => (
                        <button
                          key={intensity}
                          onClick={() => rollCorruption(intensity)}
                          className="rounded-md border border-white/10 bg-black/30 px-4 py-2 text-xs text-foreground hover:border-corruption/60 hover:bg-corruption/10"
                        >
                          Corrupção +{intensity} (Físico + Vigor · DT {7 + Math.ceil(intensity / 2)})
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

              {tab === "class" && <ClassPanel c={c} onUpdate={update} />}

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
                    tier.name === t.name ? "opacity-100" : "opacity-40"

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
          {c.character_class && (
            <div className="glass-panel rounded-2xl p-4">
              <p className="ritual-eyebrow mb-2">Bônus de Classe aplicados</p>
              <ul className="space-y-1 text-[11px] text-white/60">
                {bonuses.hp > 0 && <li>• +{bonuses.hp} PV máximos</li>}
                {bonuses.sanity > 0 && <li>• +{bonuses.sanity} PS máximos</li>}
                {bonuses.pa > 0 && <li>• +{bonuses.pa} PA máximos</li>}
                {bonuses.defense > 0 && <li>• +{bonuses.defense} Defesa</li>}
                {bonuses.proficiencies.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
                {bonuses.features.map((f) => (
                  <li key={f.name}>
                    • <span className="text-ritual-gold/80">{f.name}:</span> {f.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="glass-panel rounded-2xl p-4">
            <p className="ritual-eyebrow mb-2">Dificuldades (DT)</p>
            <div className="space-y-2">
              {DIFFICULTIES.map((d) => (
                <div key={d.label} className="flex justify-between text-xs">
                  <span className="text-white/60">{d.label}</span>
                  <span className="font-mono text-ritual-gold">DT {d.cd}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {c.corruption >= CLASS_CHOICE_CORRUPTION && (!c.character_class || !c.track) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-abyss/90 p-6 backdrop-blur-sm">
          <div className="glass-panel my-8 w-full max-w-3xl rounded-2xl p-6">
            <p className="ritual-eyebrow">Assimilação {c.corruption}%</p>
            <h2 className="ritual-title mt-1 text-3xl text-foreground">
              A Anomalia exige uma forma
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/55">
              {c.name} atingiu {CLASS_CHOICE_CORRUPTION}% de Corrupção. Escolha a Classe e a
              Trilha para continuar — os bônus são aplicados automaticamente à ficha.
            </p>
            <div className="mt-6">
              <ClassPanel c={c} onUpdate={update} />
            </div>
          </div>
        </div>
      )}
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

function ClassPanel({
  c,
  onUpdate,
}: {
  c: Character;
  onUpdate: (p: Partial<Character>) => void;
}) {
  const locked = c.corruption < CLASS_CHOICE_CORRUPTION;
  const cls = c.character_class ? CLASSES[c.character_class] : null;
  const track = c.character_class && c.track ? trackById(c.character_class, c.track) : null;

  if (locked) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/30 p-6 text-center">
        <p className="ritual-title text-xl text-foreground">Assimilação insuficiente</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
          Classe e Trilha são escolhidas somente ao atingir {CLASS_CHOICE_CORRUPTION}% de
          Corrupção. O Elemento Cósmico não se escolhe — ele se manifesta quando algo
          na mesa o revelar.
        </p>
        <p className="mt-3 font-mono text-xs text-corruption">
          Corrupção atual: {c.corruption}%
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="ritual-eyebrow mb-3">Classe</p>
        <div className="grid gap-2 md:grid-cols-2">
          {(Object.keys(CLASSES) as CharacterClass[]).map((key) => {
            const meta = CLASSES[key];
            const active = c.character_class === key;
            return (
              <button
                key={key}
                onClick={() =>
                  onUpdate({
                    character_class: key,
                    track: active ? c.track : null,
                  })
                }
                className={`rounded-xl border p-3 text-left transition-all ${
                  active
                    ? "border-ritual-gold bg-ritual-gold/5"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <p className="ritual-title text-lg text-foreground">{meta.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-ritual-gold/70">
                  {meta.keyAttrs.map((a) => ATTRIBUTES[a].name).join(" · ")}
                </p>
                <p className="mt-2 text-[11px] text-white/60">{meta.tagline}</p>
              </button>
            );
          })}
        </div>
      </div>

      {cls && (
        <div>
          <p className="ritual-eyebrow mb-2">Recursos de Classe (aplicados)</p>
          <ul className="space-y-1 text-xs text-white/60">
            {cls.resources.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-ritual-gold/80">
            Auto: PV {classBonuses(c.character_class).hp >= 0 ? "+" : ""}
            {classBonuses(c.character_class).hp} · PS +
            {classBonuses(c.character_class).sanity} · PA +
            {classBonuses(c.character_class).pa} · Perícias recomendadas:{" "}
            {classBonuses(c.character_class)
              .recommendedSkills.map((k) => SKILLS.find((s) => s.key === k)?.name ?? k)
              .join(", ")}
          </p>

          <p className="mt-3 text-[11px] text-white/50">
            <span className="uppercase tracking-widest text-ritual-gold/80">
              Despertar (Nv 10) — {cls.awakening.name}:
            </span>{" "}
            {cls.awakening.text}
          </p>
        </div>
      )}

      {cls && (
        <div>
          <p className="ritual-eyebrow mb-3">Trilha</p>
          <div className="grid gap-2 md:grid-cols-2">
            {cls.tracks.map((t) => (
              <button
                key={t.key}
                onClick={() => onUpdate({ track: t.key })}
                className={`rounded-xl border p-3 text-left transition-all ${
                  c.track === t.key
                    ? "border-prismatic bg-prismatic/5"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <p className="text-sm text-foreground">{t.name}</p>
                <p className="mt-1 text-[11px] text-white/50">{t.tagline}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {track && (
        <div>
          <p className="ritual-eyebrow mb-3">
            Habilidades — {track.name} · Assimilação {c.corruption}%
          </p>
          <div className="space-y-2">
            {track.abilities.map((a) => {
              const unlocked = c.corruption >= a.at;
              return (
                <div
                  key={a.name}
                  className={`rounded-lg border-l-2 bg-black/20 p-3 ${
                    unlocked ? "border-ritual-gold" : "border-white/10 opacity-40"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm text-foreground">{a.name}</p>
                    <span className="font-mono text-[10px] uppercase text-ritual-gold/70">
                      {a.at}%{unlocked ? "" : " · bloqueada"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/60">{a.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
  onRoll: (key: string, cd: number, attr?: AttributeKey, mods?: RollMods) => void;
}) {
  const [cd, setCd] = useState(7);
  const [attrOverride, setAttrOverride] = useState<AttributeKey | "">("");
  const [mods, setMods] = useState<RollMods>({ attrSteps: 0, skillSteps: 0, extraDice: 0, help: 0 });
  const set = (k: keyof RollMods, v: number) => setMods((m) => ({ ...m, [k]: v }));
  const numBtn = (k: keyof RollMods, min: number, max: number) => (
    <span className="inline-flex items-center gap-1">
      <button onClick={() => set(k, Math.max(min, mods[k] - 1))} className="size-5 rounded border border-white/10 text-white/60">−</button>
      <span className="w-6 text-center font-mono text-xs text-foreground">{mods[k] > 0 && k !== "extraDice" ? "+" : ""}{mods[k]}</span>
      <button onClick={() => set(k, Math.min(max, mods[k] + 1))} className="size-5 rounded border border-white/10 text-white/60">+</button>
    </span>
  );
  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lg border border-white/5 bg-black/20 p-3 text-[11px] text-white/60">
        <div className="flex flex-wrap items-center gap-2">
          <span className="uppercase tracking-widest text-white/40">DT:</span>
          {DIFFICULTIES.map((d) => (
            <button key={d.cd} onClick={() => setCd(d.cd)} title={d.label}
              className={`rounded px-2 py-1 font-mono text-[10px] ${cd === d.cd ? "bg-ritual-gold text-abyss" : "border border-white/10 text-white/60 hover:border-white/30"}`}>
              {d.cd}
            </button>
          ))}
          <input type="number" min={1} value={cd} onChange={(e) => setCd(Math.max(1, +e.target.value || 7))}
            className="w-14 rounded border border-white/10 bg-black/40 px-1 py-0.5 text-center font-mono text-xs" aria-label="DT personalizada" />
          <span className="ml-3 uppercase tracking-widest text-white/40">Atributo:</span>
          <select value={attrOverride} onChange={(e) => setAttrOverride(e.target.value as AttributeKey | "")}
            className="rounded border border-white/10 bg-black/40 px-1 py-0.5 text-xs">
            <option value="">Base da perícia</option>
            {(Object.keys(ATTRIBUTES) as AttributeKey[]).map((k) => <option key={k} value={k}>{ATTRIBUTES[k].name}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span>Passos no atributo {numBtn("attrSteps", -4, 4)}</span>
          <span>Passos na perícia {numBtn("skillSteps", -4, 4)}</span>
          <span>Dados adicionais {numBtn("extraDice", 0, 2)}</span>
          <span className="inline-flex items-center gap-1">Ajuda de aliado:
            <select value={mods.help} onChange={(e) => set("help", +e.target.value)} className="rounded border border-white/10 bg-black/40 px-1 py-0.5 text-xs">
              <option value={0}>nenhuma</option>
              <option value={helpSteps(6)}>perícia d6/d8 (+1 passo)</option>
              <option value={helpSteps(10)}>perícia d10/d12 (+2 passos)</option>
            </select>
          </span>
          <button onClick={() => setMods({ attrSteps: 0, skillSteps: 0, extraDice: 0, help: 0 })} className="text-[10px] uppercase tracking-widest text-white/40 hover:text-ritual-gold">limpar</button>
        </div>
        <p className="text-[10px] text-white/35">Até 4 dados rolados, somam-se no máximo os 3 maiores. Crítico: dados repetidos ≥ 6. Falha crítica: todos os dados em 1.</p>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {SKILLS.map((s) => {
          const die = Number(c.skills[s.key] ?? 4) || 4;
          const attr = attrOverride || s.attr;
          const attrDie = c[ATTR_TO_SCORE[attr]] as number;
          return (
            <div key={s.key} className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 p-2 pl-3">
              <button onClick={() => onRoll(s.key, cd, attr, mods)} className="flex-1 text-left hover:text-ritual-gold" title={s.use}>
                <span className="text-sm text-foreground">{s.name}</span>
                <span className="ml-2 text-[10px] uppercase text-white/40">{ATTRIBUTES[attr].short}</span>
                <span className="block text-[10px] text-white/35">{SKILL_SCALE[die] ?? ""}</span>
              </button>
              <div className="flex items-center gap-1.5">
                <button aria-label={`Reduzir ${s.name}`} onClick={() => onUpdate({ skills: { ...c.skills, [s.key]: stepDie(die, -1) } })} className="size-5 rounded border border-white/10 text-white/50">−</button>
                <span className="w-8 text-center font-mono text-xs text-ritual-gold">d{die}</span>
                <button aria-label={`Aumentar ${s.name}`} onClick={() => onUpdate({ skills: { ...c.skills, [s.key]: stepDie(die, 1) } })} className="size-5 rounded border border-white/10 text-white/50">+</button>
                <button onClick={() => onRoll(s.key, cd, attr, mods)}
                  className="rounded border border-ritual-gold/40 px-2 py-1 text-[10px] uppercase tracking-widest text-ritual-gold hover:bg-ritual-gold/10"
                  title={`d${attrDie} + d${die} vs DT ${cd}`}>
                  Testar
                </button>
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
