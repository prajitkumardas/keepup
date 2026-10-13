export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string; show_notification_details: boolean; source_retention: 'keep' | 'delete' | 'ask'; theme_mode: 'light' | 'dark'; created_at: string; updated_at: string };
        Insert: { id: string; display_name?: string; show_notification_details?: boolean; source_retention?: 'keep' | 'delete' | 'ask'; theme_mode?: 'light' | 'dark'; created_at?: string; updated_at?: string };
        Update: { display_name?: string; show_notification_details?: boolean; source_retention?: 'keep' | 'delete' | 'ask'; theme_mode?: 'light' | 'dark'; updated_at?: string };
        Relationships: [];
      };
      categories: {
        Row: { id: string; user_id: string; name: string; normalized_name: string; icon_key: string; color_key: string | null; is_custom: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; name: string; normalized_name: string; icon_key: string; color_key?: string | null; is_custom?: boolean; created_at?: string; updated_at?: string };
        Update: { name?: string; normalized_name?: string; icon_key?: string; color_key?: string | null; updated_at?: string };
        Relationships: [];
      };
      trackers: {
        Row: { id: string; user_id: string; title: string; category: string; category_id: string; source_label: string | null; created_at: string; updated_at: string; archived_at: string | null };
        Insert: { id?: string; user_id: string; title: string; category: string; category_id: string; source_label?: string | null; created_at?: string; updated_at?: string; archived_at?: string | null };
        Update: { title?: string; category?: string; category_id?: string; source_label?: string | null; updated_at?: string; archived_at?: string | null };
        Relationships: [];
      };
      milestones: {
        Row: { id: string; user_id: string; tracker_id: string; label: string; date_value: string; provenance: string; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; tracker_id: string; label: string; date_value: string; provenance: string; created_at?: string; updated_at?: string };
        Update: { label?: string; date_value?: string; provenance?: string; updated_at?: string };
        Relationships: [];
      };
      reminder_policies: {
        Row: { id: string; user_id: string; tracker_id: string; awareness_days: number; attention_days: number; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; tracker_id: string; awareness_days: number; attention_days: number; created_at?: string; updated_at?: string };
        Update: { awareness_days?: number; attention_days?: number; updated_at?: string };
        Relationships: [];
      };
      actions: {
        Row: { id: string; user_id: string; title: string; category_id: string; status: 'open' | 'completed' | 'archived'; due_date: string | null; tracker_id: string | null; snoozed_until: string | null; completed_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; title: string; category_id: string; status?: 'open' | 'completed' | 'archived'; due_date?: string | null; tracker_id?: string | null; snoozed_until?: string | null; completed_at?: string | null; created_at?: string; updated_at?: string };
        Update: { title?: string; category_id?: string; status?: 'open' | 'completed' | 'archived'; due_date?: string | null; tracker_id?: string | null; snoozed_until?: string | null; completed_at?: string | null; updated_at?: string };
        Relationships: [];
      };
      sources: {
        Row: { id: string; user_id: string; tracker_id: string | null; action_id: string | null; storage_path: string; file_name: string; mime_type: string; size_bytes: number; retention_mode: 'keep' | 'delete' | 'ask'; metadata: Json; created_at: string };
        Insert: { id?: string; user_id: string; tracker_id?: string | null; action_id?: string | null; storage_path: string; file_name: string; mime_type: string; size_bytes: number; retention_mode: 'keep' | 'delete' | 'ask'; metadata?: Json; created_at?: string };
        Update: { tracker_id?: string | null; action_id?: string | null; storage_path?: string; file_name?: string; mime_type?: string; size_bytes?: number; retention_mode?: 'keep' | 'delete' | 'ask'; metadata?: Json };
        Relationships: [];
      };
      activity_events: {
        Row: { id: string; user_id: string; entity_type: string; entity_id: string; event_type: string; payload: Json; created_at: string };
        Insert: { id?: string; user_id: string; entity_type: string; entity_id: string; event_type: string; payload?: Json; created_at?: string };
        Update: never;
        Relationships: [];
      };
      devices: {
        Row: { id: string; user_id: string; installation_id: string; platform: string; push_token: string | null; timezone: string | null; last_seen_at: string; created_at: string };
        Insert: { id?: string; user_id: string; installation_id: string; platform: string; push_token?: string | null; timezone?: string | null; last_seen_at?: string; created_at?: string };
        Update: { platform?: string; push_token?: string | null; timezone?: string | null; last_seen_at?: string };
        Relationships: [];
      };
      sync_mutations: {
        Row: { id: string; user_id: string; client_mutation_id: string; entity_type: string; entity_id: string; operation: 'insert' | 'update' | 'delete'; payload: Json; status: 'pending' | 'applied' | 'failed'; created_at: string; applied_at: string | null };
        Insert: { id?: string; user_id: string; client_mutation_id: string; entity_type: string; entity_id: string; operation: 'insert' | 'update' | 'delete'; payload?: Json; status?: 'pending' | 'applied' | 'failed'; created_at?: string; applied_at?: string | null };
        Update: { status?: 'pending' | 'applied' | 'failed'; applied_at?: string | null };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      create_tracker: { Args: { p_id: string; p_title: string; p_category: string; p_category_id: string; p_date_value: string; p_source_label: string | null }; Returns: string };
      update_tracker_details: { Args: { p_tracker_id: string; p_title: string; p_category_id: string; p_date_value: string }; Returns: undefined };
      delete_custom_category: { Args: { p_category_id: string; p_replacement_category_id: string }; Returns: undefined };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
