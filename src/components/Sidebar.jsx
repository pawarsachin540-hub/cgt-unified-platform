import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FlaskConical, ArrowLeftRight, Boxes, Factory,
  TestTubes, ShieldCheck, Wrench, BadgeCheck, GraduationCap, History,
} from 'lucide-react'
import { GROUPS, RESOURCES } from '../config/modules.js'

const ICONS = {
  LayoutDashboard, FlaskConical, ArrowLeftRight, Boxes, Factory,
  TestTubes, ShieldCheck, Wrench, BadgeCheck, GraduationCap, History,
}

function itemClass({ isActive }) {
  return [
    'block rounded-md px-3 py-1.5 text-sm transition-colors',
    isActive ? 'bg-teal-500/15 text-white font-medium' : 'text-steel-200 hover:bg-white/5 hover:text-white',
  ].join(' ')
}

export default function Sidebar({ onNavigate }) {
  return (
    <nav className="flex h-full flex-col gap-5 overflow-y-auto px-3 py-4">
      <NavLink to="/" end onClick={onNavigate} className={itemClass}>
        <span className="flex items-center gap-2">
          <LayoutDashboard size={16} /> Dashboard
        </span>
      </NavLink>

      {GROUPS.map((group) => {
        const Icon = ICONS[group.icon] || Boxes
        return (
          <div key={group.label}>
            <p className="mb-1.5 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-steel-400">
              <Icon size={13} /> {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((key) => (
                <NavLink key={key} to={`/m/${key}`} onClick={onNavigate} className={itemClass}>
                  {RESOURCES[key].label}
                </NavLink>
              ))}
            </div>
          </div>
        )
      })}

      <div className="mt-auto border-t border-white/10 pt-3">
        <NavLink to="/audit" onClick={onNavigate} className={itemClass}>
          <span className="flex items-center gap-2"><History size={16} /> Audit Trail</span>
        </NavLink>
      </div>
    </nav>
  )
}
