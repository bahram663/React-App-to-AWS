import StatTile from '../components/StatTile.jsx'
import TrendChart from '../components/TrendChart.jsx'
import { activity, formatValue, kpis, portfolioTrend } from '../data/metrics.js'

// One accent per tile — independent stat tiles, not an adjacent multi-series
// chart, so all four categorical slots are free to use.
const ACCENTS = ['var(--series-1)', 'var(--series-3)', 'var(--series-4)', 'var(--series-2)']

export default function Overview() {
  const valueKpi = kpis[0]
  const ytdGain = valueKpi.spark.at(-1) - valueKpi.spark[0]
  const portfolioReturn = portfolioTrend.series[0].values.at(-1) - 100
  const benchmarkReturn = portfolioTrend.series[1].values.at(-1) - 100
  const edge = portfolioReturn - benchmarkReturn

  return (
    <>
      {/* Exactly one hero figure per view. */}
      <section className="card">
        <div className="stat-label">Total portfolio value</div>
        <div className="hero">
          <div className="hero-figure">{formatValue(valueKpi.value, 'currency')}</div>
          <div className="hero-note">
            Up {formatValue(ytdGain, 'currency')} this year ·{' '}
            <span style={{ color: 'var(--delta-good)', fontWeight: 600 }}>
              ▲ {portfolioReturn.toFixed(1)}%
            </span>{' '}
            YTD · outperforming the S&amp;P 500 by {edge.toFixed(1)} pts
          </div>
        </div>
      </section>

      <section className="grid-kpi">
        {kpis.map((kpi, i) => (
          <StatTile key={kpi.id} kpi={kpi} accent={ACCENTS[i]} />
        ))}
      </section>

      <div className="grid-2">
        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Performance vs. S&amp;P 500</h2>
          </div>
          <p className="card-sub">
            Both lines indexed to 100 at the start of the year, so growth is directly
            comparable even though the portfolio is priced in dollars and the benchmark
            in index points.
          </p>
          <TrendChart
            categories={portfolioTrend.categories}
            series={portfolioTrend.series}
            zeroBaseline={false}
            ariaLabel={`Portfolio vs. S&P 500, indexed to 100. Portfolio ended at ${portfolioTrend.series[0].values.at(-1)}, S&P 500 at ${portfolioTrend.series[1].values.at(-1)}.`}
          />
        </section>

        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Recent activity</h2>
          </div>
          <p className="card-sub">Last 5 transactions across all accounts.</p>
          <div className="activity-list">
            {activity.map((a) => (
              <div className="activity-row" key={a.id}>
                <span className={`activity-icon ${a.kind}`} aria-hidden="true">
                  {a.kind === 'div' ? '$' : a.kind === 'buy' ? '↓' : '↑'}
                </span>
                <div className="activity-body">
                  <div className="activity-title">{a.title}</div>
                  <div className="activity-when">{a.when}</div>
                </div>
                <span className={`activity-amount ${a.amount >= 0 ? 'good' : ''}`}>
                  {a.amount >= 0 ? '+' : '-'}${Math.abs(a.amount).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
