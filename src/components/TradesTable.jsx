import { Card, CardHeader, CardTitle } from './Card'
import styles from './TradesTable.module.css'

function exportCsv(trades) {
  const rows = ['Action,Ticker,Amount USD,From %,To %,Impact',
    ...trades.map(t => `${t.action},${t.ticker},${t.amount_usd},${t.from_pct},${t.to_pct},${t.impact}`)
  ].join('\n')
  const blob = new Blob([rows], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = 'rebalance_trades.csv'; a.click()
  URL.revokeObjectURL(url)
}

export function TradesTable({ trades, onApply }) {
  if (!trades.length) return null

  return (
    <Card className="fade-in">
      <CardHeader>
        <CardTitle>Recommended Trades</CardTitle>
        <div className={styles.actions}>
          <button className={styles.ghostBtn} onClick={() => exportCsv(trades)}>
            Export CSV
          </button>
          <button className={styles.primaryBtn} onClick={onApply}>
            Apply All →
          </button>
        </div>
      </CardHeader>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Action</th>
              <th>Asset</th>
              <th>Est. Shares</th>
              <th>Amount</th>
              <th>From → To</th>
              <th>Impact</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t, i) => {
              const isBuy = t.action === 'BUY'
              const estShares = (t.amount_usd / 100).toFixed(1)
              return (
                <tr key={i}>
                  <td>
                    <span className={isBuy ? styles.buy : styles.sell}>
                      {isBuy ? '▲ BUY' : '▼ SELL'}
                    </span>
                  </td>
                  <td className={styles.tickerCell}>{t.ticker}</td>
                  <td className={styles.mono}>~{estShares}</td>
                  <td className={isBuy ? styles.pos : styles.neg}>
                    {isBuy ? '+' : '-'}${Math.abs(t.amount_usd).toLocaleString()}
                  </td>
                  <td className={styles.mono}>{t.from_pct}% → {t.to_pct}%</td>
                  <td>
                    <span className={`${styles.pill} ${styles[`impact${t.impact}`]}`}>
                      {t.impact}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
