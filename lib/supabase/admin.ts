import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const DEFAULT_SUPABASE_URL = 'https://wpiacsyiluhmjswdoshb.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwaWFjc3lpbHVobWpzd2Rvc2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTkxNzcsImV4cCI6MjEwNzAzNTE3N30.dzskRIq4N_PtxyWKdtgW4fCmuoLu8uXmB5gWrCsWo1I';

export function createAdminClient() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      '[EasyLead] SUPABASE_SERVICE_ROLE_KEY is not set. Falling back to ANON key for admin operations.'
    );
  }

  return createClient<Database>(
    url,
    serviceKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
