import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import StatusBadge from '../components/StatusBadge.jsx'

const CARDS = [
  { key: 'projects', label: 'Active projects', table: 'projects', match: { status: 'Active' }, to: '/m/projects' },
  { key: 'batches', label: 'Batches in process', table: 'batches', match: { status: 'In Process' }, to: '/m/batches' },
  { key: 'deviations', label: 'Open deviations', table: 'deviations', match: { status: 'Open' }, to: '/m/deviations', tone: 'amber' },
  { key: 'oos', label: 'Out-of-spec results', table: 'qc_results', match: { status: 'Out of Spec' }, to: '/m/qc_results', tone: 'red' },
  { key: 'capa', label: 'Open CAPAs', table: 'capa', match: { status: 'Open' }, to: '/m/capa', tone: 'amber' },
  { key: 'releases', label: 'Awaiting release', table: 'batch_releases', match: { status: 'Pending Review' }, to: '/m/releases' },
]

const TONE = {
  default: 'text-ink-900',
  amber: 'text-amber-500',
  red: 'text-rose-600',
}

export default function Dashboard() {
  const [counts, setCounts] = useState({})
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function run() {
      const next = {}
      for (const c of CARDS) {
        let q = supabase.from(c.table).select('id', { count: 'exact', head: true })
        Object.entries(c.match).forEach(([k, v]) => { q = q.eq(k, v) })
        const { count } = await q
        next[c.key] = count ?? 0
      }
      setCounts(next)

      const { data } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8)
      setRecent(data || [])
      setLoading(false)
    }
    run()
  }, [])

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-ink-900">Operations overview</h1>
        <p className="mt-0.5 text-sm text-slate-500">Cross-module status across the product lifecycle.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CARDS.map((c) => (
          <Link
            key={c.key}
            to={c.to}
            className="rounded-xl border border-steel-100 bg-white p-4 shadow-sm transition-shadow hover:shadow"
          >
            <p className={`text-2xl font-semibold ${TONE[c.tone] || TONE.default}`}>
              {loading ? '—' : counts[c.key]}
            </p>
            <p className="mt-1 text-xs leading-snug text-slate-500">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Recent activity</h2>
          {loading ? (
            <p className="py-6 text-center text-sm text-slate-400">Loading…</p>
          ) : recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No activity recorded yet.</p>
          ) : (
            <ul className="divide-y divide-steel-100">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <span className="font-medium capitalize text-ink-800">{r.action}</span>{' '}
                    <span className="text-slate-500">on {prettyTable(r.table_name)}</span>
                  </div>
                  <time className="shrink-0 text-xs text-slate-400">{new Date(r.created_at).toLocaleString()}</time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Lifecycle spine</h2>
          <ol className="space-y-2 text-sm">
            {['R&D / ELN', 'Tech Transfer', 'Procurement & Store', 'Manufacturing', 'QC Testing', 'QA Review', 'Batch Release'].map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[10px] font-semibold text-white">{i + 1}</span>
                <span className="text-slate-600">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 border-t border-steel-100 pt-3 text-xs text-slate-400">
            Every create, edit and delete is captured in the audit trail (ALCOA+ aligned).
          </p>
        </section>
      </div>
    </div>
  )
}

function prettyTable(name) {
  return (name || '').replace(/_/g, ' ')
}
