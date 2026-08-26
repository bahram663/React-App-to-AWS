import { useState } from 'react'
import BarChart from '../components/BarChart.jsx'
import { cacheHitByRegion, deployments } from '../data/metrics.js'

const STATUS = {
  good: { icon: '●', label: 'Succeeded', className: 'status-good' },
  warning: { icon: '▲', label: 'Slow', className: 'status-warning' },
  critical: { icon: '✕', label: 'Failed', className: 'status-critical' },
}

export default function Analytics() {
  const [showTable, setShowTable] = useState(false)

  return (
    <>
      <div className="grid-2">
        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Cache hit rate by region</h2>
            <button className="toggle-link" onClick={() => setShowTable((v) => !v)}>
              {showTable ? 'Show chart' : 'Show table'}
            </button>
          </div>
          <p className="card-sub">Share of requests served from the CloudFront edge, last 30 days.</p>

          {showTable ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Region</th>
                    <th className="num">Cache hit rate</th>
                  </tr>
                </thead>
                <tbody>
                  {cacheHitByRegion.map((r) => (
                    <tr key={r.region}>
                      <td>{r.region}</td>
                      <td className="num">{r.value}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <BarChart data={cacheHitByRegion} unit="%" />
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Delivery summary</h2>
          </div>
          <p className="card-sub">Rolling 30-day totals from the distribution.</p>
          <dl className="kv">
            <dt>Distribution</dt>
            <dd><code>E2QW8XMPLE1234</code></dd>
            <dt>Origin</dt>
            <dd><code>atlas-dashboard-prod.s3</code></dd>
            <dt>Bytes downloaded</dt>
            <dd>1.42 TB</dd>
            <dt>4xx error rate</dt>
            <dd>0.31%</dd>
            <dt>5xx error rate</dt>
            <dd>0.02%</dd>
            <dt>Invalidations</dt>
            <dd>14 (last: 2 hours ago)</dd>
          </dl>
        </section>
      </div>

      <section className="card">
        <div className="card-head">
          <h2 className="card-title">Recent deployments</h2>
        </div>
        <p className="card-sub">Every push to <code>main</code> builds and ships through GitHub Actions.</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Commit</th>
                <th>Branch</th>
                <th>Status</th>
                <th className="num">Duration</th>
                <th>When</th>
                <th>Triggered by</th>
              </tr>
            </thead>
            <tbody>
              {deployments.map((d) => {
                const s = STATUS[d.status]
                return (
                  <tr key={d.sha}>
                    <td><code>{d.sha}</code></td>
                    <td>{d.branch}</td>
                    <td>
                      {/* icon + label — a status colour never carries meaning alone */}
                      <span className={`status ${s.className}`}>
                        <span className="status-icon" aria-hidden="true">{s.icon}</span>
                        {s.label}
                      </span>
                    </td>
                    <td className="num">{d.duration}</td>
                    <td>{d.when}</td>
                    <td>{d.by}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
