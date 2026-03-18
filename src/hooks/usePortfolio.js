import { useState, useCallback } from 'react'
import { SAMPLE_HOLDINGS, SAMPLE_TARGETS } from '../lib/constants'

export function usePortfolio() {
  const [holdings, setHoldings]     = useState([])
  const [targets, setTargets]       = useState({})
  const [portfolioValue, setPortfolioValue] = useState(125000)
  const [riskProfile, setRiskProfile]       = useState('moderate')
  const [taxStrategy, setTaxStrategy]       = useState('tax_aware')

  const loadSample = useCallback(() => {
    setHoldings(SAMPLE_HOLDINGS)
    setTargets(SAMPLE_TARGETS)
    setPortfolioValue(SAMPLE_HOLDINGS.reduce((s, h) => s + h.value, 0))
  }, [])

  const addHolding = useCallback((ticker, value) => {
    const t = ticker.toUpperCase().trim()
    setHoldings(prev => {
      if (prev.find(h => h.ticker === t)) return prev
      return [...prev, { ticker: t, name: t, value }]
    })
    setTargets(prev => ({ ...prev, [t]: 0 }))
    setPortfolioValue(prev => prev + value)
  }, [])

  const removeHolding = useCallback((ticker) => {
    setHoldings(prev => prev.filter(h => h.ticker !== ticker))
    setTargets(prev => { const n = { ...prev }; delete n[ticker]; return n })
  }, [])

  const updateTarget = useCallback((ticker, val) => {
    setTargets(prev => ({ ...prev, [ticker]: val }))
  }, [])

  const applyTrades = useCallback((trades) => {
    setHoldings(prev => prev.map(h => {
      const trade = trades.find(t => t.ticker === h.ticker)
      if (!trade) return h
      const delta = trade.action === 'BUY' ? trade.amount_usd : -trade.amount_usd
      return { ...h, value: Math.max(0, h.value + delta) }
    }))
  }, [])

  const totalValue   = holdings.reduce((s, h) => s + h.value, 0)
  const totalTargetPct = Object.values(targets).reduce((s, v) => s + v, 0)

  const driftScore = holdings.reduce((sum, h) => {
    const cur = totalValue > 0 ? h.value / totalValue * 100 : 0
    return sum + Math.abs(cur - (targets[h.ticker] || 0))
  }, 0)

  return {
    holdings, targets, portfolioValue, riskProfile, taxStrategy,
    totalValue, totalTargetPct, driftScore,
    loadSample, addHolding, removeHolding, updateTarget, applyTrades,
    setPortfolioValue, setRiskProfile, setTaxStrategy,
  }
}
