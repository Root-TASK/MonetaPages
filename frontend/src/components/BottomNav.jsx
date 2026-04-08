import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, BarChart2, Users, Calendar, CheckSquare } from 'lucide-react'

const NAV = [
  { to: '/',        icon: LayoutDashboard, label: 'Dash' },
  { to: '/ledger',  icon: BookOpen,        label: 'Ledger' },
  { to: '/clients', icon: Users,           label: 'Clients' },
  { to: '/calendar',icon: Calendar,        label: 'Cal' },
  { to: '/tasks',   icon: CheckSquare,     label: 'Tasks' },
  { to: '/reports', icon: BarChart2,       label: 'Stats' },
]

export default function BottomNav() {
  return (
    <>
      <div className="bottom-nav">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink 
            key={to} 
            to={to} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      <style>{`
        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 40px);
          max-width: 480px;
          height: 64px;
          background: rgba(13, 17, 23, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid var(--border-strong);
          border-radius: 32px;
          z-index: 1000;
          padding: 0 10px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          align-items: center;
          justify-content: space-around;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: var(--text-muted);
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 20px;
          transition: all 0.2s ease;
        }

        .nav-item span {
          font-size: 10px;
          font-weight: 600;
        }

        .nav-item.active {
          color: var(--accent);
          background: var(--bg-hover);
        }

        @media (max-width: 640px) {
          .bottom-nav { display: flex; }
        }
      `}</style>
    </>
  )
}
