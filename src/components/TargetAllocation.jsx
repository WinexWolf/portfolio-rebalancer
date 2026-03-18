import { Card, CardHeader, CardTitle } from './Card'
import { COLORS } from '../lib/constants'
import styles from './TargetAllocation.module.css'

export function TargetAllocation({ holdings, targets, onUpdate, totalTargetPct }) {
  const isOk = Math.abs(totalTargetPct - 100) < 0.5

  return (
    <Card>
      <CardHeader>
        <CardTitle>Target Allocation</CardTitle>
        <span className={`${styles.total} ${isOk ? styles.ok : styles.bad}`}>
          {totalTargetPct.toFixed(1)}%
        </span>
      </CardHeader>

      <div className={styles.grid}>
        {holdings.map((h, i) => {
          const val   = targets[h.ticker] ?? 0
          const color = COLORS[i % COLORS.length]
          return (
            <div key={h.ticker} className={styles.row}>
              <span className={styles.ticker}>{h.ticker}</span>
              <input
                type="range"
                min={0} max={100} step={0.5}
                value={val}
                style={{ accentColor: color }}
                className={styles.slider}
                onChange={e => onUpdate(h.ticker, +e.target.value)}
              />
              <input
                type="number"
                min={0} max={100} step={0.5}
                value={val}
                className={styles.numInput}
                onChange={e => onUpdate(h.ticker, +e.target.value)}
              />
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        <span className={styles.footerLabel}>Total Allocated</span>
        <span className={`${styles.total} ${isOk ? styles.ok : styles.bad}`}>
          {totalTargetPct.toFixed(1)}%
        </span>
      </div>
    </Card>
  )
}
