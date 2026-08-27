import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { GridIcon, LayersIcon, SlidersIcon } from './icons.jsx'

const PAGES = [
  { to: '/', label: 'Overview', title: 'Overview', blurb: 'Portfolio performance for the last 12 months.', Icon: GridIcon },
  { to: '/holdings', label: 'Holdings', title: 'Holdings', blurb: 'Allocation, today’s movers, and every open position.', Icon: LayersIcon },
  { to: '/settings', label: 'Settings', title: 'Settings', blurb: 'Dashboard preferences and build metadata.', Icon: SlidersIcon },
]

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return [theme, setTheme]
}

export default function Layout() {
  const { pathname } = useLocation()
  const [theme, setTheme] = useTheme()
  const page = PAGES.find((p) => p.to === pathname) ?? PAGES[0]

  const next = { system: 'light', light: 'dark', dark: 'system' }
  const icon = { system: '◐', light: '☀', dark: '☾' }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">A</div>
          <div>
            <div className="brand-name">Atlas</div>
            <div className="brand-sub">Wealth</div>
          </div>
        </div>

        <nav className="nav" aria-label="Main">
          {PAGES.map((p) => (
            <NavLink
              key={p.to}
              to={p.to}
              end={p.to === '/'}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <p.Icon size={17} />
              {p.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          S3 + CloudFront
          <br />
          Deployed by GitHub Actions
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <h1>{page.title}</h1>
            <p>{page.blurb}</p>
          </div>
          <div className="topbar-actions">
            <span className="account-pill">
              <span className="account-pill-dot" aria-hidden="true" />
              Demo Portfolio
            </span>
            <button
              className="theme-toggle"
              onClick={() => setTheme(next[theme])}
              aria-label={`Theme: ${theme}. Switch to ${next[theme]}.`}
            >
              <span aria-hidden="true">{icon[theme]}</span> {theme}
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
