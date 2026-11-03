// Mecânica de dados — Atributo + Perícia vs DT
// Referência: Ordem Paranormal II (Playtest Beta 1.0), adotada pelo Anomalia Cósmica.

export type DieType = 4 | 6 | 8 | 10 | 12 | 20;

/** Escala de passos. d20 só é alcançável por efeitos excepcionais (paranormais/anômalos). */
export const DIE_STEPS: DieType[] = [4, 6, 8, 10, 12];
export const DT_PADRAO = 7;
export const DT_ALCANCE_LONGO = 10;
export const MAX_DICE_ROLLED = 4;
export const MAX_DICE_SUMMED = 3;

export interface DiceResult {
  formula: string;
  rolls: number[];
  /** Dados efetivamente somados (até 3 maiores). */
  kept?: number[];
  sides?: number[];
  modifier: number;
  total: number;
  /** Rolagem Alta / Rolagem Baixa (resultado individual). */
  ra?: number;
  rb?: number;
  critical?: "success" | "fumble";
}

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/** Aplica N passos (positivos ou negativos). Limites d4–d12, salvo `allowD20`. */
export function stepDie(die: number, steps: number, allowD20 = false): DieType {
  const scale: DieType[] = allowD20 ? [...DIE_STEPS, 20] : DIE_STEPS;
  let idx = scale.indexOf(die as DieType);
  if (idx < 0) idx = die >= 20 ? scale.length - 1 : 0;
  idx = Math.max(0, Math.min(scale.length - 1, idx + steps));
  return scale[idx];
}

/** Índice de passo: d4=0, d6=1, d8=2, d10=3, d12=4. */
export function dieStep(die: number): number {
  const i = DIE_STEPS.indexOf(die as DieType);
  return i < 0 ? (die >= 12 ? 4 : 0) : i;
}

export function dieLabel(die: number) {
  return `d${die}`;
}

/** Ajuda: d4 não ajuda; d6/d8 = +1 passo; d10/d12 = +2 passos. */
export function helpSteps(helperSkillDie: number): number {
  if (helperSkillDie >= 10) return 2;
  if (helperSkillDie >= 6) return 1;
  return 0;
}

/** Sucesso crítico: 2+ dados iguais com valor ≥ 6. Falha crítica: todos os dados = 1. */
export function detectCritical(rolls: number[]): DiceResult["critical"] {
  if (rolls.length === 0) return undefined;
  if (rolls.every((r) => r === 1)) return "fumble";
  const counts = new Map<number, number>();
  for (const r of rolls) counts.set(r, (counts.get(r) ?? 0) + 1);
  for (const [v, n] of counts) if (n >= 2 && v >= 6) return "success";
  return undefined;
}

/**
 * Rola um conjunto de dados (pool). Até 4 dados são rolados; somam-se no máximo os 3 maiores.
 */
export function rollPool(sides: number[], modifier = 0, label?: string): DiceResult {
  const dice = sides.slice(0, MAX_DICE_ROLLED);
  const rolls = dice.map((s) => rollDie(s));
  const kept = [...rolls].sort((a, b) => b - a).slice(0, MAX_DICE_SUMMED);
  const sum = kept.reduce((a, b) => a + b, 0);
  const formula =
    (label ? "" : "") +
    dice.map((s) => `d${s}`).join(" + ") +
    (modifier ? (modifier > 0 ? ` +${modifier}` : ` ${modifier}`) : "");
  return {
    formula,
    rolls,
    kept,
    sides: dice,
    modifier,
    total: sum + modifier,
    ra: rolls.length ? Math.max(...rolls) : 0,
    rb: rolls.length ? Math.min(...rolls) : 0,
    critical: detectCritical(rolls),
  };
}

export interface TestOptions {
  attrDie: number;
  skillDie: number;
  /** Passos aplicados ao dado de atributo (ajuda, efeitos). */
  attrSteps?: number;
  /** Passos aplicados ao dado de perícia (ajuda, efeitos). */
  skillSteps?: number;
  /** Dados adicionais concedidos por habilidades/itens. */
  extraDice?: number[];
  allowD20?: boolean;
  dt?: number;
}

export type TestResult = DiceResult & { dt?: number; passed?: boolean };

/** Teste: Atributo + Perícia (≥ DT = sucesso; crítico passa; falha crítica falha). */
export function rollTest(opts: TestOptions): TestResult {
  const a = stepDie(opts.attrDie, opts.attrSteps ?? 0, opts.allowD20);
  const s = stepDie(opts.skillDie, opts.skillSteps ?? 0, opts.allowD20);
  const r = rollPool([a, s, ...(opts.extraDice ?? [])]);
  if (opts.dt == null) return r;
  const passed =
    r.critical === "success" ? true : r.critical === "fumble" ? false : r.total >= opts.dt;
  return { ...r, dt: opts.dt, passed };
}

/** Teste oposto: vence o maior resultado. Empate = interpretação: favorece quem defende/reage. */
export function opposed(a: DiceResult, b: DiceResult): "a" | "b" | "tie" {
  if (a.total === b.total) return "tie";
  return a.total > b.total ? "a" : "b";
}

/** Dano: RA do ataque + modificador da arma. Em crítico, soma as duas maiores rolagens. */
export function attackDamage(attack: DiceResult, weaponMod: number): number {
  const sorted = [...attack.rolls].sort((x, y) => y - x);
  const base = attack.critical === "success" ? (sorted[0] ?? 0) + (sorted[1] ?? 0) : (sorted[0] ?? 0);
  return Math.max(0, base + weaponMod);
}

/** Tabela 1d8 de falha crítica (consequências — o Mestre pode substituir). */
export const FUMBLE_TABLE = [
  "Perde temporariamente a capacidade usada (−1 passo no atributo até o fim da cena).",
  "Ferimento: perde 1d4 PV.",
  "Abalo: perde 1d4 PS.",
  "Exaustão: perde 1 PA.",
  "Larga ou danifica o equipamento usado.",
  "Fica exposto: o próximo teste contra você recebe +1 passo.",
  "Chama atenção indesejada (barulho, alarme, anomalia desperta).",
  "Eco Anômalo: +1% de Corrupção.",
] as const;

// ---- Notação NdS±M (usada apenas para dano/efeitos, não para testes) ----
export function rollDice(count: number, sides: number, modifier = 0): DiceResult {
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) rolls.push(rollDie(sides));
  const total = rolls.reduce((a, b) => a + b, 0) + modifier;
  const formula = `${count}d${sides}${modifier ? (modifier > 0 ? "+" + modifier : modifier) : ""}`;
  return { formula, rolls, modifier, total };
}
