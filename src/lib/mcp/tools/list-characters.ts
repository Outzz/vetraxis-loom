import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_characters",
  title: "List characters",
  description:
    "List the character sheets visible to the signed-in user, with level, element, HP, sanity and corruption.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("characters")
      .select(
        "id, name, concept, level, element, relic, campaign_id, hp_current, hp_max, sanity_current, sanity_max, pa_current, pa_max, corruption",
      )
      .order("updated_at", { ascending: false });

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { characters: data ?? [] },
    };
  },
});
