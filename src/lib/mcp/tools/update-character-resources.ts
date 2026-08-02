import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_character_resources",
  title: "Update character resources",
  description:
    "Set current HP (PV), sanity (PS), action points (PA) or corruption on a character the signed-in user owns.",
  inputSchema: {
    character_id: z.string().uuid().describe("The character's id."),
    hp_current: z.number().int().min(0).optional().describe("New current HP (PV)."),
    sanity_current: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe("New current sanity (PS)."),
    pa_current: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe("New current action points (PA)."),
    corruption: z
      .number()
      .int()
      .min(0)
      .max(100)
      .optional()
      .describe("New corruption value (0-100)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ character_id, ...patch }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const updates = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined),
    );
    if (Object.keys(updates).length === 0) {
      return {
        content: [{ type: "text", text: "Provide at least one field to update." }],
        isError: true,
      };
    }

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("characters")
      .update(updates)
      .eq("id", character_id)
      .select(
        "id, name, hp_current, hp_max, sanity_current, sanity_max, pa_current, pa_max, corruption",
      );

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    if (!data || data.length === 0) {
      return {
        content: [{ type: "text", text: "Character not found or not editable by you." }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data[0]) }],
      structuredContent: { character: data[0] },
    };
  },
});
