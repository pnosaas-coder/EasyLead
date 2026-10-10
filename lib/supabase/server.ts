import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

const DEFAULT_SUPABASE_URL = 'https://zwlmxmhdzwmebqgwupbw.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bG14bWhkendtZWJxZ3d1cGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1ODEzMDgsImV4cCI6MjEwNzE1NzMwOH0.GpQfn4LoKsejLnOaxVe8E2aABnDlqHXTow2wJ5phCfE';

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
