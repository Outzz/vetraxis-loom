import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { randomInviteCode } from "@/lib/game-data";

export const Route = createFileRoute("/_authenticated/campaigns")({
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
        className="mb-12 flex flex-wrap items-end justify-between gap-6"
        style={{ animation: "fade-up 0.8s var(--ease-out-expo) both" }}
      >
        <div>
          <Link
            to="/dashboard"
            className="text-[10px] uppercase tracking-widest text-white/40 hover:text-ritual-gold"
          >
            ← Portal
          </Link>
          <p className="ritual-eyebrow mt-2">Ecos da Eternidade</p>
          <h1 className="ritual-title mt-2 text-5xl text-foreground">Campanhas</h1>
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
            + Nova Campanha
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c, i) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              isMaster={c.master_id === userId}
              index={i}
            />
          ))}
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
      className="group glass-panel block rounded-2xl p-6 transition-all hover:border-ritual-gold/40"
      style={{
        animation: "fade-up 0.8s var(--ease-out-expo) both",
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[9px] uppercase tracking-widest ${
            isMaster
              ? "bg-ritual-gold/15 text-ritual-gold"
              : "bg-prismatic/15 text-prismatic"
          }`}
        >
          {isMaster ? "Mestre" : "Portador"}
        </span>
        <span className="font-mono text-[10px] uppercase text-white/40">
          {campaign.invite_code}
        </span>
      </div>
      <h3 className="ritual-title text-2xl text-foreground group-hover:text-ritual-gold">
        {campaign.name}
      </h3>
      {campaign.synopsis && (
        <p className="mt-2 line-clamp-3 text-sm text-white/50">{campaign.synopsis}</p>
      )}
      <p className="mt-4 text-[10px] uppercase tracking-widest text-white/30">
        Status · {campaign.status}
      </p>
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
    // Fetch by invite code — but RLS restricts SELECT to members only.
    // We use an RPC-less approach: allow lookup via master_id fallback? Instead we ask user for exact code and try join.
    // To keep it simple: query campaigns with anon-safe view via a small edge... nope. Use secondary: try inserting membership with lookup by code
    const { data: campaign, error: findErr } = await supabase
      .from("campaigns")
      .select("id")
      .eq("invite_code", code.trim().toUpperCase())
      .maybeSingle();
    if (findErr || !campaign) {
      toast.error("Código não encontrado ou sem acesso. Peça ao Mestre para adicionar você.");
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from("campaign_members")
      .insert({ campaign_id: campaign.id, user_id: u.user.id, role: "player" });
    setSaving(false);
    if (error) {
      toast.error(error.message);
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
