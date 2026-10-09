import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

const DEFAULT_SUPABASE_URL = 'https://wpiacsyiluhmjswdoshb.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwaWFjc3lpbHVobWpzd2Rvc2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTkxNzcsImV4cCI6MjEwNzAzNTE3N30.dzskRIq4N_PtxyWKdtgW4fCmuoLu8uXmB5gWrCsWo1I';

export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // Ignored if session is refreshed by proxy.ts
          }
        },
      },
    }
  );
}
