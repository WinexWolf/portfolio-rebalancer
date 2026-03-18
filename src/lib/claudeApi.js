const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const MODEL   = import.meta.env.VITE_CLAUDE_MODEL || 'claude-sonnet-4-20250514'

/**
 * Analyze a portfolio and return narrative + trade recommendations.
 * @param {Object} params
 * @param {Array}  params.holdings      - Array of { ticker, name, value }
 * @param {Object} params.targets       - Map of ticker → target %
 * @param {number} params.portfolioValue
 * @param {string} params.riskProfile
 * @param {string} params.taxStrategy
 * @returns {Promise<{ narrative: string, trades: Array }>}
 */
export async function analyzePortfolio({ holdings, targets, portfolioValue, riskProfile, taxStrategy }) {
  if (!API_KEY) throw new Error('VITE_ANTHROPIC_API_KEY is not set. Copy .env.example → .env and add your key.')

  const total = holdings.reduce((s, h) => s + h.value, 0)

  const curAllocs = holdings.map(h => ({
    ticker:       h.ticker,
    current_value: h.value,
    current_pct:  (h.value / total * 100).toFixed(2),
    target_pct:   targets[h.ticker] || 0,
    drift_pct:    ((h.value / total * 100) - (targets[h.ticker] || 0)).toFixed(2),
  }))

  const prompt = `You are a professional portfolio manager AI. Analyze this rebalancing request.

Portfolio Value: $${portfolioValue.toLocaleString()}
Risk Profile: ${riskProfile}
Tax Strategy: ${taxStrategy}

Current vs Target Allocations:
${JSON.stringify(curAllocs, null, 2)}

Provide:
1. A concise executive summary (2-3 sentences) of the portfolio's current state and drift
2. Key observations about the largest drift positions
3. Rebalancing urgency assessment
4. 3-5 specific trade recommendations as a JSON array

End your response with exactly this block:

TRADES_JSON:
[{"ticker":"AAPL","action":"BUY","amount_usd":1200,"from_pct":12.5,"to_pct":15.0,"impact":"LOW"},...]

Actions must be BUY or SELL. Impact must be HIGH (>5% of portfolio), MED (2-5%), or LOW (<2%).
Keep the narrative concise and professional. End with the TRADES_JSON block and nothing after it.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  const text = data.content?.map(b => b.text || '').join('') || ''

  const tradesMatch = text.match(/TRADES_JSON:\s*(\[[\s\S]*?\])\s*$/)
  const narrative   = text.replace(/TRADES_JSON:[\s\S]*$/, '').trim()
  let trades = []

  if (tradesMatch) {
    try { trades = JSON.parse(tradesMatch[1]) } catch (_) { /* malformed JSON */ }
  }

  return { narrative, trades }
}
