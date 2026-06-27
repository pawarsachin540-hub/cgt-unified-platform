import { createClient } from '@supabase/supabase-js'

const FALLBACK_URL = 'https://zieqonqmxnkasqfwqlie.supabase.co'
const FALLBACK_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppZXFvbnFteG5rYXNxZndxbGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NzYyMDQsImV4cCI6MjA5ODE1MjIwNH0.VPF3lJbR0E-iBJobFychQMgZ4ptR0XdUENxML4LhYOE'

const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const urlOk = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(envUrl)
const url = (urlOk ? envUrl : FALLBACK_URL).replace(/\/+$/, '')

const envAnon = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()
const anon = envAnon.startsWith('ey') ? envAnon : FALLBACK_ANON

export const isConfigured = true

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true },
})
