import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CosmicBackground } from "@/components/CosmicBackground";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Set up listener FIRST to avoid missing early events
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate({ to: "/auth" });
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/auth" });
      } else {
        setChecking(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  if (checking) {
    return (
      <div className="relative min-h-screen">
        <CosmicBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <p className="ritual-eyebrow animate-pulse">Sincronizando…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <CosmicBackground />
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}
