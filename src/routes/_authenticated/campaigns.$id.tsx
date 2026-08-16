import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Copy, Pencil, Plus, Swords, UserRoundPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { prepareCharacterPortrait } from "@/lib/character-image";
import { ELEMENTS, type CosmicElement } from "@/lib/game-data";
import { Field, ModalShell } from "./campaigns.index";

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
  banner_url: string | null;
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
  campaign_id: string | null;
  portrait_url?: string | null;
};

function CampaignDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [pick, setPick] = useState("");
  const [linking, setLinking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  async function load() {
    const { data: u } = await supabase.auth.getUser();
    setUserId(u.user?.id ?? null);

    const [{ data: c }, { data: mems }, { data: chars }, { data: mine }] = await Promise.all([
      supabase.from("campaigns").select("*").eq("id", id).maybeSingle(),
      supabase.from("campaign_members").select("*").eq("campaign_id", id),
      supabase.from("characters").select("*").eq("campaign_id", id),
      u.user
        ? supabase.from("characters").select("*").eq("owner_id", u.user.id).order("name")
        : Promise.resolve({ data: [] as Character[] }),
    ]);
    setMyCharacters((mine as Character[]) ?? []);
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

  async function linkCharacter() {
    if (!pick) return;
    setLinking(true);
    const { error } = await supabase
      .from("characters")
      .update({ campaign_id: id })
      .eq("id", pick);
    setLinking(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Portador enviado para a crônica.");
      setPick("");
      load();
    }
  }

  async function unlinkCharacter(characterId: string) {
    const { error } = await supabase
      .from("characters")
      .update({ campaign_id: null })
      .eq("id", characterId);
    if (error) toast.error(error.message);
    else {
      toast.success("Portador removido da crônica.");
      load();
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

      <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-6">
        <Link to="/characters/new" className="flex items-center gap-2 rounded-md bg-prismatic px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-prismatic/80"><UserRoundPlus className="size-4" />Criar Portador</Link>
        <Link to="/combate" search={{ campaign: campaign.id }} className="flex items-center gap-2 rounded-md border border-prismatic/50 px-4 py-2.5 text-xs text-foreground hover:bg-prismatic/10"><Swords className="size-4" />Abrir Mesa</Link>
        <Link to="/bestiario" search={{ campaign: campaign.id }} className="flex items-center gap-2 rounded-md border border-white/10 px-4 py-2.5 text-xs text-white/65 hover:border-white/30 hover:text-foreground"><BookOpen className="size-4" />Bestiário</Link>
      </div>

      <header
        className="mt-8 grid gap-8 border-b border-white/10 pb-10 md:grid-cols-[280px_1fr_auto]"
        style={{ animation: "fade-up 0.6s var(--ease-out-expo) both" }}
      >
        <div className="campaign-sigil min-h-48 rounded-md border border-white/10 bg-void-blue" aria-hidden="true" />
        <div className="min-w-0 py-2">
          <p className="ritual-eyebrow">
            {isMaster ? "Mestre desta Crônica" : "Portador participante"}
          </p>
          <h1 className="ritual-title mt-2 text-4xl text-foreground md:text-5xl">
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
              <Copy className="mr-2 inline size-3.5" />{campaign.invite_code}
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
        <section className="mt-8 border-l-2 border-prismatic/50 py-2 pl-6">
          <p className="ritual-eyebrow mb-3">Introdução</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">
            {campaign.description}
          </p>
        </section>
      )}

      <nav className="mt-10 flex gap-8 border-b border-white/10 text-xs font-semibold uppercase tracking-widest">
        <span className="border-b-2 border-prismatic pb-3 text-foreground">Portadores</span>
        <span className="pb-3 text-white/35">Jogadores</span>
        <Link to="/combate" search={{ campaign: campaign.id }} className="pb-3 text-white/35 hover:text-foreground">Combates</Link>
      </nav>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="ritual-title text-2xl text-foreground">Jogadores vinculados</h2>
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

      <section className="mt-10 glass-panel rounded-2xl p-6">
        <p className="ritual-eyebrow">Jogadores · Meus Portadores</p>
        <p className="mt-2 text-xs text-white/45">
          Escolha qual dos seus Portadores entra nesta crônica. Um Portador só pode estar
          em uma crônica por vez.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={pick}
            onChange={(e) => setPick(e.target.value)}
            className="min-w-56 rounded-lg border border-white/10 bg-abyss px-4 py-2.5 text-sm text-foreground focus:border-prismatic/40 focus:outline-none"
          >
            <option value="">Selecionar Portador…</option>
            {myCharacters
              .filter((c) => c.campaign_id !== id)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · Nv {c.level}
                  {c.campaign_id ? " (em outra crônica)" : ""}
                </option>
              ))}
          </select>
          <button
            onClick={linkCharacter}
            disabled={!pick || linking}
            className="rounded-md bg-ritual-gold px-4 py-2.5 text-[10px] uppercase tracking-widest text-abyss hover:bg-ritual-gold/90 disabled:opacity-40"
          >
            {linking ? "Vinculando…" : "Entrar com este Portador"}
          </button>
          <Link
            to="/characters/new"
            className="rounded-md border border-white/10 px-4 py-2.5 text-[10px] uppercase tracking-widest text-white/60 hover:border-ritual-gold hover:text-ritual-gold"
          >
            <Plus className="mr-1 inline size-3" /> Criar novo
          </Link>
        </div>
        {myCharacters.some((c) => c.campaign_id === id) && (
          <ul className="mt-5 space-y-2 border-t border-white/5 pt-4">
            {myCharacters
              .filter((c) => c.campaign_id === id)
              .map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm text-white/70">
                  <span>{c.name}</span>
                  <button
                    onClick={() => unlinkCharacter(c.id)}
                    className="text-[10px] uppercase tracking-widest text-corruption/70 hover:text-corruption"
                  >
                    Retirar da crônica
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="ritual-title text-2xl text-foreground">Personagens ativos</h2>
          <Link
            to="/characters/new"
            className="rounded-md border border-ritual-gold/40 px-4 py-2 text-[10px] uppercase tracking-widest text-ritual-gold hover:bg-ritual-gold/10"
          >
            <Plus className="mr-1 inline size-3" /> Novo Portador
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
