const TONE = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
}

const MAP = {
  // green / done
  Approved: 'green', Released: 'green', Effective: 'green', Pass: 'green',
  Completed: 'green', Passed: 'green', Active: 'green', Operational: 'green',
  Signed: 'green', Verified: 'green', Qualified: 'green',
  // amber / in progress
  'In Review': 'amber', 'In Process': 'amber', 'In Test': 'amber', 'In Progress': 'amber',
  'Under Investigation': 'amber', 'Impact Assessment': 'amber', 'Action Plan': 'amber',
  Implementation: 'amber', 'Effectiveness Check': 'amber', Submitted: 'amber',
  'In Qualification': 'amber', 'Under Maintenance': 'amber', 'QA Review': 'amber',
  'QC Complete': 'amber', 'Assigned': 'amber', 'Planning': 'amber', Quarantine: 'amber',
  Scheduled: 'amber', 'Pending Review': 'amber', 'Proposed': 'amber', 'Reviewed': 'amber',
  // red / problem
  'Out of Spec': 'red', Rejected: 'red', Failed: 'red', Critical: 'red',
  Overdue: 'red', 'On Hold': 'red', Cancelled: 'red', Discarded: 'red',
  Invalidated: 'red', Expired: 'red', 'Out of Service': 'red', Major: 'red',
  // blue / open & neutral states
  Open: 'blue', Planned: 'blue', Pending: 'blue', 'CAPA Linked': 'blue',
  // violet
  Witnessed: 'violet', Implemented: 'violet',
  // slate / closed / archived
  Draft: 'slate', Closed: 'slate', Superseded: 'slate', Retired: 'slate',
  Consumed: 'slate', Minor: 'slate', Low: 'slate', Medium: 'amber', High: 'red',
}

export default function StatusBadge({ value }) {
  if (!value) return <span className="text-slate-400">—</span>
  const tone = TONE[MAP[value] || 'slate']
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}>
      {value}
    </span>
  )
}
