// Dice roller for Anomalia Cósmica
export type DieType = 4 | 6 | 8 | 10 | 12 | 20;

export interface DiceResult {
  formula: string;
  rolls: number[];
  modifier: number;
  total: number;
  critical?: "success" | "fumble";
}

export function rollDie(sides: DieType): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollDice(count: number, sides: DieType, modifier = 0): DiceResult {
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) rolls.push(rollDie(sides));
  const total = rolls.reduce((a, b) => a + b, 0) + modifier;
  const formula = `${count}d${sides}${modifier ? (modifier > 0 ? "+" + modifier : modifier) : ""}`;
  let critical: DiceResult["critical"];
  if (count === 1 && sides === 20) {
    if (rolls[0] === 20) critical = "success";
    if (rolls[0] === 1) critical = "fumble";
  }
  return { formula, rolls, modifier, total, critical };
}

export function rollTest(attrMod: number, skillBonus: number, cd: number): DiceResult & {
  cd: number;
  passed: boolean;
} {
  const r = rollDice(1, 20, attrMod + skillBonus);
  return { ...r, cd, passed: r.total >= cd };
}
