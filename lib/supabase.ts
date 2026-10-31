import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://kmrpzqxkpuedgtuntcyg.supabase.co';

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttcnB6cXhrcHVlZGd0dW50Y3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNzk0MjEsImV4cCI6MjEwODk1NTQyMX0.EHWK4bm_UBLuyDvI8P8dn1EjJ3mbkSUmPl8BmngxeO4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
