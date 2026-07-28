import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ELEMENTS, type CosmicElement } from "@/lib/game-data";

export const Route = createFileRoute("/_authenticated/campaigns/$id")({
  head: () => ({
    meta: [
      { title: "Crônica — Anomalia Cósmica" },
      {
        name: "description",
        content: "Detalhes, membros e personagens ativos da crônica.",
      },
    ],
  }),
  component: CampaignDetail,
});

type Campaign = {
  id: string;
  name: string;
  description: string | null;
  synopsis: string | null;
  invite_code: string;
  status: string;
  master_id: string;
};

type Member = {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: { display_name: string; avatar_url: string | null } | null;
};

type Character = {
  id: string;
  name: string;
  level: number;
  element: CosmicElement | null;
  hp_current: number;
  hp_max: number;
  sanity_current: number;
  sanity_max: number;
  corruption: number;
  owner_id: string;
};

function CampaignDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data: u } = await supabase.auth.getUser();
    setUserId(u.user?.id ?? null);

    const [{ data: c }, { data: mems }, { data: chars }] = await Promise.all([
      supabase.from("campaigns").select("*").eq("id", id).maybeSingle(),
      supabase.from("campaign_members").select("*").eq("campaign_id", id),
      supabase.from("characters").select("*").eq("campaign_id", id),
    ]);
    setCampaign(c as Campaign | null);
    // Fetch profiles for members
    const memList = (mems as Member[]) ?? [];
    if (memList.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in(
          "id",
          memList.map((m) => m.user_id),
        );
      const byId = new Map((profs ?? []).map((p) => [p.id, p]));
      memList.forEach((m) => {
        m.profile = byId.get(m.user_id) ?? null;
      });
    }
    setMembers(memList);
    setCharacters((chars as Character[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="ritual-eyebrow animate-pulse">Sintonizando…</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="ritual-eyebrow">Fragmento perdido</p>
        <h1 className="ritual-title mt-3 text-3xl">Crônica não encontrada</h1>
        <Link
          to="/campaigns"
          className="mt-6 inline-block text-xs uppercase tracking-widest text-ritual-gold hover:underline"
        >
          ← Voltar
        </Link>
      </div>
    );
  }

  const isMaster = campaign.master_id === userId;

  async function copyCode() {
    await navigator.clipboard.writeText(campaign!.invite_code);
    toast.success("Código copiado ao Vazio.");
  }

  async function removeMember(memberId: string) {
    if (!confirm("Remover este Portador da crônica?")) return;
    const { error } = await supabase.from("campaign_members").delete().eq("id", memberId);
    if (error) toast.error(error.message);
    else {
      toast.success("Removido.");
      load();
    }
  }

  async function leaveCampaign() {
    if (!confirm("Deixar esta crônica?")) return;
    const mine = members.find((m) => m.user_id === userId);
    if (!mine) return;
    const { error } = await supabase.from("campaign_members").delete().eq("id", mine.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Você deixou a crônica.");
      navigate({ to: "/campaigns" });
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <Link
        to="/campaigns"
        className="text-[10px] uppercase tracking-widest text-white/40 hover:text-ritual-gold"
      >
        ← Campanhas
      </Link>

      <header
        className="mt-4 flex flex-wrap items-start justify-between gap-6 border-b border-white/10 pb-8"
        style={{ animation: "fade-up 0.6s var(--ease-out-expo) both" }}
      >
        <div className="flex-1 min-w-0">
          <p className="ritual-eyebrow">
            {isMaster ? "Mestre desta Crônica" : "Portador participante"}
          </p>
          <h1 className="ritual-title mt-2 text-5xl text-foreground">
            {campaign.name}
          </h1>
          {campaign.synopsis && (
            <p className="mt-3 text-lg italic text-white/60">{campaign.synopsis}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-3">
          <button
            onClick={copyCode}
            className="rounded-md border border-ritual-gold/30 bg-ritual-gold/5 px-4 py-2 font-mono text-sm text-ritual-gold hover:bg-ritual-gold/10"
            title="Copiar código de convite"
          >
            {campaign.invite_code}
          </button>
          {!isMaster && (
            <button
              onClick={leaveCampaign}
              className="text-[10px] uppercase tracking-widest text-corruption/70 hover:text-corruption"
            >
              Deixar Crônica
            </button>
          )}
        </div>
      </header>

      {campaign.description && (
        <section className="mt-8 glass-panel rounded-2xl p-6">
          <p className="ritual-eyebrow mb-3">Introdução</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">
            {campaign.description}
          </p>
        </section>
      )}

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="ritual-title text-2xl text-foreground">Portadores</h2>
          <span className="font-mono text-xs text-white/40">{members.length}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => {
            const memberChars = characters.filter((c) => c.owner_id === m.user_id);
            return (
              <div key={m.id} className="glass-panel rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-void-blue ritual-title text-ritual-gold">
                      {(m.profile?.display_name ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        {m.profile?.display_name ?? "Portador"}
                      </p>
                      <p className="text-[9px] uppercase tracking-widest text-white/40">
                        {m.role === "master" ? "Mestre" : "Jogador"}
                      </p>
                    </div>
                  </div>
                  {isMaster && m.user_id !== userId && (
                    <button
                      onClick={() => removeMember(m.id)}
                      className="text-[10px] text-white/30 hover:text-corruption"
                      title="Remover"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {memberChars.length > 0 && (
                  <ul className="mt-3 space-y-1 border-t border-white/5 pt-2">
                    {memberChars.map((ch) => (
                      <li key={ch.id}>
                        <Link
                          to="/characters/$id"
                          params={{ id: ch.id }}
                          className="flex items-center justify-between text-xs text-white/60 hover:text-ritual-gold"
                        >
                          <span>
                            {ch.name} · Nv {ch.level}
                            {ch.element && (
                              <span
                                className="ml-1"
                                style={{ color: ELEMENTS[ch.element].color }}
                              >
                                {ELEMENTS[ch.element].name}
                              </span>
                            )}
                          </span>
                          <span className="font-mono text-[10px] text-white/40">
                            PV {ch.hp_current}/{ch.hp_max}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="ritual-title text-2xl text-foreground">Personagens ativos</h2>
          <Link
            to="/characters/new"
            search={{ campaign: campaign.id }}
            className="rounded-md border border-ritual-gold/40 px-4 py-2 text-[10px] uppercase tracking-widest text-ritual-gold hover:bg-ritual-gold/10"
          >
            + Novo Portador
          </Link>
        </div>
        {characters.length === 0 ? (
          <p className="text-sm text-white/40">
            Ainda não há Portadores vinculados a esta crônica.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {characters.map((c) => (
              <Link
                key={c.id}
                to="/characters/$id"
                params={{ id: c.id }}
                className="group glass-panel block rounded-xl p-4 transition-colors hover:border-ritual-gold/40"
              >
                <div className="flex items-center justify-between">
                  <h3 className="ritual-title text-lg text-foreground group-hover:text-ritual-gold">
                    {c.name}
                  </h3>
                  <span className="font-mono text-[10px] text-white/40">Nv {c.level}</span>
                </div>
                {c.element && (
                  <p
                    className="mt-1 text-[10px] uppercase tracking-widest"
                    style={{ color: ELEMENTS[c.element].color }}
                  >
                    {ELEMENTS[c.element].name}
                  </p>
                )}
                <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[10px] text-white/50">
                  <span>PV {c.hp_current}/{c.hp_max}</span>
                  <span>PS {c.sanity_current}/{c.sanity_max}</span>
                  <span className="text-corruption">Corr {c.corruption}%</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
