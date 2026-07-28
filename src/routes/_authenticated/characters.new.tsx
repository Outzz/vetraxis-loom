import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  ATTRIBUTES,
  ELEMENTS,
  RELICS,
  attrModifier,
  maxHP,
  maxPA,
  maxSanity,
  type AttributeKey,
  type CosmicElement,
  type Relic,
} from "@/lib/game-data";

const searchSchema = z.object({
  campaign: z.string().uuid().optional(),
});

export const Route = createFileRoute("/_authenticated/characters/new")({
  head: () => ({
    meta: [
      { title: "Novo Portador — Anomalia Cósmica" },
      {
        name: "description",
        content: "Rito de criação de um novo Portador para o universo de Vetraxis.",
      },
    ],
  }),
  validateSearch: searchSchema,
  component: NewCharacter,
});

// Point-buy: 27 pontos, começa em 8, custos crescentes
const COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};
const BASE_POOL = 27;

function NewCharacter() {
  const navigate = useNavigate();
  const { campaign } = Route.useSearch();

  const [name, setName] = useState("");
  const [concept, setConcept] = useState("");
  const [origin, setOrigin] = useState("");
  const [element, setElement] = useState<CosmicElement | "">("");
  const [relic, setRelic] = useState<Relic | "">("");
  const [attrs, setAttrs] = useState<Record<AttributeKey, number>>({
    str: 10,
    dex: 10,
    int: 10,
    res: 10,
    cha: 10,
    per: 10,
  });
  const [saving, setSaving] = useState(false);

  const spent = useMemo(
    () =>
      (Object.values(attrs) as number[]).reduce((sum, v) => sum + (COSTS[v] ?? 999), 0),
    [attrs],
  );
  const remaining = BASE_POOL - spent;

  const derived = useMemo(
    () => ({
      hp: maxHP(attrs.res, 1),
      sanity: maxSanity(attrs.int, attrs.res, 1),
      pa: maxPA(1),
    }),
    [attrs],
  );

  function adjust(key: AttributeKey, delta: number) {
    setAttrs((prev) => {
      const next = prev[key] + delta;
      if (next < 8 || next > 15) return prev;
      const projected = { ...prev, [key]: next };
      const totalCost = (Object.values(projected) as number[]).reduce(
        (s, v) => s + (COSTS[v] ?? 999),
        0,
      );
      if (totalCost > BASE_POOL) return prev;
      return projected;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("O Portador precisa de um nome.");
      return;
    }
    if (!element) {
      toast.error("Escolha um elemento cósmico.");
      return;
    }
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setSaving(false);
      return;
    }
    const { data, error } = await supabase
      .from("characters")
      .insert({
        owner_id: u.user.id,
        campaign_id: campaign ?? null,
        name,
        concept,
        origin,
        element,
        relic: relic || null,
        level: 1,
        str_score: attrs.str,
        dex_score: attrs.dex,
        int_score: attrs.int,
        res_score: attrs.res,
        cha_score: attrs.cha,
        per_score: attrs.per,
        hp_current: derived.hp,
        hp_max: derived.hp,
        sanity_current: derived.sanity,
        sanity_max: derived.sanity,
        pa_current: derived.pa,
        pa_max: derived.pa,
      })
      .select("id")
      .single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Portador manifestado.");
    navigate({ to: "/characters/$id", params: { id: data.id } });
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <Link
        to="/characters"
        className="text-[10px] uppercase tracking-widest text-white/40 hover:text-ritual-gold"
      >
        ← Portadores
      </Link>

      <header
        className="mt-4 space-y-3"
        style={{ animation: "fade-up 0.6s var(--ease-out-expo) both" }}
      >
        <p className="ritual-eyebrow">Rito de Manifestação</p>
        <h1 className="ritual-title text-5xl text-foreground">Novo Portador</h1>
      </header>

      <form onSubmit={submit} className="mt-10 space-y-8">
        <section className="glass-panel space-y-4 rounded-2xl p-6">
          <p className="ritual-eyebrow">Identidade</p>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Nome" value={name} onChange={setName} required />
            <FormField label="Origem" value={origin} onChange={setOrigin} placeholder="Cidade cósmica de Aetheris" />
          </div>
          <FormField label="Conceito" value={concept} onChange={setConcept} placeholder="Investigador atormentado por visões" />
        </section>

        <section className="glass-panel space-y-4 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <p className="ritual-eyebrow">Atributos</p>
            <span
              className={`font-mono text-xs ${
                remaining === 0
                  ? "text-ritual-gold"
                  : remaining < 0
                    ? "text-corruption"
                    : "text-white/60"
              }`}
            >
              Pontos restantes: {remaining}
            </span>
          </div>
          <p className="text-xs text-white/40">
            Compra por pontos (27). Cada atributo começa em 10, pode ir de 8 a 15.
            Custos: 8=0 · 9=1 · 10=2 · 11=3 · 12=4 · 13=5 · 14=7 · 15=9.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {(Object.entries(ATTRIBUTES) as [AttributeKey, typeof ATTRIBUTES.str][]).map(
              ([key, meta]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 p-3"
                >
                  <div>
                    <p className="text-sm text-foreground">
                      {meta.name}{" "}
                      <span className="font-mono text-[10px] text-white/40">
                        ({meta.short})
                      </span>
                    </p>
                    <p className="text-[10px] text-white/40">{meta.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjust(key, -1)}
                      className="size-7 rounded-full border border-white/10 text-white/60 hover:border-corruption hover:text-corruption"
                    >
                      −
                    </button>
                    <div className="min-w-[3ch] text-center font-mono">
                      <span className="text-lg text-foreground">{attrs[key]}</span>
                      <span className="ml-1 text-[10px] text-white/40">
                        ({attrModifier(attrs[key]) >= 0 ? "+" : ""}
                        {attrModifier(attrs[key])})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => adjust(key, 1)}
                      className="size-7 rounded-full border border-white/10 text-white/60 hover:border-ritual-gold hover:text-ritual-gold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 border-t border-white/5 pt-4 text-center font-mono text-xs">
            <div>
              <p className="text-white/40">PV máx</p>
              <p className="text-lg text-foreground">{derived.hp}</p>
            </div>
            <div>
              <p className="text-white/40">Sanidade máx</p>
              <p className="text-lg text-foreground">{derived.sanity}</p>
            </div>
            <div>
              <p className="text-white/40">PA máx</p>
              <p className="text-lg text-foreground">{derived.pa}</p>
            </div>
          </div>
        </section>

        <section className="glass-panel space-y-4 rounded-2xl p-6">
          <p className="ritual-eyebrow">Elemento Cósmico</p>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {(Object.entries(ELEMENTS) as [CosmicElement, typeof ELEMENTS.prisma][]).map(
              ([key, meta]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setElement(key)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    element === key
                      ? "border-ritual-gold bg-ritual-gold/5"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <p
                    className="ritual-title text-lg"
                    style={{ color: meta.color }}
                  >
                    {meta.name}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-white/40">
                    {meta.epithet}
                  </p>
                  <p className="mt-2 text-[11px] text-white/60">{meta.passive}</p>
                </button>
              ),
            )}
          </div>
        </section>

        <section className="glass-panel space-y-4 rounded-2xl p-6">
          <p className="ritual-eyebrow">Relíquia Sintonizada (opcional)</p>
          <div className="grid gap-2 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setRelic("")}
              className={`rounded-xl border p-3 text-left text-sm ${
                !relic
                  ? "border-white/40 bg-white/5 text-foreground"
                  : "border-white/10 text-white/50 hover:border-white/30"
              }`}
            >
              Nenhuma — Portador ainda não sintonizado
            </button>
            {(Object.entries(RELICS) as [Relic, typeof RELICS.prisma_harmonia][]).map(
              ([key, meta]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setRelic(key)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    relic === key
                      ? "border-ritual-gold bg-ritual-gold/5"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <p className="text-sm text-foreground">{meta.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-ritual-gold/70">
                    {meta.god}
                  </p>
                  <p className="mt-1 text-[11px] text-white/50">{meta.effect}</p>
                </button>
              ),
            )}
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Link
            to="/characters"
            className="rounded-md border border-white/10 px-6 py-3 text-xs uppercase tracking-widest text-white/60 hover:bg-white/5"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || remaining < 0}
            className="rounded-md bg-ritual-gold px-6 py-3 text-xs uppercase tracking-[0.25em] text-abyss transition-colors hover:bg-ritual-gold/90 disabled:opacity-50"
          >
            {saving ? "Manifestando…" : "Selar Pacto"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="ml-1 text-[10px] uppercase tracking-widest text-white/40">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1.5 w-full rounded-lg border border-white/5 bg-black/40 px-4 py-3 text-sm text-foreground placeholder:text-white/20 focus:border-prismatic/40 focus:outline-none focus:ring-1 focus:ring-prismatic/40"
      />
    </div>
  );
}
