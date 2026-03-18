import { Card, CardHeader, CardTitle } from './Card'
import styles from './AnalysisPanel.module.css'

export function AnalysisPanel({ narrative, isLoading, error }) {
  return (
    <Card highlight className={`${styles.card} fade-in`}>
      <CardHeader>
        <CardTitle>AI Analysis · Claude</CardTitle>
        <span className={styles.badge}>
          {isLoading ? 'PROCESSING' : error ? 'ERROR' : 'COMPLETE'}
        </span>
      </CardHeader>

      {isLoading && (
        <div className={styles.thinking}>
          <div className={styles.spinner} />
          Calling tools/call → analyze_portfolio…
        </div>
      )}

      {error && (
        <div className={styles.error}>⚠ {error}</div>
      )}

      {!isLoading && !error && narrative && (
        <pre className={styles.output}>{narrative}</pre>
      )}
    </Card>
  )
}
