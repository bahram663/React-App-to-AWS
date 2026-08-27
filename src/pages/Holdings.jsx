import { useState } from 'react'
import AllocationBar from '../components/AllocationBar.jsx'
import DivergingBar from '../components/DivergingBar.jsx'
import { allocation, formatValue, holdings, portfolioSummary, topMovers } from '../data/metrics.js'

export default function Holdings() {
  const [showTable, setShowTable] = useState(false)

  return (
    <>
      <div className="grid-2">
        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Allocation</h2>
            <button className="toggle-link" onClick={() => setShowTable((v) => !v)}>
              {showTable ? 'Show chart' : 'Show table'}
            </button>
          </div>
          <p className="card-sub">Share of total portfolio value by asset class.</p>

          {showTable ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="num">Share</th>
                    <th className="num">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {allocation.map((a) => (
                    <tr key={a.id}>
                      <td>{a.label}</td>
                      <td className="num">{a.pct}%</td>
                      <td className="num">{formatValue(a.value, 'currency')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AllocationBar data={allocation} />
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2 className="card-title">Portfolio summary</h2>
          </div>
          <p className="card-sub">Across {portfolioSummary.count} open positions.</p>
          <dl className="kv">
            <dt>Positions value</dt>
            <dd>{formatValue(portfolioSummary.totalValue, 'currency')}</dd>
            <dt>Cost basis</dt>
            <dd>{formatValue(portfolioSummary.totalCost, 'currency')}</dd>
            <dt>Unrealized gain</dt>
            <dd style={{ color: 'var(--delta-good)' }}>
              {formatValue(portfolioSummary.gain, 'currency')} (+{portfolioSummary.gainPct.toFixed(1)}%)
            </dd>
            <dt>Largest position</dt>
            <dd>
              <code>{portfolioSummary.largestSymbol}</code> · {portfolioSummary.largestPct.toFixed(1)}% of positions
            </dd>
            <dt>Best performer</dt>
            <dd>
              <code>{portfolioSummary.bestSymbol}</code> · +{portfolioSummary.bestReturnPct.toFixed(1)}% all-time
            </dd>
          </dl>
        </section>
      </div>

      <section className="card">
        <div className="card-head">
          <h2 className="card-title">Today's movers</h2>
        </div>
        <p className="card-sub">Intraday change by holding.</p>
        <DivergingBar data={topMovers} />
      </section>

      <section className="card">
        <div className="card-head">
          <h2 className="card-title">Holdings</h2>
        </div>
        <p className="card-sub">All open positions, largest first.</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Category</th>
                <th className="num">Units</th>
                <th className="num">Avg. cost</th>
                <th className="num">Price</th>
                <th className="num">Value</th>
                <th className="num">Day</th>
                <th className="num">Total return</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.symbol}>
                  <td>
                    <code>{h.symbol}</code>
                    <div className="stat-period">{h.name}</div>
                  </td>
                  <td>{h.category}</td>
                  <td className="num">
                    {h.units} {h.unitLabel}
                  </td>
                  <td className="num">{formatValue(h.avgCost, 'currency')}</td>
                  <td className="num">{formatValue(h.price, 'currency')}</td>
                  <td className="num">{formatValue(h.value, 'currency')}</td>
                  <td className="num" style={{ color: h.dayChangePct >= 0 ? 'var(--delta-good)' : 'var(--delta-bad)' }}>
                    {h.dayChangePct >= 0 ? '▲' : '▼'} {Math.abs(h.dayChangePct).toFixed(1)}%
                  </td>
                  <td className="num" style={{ color: h.totalReturnPct >= 0 ? 'var(--delta-good)' : 'var(--delta-bad)' }}>
                    {h.totalReturnPct >= 0 ? '▲' : '▼'} {Math.abs(h.totalReturnPct).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
