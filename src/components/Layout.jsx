import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

const PAGES = [
  { to: '/', label: 'Overview', title: 'Overview', blurb: 'Delivery health for the last 12 months.' },
  { to: '/analytics', label: 'Analytics', title: 'Analytics', blurb: 'Cache performance and deploy history.' },
  { to: '/settings', label: 'Settings', title: 'Settings', blurb: 'Dashboard preferences and build metadata.' },
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
            <div className="brand-sub">Edge delivery</div>
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
              <span className="nav-dot" aria-hidden="true" />
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
          <button
            className="theme-toggle"
            onClick={() => setTheme(next[theme])}
            aria-label={`Theme: ${theme}. Switch to ${next[theme]}.`}
          >
            <span aria-hidden="true">{icon[theme]}</span> {theme}
          </button>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
