import { useSyncExternalStore } from "react";
import type { DiceResult } from "@/lib/dice";

export type RollEntry = DiceResult & {
  id: number;
  label?: string;
  cd?: number;
  passed?: boolean;
  at: number;
};

let entries: RollEntry[] = [];
let seq = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function pushRoll(
  result: DiceResult,
  extra: { label?: string; cd?: number; passed?: boolean } = {},
): RollEntry {
  const entry: RollEntry = { ...result, ...extra, id: ++seq, at: Date.now() };
  entries = [entry, ...entries].slice(0, 20);
  emit();
  return entry;
}

export function clearRolls() {
  entries = [];
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const empty: RollEntry[] = [];

export function useRolls(): RollEntry[] {
  return useSyncExternalStore(
    subscribe,
    () => entries,
    () => empty,
  );
}

/** "1d20 [14] +3 = 17" */
export function rollBreakdown(r: RollEntry): string {
  const dice = `[${r.rolls.join(" + ")}]`;
  const mod = r.modifier ? ` ${r.modifier > 0 ? "+" : "−"} ${Math.abs(r.modifier)}` : "";
  return `${dice}${mod} = ${r.total}`;
}
