import { useEffect } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { getAvatarOption } from '../avatarCatalog'
import { useI18n } from '../../i18n/useI18n'
import { useAppStore } from '../../state/store'

export const AppLayout = () => {
  const { activeProfile } = useAppStore()
  const { t } = useI18n()
  const avatar = getAvatarOption(activeProfile.avatar)
  const navItems = [
    { to: '/', label: t('navStart') },
    { to: '/progress', label: t('navProgress') },
  ]

  useEffect(() => {
    document.documentElement.setAttribute('data-ui-scale', activeProfile.settings.uiScale)
  }, [activeProfile.settings.uiScale])

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          Zahlenliebe
        </Link>
        <Link to="/settings" className="profile-chip profile-chip-link" aria-label={t('navSettings')}>
          <img src={avatar.image} alt="" className="profile-avatar" />
          {activeProfile.name}
        </Link>
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
