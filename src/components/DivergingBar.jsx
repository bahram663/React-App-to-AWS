import { useRef, useState } from 'react'

const W = 560
const ROW_H = 34
const BAR_H = 20 // ≤ 24px; the row's leftover is air
const PAD = { top: 8, right: 20, left: 64 }

/**
 * Horizontal diverging bar chart: bars grow left or right from a zero
 * baseline. Job = "above/below a baseline" (today's % move per holding),
 * so this is diverging, not magnitude — a plain bar-from-zero would bury
 * the sign, which is the entire point of the chart.
 *
 * Color carries the sign (gain/loss), which is a reserved status use, not a
 * series identity — so every bar also gets an ▲/▼ marker and its label,
 * never color alone.
 */
export default function DivergingBar({ data, unit = '%' }) {
  const wrapRef = useRef(null)
  const [hover, setHover] = useState(null)

  const maxAbs = Math.max(...data.map((d) => Math.abs(d.value)), 0.5)
  const domainMax = Math.ceil(maxAbs / 0.5) * 0.5
  const plotBottom = PAD.top + data.length * ROW_H - (ROW_H - BAR_H)
  const H = plotBottom + 26
  const plotW = W - PAD.left - PAD.right
  const halfPlot = plotW / 2
  const centerX = PAD.left + halfPlot

  const dx = (v) => (v / domainMax) * halfPlot
  const rowY = (i) => PAD.top + i * ROW_H

  const ticks = [-domainMax, -domainMax / 2, 0, domainMax / 2, domainMax]
  const fmtTick = (t) => (t === 0 ? '0' : `${t > 0 ? '+' : ''}${t.toFixed(1)}${unit}`)

  function onEnter(event, d, i) {
    const svgRect = event.currentTarget.ownerSVGElement.getBoundingClientRect()
    const figRect = wrapRef.current.getBoundingClientRect()
    const scale = svgRect.width / W
    const half = 90
    const rawLeft = svgRect.left - figRect.left + (centerX + dx(d.value)) * scale
    setHover({
      d,
      left: Math.min(Math.max(rawLeft, half), figRect.width - half),
      top: svgRect.top - figRect.top + (rowY(i) + BAR_H / 2) * scale - 8,
    })
  }

  return (
    <figure className="chart" ref={wrapRef}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Today's move by holding, ${data.map((d) => `${d.label} ${d.value >= 0 ? '+' : ''}${d.value.toFixed(1)}${unit}`).join(', ')}.`}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={centerX + dx(t)}
              x2={centerX + dx(t)}
              y1={PAD.top}
              y2={plotBottom}
              stroke="var(--gridline)"
              strokeWidth="1"
            />
            <text className="axis-text" x={centerX + dx(t)} y={plotBottom + 17} textAnchor="middle">
              {fmtTick(t)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const good = d.value >= 0
          const color = good ? 'var(--delta-good)' : 'var(--delta-bad)'
          const barX = centerX + Math.min(dx(d.value), 0)
          const barW = Math.max(Math.abs(dx(d.value)), 3)
          const dim = hover && hover.d.id !== d.id
          return (
            <g key={d.id} onMouseEnter={(e) => onEnter(e, d, i)}>
              <rect x={0} y={rowY(i) - (ROW_H - BAR_H) / 2} width={W} height={ROW_H} fill="transparent" />
              <text className="bar-row-label" x={PAD.left - 10} y={rowY(i) + BAR_H / 2 + 4} textAnchor="end">
                {d.label}
              </text>
              <rect
                x={barX}
                y={rowY(i)}
                width={barW}
                height={BAR_H}
                rx="4"
                fill={color}
                fillOpacity={dim ? 0.45 : 1}
              />
              <text
                className="label-text"
                x={good ? barX + barW + 8 : barX - 8}
                y={rowY(i) + BAR_H / 2 + 4}
                textAnchor={good ? 'start' : 'end'}
              >
                <tspan aria-hidden="true">{good ? '▲' : '▼'}</tspan> {Math.abs(d.value).toFixed(1)}{unit}
              </text>
            </g>
          )
        })}

        <line x1={centerX} x2={centerX} y1={PAD.top} y2={plotBottom} stroke="var(--baseline)" strokeWidth="1.5" />
      </svg>

      {hover && (
        <div className="tooltip" style={{ left: `${hover.left}px`, top: `${hover.top}px` }}>
          <div className="tooltip-title">{hover.d.name ?? hover.d.label}</div>
          <div className="tooltip-row">
            <span className="tooltip-name">
              <span className="tooltip-swatch" style={{ background: hover.d.value >= 0 ? 'var(--delta-good)' : 'var(--delta-bad)' }} />
              Today
            </span>
            <span className="tooltip-val">
              {hover.d.value >= 0 ? '+' : ''}
              {hover.d.value.toFixed(1)}
              {unit}
            </span>
          </div>
        </div>
      )}
    </figure>
  )
}
