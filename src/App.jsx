import { Routes, Route, useParams, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import { RESOURCES } from './config/modules.js'
import Layout from './components/Layout.jsx'
import ResourcePage from './components/ResourcePage.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AuditTrail from './pages/AuditTrail.jsx'
import NotFound from './pages/NotFound.jsx'

function ResourceRoute() {
  const { key } = useParams()
  const config = RESOURCES[key]
  if (!config) return <NotFound />
  return <ResourcePage key={key} resourceKey={key} config={config} />
}

export default function App() {
  const { session, loading, isConfigured } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink-900 text-steel-200">
        <div className="animate-pulse text-sm">Loading platform…</div>
      </div>
    )
  }

  if (!isConfigured || !session) return <Login />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/m/:key" element={<ResourceRoute />} />
        <Route path="/audit" element={<AuditTrail />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Layout>
  )
}
