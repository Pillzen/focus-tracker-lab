export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          institution: string | null
          profile_picture: string | null
          subjects: string[] | null
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          institution?: string | null
          profile_picture?: string | null
          subjects?: string[] | null
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          institution?: string | null
          profile_picture?: string | null
          subjects?: string[] | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          attention_percentage: number | null
          created_at: string
          image: string | null
          st_id: string
          user_id: string | null
        }
        Insert: {
          attention_percentage?: number | null
          created_at?: string
          image?: string | null
          st_id: string
          user_id?: string | null
        }
        Update: {
          attention_percentage?: number | null
          created_at?: string
          image?: string | null
          st_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      students_duplicate: {
        Row: {
          attention_percentage: number | null
          created_at: string
          image: string | null
          st_id: string
        }
        Insert: {
          attention_percentage?: number | null
          created_at?: string
          image?: string | null
          st_id: string
        }
        Update: {
          attention_percentage?: number | null
          created_at?: string
          image?: string | null
          st_id?: string
        }
        Relationships: []
      }
      video_analysis: {
        Row: {
          created_at: string
          id: string
          status: string | null
          user_id: string | null
          video_title: string | null
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string | null
          user_id?: string | null
          video_title?: string | null
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string | null
          user_id?: string | null
          video_title?: string | null
          video_url?: string
        }
        Relationships: []
      }
      video_analysis_duplicate: {
        Row: {
          created_at: string
          id: string
          status: string | null
          user_id: string | null
          video_title: string | null
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string | null
          user_id?: string | null
          video_title?: string | null
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string | null
          user_id?: string | null
          video_title?: string | null
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
