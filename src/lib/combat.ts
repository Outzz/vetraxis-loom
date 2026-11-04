// Motor de combate — Anomalia Cósmica
import type { Creature } from "./bestiary";
import { bonusToDice, caToDefense, cdToDt, type CosmicElement } from "./game-data";
import { rollPool } from "./dice";

export type CombatantKind = "creature" | "character";

export interface CombatAttack {
  name: string;
  roll: string;
  damage: string;
  note?: string;
}

export interface Combatant {
  id: string;
  kind: CombatantKind;
  sourceId: string;
  name: string;
  subtitle?: string;
  portrait?: string | null;
  element?: CosmicElement;
  color?: string;
  hpMax: number;
  hpCurrent: number;
  sanityMax?: number;
  sanityCurrent?: number;
  ca: number;
  paMax: number;
  paCurrent: number;
  initiativeFormula: string;
  initiative: number | null;
  sanityDC?: number;
  corruption?: number;
  attacks: CombatAttack[];
  conditions: string[];
  defeated: boolean;
}

export interface CombatLogEntry {
  id: string;
  at: number;
  actor: string;
  text: string;
  detail?: string;
  tone: "roll" | "damage" | "heal" | "system" | "critical" | "fumble";
}

export interface EncounterState {
  round: number;
  turnIndex: number;
  started: boolean;
  combatants: Combatant[];
  log: CombatLogEntry[];
}

export const EMPTY_ENCOUNTER: EncounterState = {
  round: 1,
  turnIndex: 0,
  started: false,
  combatants: [],
  log: [],
};

export const STORAGE_KEY = "anomalia:encounter:v1";

/* ---------------- dado ---------------- */

export interface FormulaRoll {
  formula: string;
  rolls: number[];
  sides: number;
  count: number;
  modifier: number;
  total: number;
  critical?: "success" | "fumble";
  ra?: number;
}

const FORMULA_RE = /^\s*(\d*)\s*d\s*(\d+)\s*([+-]\s*\d+)?\s*$/i;

/** Aceita "2d6+3", "d20", "1d8-1" ou um bônus puro como "+4". */
const POOL_RE = /^\s*d\d+(\s*\+\s*d\d+)+\s*$/i;

/** Converte "1d20+N" / "+N" antigos em dados de teste (Atributo + Perícia). */
export function legacyToPool(raw: string): string {
  const t = (raw ?? "").trim();
  if (POOL_RE.test(t)) return t;
  const m = /^(?:1?d20)?\s*([+-]?\s*\d+)?$/i.exec(t);
  const bonus = m && m[1] ? parseInt(m[1].replace(/\s+/g, ""), 10) : 0;
  const [a, b] = bonusToDice(bonus);
  return `d${a}+d${b}`;
}

export function rollFormula(raw: string): FormulaRoll {
  const input = (raw ?? "").trim();
  if (POOL_RE.test(input)) {
    const sides = input.split("+").map((x) => parseInt(x.trim().slice(1), 10));
    const r = rollPool(sides);
    return { formula: r.formula, rolls: r.rolls, sides: 0, count: sides.length, modifier: 0, total: r.total, critical: r.critical, ra: r.ra };
  }
  const match = FORMULA_RE.exec(input);

  if (!match) {
    const flat = Number(input.replace(/\s+/g, "")) || 0;
    return {
      formula: input || "0",
      rolls: [],
      sides: 0,
      count: 0,
      modifier: flat,
      total: flat,
    };
  }

  const count = Math.min(Math.max(parseInt(match[1] || "1", 10), 1), 50);
  const sides = Math.min(Math.max(parseInt(match[2], 10), 2), 1000);
  const modifier = match[3] ? parseInt(match[3].replace(/\s+/g, ""), 10) : 0;

  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  const total = rolls.reduce((a, b) => a + b, 0) + modifier;

  // Fórmulas NdS±M servem apenas para dano/efeitos — sem críticos.
  const critical: FormulaRoll["critical"] = undefined;

  return {
    formula: `${count}d${sides}${modifier ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`,
    rolls,
    sides,
    count,
    modifier,
    total,
    critical,
  };
}

