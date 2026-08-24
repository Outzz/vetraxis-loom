import { MonitorPlay, MonitorOff, Maximize2, Radio } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

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

export function ScreenShare({
  campaignId,
  userId,
  displayName,
}: {
  campaignId: string;
  userId: string;
  displayName: string;
}) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [sharing, setSharing] = useState(false);
  const [host, setHost] = useState<{ id: string; name: string } | null>(null);
  const [viewers, setViewers] = useState(0);
  const [starting, setStarting] = useState(false);

  const chanRef = useRef<RealtimeChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sharingRef = useRef(false);

  const send = useCallback((event: string, payload: Signal) => {
    chanRef.current?.send({ type: "broadcast", event, payload });
  }, []);

  const closePeers = useCallback(() => {
    Object.values(peersRef.current).forEach((p) => p.close());
    peersRef.current = {};
    setViewers(0);
  }, []);

  const stopSharing = useCallback(() => {
    if (!sharingRef.current) return;
    sharingRef.current = false;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    closePeers();
    setSharing(false);
    send("host-offline", { from: userId });
  }, [closePeers, send, userId]);

  // --- signaling channel ---
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
        if (e.candidate) send("ice", { from: userId, to: viewerId, candidate: e.candidate.toJSON() });
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
      setViewers(Object.keys(peersRef.current).length);
      send("offer", { from: userId, to: viewerId, sdp: offer });
    };

    const viewerPeer = async (hostId: string, sdp: RTCSessionDescriptionInit) => {
      peersRef.current[hostId]?.close();
      const pc = new RTCPeerConnection(ICE);
      peersRef.current[hostId] = pc;
      pc.ontrack = (e) => {
        if (videoRef.current) {
          videoRef.current.srcObject = e.streams[0];
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
          setChannel(ch);
          send("who-is-host", { from: userId });
        }
      });

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      Object.values(peersRef.current).forEach((p) => p.close());
      peersRef.current = {};
      if (sharingRef.current) send("host-offline", { from: userId });
      sharingRef.current = false;
      supabase.removeChannel(ch);
      chanRef.current = null;
    };
  }, [campaignId, userId, displayName, send]);

  async function startSharing() {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      toast.error("Seu navegador não suporta transmissão de tela.");
      return;
    }
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      });
      streamRef.current = stream;
      sharingRef.current = true;
      setSharing(true);
      setHost(null);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => {});
      }
      stream.getVideoTracks()[0]?.addEventListener("ended", () => stopSharing());
      send("host-online", { from: userId, name: displayName });
      toast.success("Transmissão iniciada para a crônica.");
    } catch {
      toast("Transmissão cancelada.");
    } finally {
      setStarting(false);
    }
  }

  const live = sharing || !!host;

  return (
    <section className="mt-10 glass-panel rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="ritual-eyebrow flex items-center gap-2">
            <Radio className={`size-3 ${live ? "text-corruption" : "text-white/40"}`} />
            Transmissão de Tela
          </p>
          <p className="mt-2 text-xs text-white/45">
            {sharing
              ? `Você está transmitindo · ${viewers} espectador(es)`
              : host
                ? `${host.name} está transmitindo agora.`
                : "Compartilhe mapas, vídeos ou o livro sem sair da mesa."}
          </p>
        </div>
        <div className="flex gap-2">
          {sharing ? (
            <button
              onClick={stopSharing}
              className="flex items-center gap-2 rounded-md border border-corruption/50 px-4 py-2.5 text-[10px] uppercase tracking-widest text-corruption hover:bg-corruption/10"
            >
              <MonitorOff className="size-3.5" /> Encerrar transmissão
            </button>
          ) : (
            <button
              onClick={startSharing}
              disabled={starting || !channel}
              className="flex items-center gap-2 rounded-md bg-prismatic px-4 py-2.5 text-[10px] uppercase tracking-widest text-foreground hover:bg-prismatic/80 disabled:opacity-40"
            >
              <MonitorPlay className="size-3.5" /> Transmitir minha tela
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

      <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-black/60">
        {live ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls={!sharing}
            muted={sharing}
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
