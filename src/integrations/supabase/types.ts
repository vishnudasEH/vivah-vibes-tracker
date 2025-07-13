export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      budget_categories: {
        Row: {
          actual_amount: number
          created_at: string
          estimated_amount: number
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          actual_amount?: number
          created_at?: string
          estimated_amount?: number
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          actual_amount?: number
          created_at?: string
          estimated_amount?: number
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      budget_items: {
        Row: {
          actual_amount: number
          budgeted_amount: number
          category: string
          created_at: string
          id: string
          item_name: string
          notes: string | null
          payment_mode: string | null
          status: string
          updated_at: string
          vendor_name: string | null
        }
        Insert: {
          actual_amount?: number
          budgeted_amount?: number
          category: string
          created_at?: string
          id?: string
          item_name: string
          notes?: string | null
          payment_mode?: string | null
          status?: string
          updated_at?: string
          vendor_name?: string | null
        }
        Update: {
          actual_amount?: number
          budgeted_amount?: number
          category?: string
          created_at?: string
          id?: string
          item_name?: string
          notes?: string | null
          payment_mode?: string | null
          status?: string
          updated_at?: string
          vendor_name?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          dress_code: string | null
          event_date: string
          event_time: string | null
          id: string
          name: string
          notes: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          created_at?: string
          dress_code?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          created_at?: string
          dress_code?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          description: string
          expense_date: string
          id: string
          vendor_id: string | null
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_tags: {
        Row: {
          created_at: string
          guest_id: string
          id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          guest_id: string
          id?: string
          tag_id: string
        }
        Update: {
          created_at?: string
          guest_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_tags_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          category: string | null
          created_at: string
          email: string | null
          id: string
          invitation_sent: boolean
          members: number
          name: string
          phone: string | null
          relation: string
          rsvp_status: string
          side: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          email?: string | null
          id?: string
          invitation_sent?: boolean
          members?: number
          name: string
          phone?: string | null
          relation: string
          rsvp_status?: string
          side: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          email?: string | null
          id?: string
          invitation_sent?: boolean
          members?: number
          name?: string
          phone?: string | null
          relation?: string
          rsvp_status?: string
          side?: string
          updated_at?: string
        }
        Relationships: []
      }
      pooja_items: {
        Row: {
          created_at: string
          id: string
          item_name: string
          notes: string | null
          quantity_needed: number
          ritual_name: string
          source_info: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          notes?: string | null
          quantity_needed?: number
          ritual_name: string
          source_info?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          notes?: string | null
          quantity_needed?: number
          ritual_name?: string
          source_info?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      seer_items: {
        Row: {
          category: string
          created_at: string
          delivery_date: string | null
          delivery_status: string
          id: string
          image_url: string | null
          item_name: string
          notes: string | null
          price_per_item: number | null
          quantity_bought: number
          quantity_needed: number
          total_cost: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          delivery_date?: string | null
          delivery_status?: string
          id?: string
          image_url?: string | null
          item_name: string
          notes?: string | null
          price_per_item?: number | null
          quantity_bought?: number
          quantity_needed?: number
          total_cost?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          delivery_date?: string | null
          delivery_status?: string
          id?: string
          image_url?: string | null
          item_name?: string
          notes?: string | null
          price_per_item?: number | null
          quantity_bought?: number
          quantity_needed?: number
          total_cost?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      tamil_ceremonies: {
        Row: {
          ceremony_date: string | null
          ceremony_name: string
          ceremony_time: string | null
          created_at: string
          family_roles: string | null
          id: string
          items_needed: string | null
          notes: string | null
          temple_info: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          ceremony_date?: string | null
          ceremony_name: string
          ceremony_time?: string | null
          created_at?: string
          family_roles?: string | null
          id?: string
          items_needed?: string | null
          notes?: string | null
          temple_info?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          ceremony_date?: string | null
          ceremony_name?: string
          ceremony_time?: string | null
          created_at?: string
          family_roles?: string | null
          id?: string
          items_needed?: string | null
          notes?: string | null
          temple_info?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string
          category: string
          created_at: string
          description: string | null
          due_date: string
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          category: string
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          category?: string
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          agreed_price: number | null
          booking_notes: string | null
          category: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          name: string
          payment_status: string
          updated_at: string
        }
        Insert: {
          agreed_price?: number | null
          booking_notes?: string | null
          category: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name: string
          payment_status?: string
          updated_at?: string
        }
        Update: {
          agreed_price?: number | null
          booking_notes?: string | null
          category?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name?: string
          payment_status?: string
          updated_at?: string
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
    Enums: {},
  },
} as const
