import { useState } from 'react'
import { Card, CardHeader, CardTitle } from './Card'
import { COLORS } from '../lib/constants'
import styles from './DonutChart.module.css'

function buildDonutPaths(slices) {
  const cx = 70, cy = 70, r = 55, ir = 36
  let angle = -Math.PI / 2
  return slices.map(s => {
    const sweep = s.pct / 100 * Math.PI * 2
    if (sweep < 0.001) return null
    const x1  = cx + r  * Math.cos(angle), y1  = cy + r  * Math.sin(angle)
    const xi1 = cx + ir * Math.cos(angle), yi1 = cy + ir * Math.sin(angle)
    angle += sweep
    const x2  = cx + r  * Math.cos(angle), y2  = cy + r  * Math.sin(angle)
    const xi2 = cx + ir * Math.cos(angle), yi2 = cy + ir * Math.sin(angle)
    const large = sweep > Math.PI ? 1 : 0
    const d = `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${xi2.toFixed(2)},${yi2.toFixed(2)} A${ir},${ir} 0 ${large},0 ${xi1.toFixed(2)},${yi1.toFixed(2)} Z`
    return { d, color: s.color, ticker: s.ticker }
  }).filter(Boolean)
}

export function DonutChart({ holdings, targets }) {
  const [mode, setMode] = useState('current')
  const total = holdings.reduce((s, h) => s + h.value, 0)

  const slices = holdings.map((h, i) => ({
    ticker: h.ticker,
    pct: mode === 'current'
      ? (total > 0 ? h.value / total * 100 : 0)
      : (targets[h.ticker] || 0),
    color: COLORS[i % COLORS.length],
  }))

  const paths = buildDonutPaths(slices)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocation Split</CardTitle>
        <select
          className={styles.select}
          value={mode}
          onChange={e => setMode(e.target.value)}
        >
          <option value="current">Current</option>
          <option value="target">Target</option>
        </select>
      </CardHeader>

      <div className={styles.wrap}>
        <svg viewBox="0 0 140 140" width={140} height={140} className={styles.svg}>
          {paths.map(p => (
            <path key={p.ticker} d={p.d} fill={p.color} opacity={0.9} />
          ))}
          <text x="70" y="66" textAnchor="middle" fill="var(--text)" fontFamily="DM Mono,monospace" fontSize="11" fontWeight="500">
            {mode === 'current' ? 'Current' : 'Target'}
          </text>
          <text x="70" y="80" textAnchor="middle" fill="var(--text2)" fontFamily="DM Mono,monospace" fontSize="9">
            alloc
          </text>
        </svg>

        <div className={styles.legend}>
          {slices.map(s => (
            <div key={s.ticker} className={styles.legendItem}>
              <div className={styles.dot} style={{ background: s.color }} />
              <span className={styles.legendName}>{s.ticker}</span>
              <span className={styles.legendPct}>{s.pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
