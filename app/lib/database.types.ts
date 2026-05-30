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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ambassadors: {
        Row: {
          bio: string | null
          dept: string | null
          grad_year: number | null
          id: string
          school_id: string
        }
        Insert: {
          bio?: string | null
          dept?: string | null
          grad_year?: number | null
          id: string
          school_id: string
        }
        Update: {
          bio?: string | null
          dept?: string | null
          grad_year?: number | null
          id?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambassadors_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassadors_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          answer: string | null
          author_id: string
          body: string | null
          content_type: string | null
          created_at: string
          id: string
          is_anonymous: boolean
          kind: Database["public"]["Enums"]["post_kind"]
          pinned: boolean
          question: string | null
          questioner_id: string | null
          school_id: string
          summary: string | null
          title: string | null
          views: number
          visibility: Database["public"]["Enums"]["request_visibility"]
        }
        Insert: {
          answer?: string | null
          author_id: string
          body?: string | null
          content_type?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          kind: Database["public"]["Enums"]["post_kind"]
          pinned?: boolean
          question?: string | null
          questioner_id?: string | null
          school_id: string
          summary?: string | null
          title?: string | null
          views?: number
          visibility?: Database["public"]["Enums"]["request_visibility"]
        }
        Update: {
          answer?: string | null
          author_id?: string
          body?: string | null
          content_type?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          kind?: Database["public"]["Enums"]["post_kind"]
          pinned?: boolean
          question?: string | null
          questioner_id?: string | null
          school_id?: string
          summary?: string | null
          title?: string | null
          views?: number
          visibility?: Database["public"]["Enums"]["request_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_questioner_id_fkey"
            columns: ["questioner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      request_ambassadors: {
        Row: {
          ambassador_id: string
          created_at: string
          id: string
          request_id: string
          status: Database["public"]["Enums"]["assignment_status"]
        }
        Insert: {
          ambassador_id: string
          created_at?: string
          id?: string
          request_id: string
          status?: Database["public"]["Enums"]["assignment_status"]
        }
        Update: {
          ambassador_id?: string
          created_at?: string
          id?: string
          request_id?: string
          status?: Database["public"]["Enums"]["assignment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "request_ambassadors_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "ambassadors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_ambassadors_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          comm_pref: string | null
          created_at: string
          duration: string | null
          id: string
          is_anonymous: boolean
          preferred_ambassador_id: string | null
          question: string
          school_id: string
          status: Database["public"]["Enums"]["request_status"]
          student_id: string
          visibility: Database["public"]["Enums"]["request_visibility"]
        }
        Insert: {
          comm_pref?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          is_anonymous?: boolean
          preferred_ambassador_id?: string | null
          question: string
          school_id: string
          status?: Database["public"]["Enums"]["request_status"]
          student_id: string
          visibility?: Database["public"]["Enums"]["request_visibility"]
        }
        Update: {
          comm_pref?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          is_anonymous?: boolean
          preferred_ambassador_id?: string | null
          question?: string
          school_id?: string
          status?: Database["public"]["Enums"]["request_status"]
          student_id?: string
          visibility?: Database["public"]["Enums"]["request_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "requests_preferred_ambassador_id_fkey"
            columns: ["preferred_ambassador_id"]
            isOneToOne: false
            referencedRelation: "ambassadors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          color_bg: string | null
          color_fg: string | null
          description: string | null
          id: string
          logo_url: string | null
          name_en: string
          name_zh: string
          short_name: string | null
        }
        Insert: {
          color_bg?: string | null
          color_fg?: string | null
          description?: string | null
          id: string
          logo_url?: string | null
          name_en: string
          name_zh: string
          short_name?: string | null
        }
        Update: {
          color_bg?: string | null
          color_fg?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name_en?: string
          name_zh?: string
          short_name?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      nanoid: { Args: { size?: number }; Returns: string }
    }
    Enums: {
      assignment_status: "sent" | "responded" | "declined"
      post_kind: "article" | "note" | "qa"
      request_status: "pending" | "approved" | "rejected" | "done"
      request_visibility: "public" | "private"
      user_role: "student" | "ambassador" | "admin"
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
      assignment_status: ["sent", "responded", "declined"],
      post_kind: ["article", "note", "qa"],
      request_status: ["pending", "approved", "rejected", "done"],
      request_visibility: ["public", "private"],
      user_role: ["student", "ambassador", "admin"],
    },
  },
} as const
