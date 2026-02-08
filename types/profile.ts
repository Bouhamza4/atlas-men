import type { Database } from './supabase';

// ✅ Types من Supabase generator
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];