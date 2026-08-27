import { useRef, useState } from 'react'

const W = 760
const H = 260
const PAD = { top: 16, right: 56, bottom: 30, left: 44 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom

const SERIES_COLORS = ['var(--series-1)', 'var(--series-2)']

// Round tick values that fully cover [min, max] — otherwise the series can
// run off the plot. `zeroBaseline` pins the bottom tick to 0 (required for
// magnitude charts, where a windowed axis would exaggerate the trend); line
// charts of a continuous value like a price index instead window to the data.
function niceTicks(min, max, { zeroBaseline = true, count = 5 } = {}) {
  const lo = zeroBaseline ? 0 : min
  const range = max - lo || 1
  const rawStep = range / count
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= rawStep) ?? 10 * mag
  const niceMin = zeroBaseline ? 0 : Math.floor(lo / step) * step
  const niceMax = Math.ceil(max / step) * step
  const ticks = []
  for (let t = niceMin; t <= niceMax + step * 1e-6; t += step) ticks.push(t)
  return ticks
}

/**
 * Multi-series line + area chart with a crosshair tooltip.
 * One y-axis only — every series passed in must already share a unit.
 */
export default function TrendChart({ categories, series, unit = '', ariaLabel, zeroBaseline = true }) {
  const wrapRef = useRef(null)
  const [hover, setHover] = useState(null)

  const dataMin = Math.min(...series.flatMap((s) => s.values))
  const dataMax = Math.max(...series.flatMap((s) => s.values))
  const ticks = niceTicks(dataMin, dataMax, { zeroBaseline })
  const yMin = ticks[0]
  const yMax = ticks[ticks.length - 1]

  const x = (i) => PAD.left + (i / (categories.length - 1)) * PLOT_W
  const y = (v) => PAD.top + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H

  const linePath = (values) =>
    values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ')

  const areaPath = (values) =>
    `${linePath(values)} L${x(values.length - 1).toFixed(2)},${(PAD.top + PLOT_H).toFixed(2)} ` +
    `L${x(0).toFixed(2)},${(PAD.top + PLOT_H).toFixed(2)} Z`

  // Tooltip is an HTML overlay on the <figure>, so translate SVG user units
  // into figure-relative pixels and keep the box inside the figure's width.
  function onMove(event) {
    const svgRect = event.currentTarget.getBoundingClientRect()
    const figRect = wrapRef.current.getBoundingClientRect()
    const scale = svgRect.width / W
    const localX = (event.clientX - svgRect.left) / scale
    const ratio = (localX - PAD.left) / PLOT_W
    const i = Math.min(
      categories.length - 1,
      Math.max(0, Math.round(ratio * (categories.length - 1))),
    )
    const topUnits = Math.min(...series.map((s) => y(s.values[i])))
    const half = 84
    const rawLeft = svgRect.left - figRect.left + x(i) * scale
    setHover({
      i,
      left: Math.min(Math.max(rawLeft, half), figRect.width - half),
      top: svgRect.top - figRect.top + topUnits * scale - 12,
    })
  }

  return (
    <figure className="chart" ref={wrapRef}>
      {/* Legend is always present for 2+ series — identity is never colour-alone. */}
      <div className="legend">
        {series.map((s, si) => (
          <span className="legend-item" key={s.id}>
            <span className="legend-key" style={{ background: SERIES_COLORS[si] }} />
            {s.name}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={ariaLabel ?? `${series.map((s) => s.name).join(' vs. ')} over time${unit ? `, in ${unit}` : ''}.`}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          {series.map((s, si) => (
            <linearGradient key={s.id} id={`trend-fill-${s.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES_COLORS[si]} stopOpacity="0.22" />
              <stop offset="100%" stopColor={SERIES_COLORS[si]} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* recessive hairline grid */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={PAD.left + PLOT_W} y1={y(t)} y2={y(t)} stroke="var(--gridline)" strokeWidth="1" />
            <text className="axis-text" x={PAD.left - 8} y={y(t) + 4} textAnchor="end">
              {t.toLocaleString('en-US')}
            </text>
          </g>
        ))}

        <line
          x1={PAD.left}
          x2={PAD.left + PLOT_W}
          y1={PAD.top + PLOT_H}
          y2={PAD.top + PLOT_H}
          stroke="var(--baseline)"
          strokeWidth="1"
        />

        {categories.map((c, i) =>
          i % 2 === 0 ? (
            <text className="axis-text" key={c} x={x(i)} y={H - 8} textAnchor="middle">
              {c}
            </text>
          ) : null,
        )}

        {series.map((s, si) => (
          <g key={s.id}>
            <path d={areaPath(s.values)} fill={`url(#trend-fill-${s.id})`} />
            <path
              d={linePath(s.values)}
              fill="none"
              stroke={SERIES_COLORS[si]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Selective direct label: the endpoint only. */}
            <circle
              cx={x(s.values.length - 1)}
              cy={y(s.values[s.values.length - 1])}
              r="4"
              fill={SERIES_COLORS[si]}
              stroke="var(--surface-1)"
              strokeWidth="2"
            />
            <text
              className="label-text"
              x={x(s.values.length - 1) + 10}
              y={y(s.values[s.values.length - 1]) + 4}
            >
              {s.values[s.values.length - 1]}
              {unit}
            </text>
          </g>
        ))}

        {hover && (
          <g pointerEvents="none">
            <line
              x1={x(hover.i)}
              x2={x(hover.i)}
              y1={PAD.top}
              y2={PAD.top + PLOT_H}
              stroke="var(--baseline)"
              strokeWidth="1"
            />
            {series.map((s, si) => (
              <circle
                key={s.id}
                cx={x(hover.i)}
                cy={y(s.values[hover.i])}
                r="4.5"
                fill={SERIES_COLORS[si]}
                stroke="var(--surface-1)"
                strokeWidth="2"
              />
            ))}
          </g>
        )}
      </svg>

      {hover && (
        <div className="tooltip" style={{ left: `${hover.left}px`, top: `${hover.top}px` }}>
          <div className="tooltip-title">{categories[hover.i]}</div>
          {series.map((s, si) => (
            <div className="tooltip-row" key={s.id}>
              <span className="tooltip-name">
                <span className="tooltip-swatch" style={{ background: SERIES_COLORS[si] }} />
                {s.name}
              </span>
              <span className="tooltip-val">
                {s.values[hover.i]}
                {unit}
              </span>
            </div>
          ))}
        </div>
      )}
    </figure>
  )
}
