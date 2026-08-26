import { useState } from 'react'

// Injected at build time by vite.config.js `define`.
const BUILD = typeof __BUILD_INFO__ !== 'undefined' ? __BUILD_INFO__ : { commit: 'local', ref: 'local', builtAt: null }

const TOGGLES = [
  { id: 'invalidate', title: 'Invalidate CloudFront on deploy', desc: 'Creates an /* invalidation after each successful upload so viewers get the new index.html immediately.', on: true },
  { id: 'compress', title: 'Compress objects automatically', desc: 'CloudFront serves Brotli/gzip for compressible content types.', on: true },
  { id: 'alerts', title: 'Email me on failed deploys', desc: 'Send a notification when the deploy workflow exits non-zero.', on: false },
  { id: 'preview', title: 'Build preview on pull requests', desc: 'Run the build on PRs without uploading to S3.', on: true },
]

export default function Settings() {
  const [range, setRange] = useState('30d')
  const [region, setRegion] = useState('us-east-1')
  const [toggles, setToggles] = useState(() => Object.fromEntries(TOGGLES.map((t) => [t.id, t.on])))

  return (
    <>
      <section className="card">
        <div className="card-head">
          <h2 className="card-title">Dashboard preferences</h2>
        </div>
        <p className="card-sub">Local to this browser — the app has no backend.</p>

        <div className="field">
          <label htmlFor="range">Default date range</label>
          <select id="range" value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="mtd">Month to date</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="region">Primary region</label>
          <select id="region" value={region} onChange={(e) => setRegion(e.target.value)}>
            {['us-east-1', 'eu-west-1', 'ap-south-1', 'sa-east-1'].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="alias">Custom domain</label>
          <input id="alias" type="text" placeholder="dashboard.example.com" />
          <span className="field-hint">
            Set <code>domain_name</code> in Terraform to attach an ACM certificate and CloudFront alias.
          </span>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2 className="card-title">Delivery pipeline</h2>
        </div>
        <p className="card-sub">Behaviour of the GitHub Actions workflow and the distribution.</p>
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
        <p className="card-sub">Baked into the bundle at build time.</p>
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
