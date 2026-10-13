export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string;
          event_type: string;
          id: string;
          label: string | null;
          profile_id: string;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          id?: string;
          label?: string | null;
          profile_id: string;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          id?: string;
          label?: string | null;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_events_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      custom_links: {
        Row: {
          description: string | null;
          icon: string | null;
          id: string;
          position: number;
          profile_id: string;
          title: string;
          url: string;
          visible: boolean;
        };
        Insert: {
          description?: string | null;
          icon?: string | null;
          id?: string;
          position?: number;
          profile_id: string;
          title: string;
          url: string;
          visible?: boolean;
        };
        Update: {
          description?: string | null;
          icon?: string | null;
          id?: string;
          position?: number;
          profile_id?: string;
          title?: string;
          url?: string;
          visible?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "custom_links_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      page_blocks: {
        Row: {
          content_json: Json;
          created_at: string;
          id: string;
          position: number;
          profile_id: string;
          type: string;
          updated_at: string;
          visible: boolean;
        };
        Insert: {
          content_json?: Json;
          created_at?: string;
          id?: string;
          position?: number;
          profile_id: string;
          type: string;
          updated_at?: string;
          visible?: boolean;
        };
        Update: {
          content_json?: Json;
          created_at?: string;
          id?: string;
          position?: number;
          profile_id?: string;
          type?: string;
          updated_at?: string;
          visible?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "page_blocks_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          description: string | null;
          id: string;
          image: string | null;
          name: string;
          position: number;
          price: string | null;
          profile_id: string;
          url: string | null;
        };
        Insert: {
          description?: string | null;
          id?: string;
          image?: string | null;
          name: string;
          position?: number;
          price?: string | null;
          profile_id: string;
          url?: string | null;
        };
        Update: {
          description?: string | null;
          id?: string;
          image?: string | null;
          name?: string;
          position?: number;
          price?: string | null;
          profile_id?: string;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          address: string | null;
          analytics_enabled: boolean;
          bio: string | null;
          button_style: string;
          cover_image: string | null;
          created_at: string;
          description: string | null;
          display_name: string;
          email: string | null;
          id: string;
          image_shape: string;
          layout: string;
          maps_url: string | null;
          onboarded: boolean;
          opening_hours: Json;
          phone: string | null;
          profile_image: string | null;
          show_cover: boolean;
          status: string;
          template: string | null;
          theme: string;
          title: string | null;
          updated_at: string;
          user_id: string;
          username: string;
          website: string | null;
          whatsapp: string | null;
        };
        Insert: {
          address?: string | null;
          analytics_enabled?: boolean;
          bio?: string | null;
          button_style?: string;
          cover_image?: string | null;
          created_at?: string;
          description?: string | null;
          display_name?: string;
          email?: string | null;
          id?: string;
          image_shape?: string;
          layout?: string;
          maps_url?: string | null;
          onboarded?: boolean;
          opening_hours?: Json;
          phone?: string | null;
          profile_image?: string | null;
          show_cover?: boolean;
          status?: string;
          template?: string | null;
          theme?: string;
          title?: string | null;
          updated_at?: string;
          user_id: string;
          username: string;
          website?: string | null;
          whatsapp?: string | null;
        };
        Update: {
          address?: string | null;
          analytics_enabled?: boolean;
          bio?: string | null;
          button_style?: string;
          cover_image?: string | null;
          created_at?: string;
          description?: string | null;
          display_name?: string;
          email?: string | null;
          id?: string;
          image_shape?: string;
          layout?: string;
          maps_url?: string | null;
          onboarded?: boolean;
          opening_hours?: Json;
          phone?: string | null;
          profile_image?: string | null;
          show_cover?: boolean;
          status?: string;
          template?: string | null;
          theme?: string;
          title?: string | null;
          updated_at?: string;
          user_id?: string;
          username?: string;
          website?: string | null;
          whatsapp?: string | null;
        };
        Relationships: [];
      };
      services: {
        Row: {
          description: string | null;
          id: string;
          image: string | null;
          name: string;
          position: number;
          price: string | null;
          profile_id: string;
          url: string | null;
        };
        Insert: {
          description?: string | null;
          id?: string;
          image?: string | null;
          name: string;
          position?: number;
          price?: string | null;
          profile_id: string;
          url?: string | null;
        };
        Update: {
          description?: string | null;
          id?: string;
          image?: string | null;
          name?: string;
          position?: number;
          price?: string | null;
          profile_id?: string;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "services_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      social_links: {
        Row: {
          id: string;
          label: string | null;
          platform: string;
          position: number;
          profile_id: string;
          url: string;
          visible: boolean;
        };
        Insert: {
          id?: string;
          label?: string | null;
          platform: string;
          position?: number;
          profile_id: string;
          url: string;
          visible?: boolean;
        };
        Update: {
          id?: string;
          label?: string | null;
          platform?: string;
          position?: number;
          profile_id?: string;
          url?: string;
          visible?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "social_links_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_identity_link: {
        Args: {
          p_display_name: string;
          p_edit_token: string;
          p_profile_data: Json;
          p_username: string;
        };
        Returns: Json;
      };
      get_identity_link: { Args: { p_username: string }; Returns: Json };
      is_profile_public: { Args: { _profile_id: string }; Returns: boolean };
      owns_profile: { Args: { _profile_id: string }; Returns: boolean };
      update_identity_link: {
        Args: {
          p_display_name: string;
          p_edit_token: string;
          p_profile_data: Json;
          p_username: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
