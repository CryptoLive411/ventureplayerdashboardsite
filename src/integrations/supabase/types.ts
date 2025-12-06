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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_notes: {
        Row: {
          admin_id: string
          content: string
          created_at: string | null
          id: string
          player_id: string
        }
        Insert: {
          admin_id: string
          content: string
          created_at?: string | null
          id?: string
          player_id: string
        }
        Update: {
          admin_id?: string
          content?: string
          created_at?: string | null
          id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          assigned_to_player: boolean | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          player_files: string[] | null
          player_id: string
          player_notes: string | null
          sort_order: number | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to_player?: boolean | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          player_files?: string[] | null
          player_id: string
          player_notes?: string | null
          sort_order?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to_player?: boolean | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          player_files?: string[] | null
          player_id?: string
          player_notes?: string | null
          sort_order?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      college_messages: {
        Row: {
          college_tracking_id: string
          content: string
          created_at: string
          id: string
          player_id: string
          read_at: string | null
          sender_id: string
          sender_type: string
        }
        Insert: {
          college_tracking_id: string
          content: string
          created_at?: string
          id?: string
          player_id: string
          read_at?: string | null
          sender_id: string
          sender_type: string
        }
        Update: {
          college_tracking_id?: string
          content?: string
          created_at?: string
          id?: string
          player_id?: string
          read_at?: string | null
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "college_messages_college_tracking_id_fkey"
            columns: ["college_tracking_id"]
            isOneToOne: false
            referencedRelation: "college_tracking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "college_messages_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      college_tracking: {
        Row: {
          city: string | null
          coach_email: string | null
          coach_name: string | null
          coach_phone: string | null
          college_name: string
          created_at: string | null
          division: Database["public"]["Enums"]["division_type"] | null
          id: string
          last_action_date: string | null
          notes: string | null
          player_id: string
          state: string | null
          status: Database["public"]["Enums"]["college_status"] | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          coach_email?: string | null
          coach_name?: string | null
          coach_phone?: string | null
          college_name: string
          created_at?: string | null
          division?: Database["public"]["Enums"]["division_type"] | null
          id?: string
          last_action_date?: string | null
          notes?: string | null
          player_id: string
          state?: string | null
          status?: Database["public"]["Enums"]["college_status"] | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          coach_email?: string | null
          coach_name?: string | null
          coach_phone?: string | null
          college_name?: string
          created_at?: string | null
          division?: Database["public"]["Enums"]["division_type"] | null
          id?: string
          last_action_date?: string | null
          notes?: string | null
          player_id?: string
          state?: string | null
          status?: Database["public"]["Enums"]["college_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "college_tracking_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          player_id: string
          read_at: string | null
          sender_id: string
          sender_type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          player_id: string
          read_at?: string | null
          sender_id: string
          sender_type: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          player_id?: string
          read_at?: string | null
          sender_id?: string
          sender_type?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string
          id: string
          link: string | null
          player_id: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          link?: string | null
          player_id?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          link?: string | null
          player_id?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          college_name: string
          college_tracking_id: string | null
          created_at: string | null
          deadline: string | null
          id: string
          notes: string | null
          offer_type: string | null
          player_id: string
          scholarship_amount: number | null
          scholarship_percentage: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          college_name: string
          college_tracking_id?: string | null
          created_at?: string | null
          deadline?: string | null
          id?: string
          notes?: string | null
          offer_type?: string | null
          player_id: string
          scholarship_amount?: number | null
          scholarship_percentage?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          college_name?: string
          college_tracking_id?: string | null
          created_at?: string | null
          deadline?: string | null
          id?: string
          notes?: string | null
          offer_type?: string | null
          player_id?: string
          scholarship_amount?: number | null
          scholarship_percentage?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_college_tracking_id_fkey"
            columns: ["college_tracking_id"]
            isOneToOne: false
            referencedRelation: "college_tracking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_admin_requests: {
        Row: {
          email: string
          first_name: string
          id: string
          last_name: string
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          email: string
          first_name: string
          id?: string
          last_name: string
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      player_documents: {
        Row: {
          checklist_item_id: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          player_id: string
          uploaded_by: string
          uploaded_by_type: string
        }
        Insert: {
          checklist_item_id?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          player_id: string
          uploaded_by: string
          uploaded_by_type: string
        }
        Update: {
          checklist_item_id?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          player_id?: string
          uploaded_by?: string
          uploaded_by_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_documents_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_documents_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          act_score: number | null
          additional_notes: string | null
          assigned_admin_id: string | null
          avatar_url: string | null
          budget_per_year: number | null
          created_at: string | null
          current_club: string | null
          date_of_birth: string | null
          email: string
          first_name: string
          gpa: number | null
          gpa_scale: string | null
          graduation_year: number | null
          height_cm: number | null
          highlight_video_url: string | null
          id: string
          ielts_score: number | null
          last_name: string
          nationality: string | null
          phone: string | null
          position: string | null
          sat_score: number | null
          status: Database["public"]["Enums"]["player_status"] | null
          target_divisions:
            | Database["public"]["Enums"]["division_type"][]
            | null
          target_intake: string | null
          target_regions: string[] | null
          toefl_score: number | null
          updated_at: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          act_score?: number | null
          additional_notes?: string | null
          assigned_admin_id?: string | null
          avatar_url?: string | null
          budget_per_year?: number | null
          created_at?: string | null
          current_club?: string | null
          date_of_birth?: string | null
          email: string
          first_name: string
          gpa?: number | null
          gpa_scale?: string | null
          graduation_year?: number | null
          height_cm?: number | null
          highlight_video_url?: string | null
          id?: string
          ielts_score?: number | null
          last_name: string
          nationality?: string | null
          phone?: string | null
          position?: string | null
          sat_score?: number | null
          status?: Database["public"]["Enums"]["player_status"] | null
          target_divisions?:
            | Database["public"]["Enums"]["division_type"][]
            | null
          target_intake?: string | null
          target_regions?: string[] | null
          toefl_score?: number | null
          updated_at?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          act_score?: number | null
          additional_notes?: string | null
          assigned_admin_id?: string | null
          avatar_url?: string | null
          budget_per_year?: number | null
          created_at?: string | null
          current_club?: string | null
          date_of_birth?: string | null
          email?: string
          first_name?: string
          gpa?: number | null
          gpa_scale?: string | null
          graduation_year?: number | null
          height_cm?: number | null
          highlight_video_url?: string | null
          id?: string
          ielts_score?: number | null
          last_name?: string
          nationality?: string | null
          phone?: string | null
          position?: string | null
          sat_score?: number | null
          status?: Database["public"]["Enums"]["player_status"] | null
          target_divisions?:
            | Database["public"]["Enums"]["division_type"][]
            | null
          target_intake?: string | null
          target_regions?: string[] | null
          toefl_score?: number | null
          updated_at?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
    }
    Enums: {
      app_role: "admin" | "athlete"
      college_status:
        | "not_contacted"
        | "contacted"
        | "interested"
        | "communication"
        | "offer_made"
        | "not_interested"
        | "rejected"
      division_type: "NCAA_D1" | "NCAA_D2" | "NCAA_D3" | "NAIA" | "NJCAA"
      player_status: "active" | "in_placement" | "placed" | "archived"
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
      app_role: ["admin", "athlete"],
      college_status: [
        "not_contacted",
        "contacted",
        "interested",
        "communication",
        "offer_made",
        "not_interested",
        "rejected",
      ],
      division_type: ["NCAA_D1", "NCAA_D2", "NCAA_D3", "NAIA", "NJCAA"],
      player_status: ["active", "in_placement", "placed", "archived"],
    },
  },
} as const
