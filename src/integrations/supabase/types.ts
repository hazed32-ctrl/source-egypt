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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          device_type: string | null
          event_data: Json | null
          event_name: string
          id: string
          language: string | null
          page_title: string | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          event_data?: Json | null
          event_name: string
          id?: string
          language?: string | null
          page_title?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          event_data?: Json | null
          event_name?: string
          id?: string
          language?: string | null
          page_title?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      analytics_settings: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          file_path: string
          file_type: string | null
          id: string
          name: string
          property_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_path: string
          file_type?: string | null
          id?: string
          name: string
          property_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string
          file_type?: string | null
          id?: string
          name?: string
          property_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      heatmap_exclusions: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          route_pattern: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          route_pattern: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          route_pattern?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          agent_name: string | null
          area_sqm: number | null
          assigned_agent_id: string | null
          assigned_at: string | null
          assigned_by: string | null
          browser_language: string | null
          budget_max: number | null
          budget_min: number | null
          city: string | null
          created_at: string
          district: string | null
          email: string
          id: string
          is_converted: boolean | null
          landing_page: string | null
          last_events_summary: Json | null
          last_page_before_submit: string | null
          lead_device_type: string | null
          message: string | null
          name: string
          payment_preference: string | null
          phone: string | null
          property_id: string | null
          property_type: string | null
          referrer_domain: string | null
          session_id: string | null
          source: string | null
          status: string
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          agent_name?: string | null
          area_sqm?: number | null
          assigned_agent_id?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          browser_language?: string | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          created_at?: string
          district?: string | null
          email: string
          id?: string
          is_converted?: boolean | null
          landing_page?: string | null
          last_events_summary?: Json | null
          last_page_before_submit?: string | null
          lead_device_type?: string | null
          message?: string | null
          name: string
          payment_preference?: string | null
          phone?: string | null
          property_id?: string | null
          property_type?: string | null
          referrer_domain?: string | null
          session_id?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          agent_name?: string | null
          area_sqm?: number | null
          assigned_agent_id?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          browser_language?: string | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          created_at?: string
          district?: string | null
          email?: string
          id?: string
          is_converted?: boolean | null
          landing_page?: string | null
          last_events_summary?: Json | null
          last_page_before_submit?: string | null
          lead_device_type?: string | null
          message?: string | null
          name?: string
          payment_preference?: string | null
          phone?: string | null
          property_id?: string | null
          property_type?: string | null
          referrer_domain?: string | null
          session_id?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_cta: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean
          label_ar: string
          label_en: string
          menu_id: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean
          label_ar?: string
          label_en?: string
          menu_id: string
          updated_at?: string
          url?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean
          label_ar?: string
          label_en?: string
          menu_id?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "navigation_cta_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "navigation_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_items: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_mega_menu: boolean
          is_visible: boolean
          label_ar: string
          label_en: string
          menu_id: string
          open_in_new_tab: boolean
          parent_id: string | null
          roles_allowed: string[] | null
          sort_order: number
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_mega_menu?: boolean
          is_visible?: boolean
          label_ar: string
          label_en: string
          menu_id: string
          open_in_new_tab?: boolean
          parent_id?: string | null
          roles_allowed?: string[] | null
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_mega_menu?: boolean
          is_visible?: boolean
          label_ar?: string
          label_en?: string
          menu_id?: string
          open_in_new_tab?: boolean
          parent_id?: string | null
          roles_allowed?: string[] | null
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "navigation_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_menus: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          email_enabled: boolean
          id: string
          in_app_enabled: boolean
          notification_type: Database["public"]["Enums"]["notification_type"]
          recipient_roles: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          notification_type: Database["public"]["Enums"]["notification_type"]
          recipient_roles?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          notification_type?: Database["public"]["Enums"]["notification_type"]
          recipient_roles?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          entity_id: string | null
          entity_type:
            | Database["public"]["Enums"]["notification_entity_type"]
            | null
          id: string
          is_read: boolean
          metadata: Json | null
          recipient_user_id: string
          severity: Database["public"]["Enums"]["notification_severity"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?:
            | Database["public"]["Enums"]["notification_entity_type"]
            | null
          id?: string
          is_read?: boolean
          metadata?: Json | null
          recipient_user_id: string
          severity?: Database["public"]["Enums"]["notification_severity"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?:
            | Database["public"]["Enums"]["notification_entity_type"]
            | null
          id?: string
          is_read?: boolean
          metadata?: Json | null
          recipient_user_id?: string
          severity?: Database["public"]["Enums"]["notification_severity"]
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          assigned_agent_id: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_agent_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_agent_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          area: number | null
          assigned_user_id: string | null
          baths: number | null
          beds: number | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          price: number | null
          price_delta_percent: number | null
          progress_percent: number | null
          progress_status: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          area?: number | null
          assigned_user_id?: string | null
          baths?: number | null
          beds?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          price?: number | null
          price_delta_percent?: number | null
          progress_percent?: number | null
          progress_status?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          area?: number | null
          assigned_user_id?: string | null
          baths?: number | null
          beds?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          price?: number | null
          price_delta_percent?: number | null
          progress_percent?: number | null
          progress_status?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      property_photos: {
        Row: {
          created_at: string
          file_path: string
          id: string
          note: string | null
          property_id: string
          taken_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_path: string
          id?: string
          note?: string | null
          property_id: string
          taken_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string
          id?: string
          note?: string | null
          property_id?: string
          taken_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_photos_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link: string | null
          sort_order: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resale_requests: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          property_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          property_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          property_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resale_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      session_events: {
        Row: {
          created_at: string
          entity_id: string | null
          event_name: string
          id: string
          meta: Json | null
          page_path: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          event_name: string
          id?: string
          meta?: Json | null
          page_path?: string | null
          session_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          event_name?: string
          id?: string
          meta?: Json | null
          page_path?: string | null
          session_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
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
          role?: Database["public"]["Enums"]["app_role"]
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
      cleanup_old_session_events: { Args: never; Returns: undefined }
      create_notification: {
        Args: {
          p_body: string
          p_entity_id?: string
          p_entity_type?: Database["public"]["Enums"]["notification_entity_type"]
          p_metadata?: Json
          p_recipient_user_id: string
          p_severity?: Database["public"]["Enums"]["notification_severity"]
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
        }
        Returns: string
      }
      get_property_progress: { Args: { status: string }; Returns: number }
      get_unread_notification_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "client"
        | "sales_agent"
        | "sales_manager"
        | "marketer"
      notification_entity_type:
        | "lead"
        | "property"
        | "document"
        | "message"
        | "resale_request"
        | "booking"
      notification_severity: "info" | "success" | "warning" | "critical"
      notification_type:
        | "lead_created"
        | "lead_assigned"
        | "document_added"
        | "resale_request"
        | "message_received"
        | "property_status_changed"
        | "booking_request"
        | "agent_submission_approved"
        | "agent_submission_rejected"
      property_progress_status:
        | "off_plan"
        | "ready_to_deliver"
        | "ready_to_live"
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
      app_role: ["admin", "client", "sales_agent", "sales_manager", "marketer"],
      notification_entity_type: [
        "lead",
        "property",
        "document",
        "message",
        "resale_request",
        "booking",
      ],
      notification_severity: ["info", "success", "warning", "critical"],
      notification_type: [
        "lead_created",
        "lead_assigned",
        "document_added",
        "resale_request",
        "message_received",
        "property_status_changed",
        "booking_request",
        "agent_submission_approved",
        "agent_submission_rejected",
      ],
      property_progress_status: [
        "off_plan",
        "ready_to_deliver",
        "ready_to_live",
      ],
    },
  },
} as const
