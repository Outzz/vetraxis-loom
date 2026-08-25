import {
  Circle,
  Link2,
  Maximize2,
  MonitorOff,
  MonitorPlay,
  Radio,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  applyQualityToPeer,
  formatDuration,
  HQ_AUDIO_CONSTRAINTS,
  pickRecorderMime,
  presetFor,
  QUALITY_ORDER,
  QUALITY_PRESETS,
  readHealth,
  withBoostedAudio,
  type ConnectionHealth,
  type QualityId,
} from "@/lib/screen-share";

const ICE: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};

type Signal = {
  from: string;
  to?: string;
  name?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

const HEALTH_LABEL: Record<ConnectionHealth, string> = {
  boa: "Conexão estável",
  instavel: "Conexão instável",
  ruim: "Conexão fraca",
};

export function ScreenShare({
  campaignId,
  userId,
  displayName,
  canBroadcast,
  spectator = false,
  onRecordingSaved,
}: {
  campaignId: string;
  userId: string;
  displayName: string;
  canBroadcast: boolean;
  spectator?: boolean;
  onRecordingSaved?: () => void;
}) {
  const [ready, setReady] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [host, setHost] = useState<{ id: string; name: string } | null>(null);
  const [viewers, setViewers] = useState(0);
  const [starting, setStarting] = useState(false);

  const [quality, setQuality] = useState<QualityId>("auto");
  const [effective, setEffective] = useState<QualityId>("media");
  const [health, setHealth] = useState<ConnectionHealth>("boa");
  const [withAudio, setWithAudio] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(false);

  const [autoRecord, setAutoRecord] = useState(true);
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [uploading, setUploading] = useState(false);

  const chanRef = useRef<RealtimeChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sharingRef = useRef(false);
  const qualityRef = useRef<QualityId>("auto");
  const effectiveRef = useRef<QualityId>("media");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recStartRef = useRef(0);

  const send = useCallback((event: string, payload: Signal) => {
    chanRef.current?.send({ type: "broadcast", event, payload });
  }, []);

  const applyToAll = useCallback(async (id: QualityId) => {
    const preset = presetFor(id);
    effectiveRef.current = preset.id;
    setEffective(preset.id);
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      try {
        await track.applyConstraints({ frameRate: { max: preset.frameRate } });
      } catch {
        /* nem todo navegador aceita reconfigurar a captura */
      }
    }
    await Promise.all(
      Object.values(peersRef.current).map((pc) => applyQualityToPeer(pc, preset)),
    );
  }, []);

  const uploadRecording = useCallback(
    async (blob: Blob, seconds: number) => {
      if (blob.size < 100_000) return;
      setUploading(true);
      try {
        const ext = blob.type.includes("mp4") ? "mp4" : "webm";
        const path = `${campaignId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("session-recordings")
          .upload(path, blob, { contentType: blob.type || "video/webm" });
        if (upErr) throw upErr;
        const { error } = await supabase.from("campaign_recordings").insert({
          campaign_id: campaignId,
          recorded_by: userId,
          title: `Sessão de ${new Date().toLocaleDateString("pt-BR")}`,
          storage_path: path,
          duration_seconds: Math.round(seconds),
          size_bytes: blob.size,
        });
        if (error) throw error;
        toast.success("Gravação salva no histórico da crônica.");
        onRecordingSaved?.();
      } catch (e) {
        toast.error(
          `Não foi possível salvar a gravação: ${e instanceof Error ? e.message : "erro"}`,
        );
      } finally {
        setUploading(false);
      }
    },
    [campaignId, onRecordingSaved, userId],
  );

  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    const mime = pickRecorderMime();
    if (!stream || !mime || recorderRef.current) {
      if (!mime) toast("Este navegador não suporta gravação automática.");
      return;
    }
    try {
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 2_000_000 });
      chunksRef.current = [];
      recStartRef.current = Date.now();
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const seconds = (Date.now() - recStartRef.current) / 1000;
        const blob = new Blob(chunksRef.current, { type: mime });
        chunksRef.current = [];
        recorderRef.current = null;
        setRecording(false);
        setRecSeconds(0);
        void uploadRecording(blob, seconds);
      };
      rec.start(4000);
      recorderRef.current = rec;
      setRecording(true);
    } catch {
      toast.error("Não foi possível iniciar a gravação.");
    }
  }, [uploadRecording]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }, []);

  const closePeers = useCallback(() => {
    Object.values(peersRef.current).forEach((p) => p.close());
    peersRef.current = {};
    setViewers(0);
  }, []);

  const stopSharing = useCallback(() => {
    if (!sharingRef.current) return;
    sharingRef.current = false;
    stopRecording();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    closePeers();
    setSharing(false);
    setAudioAvailable(false);
    if (videoRef.current) videoRef.current.srcObject = null;
    send("host-offline", { from: userId });
  }, [closePeers, send, stopRecording, userId]);

  // --- canal de sinalização ---
  useEffect(() => {
    const ch = supabase.channel(`campaign-screen-${campaignId}`, {
      config: { broadcast: { self: false } },
    });
    chanRef.current = ch;

    const hostPeer = async (viewerId: string) => {
      if (!streamRef.current) return;
      peersRef.current[viewerId]?.close();
      const pc = new RTCPeerConnection(ICE);
      peersRef.current[viewerId] = pc;
      streamRef.current.getTracks().forEach((t) => pc.addTrack(t, streamRef.current!));
      pc.onicecandidate = (e) => {
        if (e.candidate)
          send("ice", { from: userId, to: viewerId, candidate: e.candidate.toJSON() });
      };
      pc.onconnectionstatechange = () => {
        if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
          pc.close();
          delete peersRef.current[viewerId];
          setViewers(Object.keys(peersRef.current).length);
        }
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await applyQualityToPeer(pc, presetFor(effectiveRef.current));
      setViewers(Object.keys(peersRef.current).length);
      send("offer", { from: userId, to: viewerId, sdp: offer });
    };

    const viewerPeer = async (hostId: string, sdp: RTCSessionDescriptionInit) => {
      peersRef.current[hostId]?.close();
      const pc = new RTCPeerConnection(ICE);
      peersRef.current[hostId] = pc;
      pc.ontrack = (e) => {
        const stream = e.streams[0];
        setAudioAvailable((stream?.getAudioTracks().length ?? 0) > 0);
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      };
      pc.onicecandidate = (e) => {
        if (e.candidate) send("ice", { from: userId, to: hostId, candidate: e.candidate.toJSON() });
      };
      await pc.setRemoteDescription(sdp);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      send("answer", { from: userId, to: hostId, sdp: answer });
    };

    ch.on("broadcast", { event: "who-is-host" }, ({ payload }) => {
      const p = payload as Signal;
      if (sharingRef.current) send("host-online", { from: userId, name: displayName, to: p.from });
    })
      .on("broadcast", { event: "host-online" }, ({ payload }) => {
        const p = payload as Signal;
        if (sharingRef.current || p.from === userId) return;
        setHost({ id: p.from, name: p.name ?? "Mestre" });
        send("viewer-join", { from: userId, to: p.from });
      })
      .on("broadcast", { event: "host-offline" }, ({ payload }) => {
        const p = payload as Signal;
        if (p.from === userId) return;
        peersRef.current[p.from]?.close();
        delete peersRef.current[p.from];
        if (videoRef.current) videoRef.current.srcObject = null;
        setHost(null);
      })
      .on("broadcast", { event: "viewer-join" }, ({ payload }) => {
        const p = payload as Signal;
        if (!sharingRef.current || p.to !== userId) return;
        void hostPeer(p.from);
      })
      .on("broadcast", { event: "offer" }, ({ payload }) => {
        const p = payload as Signal;
        if (p.to !== userId || !p.sdp || sharingRef.current) return;
        setHost((h) => h ?? { id: p.from, name: "Mestre" });
        void viewerPeer(p.from, p.sdp);
      })
      .on("broadcast", { event: "answer" }, async ({ payload }) => {
        const p = payload as Signal;
        if (p.to !== userId || !p.sdp) return;
        await peersRef.current[p.from]?.setRemoteDescription(p.sdp);
      })
      .on("broadcast", { event: "ice" }, async ({ payload }) => {
        const p = payload as Signal;
        if (p.to !== userId || !p.candidate) return;
        try {
          await peersRef.current[p.from]?.addIceCandidate(p.candidate);
        } catch {
          /* candidato tardio */
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setReady(true);
          send("who-is-host", { from: userId });
        }
      });

    return () => {
      recorderRef.current?.state !== "inactive" && recorderRef.current?.stop();
      recorderRef.current = null;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      Object.values(peersRef.current).forEach((p) => p.close());
      peersRef.current = {};
      if (sharingRef.current) send("host-offline", { from: userId });
      sharingRef.current = false;
      supabase.removeChannel(ch);
      chanRef.current = null;
    };
  }, [campaignId, userId, displayName, send]);

  // --- monitor de qualidade / fallback automático ---
  useEffect(() => {
    if (!sharing) return;
    const timer = setInterval(async () => {
      const peers = Object.values(peersRef.current);
      if (!peers.length) return;
      const results = await Promise.all(peers.map(readHealth));
      const worst: ConnectionHealth = results.includes("ruim")
        ? "ruim"
        : results.includes("instavel")
          ? "instavel"
          : "boa";
      setHealth(worst);
      if (qualityRef.current !== "auto") return;
      const idx = QUALITY_ORDER.indexOf(effectiveRef.current as "alta" | "media" | "baixa");
      if (worst === "ruim" && idx < QUALITY_ORDER.length - 1) {
        const next = QUALITY_ORDER[idx + 1]!;
        await applyToAll(next);
        toast(`Conexão fraca — qualidade reduzida para ${QUALITY_PRESETS[next].label}.`);
      } else if (worst === "boa" && idx > 0) {
        await applyToAll(QUALITY_ORDER[idx - 1]!);
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [sharing, applyToAll]);

  // --- cronômetro da gravação ---
  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  async function startSharing() {
    if (!canBroadcast) return;
    if (!navigator.mediaDevices?.getDisplayMedia) {
      toast.error("Seu navegador não suporta transmissão de tela.");
      return;
    }
    setStarting(true);
    const preset = presetFor(quality);
    const video: MediaTrackConstraints = {
      frameRate: { ideal: preset.frameRate, max: preset.frameRate },
      width: { ideal: preset.width },
      height: { ideal: preset.height },
    };
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({ video, audio: withAudio });
      } catch (err) {
        if (!withAudio || (err as DOMException)?.name === "NotAllowedError") throw err;
        // Fallback: alguns navegadores/SOs recusam captura de áudio da tela.
        stream = await navigator.mediaDevices.getDisplayMedia({ video, audio: false });
        toast("Áudio da tela indisponível neste navegador — transmitindo só o vídeo.");
      }
      streamRef.current = stream;
      sharingRef.current = true;
      setSharing(true);
      setHost(null);
      setAudioAvailable(stream.getAudioTracks().length > 0);
      effectiveRef.current = preset.id;
      setEffective(preset.id);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => {});
      }
      stream.getVideoTracks()[0]?.addEventListener("ended", () => stopSharing());
      send("host-online", { from: userId, name: displayName });
      if (autoRecord) startRecording();
      toast.success("Transmissão iniciada para a crônica.");
    } catch {
      toast("Transmissão cancelada.");
    } finally {
      setStarting(false);
    }
  }

  async function changeQuality(id: QualityId) {
    setQuality(id);
    qualityRef.current = id;
    if (sharing) await applyToAll(id);
    else {
      const p = presetFor(id);
      effectiveRef.current = p.id;
      setEffective(p.id);
    }
  }

  async function copySpectatorLink() {
    const url = `${window.location.origin}/assistir/${campaignId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link de espectador copiado.");
    } catch {
      toast(url);
    }
  }

  const live = sharing || !!host;

  return (
    <section className="mt-10 glass-panel rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="ritual-eyebrow flex items-center gap-2">
            <Radio className={`size-3 ${live ? "text-corruption" : "text-white/40"}`} />
            Transmissão de Tela
          </p>
          <p className="mt-2 text-xs text-white/45">
            {sharing
              ? `Você está transmitindo · ${viewers} espectador(es) · ${HEALTH_LABEL[health]}`
              : host
                ? `${host.name} está transmitindo agora.`
                : canBroadcast
                  ? "Compartilhe mapas, vídeos ou o livro sem sair da mesa."
                  : "Somente o Mestre da crônica pode iniciar a transmissão."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canBroadcast &&
            (sharing ? (
              <button
                onClick={stopSharing}
                className="flex items-center gap-2 rounded-md border border-corruption/50 px-4 py-2.5 text-[10px] uppercase tracking-widest text-corruption hover:bg-corruption/10"
              >
                <MonitorOff className="size-3.5" /> Encerrar
              </button>
            ) : (
              <button
                onClick={startSharing}
                disabled={starting || !ready || !!host}
                className="flex items-center gap-2 rounded-md bg-prismatic px-4 py-2.5 text-[10px] uppercase tracking-widest text-foreground hover:bg-prismatic/80 disabled:opacity-40"
              >
                <MonitorPlay className="size-3.5" /> Transmitir minha tela
              </button>
            ))}
          {!spectator && (
            <button
              onClick={copySpectatorLink}
              className="flex items-center gap-2 rounded-md border border-white/10 px-4 py-2.5 text-[10px] uppercase tracking-widest text-white/65 hover:border-ritual-gold hover:text-ritual-gold"
            >
              <Link2 className="size-3.5" /> Link de espectador
            </button>
          )}
          {live && (
            <button
              onClick={() => videoRef.current?.requestFullscreen?.()}
              className="flex items-center gap-2 rounded-md border border-white/10 px-4 py-2.5 text-[10px] uppercase tracking-widest text-white/65 hover:border-ritual-gold hover:text-ritual-gold"
            >
              <Maximize2 className="size-3.5" /> Tela cheia
            </button>
          )}
        </div>
      </div>

      {canBroadcast && (
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/5 pt-4">
          <span className="text-[10px] uppercase tracking-widest text-white/40">Qualidade</span>
          <div className="flex flex-wrap gap-1.5">
            {(["auto", ...QUALITY_ORDER] as QualityId[]).map((id) => {
              const isAuto = id === "auto";
              const p = isAuto ? null : QUALITY_PRESETS[id as "alta" | "media" | "baixa"];
              const active = quality === id;
              return (
                <button
                  key={id}
                  onClick={() => changeQuality(id)}
                  title={p ? p.hint : "Ajusta sozinho conforme a conexão"}
                  className={`rounded-md border px-3 py-1.5 text-[10px] uppercase tracking-widest transition-colors ${
                    active
                      ? "border-ritual-gold/60 bg-ritual-gold/10 text-ritual-gold"
                      : "border-white/10 text-white/55 hover:border-white/30 hover:text-foreground"
                  }`}
                >
                  {isAuto ? "Automática" : p!.label}
                </button>
              );
            })}
          </div>
          {quality === "auto" && sharing && (
            <span className="font-mono text-[10px] text-white/40">
              atual: {QUALITY_PRESETS[effective as "alta" | "media" | "baixa"].hint}
            </span>
          )}

          <label className="ml-auto flex cursor-pointer items-center gap-2 text-[10px] uppercase tracking-widest text-white/55">
            <input
              type="checkbox"
              checked={withAudio}
              disabled={sharing}
              onChange={(e) => setWithAudio(e.target.checked)}
              className="accent-[color:var(--color-ritual-gold,#d4a24a)]"
            />
            {withAudio ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
            Áudio da tela
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-[10px] uppercase tracking-widest text-white/55">
            <input
              type="checkbox"
              checked={autoRecord}
              disabled={sharing}
              onChange={(e) => setAutoRecord(e.target.checked)}
              className="accent-[color:var(--color-ritual-gold,#d4a24a)]"
            />
            Gravar automaticamente
          </label>

          {sharing &&
            (recording ? (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 rounded-md border border-corruption/50 px-3 py-1.5 text-[10px] uppercase tracking-widest text-corruption hover:bg-corruption/10"
              >
                <Circle className="size-3 animate-pulse fill-current" /> Parar gravação ·{" "}
                {formatDuration(recSeconds)}
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={uploading}
                className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-widest text-white/65 hover:border-ritual-gold hover:text-ritual-gold disabled:opacity-40"
              >
                <Circle className="size-3" /> {uploading ? "Salvando…" : "Gravar sessão"}
              </button>
            ))}
        </div>
      )}

      <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/60">
        {live ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls={!sharing}
            muted={sharing || !audioAvailable}
            className="aspect-video w-full bg-black"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center text-xs text-white/30">
            Nenhuma transmissão ativa nesta crônica.
          </div>
        )}
      </div>
    </section>
  );
}
