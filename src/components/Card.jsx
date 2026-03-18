import styles from './Card.module.css'

export function Card({ children, className = '', highlight = false, style }) {
  return (
    <div
      className={`${styles.card} ${highlight ? styles.highlight : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children }) {
  return <div className={styles.header}>{children}</div>
}

export function CardTitle({ children }) {
  return <div className={styles.title}>{children}</div>
}
