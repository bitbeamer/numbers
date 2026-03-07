import { useEffect } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAppStore } from '../../state/store'

const navItems = [
  { to: '/', label: 'Start' },
  { to: '/progress', label: 'Fortschritt' },
  { to: '/settings', label: 'Einstellungen' },
]

export const AppLayout = () => {
  const { activeProfile } = useAppStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-ui-scale', activeProfile.settings.uiScale)
  }, [activeProfile.settings.uiScale])

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          Zahlenliebe
        </Link>
        <p className="profile-chip">Profil: {activeProfile.name}</p>
      </header>

      <nav className="main-nav" aria-label="Hauptnavigation">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="page-wrap">
        <Outlet />
      </main>
    </div>
  )
}
