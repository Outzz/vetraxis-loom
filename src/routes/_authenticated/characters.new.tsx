import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  ATTRIBUTES,
  ATTR_MAX_START,
  ATTR_POINTS,
  ATTR_START,
  CLASSES,
  ELEMENTS,
  RELICS,
  defenseValue,
  maxHP,
  maxPA,
  maxSanity,
  type AttributeKey,
  type CharacterClass,
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

const ATTR_KEYS = Object.keys(ATTRIBUTES) as AttributeKey[];

function NewCharacter() {
  const navigate = useNavigate();
  const { campaign } = Route.useSearch();

  const [name, setName] = useState("");
  const [concept, setConcept] = useState("");
  const [origin, setOrigin] = useState("");
  const [element, setElement] = useState<CosmicElement | "">("");
  const [relic, setRelic] = useState<Relic | "">("");
  const [charClass, setCharClass] = useState<CharacterClass | "">("");
  const [attrs, setAttrs] = useState<Record<AttributeKey, number>>({
    str: ATTR_START,
    dex: ATTR_START,
    int: ATTR_START,
    cha: ATTR_START,
    res: ATTR_START,
  });
  const [saving, setSaving] = useState(false);
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [campaignId, setCampaignId] = useState(campaign ?? "");

  useEffect(() => {
    supabase
      .from("campaigns")
      .select("id, name")
      .order("name")
      .then(({ data }) => setCampaigns(data ?? []));
  }, []);

  // Pool: 4 pontos + 1 ponto extra por atributo reduzido a 0.
  const { pool, spent, remaining, zeroed } = useMemo(() => {
    const values = ATTR_KEYS.map((k) => attrs[k]);
    const zeroCount = values.filter((v) => v === 0).length;
    const poolValue = ATTR_POINTS + zeroCount;
    const spentValue = values.reduce((sum, v) => sum + Math.max(0, v - ATTR_START), 0);
    return {
      pool: poolValue,
      spent: spentValue,
      remaining: poolValue - spentValue,
      zeroed: zeroCount,
    };
  }, [attrs]);

  const derived = useMemo(
    () => ({
      hp: maxHP(attrs.res),
      sanity: maxSanity(attrs.int),
      pa: maxPA(attrs.int),
      defense: defenseValue(attrs.dex),
    }),
    [attrs],
  );

  function adjust(key: AttributeKey, delta: number) {
    setAttrs((prev) => {
      const next = prev[key] + delta;
      if (next < 0 || next > ATTR_MAX_START) return prev;
      const projected = { ...prev, [key]: next };
      const values = ATTR_KEYS.map((k) => projected[k]);
      const nextPool = ATTR_POINTS + values.filter((v) => v === 0).length;
      const nextSpent = values.reduce((s, v) => s + Math.max(0, v - ATTR_START), 0);
      if (nextSpent > nextPool) {
        toast.error("Pontos insuficientes. Reduza outro atributo primeiro.");
        return prev;
      }
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
    if (!charClass) {
      toast.error("Escolha uma classe (Cap. 4).");
      return;
    }
    if (remaining !== 0) {
      toast.error(
        remaining > 0
          ? `Ainda restam ${remaining} ponto(s) de atributo para distribuir.`
          : "Você distribuiu pontos demais.",
      );
      return;
    }
    setSaving(true);
    const { data: u, error: authError } = await supabase.auth.getUser();
    if (authError || !u.user) {
      toast.error("Sua sessão expirou. Entre novamente para criar um Portador.");
      setSaving(false);
      return;
    }
    const { data, error } = await supabase
      .from("characters")
      .insert({
        owner_id: u.user.id,
        campaign_id: campaignId || null,
        name: name.trim(),
        concept: concept.trim() || null,
        origin: origin.trim() || null,
        element,
        relic: relic || null,
        character_class: charClass,
        track: null,
        xp: 0,
        level: 1,
        str_score: attrs.str,
        dex_score: attrs.dex,
        int_score: attrs.int,
        res_score: attrs.res,
        cha_score: attrs.cha,
        per_score: 0,
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
      toast.error(
        error.code === "42501"
          ? "Você não tem permissão para criar este Portador nesta campanha."
          : `Não foi possível criar o Portador: ${error.message}`,
      );
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
        <p className="ritual-eyebrow">Rito de Manifestação · Capítulo 4</p>
        <h1 className="ritual-title text-5xl text-foreground">Novo Portador</h1>
      </header>

      <form onSubmit={submit} className="mt-10 space-y-8">
        <section className="glass-panel space-y-4 rounded-2xl p-6">
          <p className="ritual-eyebrow">Identidade</p>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Nome" value={name} onChange={setName} required />
            <FormField
              label="Origem"
              value={origin}
              onChange={setOrigin}
              placeholder="Cidade cósmica de Aetheris"
            />
          </div>
          <FormField
            label="Conceito"
            value={concept}
            onChange={setConcept}
            placeholder="Investigador atormentado por visões"
          />
          <div>
            <label
              htmlFor="character-campaign"
              className="ml-1 text-[10px] uppercase tracking-widest text-white/40"
            >
              Campanha (opcional)
            </label>
            <select
              id="character-campaign"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/5 bg-abyss px-4 py-3 text-sm text-foreground focus:border-prismatic/40 focus:outline-none"
            >
              <option value="">Portador independente</option>
              {campaigns.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="glass-panel space-y-4 rounded-2xl p-6">
          <p className="ritual-eyebrow">Classe · 4.2 Estrutura de Classe</p>
          <p className="text-xs text-white/40">
            A Trilha (subclasse) é escolhida somente no nível 4.
          </p>
          <div className="grid gap-2 md:grid-cols-3">
            {(Object.entries(CLASSES) as [CharacterClass, (typeof CLASSES)["conduite_fisico"]][]).map(
              ([key, meta]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setCharClass(key)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    charClass === key
                      ? "border-ritual-gold bg-ritual-gold/5"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <p className="ritual-title text-lg text-foreground">{meta.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-ritual-gold/70">
                    {meta.keyAttrs.map((a) => ATTRIBUTES[a].name).join(" · ")}
                  </p>
                  <p className="mt-2 text-[11px] text-white/60">{meta.tagline}</p>
                  <p className="mt-2 text-[11px] text-white/40">
                    Nv 1 — {meta.abilities[0].text}
                  </p>
                  <p className="mt-1 text-[10px] text-white/30">
                    Trilhas: {meta.tracks.join(" • ")}
                  </p>
                </button>
              ),
            )}
          </div>
        </section>

        <section className="glass-panel space-y-4 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <p className="ritual-eyebrow">Atributos · 4.0 Criação de Personagem</p>
            <span
              className={`font-mono text-xs ${
                remaining === 0
                  ? "text-ritual-gold"
                  : remaining < 0
                    ? "text-corruption"
                    : "text-white/60"
              }`}
            >
              Pontos restantes: {remaining} / {pool}
            </span>
          </div>
          <p className="text-xs text-white/40">
            Todos os atributos começam em 1. Distribua 4 pontos; o máximo inicial é 3.
            Reduzir um atributo para 0 concede +1 ponto extra — e uma consequência
            narrativa permanente.
            {zeroed > 0 && (
              <span className="text-corruption">
                {" "}
                {zeroed} atributo(s) zerado(s) → +{zeroed} ponto(s).
              </span>
            )}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {ATTR_KEYS.map((key) => {
              const meta = ATTRIBUTES[key];
              const value = attrs[key];
              return (
                <div
                  key={key}
                  className={`rounded-xl border p-3 ${
                    value === 0 ? "border-corruption/40 bg-corruption/5" : "border-white/5 bg-black/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
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
                        aria-label={`Reduzir ${meta.name}`}
                        onClick={() => adjust(key, -1)}
                        className="size-7 rounded-full border border-white/10 text-white/60 hover:border-corruption hover:text-corruption"
                      >
                        −
                      </button>
                      <span className="min-w-[2ch] text-center font-mono text-lg text-foreground">
                        {value}
                      </span>
                      <button
                        type="button"
                        aria-label={`Aumentar ${meta.name}`}
                        onClick={() => adjust(key, 1)}
                        className="size-7 rounded-full border border-white/10 text-white/60 hover:border-ritual-gold hover:text-ritual-gold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {value === 0 && (
                    <p className="mt-2 text-[10px] uppercase tracking-widest text-corruption">
                      {meta.zero}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3 border-t border-white/5 pt-4 text-center font-mono text-xs">
            <Derived label="PV (10 + RES×2)" value={derived.hp} />
            <Derived label="PS (10 + INT×2)" value={derived.sanity} />
            <Derived label="PA (10 + INT×2)" value={derived.pa} />
            <Derived label="Defesa (10 + DES)" value={derived.defense} />
          </div>
        </section>

        <section className="glass-panel space-y-4 rounded-2xl p-6">
          <p className="ritual-eyebrow">Elemento Cósmico</p>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {(Object.entries(ELEMENTS) as [CosmicElement, (typeof ELEMENTS)["prisma"]][]).map(
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
                  <p className="ritual-title text-lg" style={{ color: meta.color }}>
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
            {(Object.entries(RELICS) as [Relic, (typeof RELICS)["prisma_harmonia"]][]).map(
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
            disabled={saving}
            className="rounded-md bg-ritual-gold px-6 py-3 text-xs uppercase tracking-[0.25em] text-abyss transition-colors hover:bg-ritual-gold/90 disabled:opacity-50"
          >
            {saving ? "Manifestando…" : "Selar Pacto"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Derived({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[10px] text-white/40">{label}</p>
      <p className="text-lg text-foreground">{value}</p>
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
      <label
        htmlFor={`field-${label}`}
        className="ml-1 text-[10px] uppercase tracking-widest text-white/40"
      >
        {label}
      </label>
      <input
        id={`field-${label}`}
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
