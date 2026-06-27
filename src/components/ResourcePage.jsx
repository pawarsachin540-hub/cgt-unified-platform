import { useEffect, useMemo, useState, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, RefreshCw, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { makeCode } from '../lib/audit.js'
import { useAuth } from '../context/AuthContext.jsx'
import { WRITE_ROLES } from '../config/modules.js'
import StatusBadge from './StatusBadge.jsx'
import Modal from './Modal.jsx'

function fmt(value, type) {
  if (value === null || value === undefined || value === '') return '—'
  if (type === 'date') return new Date(value).toLocaleDateString()
  if (type === 'datetime') return new Date(value).toLocaleString()
  if (type === 'bool') return value ? 'Yes' : 'No'
  if (type === 'number') return Number(value).toLocaleString()
  return value
}

function deriveLabel(row) {
  return row.code || row.title || row.name || row.product || row.attribute || row.id
}

export default function ResourcePage({ resourceKey, config }) {
  const { role } = useAuth()
  const canWrite = WRITE_ROLES.includes(role)

  const [rows, setRows] = useState([])
  const [refMaps, setRefMaps] = useState({})       // refTable -> { id: {code,label} }
  const [refOptions, setRefOptions] = useState({})  // refTable -> [{id,label}]
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const refTables = useMemo(() => {
    const set = new Set()
    config.columns.forEach((c) => c.type === 'ref' && c.refTable && set.add(c.refTable))
    config.fields.forEach((f) => f.type === 'ref' && f.refTable && set.add(f.refTable))
    return [...set]
  }, [config])

  const statusValues = useMemo(() => {
    const f = config.fields.find((x) => x.name === 'status')
    return f?.options || []
  }, [config])

  const loadRefs = useCallback(async () => {
    const maps = {}
    const opts = {}
    for (const t of refTables) {
      const { data } = await supabase.from(t).select('*').limit(1000)
      const m = {}
      const o = []
      ;(data || []).forEach((r) => {
        const label = deriveLabel(r)
        m[r.id] = { code: r.code, label }
        o.push({ id: r.id, label: r.code ? `${r.code} · ${label}` : label })
      })
      maps[t] = m
      opts[t] = o.sort((a, b) => a.label.localeCompare(b.label))
    }
    setRefMaps(maps)
    setRefOptions(opts)
  }, [refTables])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from(config.table)
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    setRows(data || [])
    setLoading(false)
  }, [config.table])

  useEffect(() => {
    loadRefs()
    load()
  }, [loadRefs, load])

  // map a ref column to its id-field defined in fields config
  const idFieldFor = useCallback(
    (refTable) => config.fields.find((f) => f.type === 'ref' && f.refTable === refTable)?.name,
    [config],
  )

  function cellValue(row, col) {
    if (col.type === 'ref') {
      const idField = idFieldFor(col.refTable)
      const ref = refMaps[col.refTable]?.[row[idField]]
      return ref ? ref.code || ref.label : '—'
    }
    return row[col.key]
  }

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (!query) return true
      const q = query.toLowerCase()
      return (config.searchKeys || []).some((k) =>
        String(r[k] ?? '').toLowerCase().includes(q),
      )
    })
  }, [rows, query, statusFilter, config.searchKeys])

  function openCreate() {
    const initial = {}
    config.fields.forEach((f) => {
      if (f.type === 'bool') initial[f.name] = false
      else if (f.name === 'status' && f.options?.length) initial[f.name] = f.options[0]
      else initial[f.name] = ''
    })
    setForm(initial)
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(row) {
    const initial = {}
    config.fields.forEach((f) => { initial[f.name] = row[f.name] ?? (f.type === 'bool' ? false : '') })
    setForm(initial)
    setEditing(row)
    setModalOpen(true)
  }

  async function save() {
    setSaving(true)
    try {
      const payload = { ...form }
      // normalise empty strings on optional fields to null
      config.fields.forEach((f) => {
        if (payload[f.name] === '') payload[f.name] = null
        if (f.type === 'number' && payload[f.name] != null) payload[f.name] = Number(payload[f.name])
      })

      if (editing) {
        const { error } = await supabase.from(config.table).update(payload).eq('id', editing.id)
        if (error) throw error
      } else {
        payload.code = makeCode(config.code)
        const { data, error } = await supabase.from(config.table).insert(payload).select().single()
        if (error) throw error
      }
      setModalOpen(false)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function remove(row) {
    if (!confirm(`Delete ${row.code || deriveLabel(row)}? This is logged in the audit trail.`)) return
    const { error } = await supabase.from(config.table).delete().eq('id', row.id)
    if (error) { setError(error.message); return }
    await load()
  }

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">{config.label}</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
            {statusFilter !== 'all' && ` · ${statusFilter}`}
          </p>
        </div>
        {canWrite && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-ink-800"
          >
            <Plus size={16} /> New {config.singular}
          </button>
        )}
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-lg border border-steel-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>
        {statusValues.length > 0 && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-steel-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
          >
            <option value="all">All statuses</option>
            {statusValues.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <button
          onClick={() => { loadRefs(); load() }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-steel-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-steel-50"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-rose-600/20">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-steel-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-steel-100 bg-steel-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              {config.columns.map((c) => (
                <th key={c.key} className="whitespace-nowrap px-4 py-3">{c.label}</th>
              ))}
              {canWrite && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-100">
            {loading ? (
              <tr><td colSpan={99} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={99} className="px-4 py-12 text-center">
                <p className="text-sm text-slate-500">No records yet.</p>
                {canWrite && <p className="mt-1 text-xs text-slate-400">Use “New {config.singular}” to add the first one.</p>}
              </td></tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="hover:bg-steel-50/50">
                  {config.columns.map((c) => (
                    <td key={c.key} className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {c.type === 'status' || c.type === 'severity'
                        ? <StatusBadge value={row[c.key]} />
                        : c.type === 'code'
                          ? <span className="font-mono text-xs text-ink-700">{row[c.key]}</span>
                          : c.type === 'ref'
                            ? <span className="font-mono text-xs text-slate-600">{cellValue(row, c)}</span>
                            : fmt(row[c.key], c.type)}
                    </td>
                  ))}
                  {canWrite && (
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(row)} className="rounded p-1.5 text-slate-400 hover:bg-steel-100 hover:text-ink-700" aria-label="Edit"><Pencil size={15} /></button>
                        <button onClick={() => remove(row)} className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        wide
        title={editing ? `Edit ${config.singular} · ${editing.code || ''}` : `New ${config.singular}`}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-steel-200 px-3.5 py-2 text-sm text-slate-600 hover:bg-steel-50">Cancel</button>
            <button onClick={save} disabled={saving} className="rounded-lg bg-ink-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-ink-800 disabled:opacity-60">
              {saving ? 'Saving…' : editing ? 'Save changes' : `Create ${config.singular}`}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
          {config.fields.map((f) => (
            <div key={f.name} className={f.full || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                {f.label}{f.required && <span className="text-rose-500"> *</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  rows={3}
                  value={form[f.name] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  className="w-full rounded-lg border border-steel-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              ) : f.type === 'select' ? (
                <select
                  value={form[f.name] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  className="w-full rounded-lg border border-steel-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                >
                  <option value="">—</option>
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === 'ref' ? (
                <select
                  value={form[f.name] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  className="w-full rounded-lg border border-steel-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                >
                  <option value="">—</option>
                  {(refOptions[f.refTable] || []).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              ) : f.type === 'bool' ? (
                <label className="inline-flex items-center gap-2 pt-1.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={!!form[f.name]}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })}
                    className="h-4 w-4 rounded border-steel-300 text-teal-600 focus:ring-teal-500"
                  />
                  {form[f.name] ? 'Yes' : 'No'}
                </label>
              ) : (
                <input
                  type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                  value={form[f.name] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  className="w-full rounded-lg border border-steel-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
