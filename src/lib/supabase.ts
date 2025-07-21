import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
  }
  return url;
};

const getSupabaseAnonKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  }
  return key;
};

// Client-side Supabase client (lazy initialization)
let _supabase: ReturnType<typeof createClient<Database>> | null = null;
export const supabase = () => {
  if (!_supabase) {
    _supabase = createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
  }
  return _supabase;
};

// Client-side Supabase client
export const createClientComponentClient = () => {
  return createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
};

// Server-side Supabase client for Server Components
export const createServerComponentClient = () => {
  return createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
};

// Server-side Supabase client for API routes (uses service role key)
export const createServerClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceKey) {
    // During build time, return a mock client to prevent build errors
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY is required for server-side operations'
      );
    }
    // For build time, use anon key as fallback
    return createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
  }
  return createClient<Database>(getSupabaseUrl(), supabaseServiceKey);
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
