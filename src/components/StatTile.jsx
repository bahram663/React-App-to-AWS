import { formatValue } from '../data/metrics.js'
import { WalletIcon, PulseIcon, TargetIcon, PiggyBankIcon } from './icons.jsx'

const ICONS = {
  wallet: WalletIcon,
  pulse: PulseIcon,
  target: TargetIcon,
  piggy: PiggyBankIcon,
}

// 12-point sparkline: de-emphasised line with a soft gradient fill under it,
// the current period marked in the accent.
function Sparkline({ points, accent, gradientId }) {
  const w = 108
  const h = 30
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const x = (i) => (i / (points.length - 1)) * w
  const y = (v) => h - ((v - min) / span) * h

  const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const areaD = `${d} L${x(points.length - 1).toFixed(1)},${h} L0,${h} Z`
  const lastX = x(points.length - 1)
  const lastY = y(points[points.length - 1])

  return (
    <svg width={w} height={h + 8} viewBox={`0 0 ${w} ${h + 8}`} role="presentation" style={{ width: w, flex: '0 0 auto' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform="translate(0,4)">
        <path d={areaD} fill={`url(#${gradientId})`} stroke="none" />
        <path d={d} fill="none" stroke="var(--baseline)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lastX} cy={lastY} r="4" fill={accent} stroke="var(--surface-1)" strokeWidth="2" />
      </g>
    </svg>
  )
}

export default function StatTile({ kpi, accent = 'var(--series-1)' }) {
  const positive = kpi.delta >= 0
  const isGood = positive === kpi.upIsGood
  const IconCmp = ICONS[kpi.icon] ?? WalletIcon

  return (
    <article className="card stat-tile" style={{ '--accent': accent }}>
      <div className="stat-tile-head">
        <div>
          <div className="stat-label">{kpi.label}</div>
          <div className="stat-value">{formatValue(kpi.value, kpi.format)}</div>
        </div>
        <span className="stat-icon">
          <IconCmp size={18} />
        </span>
      </div>
      <div className="stat-foot">
        <div>
          <span className={`stat-delta ${isGood ? 'good' : 'bad'}`}>
            <span aria-hidden="true">{positive ? '▲' : '▼'}</span>
            {Math.abs(kpi.delta).toFixed(1)}%
          </span>{' '}
          <span className="stat-period">{kpi.period}</span>
        </div>
        <Sparkline points={kpi.spark} accent={accent} gradientId={`spark-${kpi.id}`} />
      </div>
    </article>
  )
}
