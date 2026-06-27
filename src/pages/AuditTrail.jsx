import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function AuditTrail() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => { setRows(data || []); setLoading(false) })
  }, [])

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-xl font-semibold text-ink-900">Audit Trail</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Immutable record of data changes. The database enforces capture independently of the app (21 CFR Part 11 spirit).
        </p>
      </header>
      <div className="overflow-x-auto rounded-xl border border-steel-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-steel-100 bg-steel-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">Record</th>
              <th className="px-4 py-3">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-100">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">No audit entries yet.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="hover:bg-steel-50/50">
                <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-4 py-2.5 font-medium capitalize text-ink-800">{r.action}</td>
                <td className="px-4 py-2.5 capitalize text-slate-600">{(r.table_name || '').replace(/_/g, ' ')}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{String(r.record_id || '').slice(0, 8)}</td>
                <td className="px-4 py-2.5 text-slate-500">{r.source || 'db'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
