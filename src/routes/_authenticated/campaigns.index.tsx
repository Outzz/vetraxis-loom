import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { randomInviteCode } from "@/lib/game-data";

export const Route = createFileRoute("/_authenticated/campaigns/")({
  head: () => ({
    meta: [
      { title: "Campanhas — Anomalia Cósmica" },
      {
        name: "description",
        content:
          "Crie, gerencie e entre em campanhas de RPG do universo de Vetraxis.",
      },
    ],
  }),
  component: CampaignsPage,
});

type Campaign = {
  id: string;
  name: string;
  description: string | null;
  synopsis: string | null;
  invite_code: string;
  status: "active" | "paused" | "archived";
  master_id: string;
  created_at: string;
  banner_url: string | null;
};

function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  async function load() {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    setUserId(u.user?.id ?? null);
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setCampaigns((data as Campaign[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <header
        className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-8"
        style={{ animation: "fade-up 0.8s var(--ease-out-expo) both" }}
      >
        <div>
          <Link
            to="/dashboard"
            className="text-[10px] uppercase tracking-widest text-white/40 hover:text-ritual-gold"
          >
            ← Portal
          </Link>
          <p className="ritual-eyebrow mt-3">Ecos da Eternidade</p>
          <h1 className="ritual-title mt-2 text-5xl text-foreground">Suas Campanhas</h1>
          <p className="mt-2 text-sm text-white/45">Crônicas mestradas e jornadas das quais você participa.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowJoin(true)}
            className="rounded-md border border-white/10 px-5 py-2.5 text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-white/5"
          >
            Entrar por código
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-md bg-ritual-gold px-5 py-2.5 text-xs uppercase tracking-widest text-abyss transition-colors hover:bg-ritual-gold/90"
          >
            Nova Campanha
          </button>
        </div>
      </header>

      {loading ? (
        <p className="ritual-eyebrow animate-pulse">Convocando…</p>
      ) : campaigns.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center">
          <p className="ritual-eyebrow">Vazio ritual</p>
          <h2 className="ritual-title mt-4 text-2xl text-foreground">
            Nenhuma crônica ainda foi tecida
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/50">
            Como Mestre, crie a primeira campanha. Como Portador, use um código
            de convite para se juntar a uma existente.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-5 flex items-center gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">Campanhas</h2>
            <span className="font-mono text-xs text-white/35">{campaigns.length}</span>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
          {campaigns.map((c, i) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              isMaster={c.master_id === userId}
              index={i}
            />
          ))}
          </div>
        </div>
      )}

      {showCreate && (
        <CreateCampaignModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
      {showJoin && (
        <JoinCampaignModal
          onClose={() => setShowJoin(false)}
          onJoined={() => {
            setShowJoin(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function CampaignCard({
  campaign,
  isMaster,
  index,
}: {
  campaign: Campaign;
  isMaster: boolean;
  index: number;
}) {
  return (
    <Link
      to="/campaigns/$id"
      params={{ id: campaign.id }}
      className="group block overflow-hidden rounded-lg border border-white/10 bg-card transition-all hover:-translate-y-0.5 hover:border-prismatic/50"
      style={{
        animation: "fade-up 0.8s var(--ease-out-expo) both",
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div className="relative h-44 overflow-hidden border-b border-white/10 bg-void-blue">
        {campaign.banner_url ? (
          <img src={campaign.banner_url} alt="" className="h-full w-full object-cover opacity-65 transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 campaign-sigil" aria-hidden="true" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <span className={`absolute left-4 top-4 rounded-sm border px-2 py-1 text-[9px] font-semibold uppercase tracking-widest ${isMaster ? "border-ritual-gold/40 bg-abyss/80 text-ritual-gold" : "border-prismatic/40 bg-abyss/80 text-prismatic"}`}>
          {isMaster ? "Mestre" : "Jogador"}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate ritual-title text-2xl text-foreground group-hover:text-ritual-gold">{campaign.name}</h3>
            <p className="mt-1 line-clamp-2 min-h-10 text-sm text-white/45">{campaign.synopsis || "Uma nova crônica aguarda seus primeiros ecos."}</p>
          </div>
          <ChevronRight className="mt-1 size-5 shrink-0 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-ritual-gold" />
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-[10px] uppercase tracking-widest text-white/35">
          <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />{new Intl.DateTimeFormat("pt-BR").format(new Date(campaign.created_at))}</span>
          <span className="flex items-center gap-1.5"><Users className="size-3.5" />{campaign.status === "active" ? "Ativa" : campaign.status}</span>
        </div>
      </div>
    </Link>
  );
}

function CreateCampaignModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      toast.error("Sessão perdida.");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("campaigns").insert({
      master_id: u.user.id,
      name,
      synopsis,
      description,
      invite_code: randomInviteCode(),
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Crônica selada.");
    onCreated();
  }

  return (
    <ModalShell title="Nova Campanha" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="Nome da Crônica"
          value={name}
          onChange={setName}
          placeholder="O Colapso de Vetraxis"
          required
        />
        <Field
          label="Sinopse (curta)"
          value={synopsis}
          onChange={setSynopsis}
          placeholder="Uma anomalia se abre no coração da cidade…"
        />
        <div>
          <label className="ml-1 text-[10px] uppercase tracking-widest text-white/40">
            Descrição / Introdução
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1.5 w-full rounded-lg border border-white/5 bg-black/40 px-4 py-3 text-sm text-foreground placeholder:text-white/20 focus:border-prismatic/40 focus:outline-none focus:ring-1 focus:ring-prismatic/40"
            placeholder="Contexto, tom, avisos de conteúdo…"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full rounded-md bg-ritual-gold py-3 text-xs uppercase tracking-[0.25em] text-abyss transition-colors hover:bg-ritual-gold/90 disabled:opacity-50"
        >
          {saving ? "Selando…" : "Selar Crônica"}
        </button>
      </form>
    </ModalShell>
  );
}

function JoinCampaignModal({
  onClose,
  onJoined,
}: {
  onClose: () => void;
  onJoined: () => void;
}) {
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setSaving(false);
      return;
    }
    // Junção via função segura no banco: qualquer usuário logado pode entrar com o código.
    const { error } = await supabase.rpc("join_campaign_by_code", {
      _code: code.trim().toUpperCase(),
    });
    setSaving(false);
    if (error) {
      toast.error(
        error.message.includes("inválido")
          ? "Código de convite inválido."
          : error.message,
      );
      return;
    }
    toast.success("Você foi vinculado à Crônica.");
    onJoined();
  }

  return (
    <ModalShell title="Entrar por código" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="Código de Convite"
          value={code}
          onChange={(v) => setCode(v.toUpperCase())}
          placeholder="XK4M9Q"
          required
        />
        <p className="text-xs text-white/40">
          O Mestre da campanha deve compartilhar o código com você. Se falhar,
          peça para ele adicioná-lo manualmente.
        </p>
        <button
          type="submit"
          disabled={saving || !code.trim()}
          className="w-full rounded-md bg-foreground py-3 text-xs uppercase tracking-[0.25em] text-abyss transition-colors hover:bg-ritual-gold disabled:opacity-50"
        >
          {saving ? "Sincronizando…" : "Vincular"}
        </button>
      </form>
    </ModalShell>
  );
}

export function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-abyss/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-md rounded-2xl p-8"
        style={{ animation: "fade-up 0.4s var(--ease-out-expo) both" }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="ritual-title text-2xl text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/40 transition-colors hover:text-corruption"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="ml-1 text-[10px] uppercase tracking-widest text-white/40">
        {props.label}
      </label>
      <input
        type={props.type ?? "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        required={props.required}
        className="mt-1.5 w-full rounded-lg border border-white/5 bg-black/40 px-4 py-3 text-sm text-foreground placeholder:text-white/20 focus:border-prismatic/40 focus:outline-none focus:ring-1 focus:ring-prismatic/40"
      />
    </div>
  );
}
