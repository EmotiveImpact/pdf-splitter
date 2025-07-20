export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          website_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          organization_id: string | null;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string | null;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          organization_id: string;
          account_number: string;
          customer_name: string;
          email: string | null;
          phone: string | null;
          address_street: string | null;
          address_city: string | null;
          address_state: string | null;
          address_zip: string | null;
          address_country: string;
          status: string;
          customer_since: string | null;
          last_statement_date: string | null;
          preferred_contact: string;
          email_notifications: boolean;
          sms_notifications: boolean;
          total_statements_processed: number;
          total_emails_sent: number;
          last_activity: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          account_number: string;
          customer_name: string;
          email?: string | null;
          phone?: string | null;
          address_street?: string | null;
          address_city?: string | null;
          address_state?: string | null;
          address_zip?: string | null;
          address_country?: string;
          status?: string;
          customer_since?: string | null;
          last_statement_date?: string | null;
          preferred_contact?: string;
          email_notifications?: boolean;
          sms_notifications?: boolean;
          total_statements_processed?: number;
          total_emails_sent?: number;
          last_activity?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          account_number?: string;
          customer_name?: string;
          email?: string | null;
          phone?: string | null;
          address_street?: string | null;
          address_city?: string | null;
          address_state?: string | null;
          address_zip?: string | null;
          address_country?: string;
          status?: string;
          customer_since?: string | null;
          last_statement_date?: string | null;
          preferred_contact?: string;
          email_notifications?: boolean;
          sms_notifications?: boolean;
          total_statements_processed?: number;
          total_emails_sent?: number;
          last_activity?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      pdf_batches: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          batch_name: string | null;
          original_filename: string | null;
          month_year: string | null;
          total_pages: number | null;
          processed_pages: number;
          failed_pages: number;
          processing_time_seconds: number | null;
          status: string;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          batch_name?: string | null;
          original_filename?: string | null;
          month_year?: string | null;
          total_pages?: number | null;
          processed_pages?: number;
          failed_pages?: number;
          processing_time_seconds?: number | null;
          status?: string;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string | null;
          batch_name?: string | null;
          original_filename?: string | null;
          month_year?: string | null;
          total_pages?: number | null;
          processed_pages?: number;
          failed_pages?: number;
          processing_time_seconds?: number | null;
          status?: string;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      processed_pdfs: {
        Row: {
          id: string;
          batch_id: string;
          client_id: string | null;
          filename: string;
          page_number: number | null;
          file_size_bytes: number | null;
          storage_path: string | null;
          processing_status: string;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          client_id?: string | null;
          filename: string;
          page_number?: number | null;
          file_size_bytes?: number | null;
          storage_path?: string | null;
          processing_status?: string;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          client_id?: string | null;
          filename?: string;
          page_number?: number | null;
          file_size_bytes?: number | null;
          storage_path?: string | null;
          processing_status?: string;
          error_message?: string | null;
          created_at?: string;
        };
      };
      email_campaigns: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          campaign_name: string;
          subject_template: string;
          content_template: string;
          total_recipients: number;
          emails_sent: number;
          emails_delivered: number;
          emails_opened: number;
          emails_clicked: number;
          emails_failed: number;
          status: string;
          scheduled_at: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          campaign_name: string;
          subject_template: string;
          content_template: string;
          total_recipients?: number;
          emails_sent?: number;
          emails_delivered?: number;
          emails_opened?: number;
          emails_clicked?: number;
          emails_failed?: number;
          status?: string;
          scheduled_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string | null;
          campaign_name?: string;
          subject_template?: string;
          content_template?: string;
          total_recipients?: number;
          emails_sent?: number;
          emails_delivered?: number;
          emails_opened?: number;
          emails_clicked?: number;
          emails_failed?: number;
          status?: string;
          scheduled_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      email_sends: {
        Row: {
          id: string;
          campaign_id: string;
          client_id: string | null;
          processed_pdf_id: string | null;
          recipient_email: string;
          subject: string | null;
          status: string;
          sent_at: string | null;
          delivered_at: string | null;
          opened_at: string | null;
          clicked_at: string | null;
          failed_at: string | null;
          error_message: string | null;
          mailgun_message_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          client_id?: string | null;
          processed_pdf_id?: string | null;
          recipient_email: string;
          subject?: string | null;
          status?: string;
          sent_at?: string | null;
          delivered_at?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          failed_at?: string | null;
          error_message?: string | null;
          mailgun_message_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          client_id?: string | null;
          processed_pdf_id?: string | null;
          recipient_email?: string;
          subject?: string | null;
          status?: string;
          sent_at?: string | null;
          delivered_at?: string | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          failed_at?: string | null;
          error_message?: string | null;
          mailgun_message_id?: string | null;
          created_at?: string;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          event_type: string;
          event_data: Json | null;
          client_id: string | null;
          batch_id: string | null;
          campaign_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          event_type: string;
          event_data?: Json | null;
          client_id?: string | null;
          batch_id?: string | null;
          campaign_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string | null;
          event_type?: string;
          event_data?: Json | null;
          client_id?: string | null;
          batch_id?: string | null;
          campaign_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
