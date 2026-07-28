import { createFileRoute, redirect } from "@tanstack/react-router";

// /authenticated redirects to /dashboard; the layout itself gates auth.
export const Route = createFileRoute("/_authenticated/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
