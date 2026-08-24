import { Download, Film, Play, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatBytes, formatDuration } from "@/lib/screen-share";

type Recording = {
  id: string;
  title: string;
  storage_path: string;
  duration_seconds: number;
  size_bytes: number;
  created_at: string;
  recorded_by: string;
};

export function RecordingHistory({
  campaignId,
  isMaster,
  refreshKey = 0,
}: {
  campaignId: string;
  isMaster: boolean;
  refreshKey?: number;
}) {
  const [items, setItems] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<{ id: string; url: string } | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("campaign_recordings")
      .select("id, title, storage_path, duration_seconds, size_bytes, created_at, recorded_by")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as Recording[]) ?? []);
    setLoading(false);
  }, [campaignId]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  async function signedUrl(path: string) {
    const { data, error } = await supabase.storage
      .from("session-recordings")
      .createSignedUrl(path, 3600);
    if (error || !data) {
      toast.error("Não foi possível abrir a gravação.");
      return null;
    }
    return data.signedUrl;
  }

  async function watch(rec: Recording) {
    const url = await signedUrl(rec.storage_path);
    if (url) setPlaying({ id: rec.id, url });
  }

  async function download(rec: Recording) {
    const url = await signedUrl(rec.storage_path);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rec.title}.webm`;
    a.click();
  }

  async function remove(rec: Recording) {
    if (!confirm("Apagar esta gravação da crônica?")) return;
    const { error } = await supabase.from("campaign_recordings").delete().eq("id", rec.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.storage.from("session-recordings").remove([rec.storage_path]);
    if (playing?.id === rec.id) setPlaying(null);
    toast.success("Gravação removida.");
    void load();
  }

  return (
    <section className="mt-6 glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <p className="ritual-eyebrow flex items-center gap-2">
          <Film className="size-3 text-white/40" /> Histórico de Sessões
        </p>
        <span className="font-mono text-xs text-white/40">{items.length}</span>
      </div>

      {playing && (
        <video
          key={playing.id}
          src={playing.url}
          controls
          autoPlay
          className="mt-4 aspect-video w-full rounded-xl border border-white/10 bg-black"
        />
      )}

      {loading ? (
        <p className="mt-4 text-xs text-white/35">Recuperando registros…</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-xs text-white/35">
          Nenhuma sessão gravada ainda. Ative a gravação automática antes de transmitir.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((rec) => (
            <li
              key={rec.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/5 bg-black/30 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">{rec.title}</p>
                <p className="font-mono text-[10px] text-white/40">
                  {new Date(rec.created_at).toLocaleString("pt-BR")} ·{" "}
                  {formatDuration(rec.duration_seconds)} · {formatBytes(rec.size_bytes)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => watch(rec)}
                  className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-widest text-white/65 hover:border-ritual-gold hover:text-ritual-gold"
                >
                  <Play className="size-3" /> Assistir
                </button>
                <button
                  onClick={() => download(rec)}
                  className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-widest text-white/65 hover:border-ritual-gold hover:text-ritual-gold"
                >
                  <Download className="size-3" /> Baixar
                </button>
                {isMaster && (
                  <button
                    onClick={() => remove(rec)}
                    className="flex items-center gap-1.5 rounded-md border border-corruption/40 px-3 py-1.5 text-[10px] uppercase tracking-widest text-corruption hover:bg-corruption/10"
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
