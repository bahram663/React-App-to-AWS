import { useRef, useState } from 'react'

const W = 560
const ROW_H = 34
const BAR_H = 20 // ≤ 24px; the row's leftover is air
const PAD = { top: 8, right: 56, left: 118 }

/**
 * Single-series horizontal bar chart. One series, so no legend box —
 * the card title says what is plotted. Values ride the bar tips.
 */
export default function BarChart({ data, unit = '%', accent = 'var(--series-1)' }) {
  const wrapRef = useRef(null)
  const [hover, setHover] = useState(null)

  // Bottom of the last bar, not the bottom of the row band — the axis and its
  // tick labels sit just under the marks rather than under the row's air.
  const plotBottom = PAD.top + data.length * ROW_H - (ROW_H - BAR_H)
  const H = plotBottom + 26
  const plotW = W - PAD.left - PAD.right
  const max = 100 // cache hit rate — a fixed, meaningful ceiling
  const bar = (v) => (v / max) * plotW
  const rowY = (i) => PAD.top + i * ROW_H

  function onEnter(event, d, i) {
    const svgRect = event.currentTarget.ownerSVGElement.getBoundingClientRect()
    const figRect = wrapRef.current.getBoundingClientRect()
    const scale = svgRect.width / W
    const half = 80
    const rawLeft = svgRect.left - figRect.left + (PAD.left + bar(d.value)) * scale
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
        aria-label={`Cache hit rate by region, ${data.map((d) => `${d.region} ${d.value}${unit}`).join(', ')}.`}
        onMouseLeave={() => setHover(null)}
      >
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={t}>
            <line
              x1={PAD.left + bar(t)}
              x2={PAD.left + bar(t)}
              y1={PAD.top}
              y2={plotBottom}
              stroke="var(--gridline)"
              strokeWidth="1"
            />
            <text className="axis-text" x={PAD.left + bar(t)} y={plotBottom + 17} textAnchor="middle">
              {t}
            </text>
          </g>
        ))}

        {data.map((d, i) => (
          <g key={d.region} onMouseEnter={(e) => onEnter(e, d, i)}>
            {/* hit target larger than the mark */}
            <rect x={0} y={rowY(i) - (ROW_H - BAR_H) / 2} width={W} height={ROW_H} fill="transparent" />
            <text className="axis-text" x={PAD.left - 10} y={rowY(i) + BAR_H / 2 + 4} textAnchor="end">
              {d.region}
            </text>
            <rect
              x={PAD.left}
              y={rowY(i)}
              width={Math.max(bar(d.value), 4)}
              height={BAR_H}
              rx="4"
              fill={accent}
              fillOpacity={hover && hover.d.region !== d.region ? 0.45 : 1}
            />
            {/* square off the baseline end so the bar grows from the axis */}
            <rect x={PAD.left} y={rowY(i)} width="4" height={BAR_H} fill={accent} fillOpacity={hover && hover.d.region !== d.region ? 0.45 : 1} />
            <text className="label-text" x={PAD.left + bar(d.value) + 9} y={rowY(i) + BAR_H / 2 + 4}>
              {d.value}
              {unit}
            </text>
          </g>
        ))}

        <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={plotBottom} stroke="var(--baseline)" strokeWidth="1" />
      </svg>

      {hover && (
        <div className="tooltip" style={{ left: `${hover.left}px`, top: `${hover.top}px` }}>
          <div className="tooltip-title">{hover.d.region}</div>
          <div className="tooltip-row">
            <span className="tooltip-name">
              <span className="tooltip-swatch" style={{ background: accent }} />
              Cache hit rate
            </span>
            <span className="tooltip-val">
              {hover.d.value}
              {unit}
            </span>
          </div>
        </div>
      )}
    </figure>
  )
}
