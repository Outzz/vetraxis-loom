import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { prepareCharacterPortrait } from "@/lib/character-image";
import {
  ATTRIBUTES,
  ATTR_MAX_START,
  ATTR_POINTS,
  ATTR_START,
  CLASS_CHOICE_CORRUPTION,
  defenseValue,
  maxHP,
  maxPA,
  maxSanity,
  type AttributeKey,
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
      { property: "og:title", content: "Novo Portador — Anomalia Cósmica" },
      {
        property: "og:description",
        content: "Distribua atributos e manifeste um novo agente em Vetraxis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: searchSchema,
  component: NewCharacter,
});

const ATTR_KEYS = Object.keys(ATTRIBUTES) as AttributeKey[];

function NewCharacter() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [concept, setConcept] = useState("");
  const [origin, setOrigin] = useState("");
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [preparingPortrait, setPreparingPortrait] = useState(false);
  const [attrs, setAttrs] = useState<Record<AttributeKey, number>>({
    str: ATTR_START,
    dex: ATTR_START,
    int: ATTR_START,
    cha: ATTR_START,
    res: ATTR_START,
  });
  const [saving, setSaving] = useState(false);

  // Pool: 4 pontos + 1 ponto extra por atributo reduzido a 0.
  const { pool, remaining, zeroed } = useMemo(() => {
    const values = ATTR_KEYS.map((k) => attrs[k]);
    const zeroCount = values.filter((v) => v === 0).length;
    const poolValue = ATTR_POINTS + zeroCount;
    const spentValue = values.reduce((sum, v) => sum + Math.max(0, v - ATTR_START), 0);
    return { pool: poolValue, remaining: poolValue - spentValue, zeroed: zeroCount };
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

  function reset() {
    setAttrs({ str: ATTR_START, dex: ATTR_START, int: ATTR_START, cha: ATTR_START, res: ATTR_START });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!name.trim()) {
      toast.error("O Portador precisa de um nome.");
      return;
    }
    if (remaining < 0) {
      toast.error("Você distribuiu pontos demais.");
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
        campaign_id: null,
        name: name.trim(),
        concept: concept.trim() || null,
        origin: origin.trim() || null,
        portrait_url: portraitUrl,
        element: null,
        relic: null,
        character_class: null,
        track: null,
        xp: 0,
        level: 1,
        corruption: 0,
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
    if (error || !data) {
      toast.error(
        error?.code === "42501"
          ? "Você não tem permissão para criar este Portador nesta campanha."
          : `Não foi possível criar o Portador: ${error?.message ?? "erro desconhecido"}`,
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
        <p className="ritual-eyebrow">Rito de Manifestação · Capítulo 4.0</p>
        <h1 className="ritual-title text-5xl text-foreground">Novo Portador</h1>
        <p className="max-w-2xl text-sm text-white/50">
          Elemento, Classe e Trilha não são escolhidos aqui. A Classe e a Trilha são
          liberadas na ficha ao atingir {CLASS_CHOICE_CORRUPTION}% de Corrupção; o
          Elemento só se manifesta quando algo na mesa o revelar.
        </p>
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
            <p className="ml-1 text-[10px] uppercase tracking-widest text-white/40">
              Retrato (opcional)
            </p>
            <div className="mt-1.5 flex items-center gap-4 rounded-lg border border-white/5 bg-black/30 p-3">
              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-abyss text-2xl text-white/25">
                {portraitUrl ? (
                  <img src={portraitUrl} alt="Prévia do retrato" className="h-full w-full object-cover" />
                ) : (
                  "◇"
                )}
              </div>
              <div className="min-w-0 space-y-2">
                <label className="inline-flex cursor-pointer rounded-md border border-white/10 px-3 py-2 text-[10px] uppercase tracking-widest text-white/65 hover:border-ritual-gold hover:text-ritual-gold">
                  {preparingPortrait ? "Preparando…" : "Escolher imagem"}
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
                        setPortraitUrl(await prepareCharacterPortrait(file));
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Imagem inválida.");
                      } finally {
                        setPreparingPortrait(false);
                      }
                    }}
                  />
                </label>
                {portraitUrl && (
                  <button type="button" onClick={() => setPortraitUrl(null)} className="block text-[10px] uppercase tracking-widest text-corruption/70 hover:text-corruption">
                    Remover retrato
                  </button>
                )}
                <p className="text-[10px] text-white/35">JPG, PNG ou WebP. A imagem será otimizada.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel space-y-4 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <p className="ritual-eyebrow">Atributos · 4.0 Criação de Personagem</p>
            <div className="flex items-center gap-3">
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
              <button
                type="button"
                onClick={reset}
                className="text-[10px] uppercase tracking-widest text-white/40 hover:text-ritual-gold"
              >
                ↻ Zerar
              </button>
            </div>
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
                    value === 0
                      ? "border-corruption/40 bg-corruption/5"
                      : "border-white/5 bg-black/30"
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

        <div className="flex justify-end gap-3">
          <Link
            to="/characters"
            className="rounded-md border border-white/10 px-6 py-3 text-xs uppercase tracking-widest text-white/60 hover:bg-white/5"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || preparingPortrait}
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
