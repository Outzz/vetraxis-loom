import { useState } from "react";
import { rollDice, type DieType, type DiceResult } from "@/lib/dice";

const DICE: DieType[] = [4, 6, 8, 10, 12, 20];

export function DiceRoller({ compact = false }: { compact?: boolean }) {
  const [history, setHistory] = useState<DiceResult[]>([]);
  const [modifier, setModifier] = useState(0);
  const [count, setCount] = useState(1);

  function roll(sides: DieType) {
    const result = rollDice(count, sides, modifier);
    setHistory((h) => [result, ...h].slice(0, 8));
  }

  return (
    <div className={`glass-panel rounded-2xl ${compact ? "p-4" : "p-6"} space-y-4`}>
      <div className="flex items-center justify-between">
        <p className="ritual-eyebrow">Rolador Ritual</p>
        {history.length > 0 && (
          <button
            onClick={() => setHistory([])}
            className="text-[10px] uppercase tracking-widest text-white/40 hover:text-corruption"
          >
            Limpar
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <label className="flex-1">
          <span className="mb-1 block text-[9px] uppercase tracking-widest text-white/40">
            Quantidade
          </span>
          <input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(20, +e.target.value || 1)))}
            className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-foreground focus:border-prismatic/40 focus:outline-none"
          />
        </label>
        <label className="flex-1">
          <span className="mb-1 block text-[9px] uppercase tracking-widest text-white/40">
            Modificador
          </span>
          <input
            type="number"
            value={modifier}
            onChange={(e) => setModifier(+e.target.value || 0)}
            className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-foreground focus:border-prismatic/40 focus:outline-none"
          />
        </label>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {DICE.map((d) => (
          <button
            key={d}
            onClick={() => roll(d)}
            className="group relative aspect-square rounded-lg border border-white/10 bg-white/5 text-sm font-mono text-foreground transition-all hover:border-ritual-gold/60 hover:bg-ritual-gold/10 hover:text-ritual-gold"
          >
            d{d}
          </button>
        ))}
      </div>

      {history.length > 0 && (
        <div className="space-y-1.5 border-t border-white/5 pt-3">
          {history.map((r, i) => (
            <div
              key={i}
              className={`flex items-baseline justify-between rounded-md px-2 py-1.5 font-mono text-xs ${
                r.critical === "success"
                  ? "bg-ritual-gold/10 text-ritual-gold"
                  : r.critical === "fumble"
                    ? "bg-corruption/10 text-corruption"
                    : i === 0
                      ? "bg-prismatic/10 text-foreground"
                      : "text-white/50"
              }`}
            >
              <span>
                {r.formula} → [{r.rolls.join(", ")}]
                {r.modifier ? ` ${r.modifier > 0 ? "+" : ""}${r.modifier}` : ""}
              </span>
              <span className="text-base font-semibold">{r.total}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
