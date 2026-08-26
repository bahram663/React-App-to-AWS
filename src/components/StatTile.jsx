import { formatValue } from '../data/metrics.js'

// 12-point sparkline: de-emphasised line with the current period in the accent.
function Sparkline({ points, accent }) {
  const w = 96
  const h = 26
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const x = (i) => (i / (points.length - 1)) * w
  const y = (v) => h - ((v - min) / span) * h

  const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const lastX = x(points.length - 1)
  const lastY = y(points[points.length - 1])

  return (
    <svg width={w} height={h + 8} viewBox={`0 0 ${w} ${h + 8}`} role="presentation" style={{ width: w, flex: '0 0 auto' }}>
      <path d={d} transform="translate(0,4)" fill="none" stroke="var(--baseline)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY + 4} r="4" fill={accent} stroke="var(--surface-1)" strokeWidth="2" />
    </svg>
  )
}

export default function StatTile({ kpi, accent = 'var(--series-1)' }) {
  const positive = kpi.delta >= 0
  const isGood = positive === kpi.upIsGood

  return (
    <article className="card">
      <div className="stat-label">{kpi.label}</div>
      <div className="stat-value">{formatValue(kpi.value, kpi.format)}</div>
      <div className="stat-foot">
        <div>
          <span className={`stat-delta ${isGood ? 'good' : 'bad'}`}>
            <span aria-hidden="true">{positive ? '▲' : '▼'}</span>
            {Math.abs(kpi.delta).toFixed(1)}%
          </span>{' '}
          <span className="stat-period">{kpi.period}</span>
        </div>
        <Sparkline points={kpi.spark} accent={accent} />
      </div>
    </article>
  )
}
