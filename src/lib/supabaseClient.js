import { createClient } from '@supabase/supabase-js'

// Supabase Project configuration (Mumbai ap-south-1)
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://rjufejthxjrztkyhhzgr.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqdWZlanRoeGpyenRreWhoemdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNjUxMTAsImV4cCI6MjEwODg0MTExMH0.p9h6LioUma56-3XWTV-xAJinIx74KUw9RvTl98XzDzw'

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Authentication convenience wrappers
export const signInWithEmail = async (email, password) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export const signOutUser = async () => {
  return await supabase.auth.signOut()
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
