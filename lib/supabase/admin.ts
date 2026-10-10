import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const DEFAULT_SUPABASE_URL = 'https://zwlmxmhdzwmebqgwupbw.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bG14bWhkendtZWJxZ3d1cGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1ODEzMDgsImV4cCI6MjEwNzE1NzMwOH0.GpQfn4LoKsejLnOaxVe8E2aABnDlqHXTow2wJ5phCfE';

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
