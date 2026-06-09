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
      companies: {
        Row: {
          billing_email: string | null
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          billing_email?: string | null
          created_at?: string
          created_by: string
          id?: string
          name: string
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          billing_email?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_admin: boolean
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_admin?: boolean
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_admin?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_documents: {
        Row: {
          created_at: string
          doc_number: string | null
          doc_type: Database["public"]["Enums"]["doc_type"]
          driver_id: string
          expires_at: string | null
          file_url: string | null
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["doc_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          doc_number?: string | null
          doc_type: Database["public"]["Enums"]["doc_type"]
          driver_id: string
          expires_at?: string | null
          file_url?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          doc_number?: string | null
          doc_type?: Database["public"]["Enums"]["doc_type"]
          driver_id?: string
          expires_at?: string | null
          file_url?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string
          current_location: string | null
          full_name: string
          id: string
          is_online: boolean
          rating: number
          seats: number
          updated_at: string
          user_id: string
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_plate: string | null
        }
        Insert: {
          created_at?: string
          current_location?: string | null
          full_name: string
          id?: string
          is_online?: boolean
          rating?: number
          seats?: number
          updated_at?: string
          user_id: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
        }
        Update: {
          created_at?: string
          current_location?: string | null
          full_name?: string
          id?: string
          is_online?: boolean
          rating?: number
          seats?: number
          updated_at?: string
          user_id?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
        }
        Relationships: []
      }
      incidents: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          location: string | null
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          ride_request_id: string | null
          severity: Database["public"]["Enums"]["incident_severity"]
          status: Database["public"]["Enums"]["incident_status"]
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          location?: string | null
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          ride_request_id?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          location?: string | null
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          ride_request_id?: string | null
          severity?: Database["public"]["Enums"]["incident_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_ride_request_id_fkey"
            columns: ["ride_request_id"]
            isOneToOne: false
            referencedRelation: "ride_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_cents: number
          company_id: string | null
          created_at: string
          currency: string
          hosted_invoice_url: string | null
          id: string
          issued_at: string | null
          paid_at: string | null
          pdf_url: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id: string | null
          subscription_id: string | null
          tax_cents: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          company_id?: string | null
          created_at?: string
          currency?: string
          hosted_invoice_url?: string | null
          id?: string
          issued_at?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          tax_cents?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          company_id?: string | null
          created_at?: string
          currency?: string
          hosted_invoice_url?: string | null
          id?: string
          issued_at?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          tax_cents?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          ride_request_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          ride_request_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          ride_request_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_ride_request_id_fkey"
            columns: ["ride_request_id"]
            isOneToOne: false
            referencedRelation: "ride_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ride_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          ratee_id: string
          rater_id: string
          ride_request_id: string
          stars: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          ratee_id: string
          rater_id: string
          ride_request_id: string
          stars: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          ratee_id?: string
          rater_id?: string
          ride_request_id?: string
          stars?: number
        }
        Relationships: [
          {
            foreignKeyName: "ride_ratings_ride_request_id_fkey"
            columns: ["ride_request_id"]
            isOneToOne: false
            referencedRelation: "ride_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_requests: {
        Row: {
          created_at: string
          driver_id: string | null
          dropoff: string
          id: string
          notes: string | null
          passenger_id: string
          pickup: string
          status: Database["public"]["Enums"]["ride_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          driver_id?: string | null
          dropoff: string
          id?: string
          notes?: string | null
          passenger_id: string
          pickup: string
          status?: Database["public"]["Enums"]["ride_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          driver_id?: string | null
          dropoff?: string
          id?: string
          notes?: string | null
          passenger_id?: string
          pickup?: string
          status?: Database["public"]["Enums"]["ride_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_requests_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      route_clusters: {
        Row: {
          created_at: string
          currency: string
          days_of_week: number[]
          departure_time: string
          destination: string
          driver_id: string
          id: string
          is_published: boolean
          name: string
          origin: string
          price_cents: number
          seats_available: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          days_of_week?: number[]
          departure_time: string
          destination: string
          driver_id: string
          id?: string
          is_published?: boolean
          name: string
          origin: string
          price_cents?: number
          seats_available?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          days_of_week?: number[]
          departure_time?: string
          destination?: string
          driver_id?: string
          id?: string
          is_published?: boolean
          name?: string
          origin?: string
          price_cents?: number
          seats_available?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_clusters_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_routes: {
        Row: {
          created_at: string
          dropoff: string
          dropoff_lat: number | null
          dropoff_lng: number | null
          id: string
          label: string
          pickup: string
          pickup_lat: number | null
          pickup_lng: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dropoff: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          id?: string
          label: string
          pickup: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dropoff?: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          id?: string
          label?: string
          pickup?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_rides: {
        Row: {
          created_at: string
          dropoff: string
          id: string
          is_active: boolean
          notes: string | null
          pickup: string
          recurrence: Database["public"]["Enums"]["recurrence"]
          saved_route_id: string | null
          scheduled_for: string
          seats: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dropoff: string
          id?: string
          is_active?: boolean
          notes?: string | null
          pickup: string
          recurrence?: Database["public"]["Enums"]["recurrence"]
          saved_route_id?: string | null
          scheduled_for: string
          seats?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dropoff?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          pickup?: string
          recurrence?: Database["public"]["Enums"]["recurrence"]
          saved_route_id?: string | null
          scheduled_for?: string
          seats?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_rides_saved_route_id_fkey"
            columns: ["saved_route_id"]
            isOneToOne: false
            referencedRelation: "saved_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          description: string | null
          features: Json
          id: string
          interval: string
          is_active: boolean
          name: string
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json
          id?: string
          interval?: string
          is_active?: boolean
          name: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json
          id?: string
          interval?: string
          is_active?: boolean
          name?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          company_id: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: Database["public"]["Enums"]["sub_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean
          company_id?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: Database["public"]["Enums"]["sub_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean
          company_id?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: Database["public"]["Enums"]["sub_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
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
      vehicle_pings: {
        Row: {
          driver_id: string
          heading: number | null
          id: string
          lat: number
          lng: number
          recorded_at: string
          ride_request_id: string | null
          speed_kph: number | null
        }
        Insert: {
          driver_id: string
          heading?: number | null
          id?: string
          lat: number
          lng: number
          recorded_at?: string
          ride_request_id?: string | null
          speed_kph?: number | null
        }
        Update: {
          driver_id?: string
          heading?: number | null
          id?: string
          lat?: number
          lng?: number
          recorded_at?: string
          ride_request_id?: string | null
          speed_kph?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_pings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_pings_ride_request_id_fkey"
            columns: ["ride_request_id"]
            isOneToOne: false
            referencedRelation: "ride_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          description: string | null
          id: string
          metadata: Json
          ride_request_id: string | null
          status: Database["public"]["Enums"]["txn_status"]
          stripe_payment_intent_id: string | null
          type: Database["public"]["Enums"]["txn_type"]
          updated_at: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json
          ride_request_id?: string | null
          status?: Database["public"]["Enums"]["txn_status"]
          stripe_payment_intent_id?: string | null
          type: Database["public"]["Enums"]["txn_type"]
          updated_at?: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json
          ride_request_id?: string | null
          status?: Database["public"]["Enums"]["txn_status"]
          stripe_payment_intent_id?: string | null
          type?: Database["public"]["Enums"]["txn_type"]
          updated_at?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_ride_request_id_fkey"
            columns: ["ride_request_id"]
            isOneToOne: false
            referencedRelation: "ride_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance_cents: number
          created_at: string
          currency: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_cents?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_cents?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
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
      is_company_admin: {
        Args: { _company: string; _user: string }
        Returns: boolean
      }
      is_company_member: {
        Args: { _company: string; _user: string }
        Returns: boolean
      }
      is_ride_participant: {
        Args: { _ride: string; _user: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "driver" | "passenger" | "corporate_admin"
      doc_status: "pending" | "approved" | "rejected" | "expired"
      doc_type:
        | "drivers_license"
        | "prdp"
        | "vehicle_registration"
        | "vehicle_insurance"
        | "roadworthy"
        | "id_document"
        | "other"
      incident_severity: "low" | "medium" | "high" | "critical"
      incident_status: "open" | "investigating" | "resolved" | "dismissed"
      invoice_status: "draft" | "open" | "paid" | "void" | "uncollectible"
      recurrence: "once" | "daily" | "weekdays" | "weekly" | "monthly"
      ride_status:
        | "pending"
        | "accepted"
        | "declined"
        | "cancelled"
        | "completed"
      sub_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "unpaid"
      txn_status: "pending" | "completed" | "failed" | "cancelled"
      txn_type: "topup" | "ride_payment" | "payout" | "refund" | "adjustment"
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
      app_role: ["admin", "driver", "passenger", "corporate_admin"],
      doc_status: ["pending", "approved", "rejected", "expired"],
      doc_type: [
        "drivers_license",
        "prdp",
        "vehicle_registration",
        "vehicle_insurance",
        "roadworthy",
        "id_document",
        "other",
      ],
      incident_severity: ["low", "medium", "high", "critical"],
      incident_status: ["open", "investigating", "resolved", "dismissed"],
      invoice_status: ["draft", "open", "paid", "void", "uncollectible"],
      recurrence: ["once", "daily", "weekdays", "weekly", "monthly"],
      ride_status: [
        "pending",
        "accepted",
        "declined",
        "cancelled",
        "completed",
      ],
      sub_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "unpaid",
      ],
      txn_status: ["pending", "completed", "failed", "cancelled"],
      txn_type: ["topup", "ride_payment", "payout", "refund", "adjustment"],
    },
  },
} as const
