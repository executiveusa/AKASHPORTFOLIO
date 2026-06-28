// Auto-generated types — run `supabase gen types typescript` to update
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          slug: string;
          name: string;
          locale_default: "en" | "es";
          branding_json: Json;
          owner_email: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tenants"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["tenants"]["Insert"]>;
      };
      user_profiles: {
        Row: {
          id: string;
          tenant_id: string;
          role: "owner" | "pm" | "client_admin" | "client_viewer";
          display_name: string | null;
          avatar_url: string | null;
          locale: "en" | "es";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["user_profiles"]["Insert"]>;
      };
      boards: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          status: "active" | "archived";
          pm_user_id: string | null;
          due_date: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["boards"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["boards"]["Insert"]>;
      };
      columns: {
        Row: {
          id: string;
          board_id: string;
          tenant_id: string;
          title_en: string;
          title_es: string;
          position: number;
          wip_limit: number | null;
          color: string;
        };
        Insert: Omit<Database["public"]["Tables"]["columns"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["columns"]["Insert"]>;
      };
      cards: {
        Row: {
          id: string;
          board_id: string;
          column_id: string;
          tenant_id: string;
          title: string;
          description: string | null;
          assignee_id: string | null;
          due_date: string | null;
          priority: "low" | "medium" | "high" | "critical";
          labels: string[];
          pmi_phase: string | null;
          position: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["cards"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["cards"]["Insert"]>;
      };
      comments: {
        Row: {
          id: string;
          tenant_id: string;
          parent_type: "card" | "issue";
          parent_id: string;
          author_id: string;
          body_en: string | null;
          body_es: string | null;
          original_lang: string;
          pending_translation: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["comments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["comments"]["Insert"]>;
      };
      issues: {
        Row: {
          id: string;
          tenant_id: string;
          board_id: string | null;
          title: string;
          description_en: string | null;
          description_es: string | null;
          severity: "low" | "medium" | "high" | "critical";
          status: "open" | "in_progress" | "resolved" | "closed";
          raised_by: string;
          assigned_to: string | null;
          resolution_en: string | null;
          resolution_es: string | null;
          closed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["issues"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["issues"]["Insert"]>;
      };
      goals: {
        Row: {
          id: string;
          tenant_id: string;
          board_id: string | null;
          title_en: string;
          title_es: string | null;
          target_date: string | null;
          owner_id: string | null;
          percent_complete: number;
          status: "not_started" | "in_progress" | "completed" | "at_risk";
          linked_cards: string[];
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["goals"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["goals"]["Insert"]>;
      };
      contacts: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          role: string | null;
          email: string | null;
          phone: string | null;
          whatsapp: string | null;
          avatar_url: string | null;
          is_kupuri_staff: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["contacts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["contacts"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          tenant_id: string;
          thread_id: string;
          sender_id: string;
          body: string;
          original_lang: string;
          body_translated: string | null;
          pending_translation: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
    };
  };
}
