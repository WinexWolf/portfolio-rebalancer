import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle } from './Card'
import styles from './McpLog.module.css'

export function McpLog({ subscribeLogs }) {
  const [entries, setEntries] = useState([])
  const bottomRef = useRef(null)

  useEffect(() => {
    const unsub = subscribeLogs(setEntries)
    return unsub
  }, [subscribeLogs])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  return (
    <Card>
      <CardHeader>
        <CardTitle>MCP JSON-RPC Log</CardTitle>
        <span className={styles.hint}>postMessage transport · SEP-1865</span>
      </CardHeader>
      <div className={styles.log}>
        {entries.map((e, i) => {
          const isIn = e.direction.includes('HOST')
          return (
            <div key={i} className={styles.entry}>
              <span className={styles.ts}>{e.ts}</span>
              <span className={isIn ? styles.dirIn : styles.dirOut}>{e.direction}</span>
              <span className={styles.text}>
                <span className={styles.method}>{e.method}</span>{' '}
                {e.payload}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </Card>
  )
}
