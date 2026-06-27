import { useState } from 'react'
import { Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import Sidebar from './Sidebar.jsx'

export default function Layout({ children }) {
  const { user, profile, role, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const name = profile?.full_name || user?.email || 'User'

  return (
    <div className="flex h-screen overflow-hidden bg-steel-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-ink-900 lg:block">
        <Brand />
        <div className="h-[calc(100%-4rem)]"><Sidebar /></div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-ink-900">
            <Brand onClose={() => setOpen(false)} />
            <div className="h-[calc(100%-4rem)]"><Sidebar onNavigate={() => setOpen(false)} /></div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-steel-100 bg-white px-4 lg:px-6">
          <button onClick={() => setOpen(true)} className="rounded-md p-1.5 text-slate-500 hover:bg-steel-50 lg:hidden" aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium leading-tight text-ink-900">{name}</p>
              <p className="text-xs capitalize leading-tight text-slate-400">{role}</p>
            </div>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-steel-200 px-2.5 py-1.5 text-sm text-slate-600 hover:bg-steel-50"
            >
              <LogOut size={15} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

function Brand({ onClose }) {
  return (
    <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-500/20 ring-1 ring-teal-500/40">
          <span className="text-sm font-bold text-teal-500">C</span>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">CGT Platform</p>
          <p className="text-[10px] uppercase tracking-wider text-steel-400">Unified lifecycle</p>
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-steel-300 hover:text-white lg:hidden" aria-label="Close menu"><X size={18} /></button>
      )}
    </div>
  )
}
