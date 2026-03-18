import { Card } from './Card'
import styles from './Settings.module.css'

export function Settings({ portfolioValue, riskProfile, taxStrategy, onChange }) {
  return (
    <Card>
      <div className={styles.grid}>
        <Field label="Portfolio Value ($)">
          <input
            className={styles.input}
            type="number"
            value={portfolioValue}
            step={1000}
            onChange={e => onChange('portfolioValue', +e.target.value)}
          />
        </Field>
        <Field label="Risk Profile">
          <select
            className={styles.select}
            value={riskProfile}
            onChange={e => onChange('riskProfile', e.target.value)}
          >
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
            <option value="custom">Custom</option>
          </select>
        </Field>
        <Field label="Tax Strategy">
          <select
            className={styles.select}
            value={taxStrategy}
            onChange={e => onChange('taxStrategy', e.target.value)}
          >
            <option value="tax_aware">Tax-Aware</option>
            <option value="ignore">Ignore Taxes</option>
            <option value="tax_loss_harvest">TLH Focus</option>
          </select>
        </Field>
      </div>
    </Card>
  )
}

function Field({ label, children }) {
  return (
    <div className={styles.field}>
      <div className={styles.label}>{label}</div>
      {children}
    </div>
  )
}
