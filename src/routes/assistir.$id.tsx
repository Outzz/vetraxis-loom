import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { ScreenShare } from "@/components/ScreenShare";

export const Route = createFileRoute("/assistir/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Transmissão da Crônica — Anomalia Cósmica" },
      {
        name: "description",
        content:
          "Assista à transmissão de tela ao vivo de uma crônica de Anomalia Cósmica como espectador.",
      },
      { property: "og:title", content: "Transmissão da Crônica — Anomalia Cósmica" },
      {
        property: "og:description",
        content: "Acompanhe a mesa ao vivo pelo link de espectador.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SpectatorView,
});

function SpectatorView() {
  const { id } = Route.useParams();
  const [name, setName] = useState("Espectador");
  const viewerId = useMemo(
    () => (typeof crypto !== "undefined" ? crypto.randomUUID() : `viewer-${Date.now()}`),
    [],
  );

  useEffect(() => {
    const saved = localStorage.getItem("spectator-name");
    if (saved) setName(saved);
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <p className="ritual-eyebrow">Modo espectador</p>
      <h1 className="ritual-title mt-2 text-4xl text-foreground">Transmissão da Crônica</h1>
      <p className="mt-3 max-w-2xl text-sm text-white/50">
        Você está assistindo como convidado — não é necessário entrar na campanha. A imagem aparece
        assim que o Mestre iniciar a transmissão.
      </p>

      <label className="mt-6 block max-w-xs">
        <span className="ml-1 text-[10px] uppercase tracking-widest text-white/40">
          Seu nome (opcional)
        </span>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            localStorage.setItem("spectator-name", e.target.value);
          }}
          className="mt-1.5 w-full rounded-lg border border-white/5 bg-black/40 px-4 py-2.5 text-sm text-foreground focus:border-prismatic/40 focus:outline-none"
        />
      </label>

      <ScreenShare
        campaignId={id}
        userId={viewerId}
        displayName={name || "Espectador"}
        canBroadcast={false}
        spectator
      />
    </div>
  );
}
