// lib/supabase/client.ts — Browser client for client components
'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_AUTH_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase auth environment variables.');
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}
