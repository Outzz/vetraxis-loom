import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { FloatingDice } from "../components/FloatingDice";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="ritual-eyebrow">Fragmento perdido</p>
        <h1 className="ritual-title mt-4 text-7xl text-foreground">404</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Esta página foi consumida pela Anomalia. Nenhum registro sobrou.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-ritual-gold/40 bg-transparent px-6 py-2.5 text-xs uppercase tracking-widest text-ritual-gold transition-colors hover:bg-ritual-gold/10"
          >
            Retornar ao Vazio
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="ritual-eyebrow">Colapso de realidade</p>
        <h1 className="ritual-title mt-4 text-3xl text-foreground">
          A conexão com Vetraxis foi rompida
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Uma anomalia inesperada interrompeu o ritual. Tente sincronizar novamente.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-ritual-gold px-6 py-2.5 text-xs uppercase tracking-widest text-abyss transition-colors hover:bg-ritual-gold/90"
          >
            Re-sincronizar
          </button>
          <a
            href="/"
            className="rounded-md border border-border bg-transparent px-6 py-2.5 text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-white/5"
          >
            Retornar
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Anomalia Cósmica RPG — Portal de Vetraxis" },
      {
        name: "description",
        content:
          "Plataforma oficial para o RPG Anomalia Cósmica. Fichas, campanhas, corrupção e sanidade automatizadas no universo vivo de Vetraxis.",
      },
      { name: "author", content: "Anomalia Cósmica" },
      {
        property: "og:title",
        content: "Anomalia Cósmica RPG — Portal de Vetraxis",
      },
      {
        property: "og:description",
        content:
          "Portadores, ritos e horrores cósmicos. Uma plataforma completa para Mestres e Jogadores.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <FloatingDice />
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.12 0.03 265 / 0.9)",
            border: "1px solid oklch(1 0 0 / 0.1)",
            color: "oklch(0.96 0.01 260)",
            backdropFilter: "blur(12px)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
