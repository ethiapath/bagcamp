export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      artists: {
        Row: {
          bio: string | null
          created_at: string
          genres: string[] | null
          id: string
          location: string | null
          name: string
          profile_image_url: string | null
          social_links: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          genres?: string[] | null
          id?: string
          location?: string | null
          name: string
          profile_image_url?: string | null
          social_links?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          genres?: string[] | null
          id?: string
          location?: string | null
          name?: string
          profile_image_url?: string | null
          social_links?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      merchandise: {
        Row: {
          artist_id: string
          created_at: string
          description: string | null
          has_variations: boolean
          id: string
          image_url: string | null
          inventory_count: number | null
          physical: boolean
          price: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          description?: string | null
          has_variations?: boolean
          id?: string
          image_url?: string | null
          inventory_count?: number | null
          physical?: boolean
          price: number
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          description?: string | null
          has_variations?: boolean
          id?: string
          image_url?: string | null
          inventory_count?: number | null
          physical?: boolean
          price?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchandise_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          }
        ]
      }
      merchandise_variations: {
        Row: {
          attribute_name: string
          attribute_value: string
          created_at: string
          id: string
          inventory_count: number | null
          merchandise_id: string
          price_adjustment: number
          updated_at: string
        }
        Insert: {
          attribute_name: string
          attribute_value: string
          created_at?: string
          id?: string
          inventory_count?: number | null
          merchandise_id: string
          price_adjustment?: number
          updated_at?: string
        }
        Update: {
          attribute_name?: string
          attribute_value?: string
          created_at?: string
          id?: string
          inventory_count?: number | null
          merchandise_id?: string
          price_adjustment?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchandise_variations_merchandise_id_fkey"
            columns: ["merchandise_id"]
            isOneToOne: false
            referencedRelation: "merchandise"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      releases: {
        Row: {
          allow_name_your_price: boolean
          artist_id: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          minimum_price: number | null
          price: number | null
          published: boolean
          streaming_enabled: boolean
          streaming_limit: number | null
          title: string
          type: string
          updated_at: string
          year: number
        }
        Insert: {
          allow_name_your_price?: boolean
          artist_id: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          minimum_price?: number | null
          price?: number | null
          published?: boolean
          streaming_enabled?: boolean
          streaming_limit?: number | null
          title: string
          type: string
          updated_at?: string
          year: number
        }
        Update: {
          allow_name_your_price?: boolean
          artist_id?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          minimum_price?: number | null
          price?: number | null
          published?: boolean
          streaming_enabled?: boolean
          streaming_limit?: number | null
          title?: string
          type?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "releases_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          }
        ]
      }
      tracks: {
        Row: {
          audio_url: string | null
          created_at: string
          credits: string | null
          duration: number
          id: string
          lyrics: string | null
          preview_duration: number | null
          preview_url: string | null
          release_id: string
          title: string
          track_number: number
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          credits?: string | null
          duration: number
          id?: string
          lyrics?: string | null
          preview_duration?: number | null
          preview_url?: string | null
          release_id: string
          title: string
          track_number: number
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          credits?: string | null
          duration?: number
          id?: string
          lyrics?: string | null
          preview_duration?: number | null
          preview_url?: string | null
          release_id?: string
          title?: string
          track_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracks_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "releases"
            referencedColumns: ["id"]
          }
        ]
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