/** Ataque de criatura: dados de Atributo + Perícia derivados do bônus. Retorna null para efeitos de resistência ("DT …"). */
export function rollAttack(rollNotation: string): FormulaRoll | null {
  const n = (rollNotation ?? "").trim();
  if (/^(DT|CD)\b/i.test(n)) return null;
  return rollFormula(legacyToPool(n));
}

/* ---------------- combatentes ---------------- */

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function combatantFromCreature(c: Creature, elementColor?: string): Combatant {
  return {
    id: uid(),
    kind: "creature",
    sourceId: c.id,
    name: c.name,
    subtitle: c.epithet,
    portrait: c.image ?? null,
    element: c.element,
    color: elementColor,
    hpMax: c.hp,
    hpCurrent: c.hp,
    ca: caToDefense(c.ca),
    paMax: 3,
    paCurrent: 3,
    initiativeFormula: legacyToPool(c.initiative),
    initiative: null,
    sanityDC: cdToDt(c.sanityDC),
    corruption: c.corruption,
    attacks: c.attacks,
    conditions: [],
    defeated: false,
  };
}

export interface CharacterLike {
  id: string;
  name: string;
  concept?: string | null;
  element?: CosmicElement | null;
  hp_current: number;
  hp_max: number;
  sanity_current?: number;
  sanity_max?: number;
  pa_current: number;
  pa_max: number;
  corruption?: number;
  dex_score: number;
  str_score?: number;
  skills?: Record<string, number> | null;
  portrait_url?: string | null;
}



export function combatantFromCharacter(
  ch: CharacterLike,
  elementColor?: string,
): Combatant {
  const fis = ch.str_score ?? 6;
  const acro = Number(ch.skills?.acrobacia ?? 4) || 4;
  return {
    id: uid(),
    kind: "character",
    sourceId: ch.id,
    name: ch.name,
    subtitle: ch.concept ?? "Portador",
    portrait: ch.portrait_url ?? null,
    element: ch.element ?? undefined,
    color: elementColor,
    hpMax: ch.hp_max,
    hpCurrent: ch.hp_current,
    sanityMax: ch.sanity_max ?? undefined,
    sanityCurrent: ch.sanity_current ?? undefined,
    ca: 7,
    paMax: ch.pa_max,
    paCurrent: ch.pa_current,
    initiativeFormula: `d${fis}+d${acro}`,
    initiative: null,
    corruption: ch.corruption ?? 0,
    attacks: [],
    conditions: [],
    defeated: false,
  };
}

/** Chave de sincronização — muda quando algum recurso persistível muda. */
export function resourceKey(c: Combatant) {
  return `${c.hpCurrent}|${c.sanityCurrent ?? "-"}|${c.paCurrent}|${c.corruption ?? "-"}`;
}


/* ---------------- fila de envio (Bestiário → Combate) ---------------- */

const QUEUE_KEY = "anomalia:encounter:queue";

export function queueCreature(creatureId: string) {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(QUEUE_KEY);
  const list: string[] = raw ? JSON.parse(raw) : [];
  list.push(creatureId);
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(list));
}

export function drainQueue(): string[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(QUEUE_KEY);
  window.localStorage.removeItem(QUEUE_KEY);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

/* ---------------- persistência ---------------- */

export function loadEncounter(): EncounterState {
  if (typeof window === "undefined") return EMPTY_ENCOUNTER;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_ENCOUNTER;
    return { ...EMPTY_ENCOUNTER, ...(JSON.parse(raw) as EncounterState) };
  } catch {
    return EMPTY_ENCOUNTER;
  }
}

export function saveEncounter(state: EncounterState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* ---------------- ordem de iniciativa ---------------- */

export function sortByInitiative(list: Combatant[]) {
  return [...list].sort((a, b) => (b.initiative ?? -99) - (a.initiative ?? -99));
}

export function logEntry(
  actor: string,
  text: string,
  tone: CombatLogEntry["tone"],
  detail?: string,
): CombatLogEntry {
  return { id: uid(), at: Date.now(), actor, text, detail, tone };
}
