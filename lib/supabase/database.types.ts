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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      companies: {
        Row: {
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
        Insert: {
          avg_prep_time_minutes?: number | null
          city?: string | null
          cnpj?: string | null
          cover_image_url?: string | null
          cpf?: string | null
          created_at?: string
          delivery_fee_base?: number
          delivery_radius_km?: number | null
          description?: string | null
          id?: string
          is_open?: boolean
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          min_order_value?: number
          name: string
          neighborhood?: string | null
          number?: string | null
          owner_id: string
          phone?: string | null
          postal_code?: string | null
          rating_avg?: number | null
          rating_count?: number
          slug: string
          state?: string | null
          status?: string
          street?: string | null
          updated_at?: string
        }
        Update: {
          avg_prep_time_minutes?: number | null
          city?: string | null
          cnpj?: string | null
          cover_image_url?: string | null
          cpf?: string | null
          created_at?: string
          delivery_fee_base?: number
          delivery_radius_km?: number | null
          description?: string | null
          id?: string
          is_open?: boolean
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          min_order_value?: number
          name?: string
          neighborhood?: string | null
          number?: string | null
          owner_id?: string
          phone?: string | null
          postal_code?: string | null
          rating_avg?: number | null
          rating_count?: number
          slug?: string
          state?: string | null
          status?: string
          street?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
      orders: {
        Row: {
          company_id: string
          created_at: string
          customer_id: string
          delivered_at: string | null
          delivery_address: Json | null
          delivery_fee: number
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
        Insert: {
          company_id: string
          created_at?: string
          customer_id: string
          delivered_at?: string | null
          delivery_address?: Json | null
          delivery_fee?: number
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
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
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
      company_is_visible: { Args: { p_company_id: string }; Returns: boolean }
      company_role: { Args: { p_company_id: string }; Returns: string }
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
      is_company_member: { Args: { p_company_id: string }; Returns: boolean }
      is_company_owner: { Args: { p_company_id: string }; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      menu_item_company_id: {
        Args: { p_menu_item_id: string }
        Returns: string
      }
      option_group_company_id: {
        Args: { p_option_group_id: string }
        Returns: string
      }
      order_visible: { Args: { p_order_id: string }; Returns: boolean }
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
