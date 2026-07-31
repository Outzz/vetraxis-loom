export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      campaign_members: {
        Row: {
          campaign_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["campaign_member_role"]
          user_id: string
        }
        Insert: {
          campaign_id: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["campaign_member_role"]
          user_id: string
        }
        Update: {
          campaign_id?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["campaign_member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_members_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string | null
          id: string
          invite_code: string
          master_id: string
          name: string
          status: Database["public"]["Enums"]["campaign_status"]
          synopsis: string | null
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          invite_code: string
          master_id: string
          name: string
          status?: Database["public"]["Enums"]["campaign_status"]
          synopsis?: string | null
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          invite_code?: string
          master_id?: string
          name?: string
          status?: Database["public"]["Enums"]["campaign_status"]
          synopsis?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      characters: {
        Row: {
          campaign_id: string | null
          cha_score: number
          concept: string | null
          corruption: number
          created_at: string
          dex_score: number
          disorders: Json
          element: Database["public"]["Enums"]["cosmic_element"] | null
          hp_current: number
          hp_max: number
          id: string
          int_score: number
          inventory: Json
          level: number
          name: string
          notes: string | null
          origin: string | null
          owner_id: string
          pa_current: number
          pa_max: number
          per_score: number
          portrait_url: string | null
          powers: Json
          relic: Database["public"]["Enums"]["relic"] | null
          res_score: number
          sanity_current: number
          sanity_max: number
          scars: Json
          skills: Json
          str_score: number
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          cha_score?: number
          concept?: string | null
          corruption?: number
          created_at?: string
          dex_score?: number
          disorders?: Json
          element?: Database["public"]["Enums"]["cosmic_element"] | null
          hp_current?: number
          hp_max?: number
          id?: string
          int_score?: number
          inventory?: Json
          level?: number
          name: string
          notes?: string | null
          origin?: string | null
          owner_id: string
          pa_current?: number
          pa_max?: number
          per_score?: number
          portrait_url?: string | null
          powers?: Json
          relic?: Database["public"]["Enums"]["relic"] | null
          res_score?: number
          sanity_current?: number
          sanity_max?: number
          scars?: Json
          skills?: Json
          str_score?: number
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          cha_score?: number
          concept?: string | null
          corruption?: number
          created_at?: string
          dex_score?: number
          disorders?: Json
          element?: Database["public"]["Enums"]["cosmic_element"] | null
          hp_current?: number
          hp_max?: number
          id?: string
          int_score?: number
          inventory?: Json
          level?: number
          name?: string
          notes?: string | null
          origin?: string | null
          owner_id?: string
          pa_current?: number
          pa_max?: number
          per_score?: number
          portrait_url?: string | null
          powers?: Json
          relic?: Database["public"]["Enums"]["relic"] | null
          res_score?: number
          sanity_current?: number
          sanity_max?: number
          scars?: Json
          skills?: Json
          str_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "characters_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_campaign_master: {
        Args: { _campaign_id: string; _user_id: string }
        Returns: boolean
      }
      is_campaign_member: {
        Args: { _campaign_id: string; _user_id: string }
        Returns: boolean
      }
      join_campaign_by_code: { Args: { _code: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "master" | "player"
      campaign_member_role: "master" | "player"
      campaign_status: "active" | "paused" | "archived"
      cosmic_element:
        | "prisma"
        | "chama"
        | "nebulosa"
        | "luz"
        | "raiz"
        | "eter"
        | "sombra"
      relic:
        | "prisma_harmonia"
        | "lamina_paixao"
        | "calice_astros"
        | "lanterna_solar"
        | "coroa_vitalidade"
        | "escudo_celestial"
        | "manto_sombras"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "master", "player"],
      campaign_member_role: ["master", "player"],
      campaign_status: ["active", "paused", "archived"],
      cosmic_element: [
        "prisma",
        "chama",
        "nebulosa",
        "luz",
        "raiz",
        "eter",
        "sombra",
      ],
      relic: [
        "prisma_harmonia",
        "lamina_paixao",
        "calice_astros",
        "lanterna_solar",
        "coroa_vitalidade",
        "escudo_celestial",
        "manto_sombras",
      ],
    },
  },
} as const
