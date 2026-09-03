export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Standalone alias for the `orders` row shape, used by RPC Returns types
// below since the Functions block can't self-reference the Database type
// it's nested inside.
type OrderRow = {
  company_id: string
  created_at: string
  customer_id: string
  delivered_at: string | null
  delivery_address: Json | null
  delivery_fee: number
  delivery_partner_id: string | null
  discount_total: number
  id: string
  notes: string | null
  payment_method: string | null
  payment_status: string | null
  status: string
  subtotal: number
  total: number
  updated_at: string
}

type DeliveryPartnerRow = {
  approved_at: string | null
  approved_by: string | null
  created_at: string
  current_lat: number | null
  current_lng: number | null
  is_online: boolean
  last_location_at: string | null
  rating_avg: number | null
  rating_count: number
  rejection_reason: string | null
  status: string
  updated_at: string
  user_id: string
  vehicle_plate: string | null
  vehicle_type: string | null
}

type ReviewRow = {
  comment: string | null
  created_at: string
  id: string
  order_id: string
  rating: number
  reviewer_id: string
  target_id: string
  target_type: string
  updated_at: string
}

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          accepted_payment_methods: string[]
          avg_prep_time_minutes: number | null
          category: string | null
          city: string | null
          cnpj: string | null
          cover_image_url: string | null
          cpf: string | null
          created_at: string
          delivered_orders_count: number
          delivery_fee_base: number
          delivery_preference: string
          delivery_radius_km: number | null
          description: string | null
          id: string
          is_open: boolean
          lat: number | null
          lng: number | null
          logo_url: string | null
          mercadopago_user_id: string | null
          min_order_value: number
          name: string
          neighborhood: string | null
          number: string | null
          owner_id: string
          phone: string | null
          postal_code: string | null
          preferred_delivery_partner_id: string | null
          rating_avg: number | null
          rating_count: number
          slug: string
          state: string | null
          status: string
          street: string | null
          updated_at: string
          view_count: number
        }
        Insert: {
          accepted_payment_methods?: string[]
          avg_prep_time_minutes?: number | null
          category?: string | null
          city?: string | null
          cnpj?: string | null
          cover_image_url?: string | null
          cpf?: string | null
          created_at?: string
          delivered_orders_count?: number
          delivery_fee_base?: number
          delivery_preference?: string
          delivery_radius_km?: number | null
          description?: string | null
          id?: string
          is_open?: boolean
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          mercadopago_user_id?: string | null
          min_order_value?: number
          name: string
          neighborhood?: string | null
          number?: string | null
          owner_id: string
          phone?: string | null
          postal_code?: string | null
          preferred_delivery_partner_id?: string | null
          rating_avg?: number | null
          rating_count?: number
          slug: string
          state?: string | null
          status?: string
          street?: string | null
          updated_at?: string
          view_count?: number
        }
        Update: {
          accepted_payment_methods?: string[]
          avg_prep_time_minutes?: number | null
          category?: string | null
          city?: string | null
          cnpj?: string | null
          cover_image_url?: string | null
          cpf?: string | null
          created_at?: string
          delivered_orders_count?: number
          delivery_fee_base?: number
          delivery_preference?: string
          delivery_radius_km?: number | null
          description?: string | null
          id?: string
          is_open?: boolean
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          mercadopago_user_id?: string | null
          min_order_value?: number
          name?: string
          neighborhood?: string | null
          number?: string | null
          owner_id?: string
          phone?: string | null
          postal_code?: string | null
          preferred_delivery_partner_id?: string | null
          rating_avg?: number | null
          rating_count?: number
          slug?: string
          state?: string | null
          status?: string
          street?: string | null
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_preferred_delivery_partner_id_fkey"
            columns: ["preferred_delivery_partner_id"]
            isOneToOne: false
            referencedRelation: "delivery_partners"
            referencedColumns: ["user_id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          invited_by: string | null
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          invited_by?: string | null
          role: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          invited_by?: string | null
          role?: string
          status?: string
          updated_at?: string
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
          {
            foreignKeyName: "company_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_business_hours: {
        Row: {
          closes_at: string | null
          company_id: string
          created_at: string
          day_of_week: number
          id: string
          is_closed: boolean
          opens_at: string | null
          updated_at: string
        }
        Insert: {
          closes_at?: string | null
          company_id: string
          created_at?: string
          day_of_week: number
          id?: string
          is_closed?: boolean
          opens_at?: string | null
          updated_at?: string
        }
        Update: {
          closes_at?: string | null
          company_id?: string
          created_at?: string
          day_of_week?: number
          id?: string
          is_closed?: boolean
          opens_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_business_hours_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_partner_documents: {
        Row: {
          created_at: string
          delivery_partner_id: string
          doc_type: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          delivery_partner_id: string
          doc_type: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_path: string
        }
        Update: {
          created_at?: string
          delivery_partner_id?: string
          doc_type?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_partner_documents_delivery_partner_id_fkey"
            columns: ["delivery_partner_id"]
            isOneToOne: false
            referencedRelation: "delivery_partners"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "delivery_partner_documents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_partners: {
        Row: DeliveryPartnerRow
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          is_online?: boolean
          last_location_at?: string | null
          rating_avg?: number | null
          rating_count?: number
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          user_id: string
          vehicle_plate?: string | null
          vehicle_type?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          is_online?: boolean
          last_location_at?: string | null
          rating_avg?: number | null
          rating_count?: number
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          vehicle_plate?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_partners_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_partners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          company_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string
          discount_amount: number
          id: string
          order_id: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string
          discount_amount: number
          id?: string
          order_id: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string
          discount_amount?: number
          id?: string
          order_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          company_id: string | null
          created_at: string
          created_by: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          max_uses_per_user: number | null
          min_order_value: number
          promo_type: string
          uses_count: number
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          max_uses_per_user?: number | null
          min_order_value?: number
          promo_type?: string
          uses_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          max_uses_per_user?: number | null
          min_order_value?: number
          promo_type?: string
          uses_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_verifications: {
        Row: {
          created_at: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_verifications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      login_qr_requests: {
        Row: {
          created_at: string
          expires_at: string
          redeemed: boolean
          status: string
          token: string
          token_hash: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          redeemed?: boolean
          status?: string
          token?: string
          token_hash?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          redeemed?: boolean
          status?: string
          token?: string
          token_hash?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "login_qr_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_addon_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          menu_item_id: string
          min_select: number
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          menu_item_id: string
          min_select?: number
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          menu_item_id?: string
          min_select?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_addon_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_addon_categories_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_addons: {
        Row: {
          addon_item_id: string
          created_at: string
          menu_item_id: string
        }
        Insert: {
          addon_item_id: string
          created_at?: string
          menu_item_id: string
        }
        Update: {
          addon_item_id?: string
          created_at?: string
          menu_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_addons_addon_item_id_fkey"
            columns: ["addon_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_addons_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_images: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_images_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_option_groups: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          max_select: number
          menu_item_id: string
          min_select: number
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          max_select?: number
          menu_item_id: string
          min_select?: number
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          max_select?: number
          menu_item_id?: string
          min_select?: number
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_option_groups_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_options: {
        Row: {
          created_at: string
          id: string
          is_available: boolean
          name: string
          option_group_id: string
          price_delta: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean
          name: string
          option_group_id: string
          price_delta?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean
          name?: string
          option_group_id?: string
          price_delta?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_options_option_group_id_fkey"
            columns: ["option_group_id"]
            isOneToOne: false
            referencedRelation: "menu_item_option_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category_id: string | null
          company_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          name: string
          price: number
          show_as_addon: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          name: string
          price: number
          show_as_addon?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          name?: string
          price?: number
          show_as_addon?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          item_name: string
          menu_item_id: string | null
          order_id: string
          quantity: number
          selected_options: Json | null
          subtotal: number
          unit_price: number
        }
        Insert: {
          id?: string
          item_name: string
          menu_item_id?: string | null
          order_id: string
          quantity: number
          selected_options?: Json | null
          subtotal: number
          unit_price: number
        }
        Update: {
          id?: string
          item_name?: string
          menu_item_id?: string | null
          order_id?: string
          quantity?: number
          selected_options?: Json | null
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_reports: {
        Row: {
          created_at: string
          id: string
          message: string
          order_id: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          order_id: string
          status?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          order_id?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_reports_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          note: string | null
          order_id: string
          status: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          note?: string | null
          order_id: string
          status: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          note?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: OrderRow
        Insert: {
          company_id: string
          created_at?: string
          customer_id: string
          delivered_at?: string | null
          delivery_address?: Json | null
          delivery_fee?: number
          delivery_partner_id?: string | null
          discount_total?: number
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          status?: string
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          customer_id?: string
          delivered_at?: string | null
          delivery_address?: Json | null
          delivery_fee?: number
          delivery_partner_id?: string | null
          discount_total?: number
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_partner_id_fkey"
            columns: ["delivery_partner_id"]
            isOneToOne: false
            referencedRelation: "delivery_partners"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payment_splits: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_id: string
          provider_transfer_id: string | null
          recipient_id: string | null
          recipient_type: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_id: string
          provider_transfer_id?: string | null
          recipient_id?: string | null
          recipient_type: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_id?: string
          provider_transfer_id?: string | null
          recipient_id?: string | null
          recipient_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_splits_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string | null
          order_id: string
          provider: string
          provider_payment_id: string | null
          raw_payload: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method?: string | null
          order_id: string
          provider: string
          provider_payment_id?: string | null
          raw_payload?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string | null
          order_id?: string
          provider?: string
          provider_payment_id?: string | null
          raw_payload?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string
          default_payment_method: string | null
          full_name: string
          id: string
          phone: string | null
          recovery_email: string | null
          recovery_requested_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          default_payment_method?: string | null
          full_name?: string
          id: string
          phone?: string | null
          recovery_email?: string | null
          recovery_requested_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          default_payment_method?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          recovery_email?: string | null
          recovery_requested_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          order_id: string
          rating: number
          reviewer_id: string
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id: string
          rating: number
          reviewer_id: string
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string
          rating?: number
          reviewer_id?: string
          target_id?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_addresses: {
        Row: {
          city: string
          complement: string | null
          created_at: string
          id: string
          is_default: boolean
          label: string | null
          lat: number | null
          lng: number | null
          neighborhood: string | null
          number: string | null
          postal_code: string | null
          state: string
          street: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          complement?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          lat?: number | null
          lng?: number | null
          neighborhood?: string | null
          number?: string | null
          postal_code?: string | null
          state: string
          street: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          complement?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          lat?: number | null
          lng?: number | null
          neighborhood?: string | null
          number?: string | null
          postal_code?: string | null
          state?: string
          street?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_order: {
        Args: { p_order_id: string }
        Returns: OrderRow
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      approve_delivery_partner: {
        Args: { p_user_id: string }
        Returns: DeliveryPartnerRow
        SetofOptions: {
          from: "*"
          to: "delivery_partners"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      assign_delivery_partner: {
        Args: { p_order_id: string }
        Returns: OrderRow
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cancel_order: {
        Args: { p_order_id: string; p_reason?: string }
        Returns: OrderRow
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      company_is_visible: { Args: { p_company_id: string }; Returns: boolean }
      company_role: { Args: { p_company_id: string }; Returns: string }
      create_order: {
        Args: {
          p_company_id: string
          p_coupon_code?: string
          p_delivery_address: Json
          p_items: Json
          p_notes?: string
          p_payment_method?: string
        }
        Returns: OrderRow
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_company: {
        Args: {
          p_cnpj?: string
          p_cpf?: string
          p_description?: string
          p_name: string
          p_phone?: string
          p_slug: string
        }
        Returns: {
          avg_prep_time_minutes: number | null
          city: string | null
          cnpj: string | null
          cover_image_url: string | null
          cpf: string | null
          created_at: string
          delivery_fee_base: number
          delivery_radius_km: number | null
          description: string | null
          id: string
          is_open: boolean
          lat: number | null
          lng: number | null
          logo_url: string | null
          min_order_value: number
          name: string
          neighborhood: string | null
          number: string | null
          owner_id: string
          phone: string | null
          postal_code: string | null
          rating_avg: number | null
          rating_count: number
          slug: string
          state: string | null
          status: string
          street: string | null
          updated_at: string
        }
      }
      create_qr_login_request: { Args: never; Returns: string }
      get_company_queue_info: {
        Args: { p_company_ids: string[] }
        Returns: { avg_minutes: number | null; company_id: string; has_queue: boolean }[]
      }
      get_company_sales_over_time: {
        Args: { p_company_id: string; p_days?: number }
        Returns: { day: string; order_count: number; revenue: number }[]
      }
      get_company_top_products: {
        Args: { p_company_id: string; p_days?: number; p_limit?: number; p_offset?: number }
        Returns: { item_name: string; total_quantity: number; total_revenue: number }[]
      }
      get_company_payment_method_usage: {
        Args: { p_company_id: string; p_days?: number }
        Returns: { order_count: number; payment_method: string; revenue: number }[]
      }
      get_best_selling_items_for_companies: {
        Args: { p_company_ids: string[]; p_limit_per_company?: number }
        Returns: { company_id: string; menu_item_id: string; rnk: number; total_quantity: number }[]
      }
      get_delivery_partner_name: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_qr_login_status: {
        Args: { p_token: string }
        Returns: { status: string; token_hash: string | null }[]
      }
      is_approved_delivery_partner: { Args: never; Returns: boolean }
      is_company_member: { Args: { p_company_id: string }; Returns: boolean }
      is_company_owner: { Args: { p_company_id: string }; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      increment_company_view: {
        Args: { p_company_id: string }
        Returns: undefined
      }
      mark_delivered: {
        Args: { p_order_id: string }
        Returns: OrderRow
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_order_paid: {
        Args: {
          p_amount: number
          p_method: string
          p_order_id: string
          p_provider: string
          p_provider_payment_id: string
          p_raw_payload: Json
          p_status: string
        }
        Returns: OrderRow
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_picked_up: {
        Args: { p_order_id: string }
        Returns: OrderRow
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_preparing: {
        Args: { p_order_id: string }
        Returns: OrderRow
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_ready: {
        Args: { p_order_id: string }
        Returns: OrderRow
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      find_delivery_partner_by_email: {
        Args: { p_email: string }
        Returns: {
          full_name: string
          user_id: string
        }[]
      }
      menu_item_company_id: {
        Args: { p_menu_item_id: string }
        Returns: string
      }
      notify_preferred_delivery_partner: {
        Args: { p_order_id: string }
        Returns: undefined
      }
      notify_user: {
        Args: {
          p_body?: string
          p_data?: Json
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      option_group_company_id: {
        Args: { p_option_group_id: string }
        Returns: string
      }
      order_visible: { Args: { p_order_id: string }; Returns: boolean }
      reject_delivery_partner: {
        Args: { p_reason?: string; p_user_id: string }
        Returns: DeliveryPartnerRow
        SetofOptions: {
          from: "*"
          to: "delivery_partners"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reject_order: {
        Args: { p_order_id: string; p_reason?: string }
        Returns: OrderRow
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_review: {
        Args: {
          p_comment?: string
          p_order_id: string
          p_rating: number
          p_target_type: string
        }
        Returns: ReviewRow
        SetofOptions: {
          from: "*"
          to: "reviews"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      validate_coupon: {
        Args: { p_code: string; p_company_id: string; p_subtotal: number }
        Returns: { discount_amount: number; message: string; valid: boolean }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<
  DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"]),
> = (DefaultSchema["Tables"] &
  DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
  Row: infer R
}
  ? R
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
  Insert: infer I
}
  ? I
  : never
