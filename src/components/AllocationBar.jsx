import { useRef, useState } from 'react'
import { formatValue } from '../data/metrics.js'

// Fixed categorical order (never cycled) — the first four slots of the
// validated palette, which pass the adjacent-pair CVD gate for stacked bars.
const COLORS = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)']

/**
 * Part-to-whole: one stacked bar, categorical color, always-visible legend
 * with the exact value beside every segment (identity is never color-alone).
 */
export default function AllocationBar({ data }) {
  const wrapRef = useRef(null)
  const [hover, setHover] = useState(null)

  function onEnter(event, d) {
    const segRect = event.currentTarget.getBoundingClientRect()
    const wrapRect = wrapRef.current.getBoundingClientRect()
    setHover({
      d,
      left: segRect.left - wrapRect.left + segRect.width / 2,
      top: segRect.top - wrapRect.top,
    })
  }

  return (
    <figure className="chart" ref={wrapRef}>
      <div
        className="stack-bar"
        role="img"
        aria-label={`Portfolio allocation: ${data.map((d) => `${d.label} ${d.pct}%`).join(', ')}.`}
      >
        {data.map((d, i) => (
          <div
            key={d.id}
            className="stack-seg"
            style={{ width: `${d.pct}%`, background: COLORS[i % COLORS.length] }}
            onMouseEnter={(e) => onEnter(e, d)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </div>

      <div className="legend-values">
        {data.map((d, i) => (
          <div className="legend-value-item" key={d.id}>
            <span className="legend-key" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="legend-value-name">{d.label}</span>
            <span className="legend-value-pct">{d.pct}%</span>
            <span className="legend-value-num">{formatValue(d.value, 'currency')}</span>
          </div>
        ))}
      </div>

      {hover && (
        <div className="tooltip" style={{ left: `${hover.left}px`, top: `${hover.top - 8}px` }}>
          <div className="tooltip-title">{hover.d.label}</div>
          <div className="tooltip-row">
            <span className="tooltip-val">
              {formatValue(hover.d.value, 'currency')} · {hover.d.pct}%
            </span>
          </div>
        </div>
      )}
    </figure>
  )
}
