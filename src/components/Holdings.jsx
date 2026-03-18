import { useState } from 'react'
import { Card, CardHeader, CardTitle } from './Card'
import { COLORS } from '../lib/constants'
import styles from './Holdings.module.css'

export function Holdings({ holdings, onAdd, onRemove }) {
  const [showAdd, setShowAdd] = useState(false)
  const [ticker, setTicker]   = useState('')
  const [value, setValue]     = useState('')

  const total = holdings.reduce((s, h) => s + h.value, 0)

  const handleAdd = () => {
    const t = ticker.trim().toUpperCase()
    const v = parseFloat(value)
    if (!t || isNaN(v) || v <= 0) return
    onAdd(t, v)
    setTicker('')
    setValue('')
    setShowAdd(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Holdings</CardTitle>
        <button className={styles.ghostBtn} onClick={() => setShowAdd(s => !s)}>
          {showAdd ? '✕ Cancel' : '+ Add'}
        </button>
      </CardHeader>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Asset</th>
            <th className={styles.barCell}>Current %</th>
            <th className={styles.right}>Value</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h, i) => {
            const pct = total > 0 ? (h.value / total * 100).toFixed(1) : '0.0'
            const color = COLORS[i % COLORS.length]
            return (
              <tr key={h.ticker}>
                <td>
                  <div className={styles.ticker}>{h.ticker}</div>
                  <div className={styles.name}>{h.name}</div>
                </td>
                <td className={styles.barCell}>
                  <div className={styles.barWrap}>
                    <div className={styles.barBg}>
                      <div className={styles.barFill} style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className={styles.pctVal}>{pct}%</span>
                  </div>
                </td>
                <td className={styles.right}>${h.value.toLocaleString()}</td>
                <td>
                  <button className={styles.removeBtn} onClick={() => onRemove(h.ticker)}>×</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {showAdd && (
        <div className={styles.addRow}>
          <input
            className={styles.input}
            placeholder="TICKER"
            value={ticker}
            onChange={e => setTicker(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <input
            className={styles.input}
            placeholder="Value ($)"
            type="number"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button className={styles.addBtn} onClick={handleAdd}>Add</button>
        </div>
      )}
    </Card>
  )
}
