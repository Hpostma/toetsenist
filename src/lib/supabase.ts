import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    // Dit voorkomt een harde crash bij build time, maar logt wel duidelijk
    console.warn('⚠️LET OP: SUPABASE KEYS ZIJN NIET GECONFIGUREERD! De database zal niet werken.')
}

// Fallback om crash te voorkomen als keys er niet zijn (createClient crasht op lege string url)
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
)
