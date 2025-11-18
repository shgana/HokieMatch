import { createClient } from "@supabase/supabase-js"

// Server-side Supabase client. Provide these env vars in .env.local
// SUPABASE_URL=https://xxxxx.supabase.co
// SUPABASE_SERVICE_ROLE_KEY=service_role_key
// SUPABASE_ANON_KEY=anon_key

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL env var")
}
if (!supabaseServiceKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY env var")
}
if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY env var")
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: true, persistSession: true },
})

