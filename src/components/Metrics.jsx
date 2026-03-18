import { Card, CardHeader, CardTitle } from './Card'
import styles from './Metrics.module.css'

export function Metrics({ totalValue, driftScore, assetCount, status }) {
  const driftColor =
    driftScore < 5  ? 'var(--gain)' :
    driftScore < 15 ? 'var(--warn)' : 'var(--loss)'

  const statusColor =
    status === 'Rebalanced' ? 'var(--gain)' :
    status === 'Pending'    ? 'var(--warn)' : 'var(--text2)'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Metrics</CardTitle>
      </CardHeader>
      <div className={styles.grid}>
        <Metric label="Total Value"  value={`$${totalValue.toLocaleString()}`}          sub="portfolio" />
        <Metric label="Drift Score"  value={`${driftScore.toFixed(1)}%`}                sub="vs target"   valueColor={driftColor} />
        <Metric label="Assets"       value={assetCount}                                  sub="positions" />
        <Metric label="Status"       value={status}                                      sub="rebalance state" valueColor={statusColor} small />
      </div>
    </Card>
  )
}

function Metric({ label, value, sub, valueColor, small }) {
  return (
    <div className={styles.metric}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value} style={{ color: valueColor, fontSize: small ? '14px' : undefined }}>
        {value}
      </div>
      <div className={styles.sub}>{sub}</div>
    </div>
  )
}
