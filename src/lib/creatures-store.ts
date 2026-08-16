// Bestiário compartilhado: criaturas do livro + anomalias criadas pelo administrador.
import { supabase } from "@/integrations/supabase/client";
import { CREATURES, type Creature } from "./bestiary";

export const ANOMALY_ADMIN_EMAIL = "blueoutz.kka@gmail.com";

export async function isAnomalyAdmin(): Promise<boolean> {
  const { data } = await supabase.auth.getUser();
  return (data.user?.email ?? "").toLowerCase() === ANOMALY_ADMIN_EMAIL;
}

/** Criaturas oficiais mescladas com as customizadas (custom sobrescreve por id). */
export async function loadCreatures(): Promise<Creature[]> {
  const map = new Map<string, Creature>(CREATURES.map((c) => [c.id, c]));
  const { data, error } = await supabase.from("custom_creatures").select("id, data");
  if (!error && data) {
    for (const row of data) {
      const parsed = row.data as unknown as Creature;
      map.set(row.id, { ...parsed, id: row.id });
    }
  }
  return [...map.values()];
}

export async function saveCreature(creature: Creature) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Sessão expirada.");
  const { id, ...rest } = creature;
  const { error } = await supabase
    .from("custom_creatures")
    .upsert({ id, data: { ...rest, id } as never, created_by: u.user.id });
  if (error) throw error;
}

export async function deleteCreature(id: string) {
  const { error } = await supabase.from("custom_creatures").delete().eq("id", id);
  if (error) throw error;
}

export function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `anomalia-${Date.now()}`
  );
}
