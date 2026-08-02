import { auth, defineMcp } from "@lovable.dev/mcp-js";

import listCampaigns from "./tools/list-campaigns";
import listCharacters from "./tools/list-characters";
import getCharacter from "./tools/get-character";
import updateCharacterResources from "./tools/update-character-resources";
import searchBestiary from "./tools/search-bestiary";

// The OAuth issuer must be the direct Supabase host; the project ref is the only
// value that survives publish unchanged.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "cosmic-anomaly-nexus",
  title: "Cosmic Anomaly Nexus",
  version: "0.1.0",
  instructions:
    "Tools for the Anomalia Cósmica RPG (Vetraxis). Use `list_campaigns` and `list_characters` to see the signed-in Portador's table, `get_character` for a full sheet, `update_character_resources` to apply damage, healing, sanity loss or corruption, and `search_bestiary` to look up creature stat blocks.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listCampaigns,
    listCharacters,
    getCharacter,
    updateCharacterResources,
    searchBestiary,
  ],
});
