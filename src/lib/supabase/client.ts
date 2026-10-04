// src/lib/supabase/client.ts
//
// Typed Supabase client for scouting READS. Uses only the public anon key
// (VITE_* vars are bundled into browser code on purpose), so it is safe in
// browser or server code. The service-role key must never be used here —
// that one lives only in app/lib/supabase.server.ts.

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — add both to your local .env file (see .env.example).',
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
