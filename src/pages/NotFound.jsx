import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-sm font-semibold text-teal-600">404</p>
      <h1 className="mt-1 text-xl font-semibold text-ink-900">Page not found</h1>
      <Link to="/" className="mt-4 inline-block rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-800">Back to dashboard</Link>
    </div>
  )
}
