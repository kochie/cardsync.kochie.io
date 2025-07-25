export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      carddav_addressbooks: {
        Row: {
          connection_id: string
          created_at: string
          display_name: string | null
          id: string
          url: string
          user_id: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          display_name?: string | null
          id?: string
          url: string
          user_id?: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          display_name?: string | null
          id?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carddav_addressbooks_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "carddav_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      carddav_connections: {
        Row: {
          address_book_path: string
          contact_count: number
          created_at: string
          description: string
          id: string
          last_synced: string | null
          name: string
          password: string
          server: string
          status: string
          sync_all_contacts: boolean
          sync_frequency: string
          sync_groups: boolean
          sync_photos: boolean
          use_ssl: boolean
          user_id: string | null
          username: string
        }
        Insert: {
          address_book_path?: string
          contact_count?: number
          created_at?: string
          description?: string
          id?: string
          last_synced?: string | null
          name?: string
          password?: string
          server?: string
          status?: string
          sync_all_contacts?: boolean
          sync_frequency?: string
          sync_groups?: boolean
          sync_photos?: boolean
          use_ssl?: boolean
          user_id?: string | null
          username?: string
        }
        Update: {
          address_book_path?: string
          contact_count?: number
          created_at?: string
          description?: string
          id?: string
          last_synced?: string | null
          name?: string
          password?: string
          server?: string
          status?: string
          sync_all_contacts?: boolean
          sync_frequency?: string
          sync_groups?: boolean
          sync_photos?: boolean
          use_ssl?: boolean
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      carddav_contacts: {
        Row: {
          address_book: string
          addresses: string[]
          birth_date: string | null
          company: string | null
          created_at: string
          emails: string[]
          hidden: boolean
          id: string
          id_is_uppercase: boolean | null
          instagram_id: string | null
          last_updated: string
          linkedin_id: string | null
          name: string | null
          notes: string[] | null
          other: Json | null
          phones: string[]
          photo_blur_url: string | null
          role: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          address_book: string
          addresses: string[]
          birth_date?: string | null
          company?: string | null
          created_at?: string
          emails: string[]
          hidden?: boolean
          id?: string
          id_is_uppercase?: boolean | null
          instagram_id?: string | null
          last_updated: string
          linkedin_id?: string | null
          name?: string | null
          notes?: string[] | null
          other?: Json | null
          phones: string[]
          photo_blur_url?: string | null
          role?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          address_book?: string
          addresses?: string[]
          birth_date?: string | null
          company?: string | null
          created_at?: string
          emails?: string[]
          hidden?: boolean
          id?: string
          id_is_uppercase?: boolean | null
          instagram_id?: string | null
          last_updated?: string
          linkedin_id?: string | null
          name?: string | null
          notes?: string[] | null
          other?: Json | null
          phones?: string[]
          photo_blur_url?: string | null
          role?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carddav_contacts_address_book_fkey"
            columns: ["address_book"]
            isOneToOne: false
            referencedRelation: "carddav_addressbooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carddav_contacts_instagram_id_fkey"
            columns: ["instagram_id"]
            isOneToOne: false
            referencedRelation: "instagram_contacts"
            referencedColumns: ["internal_id"]
          },
          {
            foreignKeyName: "carddav_contacts_linkedin_id_fkey"
            columns: ["linkedin_id"]
            isOneToOne: false
            referencedRelation: "linkedin_contacts"
            referencedColumns: ["internal_id"]
          },
        ]
      }
      carddav_group_members: {
        Row: {
          address_book: string
          group_id: string
          member_id: string
          user_id: string
        }
        Insert: {
          address_book: string
          group_id: string
          member_id: string
          user_id?: string
        }
        Update: {
          address_book?: string
          group_id?: string
          member_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carddav_group_members_member_id_address_book_fkey"
            columns: ["member_id", "address_book"]
            isOneToOne: false
            referencedRelation: "carddav_contacts"
            referencedColumns: ["id", "address_book"]
          },
          {
            foreignKeyName: "group_members_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "carddav_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      carddav_groups: {
        Row: {
          address_book: string
          created_at: string
          description: string | null
          id: string
          id_is_uppercase: boolean
          name: string | null
          readonly: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          address_book: string
          created_at?: string
          description?: string | null
          id?: string
          id_is_uppercase: boolean
          name?: string | null
          readonly?: boolean
          updated_at?: string
          user_id?: string
        }
        Update: {
          address_book?: string
          created_at?: string
          description?: string | null
          id?: string
          id_is_uppercase?: boolean
          name?: string | null
          readonly?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_address_book_fkey"
            columns: ["address_book"]
            isOneToOne: false
            referencedRelation: "carddav_addressbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_connections: {
        Row: {
          cookies: string
          created_at: string
          follower_count: number
          following_count: number
          id: string
          instagram_id: string
          last_synced: string | null
          name: string
          session_id: string
          status: string
          sync_frequency: string
          user_id: string
          username: string
        }
        Insert: {
          cookies: string
          created_at?: string
          follower_count?: number
          following_count?: number
          id?: string
          instagram_id?: string
          last_synced?: string | null
          name: string
          session_id: string
          status?: string
          sync_frequency?: string
          user_id?: string
          username: string
        }
        Update: {
          cookies?: string
          created_at?: string
          follower_count?: number
          following_count?: number
          id?: string
          instagram_id?: string
          last_synced?: string | null
          name?: string
          session_id?: string
          status?: string
          sync_frequency?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      instagram_contacts: {
        Row: {
          connection_id: string
          created_at: string
          followed_by_viewer: boolean
          follower_count: number
          following_count: number
          follows_viewer: boolean
          full_name: string | null
          internal_id: string
          is_private: boolean
          is_verified: boolean
          last_synced: string | null
          mutual_followers: string[]
          profile_picture: string | null
          requested_by_viewer: boolean
          user_id: string | null
          user_id_instagram: string
          username: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          followed_by_viewer?: boolean
          follower_count?: number
          following_count?: number
          follows_viewer?: boolean
          full_name?: string | null
          internal_id?: string
          is_private?: boolean
          is_verified?: boolean
          last_synced?: string | null
          mutual_followers?: string[]
          profile_picture?: string | null
          requested_by_viewer?: boolean
          user_id?: string | null
          user_id_instagram: string
          username: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          followed_by_viewer?: boolean
          follower_count?: number
          following_count?: number
          follows_viewer?: boolean
          full_name?: string | null
          internal_id?: string
          is_private?: boolean
          is_verified?: boolean
          last_synced?: string | null
          mutual_followers?: string[]
          profile_picture?: string | null
          requested_by_viewer?: boolean
          user_id?: string | null
          user_id_instagram?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "instagram_contacts_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "instagram_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      linkedin_connections: {
        Row: {
          cookies: string
          created_at: string
          id: string
          last_synced: string | null
          name: string
          number_contacts: number
          session_id: string
          status: string
          sync_frequency: string
          user_id: string
        }
        Insert: {
          cookies: string
          created_at?: string
          id?: string
          last_synced?: string | null
          name: string
          number_contacts?: number
          session_id: string
          status?: string
          sync_frequency?: string
          user_id?: string
        }
        Update: {
          cookies?: string
          created_at?: string
          id?: string
          last_synced?: string | null
          name?: string
          number_contacts?: number
          session_id?: string
          status?: string
          sync_frequency?: string
          user_id?: string
        }
        Relationships: []
      }
      linkedin_contacts: {
        Row: {
          connection_id: string
          created_at: string
          entity_urn: string
          extended_data: Json | null
          first_name: string | null
          full_name: string | null
          headline: string | null
          internal_id: string
          last_name: string | null
          last_synced: string | null
          profile_picture: string | null
          public_identifier: string | null
          user_id: string | null
        }
        Insert: {
          connection_id: string
          created_at?: string
          entity_urn: string
          extended_data?: Json | null
          first_name?: string | null
          full_name?: string | null
          headline?: string | null
          internal_id?: string
          last_name?: string | null
          last_synced?: string | null
          profile_picture?: string | null
          public_identifier?: string | null
          user_id?: string | null
        }
        Update: {
          connection_id?: string
          created_at?: string
          entity_urn?: string
          extended_data?: Json | null
          first_name?: string | null
          full_name?: string | null
          headline?: string | null
          internal_id?: string
          last_name?: string | null
          last_synced?: string | null
          profile_picture?: string | null
          public_identifier?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "linkedin_contacts_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "linkedin_connections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_instagram_by_name: {
        Args: { p_connection_id: string }
        Returns: number
      }
      match_linkedin_by_name: {
        Args: { p_connection_id: string }
        Returns: number
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

