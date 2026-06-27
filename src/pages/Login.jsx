import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { signIn, signUp, isConfigured } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setMsg(null)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        const { error } = await signUp(email, password, fullName)
        if (error) throw error
        setMsg({ ok: true, text: 'Account created. Check your email to confirm, then sign in.' })
        setMode('signin')
      }
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/20 ring-1 ring-teal-500/40">
            <span className="text-lg font-bold text-teal-500">C</span>
          </div>
          <h1 className="text-lg font-semibold text-white">CGT Unified Platform</h1>
          <p className="mt-1 text-sm text-steel-300">R&amp;D to GMP release, one system of record</p>
        </div>

        {!isConfigured ? (
          <div className="rounded-xl bg-white p-5 text-sm text-slate-700 shadow-lg">
            <p className="font-semibold text-ink-900">Connect Supabase to continue</p>
            <p className="mt-2 text-slate-500">
              Add your project URL and anon key to a <code className="rounded bg-steel-100 px-1">.env</code> file
              (see <code className="rounded bg-steel-100 px-1">.env.example</code>), then restart the dev server.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-xl bg-white p-5 shadow-lg">
            {mode === 'signup' && (
              <Labeled label="Full name">
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={input} />
              </Labeled>
            )}
            <Labeled label="Email">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
            </Labeled>
            <Labeled label="Password">
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
            </Labeled>

            {msg && (
              <p className={`mt-1 mb-3 text-sm ${msg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>{msg.text}</p>
            )}

            <button disabled={busy} className="mt-1 w-full rounded-lg bg-ink-900 py-2.5 text-sm font-medium text-white hover:bg-ink-800 disabled:opacity-60">
              {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>

            <p className="mt-4 text-center text-sm text-slate-500">
              {mode === 'signin' ? 'No account yet?' : 'Already have an account?'}{' '}
              <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMsg(null) }} className="font-medium text-teal-600 hover:underline">
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

const input = 'w-full rounded-lg border border-steel-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
function Labeled({ label, children }) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  )
}
