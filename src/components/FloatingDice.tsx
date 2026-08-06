import { useEffect, useRef, useState } from "react";
import { useRolls, clearRolls, rollBreakdown } from "@/lib/dice-store";

/** Ícone de dado (d20 estilizado) com o resultado no centro */
function DieIcon({ value, tone }: { value: number; tone: string }) {
  return (
    <span className="relative inline-flex size-11 shrink-0 items-center justify-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden="true">
        <polygon
          points="50,4 94,29 94,71 50,96 6,71 6,29"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="4"
        />
        <polygon
          points="50,22 76,37 76,63 50,78 24,63 24,37"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.35"
        />
      </svg>
      <span className="relative font-mono text-sm font-semibold" style={{ color: tone }}>
        {value}
      </span>
    </span>
  );
}

/**
 * Widget de resultado das rolagens. Aparece apenas quando alguém rola
 * um dado (ficha do Portador, combate, etc.) — não rola dados por conta própria.
 */
export function FloatingDice() {
  const rolls = useRolls();
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState(false);
  const lastId = useRef<number | null>(null);

  const last = rolls[0];

  useEffect(() => {
    if (!last || last.id === lastId.current) return;
    lastId.current = last.id;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 600);
    return () => clearTimeout(t);
  }, [last]);

  if (!last) return null;

  const tone =
    last.critical === "success"
      ? "#fbbf24"
      : last.critical === "fumble"
        ? "#ef4444"
        : "#a78bfa";

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && rolls.length > 0 && (
        <div
          className="glass-panel pointer-events-auto w-[19rem] space-y-3 rounded-2xl p-4"
          style={{ animation: "fade-up 0.3s var(--ease-out-expo) both" }}
        >
          <div className="flex items-center justify-between">
            <p className="ritual-eyebrow">Últimas rolagens</p>
            <button
              onClick={clearRolls}
              className="text-[10px] uppercase tracking-widest text-white/40 hover:text-corruption"
            >
              Limpar
            </button>
          </div>
          <div className="max-h-56 space-y-1.5 overflow-y-auto">
            {rolls.map((r) => (
              <div
                key={r.id}
                className={`rounded-md px-2 py-1.5 font-mono text-[11px] ${
                  r.critical === "success"
                    ? "bg-ritual-gold/10 text-ritual-gold"
                    : r.critical === "fumble"
                      ? "bg-corruption/10 text-corruption"
                      : "text-white/60"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate">{r.label ?? r.formula}</span>
                  <span className="text-sm font-semibold">{r.total}</span>
                </div>
                <div className="text-[10px] text-white/40">
                  {r.formula} → {rollBreakdown(r)}
                  {r.cd != null && ` · CD ${r.cd} · ${r.passed ? "SUCESSO" : "FALHA"}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Resultado da rolagem"
        className="glass-panel pointer-events-auto flex items-center gap-3 rounded-2xl px-3 py-2 text-left transition-all hover:border-ritual-gold/40"
        style={flash ? { animation: "pulse-core 0.6s var(--ease-out-expo)" } : undefined}
      >
        <DieIcon value={last.total} tone={tone} />
        <span className="min-w-0">
          <span className="block text-[9px] uppercase tracking-widest text-white/40">
            {last.label ?? last.formula}
          </span>
          <span className="block font-mono text-[11px] text-white/70">
            {`${last.formula} → ${rollBreakdown(last)}${
              last.cd != null ? ` (CD ${last.cd} · ${last.passed ? "sucesso" : "falha"})` : ""
            }`}
          </span>
        </span>
      </button>
    </div>
  );
}
