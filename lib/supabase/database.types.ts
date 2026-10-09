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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          archived_at: string | null
          balance_due: number
          city: string | null
          contact_name: string | null
          country: string
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          rccm: string | null
          tax_id: string | null
          total_billed: number
          total_paid: number
        }
        Insert: {
          address?: string | null
          archived_at?: string | null
          balance_due?: number
          city?: string | null
          contact_name?: string | null
          country?: string
          created_at?: string
          email?: string | null
          id: string
          name: string
          notes?: string | null
          phone?: string | null
          rccm?: string | null
          tax_id?: string | null
          total_billed?: number
          total_paid?: number
        }
        Update: {
          address?: string | null
          archived_at?: string | null
          balance_due?: number
          city?: string | null
          contact_name?: string | null
          country?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          rccm?: string | null
          tax_id?: string | null
          total_billed?: number
          total_paid?: number
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: Database["public"]["Enums"]["credit_reason"]
          ref_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason: Database["public"]["Enums"]["credit_reason"]
          ref_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: Database["public"]["Enums"]["credit_reason"]
          ref_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      easylead_payments: {
        Row: {
          amount: number
          created_at: string
          credits: number
          currency: string
          id: string
          pack_id: string
          phone_number: string | null
          provider: string
          provider_tx_id: string
          raw: Json | null
          status: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          credits: number
          currency?: string
          id?: string
          pack_id: string
          phone_number?: string | null
          provider?: string
          provider_tx_id: string
          raw?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          credits?: number
          currency?: string
          id?: string
          pack_id?: string
          phone_number?: string | null
          provider?: string
          provider_tx_id?: string
          raw?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          description: string
          id: string
          invoice_id: string
          line_subtotal: number
          line_tax: number
          position: number
          product_id: string | null
          quantity: number
          tax_rate: number
          unit_price: number
        }
        Insert: {
          description: string
          id: string
          invoice_id: string
          line_subtotal?: number
          line_tax?: number
          position?: number
          product_id?: string | null
          quantity?: number
          tax_rate?: number
          unit_price?: number
        }
        Update: {
          description?: string
          id?: string
          invoice_id?: string
          line_subtotal?: number
          line_tax?: number
          position?: number
          product_id?: string | null
          quantity?: number
          tax_rate?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          balance_due: number
          client_address: string | null
          client_city: string | null
          client_email: string | null
          client_id: string
          client_name: string
          client_phone: string | null
          created_at: string
          discount_amount: number
          discount_type: string | null
          discount_value: number | null
          due_date: string
          id: string
          issue_date: string
          notes: string | null
          number: string
          quote_id: string | null
          status: string
          subtotal: number
          tax_total: number
          terms: string | null
          total: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          balance_due?: number
          client_address?: string | null
          client_city?: string | null
          client_email?: string | null
          client_id: string
          client_name: string
          client_phone?: string | null
          created_at?: string
          discount_amount?: number
          discount_type?: string | null
          discount_value?: number | null
          due_date: string
          id: string
          issue_date: string
          notes?: string | null
          number: string
          quote_id?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          terms?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          balance_due?: number
          client_address?: string | null
          client_city?: string | null
          client_email?: string | null
          client_id?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string
          discount_amount?: number
          discount_type?: string | null
          discount_value?: number | null
          due_date?: string
          id?: string
          issue_date?: string
          notes?: string | null
          number?: string
          quote_id?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          terms?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          country_code: string | null
          created_at: string
          email: string | null
          id: string
          lat: number | null
          lng: number | null
          maps_url: string | null
          name: string
          notes: string | null
          phone: string | null
          phone_e164: string | null
          place_id: string | null
          rating: number | null
          raw: Json | null
          reviews_count: number | null
          search_id: string
          socials: Json | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          maps_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          phone_e164?: string | null
          place_id?: string | null
          rating?: number | null
          raw?: Json | null
          reviews_count?: number | null
          search_id: string
          socials?: Json | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          maps_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          phone_e164?: string | null
          place_id?: string | null
          rating?: number | null
          raw?: Json | null
          reviews_count?: number | null
          search_id?: string
          socials?: Json | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "searches"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          channel: Database["public"]["Enums"]["message_channel"]
          created_at: string
          id: string
          language: string
          lead_id: string
          model: string | null
          subject: string | null
          tone: string
          user_id: string
        }
        Insert: {
          body: string
          channel: Database["public"]["Enums"]["message_channel"]
          created_at?: string
          id?: string
          language?: string
          lead_id: string
          model?: string | null
          subject?: string | null
          tone?: string
          user_id: string
        }
        Update: {
          body?: string
          channel?: Database["public"]["Enums"]["message_channel"]
          created_at?: string
          id?: string
          language?: string
          lead_id?: string
          model?: string | null
          subject?: string | null
          tone?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          address: string
          bank_rib: string
          city: string
          country: string
          created_at: string
          currency: string
          default_notes: string | null
          default_tax_rate: number
          default_terms: string | null
          email: string
          id: string
          invoice_prefix: string
          manager_name: string
          mtn_momo_phone: string
          name: string
          orange_money_phone: string
          payment_terms_days: number
          phone: string
          quote_prefix: string
          rccm: string
          tax_id: string
          updated_at: string
        }
        Insert: {
          address?: string
          bank_rib?: string
          city?: string
          country?: string
          created_at?: string
          currency?: string
          default_notes?: string | null
          default_tax_rate?: number
          default_terms?: string | null
          email?: string
          id?: string
          invoice_prefix?: string
          manager_name?: string
          mtn_momo_phone?: string
          name?: string
          orange_money_phone?: string
          payment_terms_days?: number
          phone?: string
          quote_prefix?: string
          rccm?: string
          tax_id?: string
          updated_at?: string
        }
        Update: {
          address?: string
          bank_rib?: string
          city?: string
          country?: string
          created_at?: string
          currency?: string
          default_notes?: string | null
          default_tax_rate?: number
          default_terms?: string | null
          email?: string
          id?: string
          invoice_prefix?: string
          manager_name?: string
          mtn_momo_phone?: string
          name?: string
          orange_money_phone?: string
          payment_terms_days?: number
          phone?: string
          quote_prefix?: string
          rccm?: string
          tax_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          method: string
          note: string | null
          paid_on: string
          reference: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          id: string
          invoice_id: string
          method: string
          note?: string | null
          paid_on: string
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          method?: string
          note?: string | null
          paid_on?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          tax_rate: number
          unit: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: string
          name: string
          tax_rate?: number
          unit?: string | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tax_rate?: number
          unit?: string | null
          unit_price?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          country_code: string | null
          created_at: string | null
          credits_balance: number | null
          default_language: string | null
          full_name: string | null
          id: string
          offer_description: string | null
          onboarded: boolean | null
          target_description: string | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          country_code?: string | null
          created_at?: string | null
          credits_balance?: number | null
          default_language?: string | null
          full_name?: string | null
          id: string
          offer_description?: string | null
          onboarded?: boolean | null
          target_description?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          country_code?: string | null
          created_at?: string | null
          credits_balance?: number | null
          default_language?: string | null
          full_name?: string | null
          id?: string
          offer_description?: string | null
          onboarded?: boolean | null
          target_description?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quote_items: {
        Row: {
          description: string
          id: string
          line_subtotal: number
          line_tax: number
          position: number
          product_id: string | null
          quantity: number
          quote_id: string
          tax_rate: number
          unit_price: number
        }
        Insert: {
          description: string
          id: string
          line_subtotal?: number
          line_tax?: number
          position?: number
          product_id?: string | null
          quantity?: number
          quote_id: string
          tax_rate?: number
          unit_price?: number
        }
        Update: {
          description?: string
          id?: string
          line_subtotal?: number
          line_tax?: number
          position?: number
          product_id?: string | null
          quantity?: number
          quote_id?: string
          tax_rate?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_address: string | null
          client_city: string | null
          client_email: string | null
          client_id: string
          client_name: string
          client_phone: string | null
          converted_invoice_id: string | null
          created_at: string
          discount_amount: number
          discount_type: string | null
          discount_value: number | null
          id: string
          issue_date: string
          notes: string | null
          number: string
          status: string
          subtotal: number
          tax_total: number
          terms: string | null
          total: number
          updated_at: string
          valid_until: string
        }
        Insert: {
          client_address?: string | null
          client_city?: string | null
          client_email?: string | null
          client_id: string
          client_name: string
          client_phone?: string | null
          converted_invoice_id?: string | null
          created_at?: string
          discount_amount?: number
          discount_type?: string | null
          discount_value?: number | null
          id: string
          issue_date: string
          notes?: string | null
          number: string
          status?: string
          subtotal?: number
          tax_total?: number
          terms?: string | null
          total?: number
          updated_at?: string
          valid_until: string
        }
        Update: {
          client_address?: string | null
          client_city?: string | null
          client_email?: string | null
          client_id?: string
          client_name?: string
          client_phone?: string | null
          converted_invoice_id?: string | null
          created_at?: string
          discount_amount?: number
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          issue_date?: string
          notes?: string | null
          number?: string
          status?: string
          subtotal?: number
          tax_total?: number
          terms?: string | null
          total?: number
          updated_at?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_invoices: {
        Row: {
          amount: number
          client_email: string | null
          client_name: string
          created_at: string
          description: string | null
          frequency: string
          id: string
          next_run_date: string
          start_date: string
          status: string
        }
        Insert: {
          amount?: number
          client_email?: string | null
          client_name: string
          created_at?: string
          description?: string | null
          frequency: string
          id: string
          next_run_date: string
          start_date: string
          status?: string
        }
        Update: {
          amount?: number
          client_email?: string | null
          client_name?: string
          created_at?: string
          description?: string | null
          frequency?: string
          id?: string
          next_run_date?: string
          start_date?: string
          status?: string
        }
        Relationships: []
      }
      searches: {
        Row: {
          apify_dataset_id: string | null
          apify_run_id: string | null
          city: string
          completed_at: string | null
          country_code: string
          created_at: string
          credits_charged: number
          credits_reserved: number
          enrich_contacts: boolean
          error: string | null
          id: string
          max_results: number
          results_count: number
          sector: string
          status: Database["public"]["Enums"]["search_status"]
          user_id: string
        }
        Insert: {
          apify_dataset_id?: string | null
          apify_run_id?: string | null
          city: string
          completed_at?: string | null
          country_code?: string
          created_at?: string
          credits_charged?: number
          credits_reserved?: number
          enrich_contacts?: boolean
          error?: string | null
          id?: string
          max_results?: number
          results_count?: number
          sector: string
          status?: Database["public"]["Enums"]["search_status"]
          user_id: string
        }
        Update: {
          apify_dataset_id?: string | null
          apify_run_id?: string | null
          city?: string
          completed_at?: string | null
          country_code?: string
          created_at?: string
          credits_charged?: number
          credits_reserved?: number
          enrich_contacts?: boolean
          error?: string | null
          id?: string
          max_results?: number
          results_count?: number
          sector?: string
          status?: Database["public"]["Enums"]["search_status"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: {
          p_amount: number
          p_reason: Database["public"]["Enums"]["credit_reason"]
          p_ref?: string
          p_user: string
        }
        Returns: number
      }
      debit_credits: {
        Args: {
          p_amount: number
          p_reason: Database["public"]["Enums"]["credit_reason"]
          p_ref?: string
          p_user: string
        }
        Returns: number
      }
    }
    Enums: {
      credit_reason:
        | "signup_bonus"
        | "purchase"
        | "search_reserve"
        | "search_refund"
        | "message"
        | "message_refund"
      lead_status: "new" | "contacted" | "replied" | "won" | "lost"
      message_channel: "whatsapp" | "email" | "call_script"
      payment_status: "pending" | "succeeded" | "failed"
      search_status:
        | "pending"
        | "running"
        | "ingesting"
        | "completed"
        | "failed"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      credit_reason: [
        "signup_bonus",
        "purchase",
        "search_reserve",
        "search_refund",
        "message",
        "message_refund",
      ],
      lead_status: ["new", "contacted", "replied", "won", "lost"],
      message_channel: ["whatsapp", "email", "call_script"],
      payment_status: ["pending", "succeeded", "failed"],
      search_status: ["pending", "running", "ingesting", "completed", "failed"],
    },
  },
} as const
