// MCP App resource URI (per MCP Apps Extension spec)
export const MCP_APP_URI = 'ui://portfolio/rebalancer'

export const COLORS = [
  '#00e5a0', '#0096ff', '#ff6b35', '#b56fff',
  '#ffd60a', '#ff4d6d', '#00d4ff', '#7bed9f',
  '#eccc68', '#ff6348',
]

export const SAMPLE_HOLDINGS = [
  { ticker: 'AAPL', name: 'Apple Inc.',      value: 22000 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', value: 18500 },
  { ticker: 'VTI',  name: 'Vanguard Total',  value: 32000 },
  { ticker: 'BND',  name: 'Vanguard Bonds',  value: 15000 },
  { ticker: 'QQQ',  name: 'Invesco QQQ',     value: 14000 },
  { ticker: 'GLD',  name: 'SPDR Gold',       value:  8000 },
  { ticker: 'TSLA', name: 'Tesla Inc.',      value:  7500 },
  { ticker: 'AMZN', name: 'Amazon.com',      value:  8000 },
]

export const SAMPLE_TARGETS = {
  AAPL: 15, MSFT: 15, VTI: 25, BND: 15,
  QQQ: 12,  GLD: 8,   TSLA: 5, AMZN: 5,
}
