import StatTile from '../components/StatTile.jsx'
import TrendChart from '../components/TrendChart.jsx'
import { kpis, trafficTrend } from '../data/metrics.js'

const ACCENTS = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-1)']

export default function Overview() {
  const totalThisMonth = trafficTrend.series.reduce((sum, s) => sum + s.values[s.values.length - 1], 0)

  return (
    <>
      {/* Exactly one hero figure per view. */}
      <section className="card">
        <div className="stat-label">Requests this month</div>
        <div className="hero">
          <div className="hero-figure">{(totalThisMonth / 1000).toFixed(2)}M</div>
          <div className="hero-note">
            Across all edge locations · 99.98% availability · <span style={{ color: 'var(--delta-good)', fontWeight: 600 }}>▲ 8.9%</span> vs. last month
          </div>
        </div>
      </section>

      <section className="grid-kpi">
        {kpis.map((kpi, i) => (
          <StatTile key={kpi.id} kpi={kpi} accent={ACCENTS[i]} />
        ))}
      </section>

      <section className="card">
        <div className="card-head">
          <h2 className="card-title">Requests by tier</h2>
        </div>
        <p className="card-sub">
          Thousands of requests per month. As the cache warms, edge hits climb and origin
          fetches fall — both series share one scale.
        </p>
        <TrendChart categories={trafficTrend.categories} series={trafficTrend.series} unit="k" />
      </section>
    </>
  )
}
