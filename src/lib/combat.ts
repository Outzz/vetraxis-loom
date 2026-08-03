// Motor de combate — Anomalia Cósmica
import type { Creature } from "./bestiary";
import type { CosmicElement } from "./game-data";

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
}

const FORMULA_RE = /^\s*(\d*)\s*d\s*(\d+)\s*([+-]\s*\d+)?\s*$/i;

/** Aceita "2d6+3", "d20", "1d8-1" ou um bônus puro como "+4". */
export function rollFormula(raw: string): FormulaRoll {
  const input = (raw ?? "").trim();
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

  let critical: FormulaRoll["critical"];
  if (count === 1 && sides === 20) {
    if (rolls[0] === 20) critical = "success";
    if (rolls[0] === 1) critical = "fumble";
  }

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

/** Rola o ataque (d20 + bônus) — aceita "+7" ou "1d20+7". */
export function rollAttack(rollNotation: string): FormulaRoll {
  const notation = rollNotation.trim();
  return rollFormula(/d\s*\d/i.test(notation) ? notation : `1d20${notation.startsWith("-") ? notation : `+${notation.replace(/^\+/, "")}`}`);
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
    element: c.element,
    color: elementColor,
    hpMax: c.hp,
    hpCurrent: c.hp,
    ca: c.ca,
    paMax: 3,
    paCurrent: 3,
    initiativeFormula: c.initiative,
    initiative: null,
    sanityDC: c.sanityDC,
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
  pa_current: number;
  pa_max: number;
  dex_score: number;
}

export function modifier(score: number) {
  return Math.floor((score - 10) / 2);
}

export function combatantFromCharacter(
  ch: CharacterLike,
  elementColor?: string,
): Combatant {
  const dex = modifier(ch.dex_score ?? 10);
  return {
    id: uid(),
    kind: "character",
    sourceId: ch.id,
    name: ch.name,
    subtitle: ch.concept ?? "Portador",
    element: ch.element ?? undefined,
    color: elementColor,
    hpMax: ch.hp_max,
    hpCurrent: ch.hp_current,
    ca: 10 + dex,
    paMax: ch.pa_max,
    paCurrent: ch.pa_current,
    initiativeFormula: `1d20${dex >= 0 ? `+${dex}` : dex}`,
    initiative: null,
    attacks: [],
    conditions: [],
    defeated: false,
  };
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
