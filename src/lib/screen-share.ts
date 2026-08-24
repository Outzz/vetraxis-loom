export type QualityId = "auto" | "alta" | "media" | "baixa";

export type QualityPreset = {
  id: QualityId;
  label: string;
  hint: string;
  width: number;
  height: number;
  frameRate: number;
  maxBitrate: number;
};

export const QUALITY_PRESETS: Record<Exclude<QualityId, "auto">, QualityPreset> = {
  alta: {
    id: "alta",
    label: "Alta",
    hint: "1080p · 30 fps",
    width: 1920,
    height: 1080,
    frameRate: 30,
    maxBitrate: 2_500_000,
  },
  media: {
    id: "media",
    label: "Média",
    hint: "720p · 24 fps",
    width: 1280,
    height: 720,
    frameRate: 24,
    maxBitrate: 1_200_000,
  },
  baixa: {
    id: "baixa",
    label: "Baixa",
    hint: "480p · 15 fps",
    width: 854,
    height: 480,
    frameRate: 15,
    maxBitrate: 500_000,
  },
};

export const QUALITY_ORDER: Array<Exclude<QualityId, "auto">> = ["alta", "media", "baixa"];

export function presetFor(id: QualityId): QualityPreset {
  return QUALITY_PRESETS[id === "auto" ? "media" : id];
}

/** Áudio sempre em alta fidelidade: estéreo 48 kHz, sem processamento de voz. */
export const HQ_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
  channelCount: 2,
  sampleRate: 48000,
  sampleSize: 16,
};

/** Bitrate fixo e generoso para o áudio — nunca é reduzido junto com o vídeo. */
export const AUDIO_MAX_BITRATE = 256_000;

/** Força Opus estéreo com bitrate alto no SDP (o padrão do WebRTC é mono ~32 kbps). */
export function boostAudioSdp(sdp: string): string {
  const payload = sdp.match(/a=rtpmap:(\d+) opus\/48000\/2/i)?.[1];
  if (!payload) return sdp;
  const fmtp = new RegExp(`a=fmtp:${payload} ([^\\r\\n]*)`);
  const extras = [
    "stereo=1",
    "sprop-stereo=1",
    "maxaveragebitrate=256000",
    "maxplaybackrate=48000",
    "cbr=0",
    "useinbandfec=1",
  ];
  if (fmtp.test(sdp)) {
    return sdp.replace(fmtp, (_m, params: string) => {
      const kept = params
        .split(";")
        .map((p) => p.trim())
        .filter((p) => p && !extras.some((e) => p.startsWith(e.split("=")[0] + "=")));
      return `a=fmtp:${payload} ${[...kept, ...extras].join(";")}`;
    });
  }
  return sdp.replace(
    new RegExp(`(a=rtpmap:${payload} opus/48000/2[^\\r\\n]*)`),
    `$1\r\na=fmtp:${payload} ${extras.join(";")}`,
  );
}

export function withBoostedAudio(desc: RTCSessionDescriptionInit): RTCSessionDescriptionInit {
  return desc.sdp ? { type: desc.type, sdp: boostAudioSdp(desc.sdp) } : desc;
}

/** Aplica limites de bitrate/fps/escala no vídeo e mantém o áudio intacto e alto. */
export async function applyQualityToPeer(pc: RTCPeerConnection, preset: QualityPreset) {
  for (const sender of pc.getSenders()) {
    const kind = sender.track?.kind;
    if (kind !== "video" && kind !== "audio") continue;
    const params = sender.getParameters();
    if (!params.encodings || params.encodings.length === 0) params.encodings = [{}];

    if (kind === "audio") {
      sender.track!.enabled = true;
      params.encodings[0]!.active = true;
      params.encodings[0]!.maxBitrate = AUDIO_MAX_BITRATE;
      delete params.encodings[0]!.maxFramerate;
      delete params.encodings[0]!.scaleResolutionDownBy;
      try {
        await sender.setParameters(params);
      } catch {
        /* alguns navegadores recusam parâmetros parciais */
      }
      continue;
    }

    const settings = sender.track!.getSettings();
    const sourceHeight = settings.height ?? preset.height;
    params.encodings[0]!.maxBitrate = preset.maxBitrate;
    params.encodings[0]!.maxFramerate = preset.frameRate;
    params.encodings[0]!.scaleResolutionDownBy = Math.max(1, sourceHeight / preset.height);
    try {
      await sender.setParameters(params);
    } catch {
      /* alguns navegadores recusam parâmetros parciais */
    }
  }
}


export type ConnectionHealth = "boa" | "instavel" | "ruim";

/** Lê estatísticas do WebRTC para decidir se a conexão aguenta a qualidade atual. */
export async function readHealth(pc: RTCPeerConnection): Promise<ConnectionHealth> {
  try {
    const stats = await pc.getStats();
    let lost = 0;
    let sent = 0;
    let limited: string | undefined;
    stats.forEach((report) => {
      const r = report as unknown as Record<string, unknown>;
      if (r["type"] === "outbound-rtp" && r["kind"] === "video") {
        sent += Number(r["packetsSent"] ?? 0);
        limited = (r["qualityLimitationReason"] as string | undefined) ?? limited;
      }
      if (r["type"] === "remote-inbound-rtp" && r["kind"] === "video") {
        lost += Number(r["packetsLost"] ?? 0);
      }
    });
    const lossRate = sent > 0 ? lost / sent : 0;
    if (lossRate > 0.08 || limited === "bandwidth") return "ruim";
    if (lossRate > 0.03 || limited === "cpu") return "instavel";
    return "boa";
  } catch {
    return "boa";
  }
}

export const RECORDER_MIME_TYPES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4",
];

export function pickRecorderMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return RECORDER_MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
}

export function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(1)} ${units[i]}`;
}
