import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CREATURES } from "@/lib/bestiary";

export default defineTool({
  name: "search_bestiary",
  title: "Search the bestiary",
  description:
    "Search the Anomalia Cósmica creature bestiary by text, threat level, cosmic element or behavior. Returns full combat stats.",
  inputSchema: {
    query: z.string().trim().optional().describe("Free text matched against name, epithet and lore."),
    threat: z
      .enum(["menor", "moderada", "severa", "cataclismica"])
      .optional()
      .describe("Filter by threat level."),
    element: z.string().trim().optional().describe("Filter by cosmic element, e.g. sombra."),
    behavior: z.string().trim().optional().describe("Filter by behavior pattern."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, threat, element, behavior }) => {
    const q = query?.toLowerCase();
    const results = CREATURES.filter((c) => {
      if (threat && c.threat !== threat) return false;
      if (element && c.element !== element) return false;
      if (behavior && c.behavior !== behavior) return false;
      if (q) {
        const haystack = `${c.name} ${c.epithet} ${c.lore}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return {
      content: [{ type: "text", text: JSON.stringify(results) }],
      structuredContent: { creatures: results, count: results.length },
    };
  },
});
