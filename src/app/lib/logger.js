import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function logApiRequest({ method, path, status, durationMs }) {
  try {
    await supabase.from('api_logs').insert([
      { method, path, status, duration_ms: durationMs }
    ])
  } catch (err) {
    console.error('Failed to save API log:', err)
  }
}