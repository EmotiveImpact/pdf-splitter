import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Client-side Supabase client
export const createClientComponentClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Server-side Supabase client for Server Components
export const createServerComponentClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Types for our database tables
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type PDFBatch = Database['public']['Tables']['pdf_batches']['Row'];
export type ProcessedPDF =
  Database['public']['Tables']['processed_pdfs']['Row'];
export type EmailCampaign =
  Database['public']['Tables']['email_campaigns']['Row'];
export type EmailSend = Database['public']['Tables']['email_sends']['Row'];
export type AnalyticsEvent =
  Database['public']['Tables']['analytics_events']['Row'];

// Insert types
export type OrganizationInsert =
  Database['public']['Tables']['organizations']['Insert'];
export type UserProfileInsert =
  Database['public']['Tables']['user_profiles']['Insert'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type PDFBatchInsert =
  Database['public']['Tables']['pdf_batches']['Insert'];
export type ProcessedPDFInsert =
  Database['public']['Tables']['processed_pdfs']['Insert'];
export type EmailCampaignInsert =
  Database['public']['Tables']['email_campaigns']['Insert'];
export type EmailSendInsert =
  Database['public']['Tables']['email_sends']['Insert'];
export type AnalyticsEventInsert =
  Database['public']['Tables']['analytics_events']['Insert'];

// Update types
export type OrganizationUpdate =
  Database['public']['Tables']['organizations']['Update'];
export type UserProfileUpdate =
  Database['public']['Tables']['user_profiles']['Update'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];
export type PDFBatchUpdate =
  Database['public']['Tables']['pdf_batches']['Update'];
export type ProcessedPDFUpdate =
  Database['public']['Tables']['processed_pdfs']['Update'];
export type EmailCampaignUpdate =
  Database['public']['Tables']['email_campaigns']['Update'];
export type EmailSendUpdate =
  Database['public']['Tables']['email_sends']['Update'];
export type AnalyticsEventUpdate =
  Database['public']['Tables']['analytics_events']['Update'];
