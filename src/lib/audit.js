import { supabase } from './supabase.js'

// Best-effort client-side audit hook. The authoritative audit trail is the
// database trigger (see migration) which captures every row change regardless
// of where it originates. This adds the human-readable action context.
export async function logAction(table_name, record_id, action, detail) {
  try {
    await supabase.from('audit_log').insert({
      table_name,
      record_id,
      action,
      detail: detail ? JSON.stringify(detail) : null,
      source: 'app',
    })
  } catch {
    // never block the user action on an audit write failure
  }
}

// Generate a human-friendly sequential-ish code, e.g. PRJ-2026-4F2A.
export function makeCode(prefix) {
  const year = new Date().getFullYear()
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `${prefix}-${year}-${rand}`
}
