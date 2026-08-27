import { useState } from 'react'

// Injected at build time by vite.config.js `define`.
const BUILD = typeof __BUILD_INFO__ !== 'undefined' ? __BUILD_INFO__ : { commit: 'local', ref: 'local', builtAt: null }

const TOGGLES = [
  { id: 'summary', title: 'Daily portfolio summary', desc: "A recap of today's performance, sent every trading day at market close.", on: true },
  { id: 'alerts', title: 'Price movement alerts', desc: 'Notify me when a holding moves more than the threshold below in a single day.', on: true },
  { id: 'roundup', title: 'Round up purchases to invest', desc: 'Every linked purchase rounds up to the nearest dollar; the difference buys fractional shares.', on: false },
  { id: 'crypto', title: 'Show crypto on Overview', desc: 'Include crypto holdings in the hero figure and KPI tiles.', on: true },
]

export default function Settings() {
  const [currency, setCurrency] = useState('USD')
  const [range, setRange] = useState('30d')
  const [threshold, setThreshold] = useState('5')
  const [toggles, setToggles] = useState(() => Object.fromEntries(TOGGLES.map((t) => [t.id, t.on])))

  return (
    <>
      <section className="card">
        <div className="card-head">
          <h2 className="card-title">Preferences</h2>
        </div>
        <p className="card-sub">Local to this browser — the app has no backend.</p>

        <div className="field">
          <label htmlFor="currency">Display currency</label>
          <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {['USD', 'EUR', 'GBP', 'JPY'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="range">Default date range</label>
          <select id="range" value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="ytd">Year to date</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="threshold">Price alert threshold</label>
          <input
            id="threshold"
            type="number"
            min="1"
            max="50"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            style={{ maxWidth: 100 }}
          />
          <span className="field-hint">
            Trigger a price movement alert when a holding moves more than this percent in one day.
          </span>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2 className="card-title">Notifications</h2>
        </div>
        <p className="card-sub">How and when this dashboard reaches out.</p>
        {TOGGLES.map((t) => (
          <div className="switch-row" key={t.id}>
            <input
              id={t.id}
              type="checkbox"
              checked={toggles[t.id]}
              onChange={(e) => setToggles((prev) => ({ ...prev, [t.id]: e.target.checked }))}
            />
            <div>
              <label className="switch-title" htmlFor={t.id}>{t.title}</label>
              <div className="switch-desc">{t.desc}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="card-head">
          <h2 className="card-title">Build metadata</h2>
        </div>
        <p className="card-sub">Baked into the bundle at build time — proof this is the live, deployed build.</p>
        <dl className="kv">
          <dt>Commit</dt>
          <dd><code>{BUILD.commit}</code></dd>
          <dt>Ref</dt>
          <dd><code>{BUILD.ref}</code></dd>
          <dt>Built at</dt>
          <dd>{BUILD.builtAt ? new Date(BUILD.builtAt).toLocaleString() : '—'}</dd>
          <dt>Workflow run</dt>
          <dd>{BUILD.runId ? <code>{BUILD.runId}</code> : 'local build'}</dd>
        </dl>
      </section>
    </>
  )
}
