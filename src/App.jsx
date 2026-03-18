import { useState, useCallback } from 'react'
import { usePortfolio }       from './hooks/usePortfolio'
import { useMcpBridge }       from './hooks/useMcpBridge'
import { analyzePortfolio }   from './lib/claudeApi'
import { MCP_APP_URI }        from './lib/constants'

import { Settings }       from './components/Settings'
import { Holdings }       from './components/Holdings'
import { TargetAllocation } from './components/TargetAllocation'
import { DonutChart }     from './components/DonutChart'
import { Metrics }        from './components/Metrics'
import { AnalysisPanel }  from './components/AnalysisPanel'
import { TradesTable }    from './components/TradesTable'
import { McpLog }         from './components/McpLog'

import styles from './App.module.css'

export default function App() {
  const portfolio = usePortfolio()
  const [trades,    setTrades]    = useState([])
  const [narrative, setNarrative] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiError,   setAiError]   = useState('')
  const [showAi,    setShowAi]    = useState(false)
  const [status,    setStatus]    = useState('Draft')

  // MCP host message handler
  const onHostMessage = useCallback((msg) => {
    if (msg.method === 'tools/call' && msg.params?.name === 'load_portfolio') {
      portfolio.loadSample()
    }
  }, [portfolio])

  const { sendToHost, mcpLog, subscribeLogs } = useMcpBridge(onHostMessage)

  const handleSettingsChange = (key, value) => {
    if (key === 'portfolioValue') portfolio.setPortfolioValue(value)
    if (key === 'riskProfile')    portfolio.setRiskProfile(value)
    if (key === 'taxStrategy')    portfolio.setTaxStrategy(value)
  }

  const handleAnalyze = async () => {
    if (!portfolio.holdings.length) return
    setIsLoading(true)
    setShowAi(true)
    setNarrative('')
    setAiError('')
    setTrades([])

    mcpLog('◀ HOST', 'tools/call', {
      name: 'analyze_portfolio',
      input: { portfolio_value: portfolio.totalValue, risk: portfolio.riskProfile }
    })

    try {
      const { narrative: n, trades: t } = await analyzePortfolio({
        holdings:       portfolio.holdings,
        targets:        portfolio.targets,
        portfolioValue: portfolio.portfolioValue,
        riskProfile:    portfolio.riskProfile,
        taxStrategy:    portfolio.taxStrategy,
      })

      setNarrative(n)
      setTrades(t)
      setStatus('Pending')

      mcpLog('▶ SERVER', 'tools/result', { status: 'ok', analysis_length: n.length })
      if (t.length) {
        sendToHost('resources/updated', {
          uri: `${MCP_APP_URI}/trades`,
          event: 'trades_ready',
          count: t.length,
        })
      }
    } catch (err) {
      setAiError(err.message)
      mcpLog('▶ SERVER', 'error', { code: -32603, message: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyTrades = () => {
    portfolio.applyTrades(trades)
    setTrades([])
    setStatus('Rebalanced')
    sendToHost('tools/call', { name: 'apply_trades', input: { confirm: true } })
    mcpLog('▶ SERVER', 'tools/result', { status: 'ok', message: 'Portfolio rebalanced' })
  }

  const handleLoadSample = () => {
    portfolio.loadSample()
    mcpLog('◀ HOST', 'tools/call', { name: 'load_portfolio', input: { preset: 'sample_moderate' } })
    mcpLog('▶ SERVER', 'tools/result', { status: 'ok', holdings: 8, value: 125000 })
  }

  return (
    <div className={styles.app}>
      {/* Background glow */}
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      {/* Header */}
      <header className={styles.header}>
        <div>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            MCP App · {MCP_APP_URI}
          </div>
          <h1 className={styles.title}>
            Portfolio <span className={styles.accent}>Rebalancer</span>
          </h1>
          <p className={styles.subtitle}>// AI-powered allocation analysis via MCP JSON-RPC</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.ghostBtn} onClick={handleLoadSample}>
            Load Sample
          </button>
          <button
            className={styles.primaryBtn}
            onClick={handleAnalyze}
            disabled={isLoading || !portfolio.holdings.length}
          >
            {isLoading ? 'Analyzing…' : 'Analyze Portfolio →'}
          </button>
        </div>
      </header>

      {/* Settings */}
      <div className={styles.section}>
        <Settings
          portfolioValue={portfolio.portfolioValue}
          riskProfile={portfolio.riskProfile}
          taxStrategy={portfolio.taxStrategy}
          onChange={handleSettingsChange}
        />
      </div>

      {/* Main grid */}
      <div className={styles.grid}>
        <Holdings
          holdings={portfolio.holdings}
          onAdd={portfolio.addHolding}
          onRemove={portfolio.removeHolding}
        />
        <TargetAllocation
          holdings={portfolio.holdings}
          targets={portfolio.targets}
          onUpdate={portfolio.updateTarget}
          totalTargetPct={portfolio.totalTargetPct}
        />
        <DonutChart holdings={portfolio.holdings} targets={portfolio.targets} />
        <Metrics
          totalValue={portfolio.totalValue}
          driftScore={portfolio.driftScore}
          assetCount={portfolio.holdings.length}
          status={status}
        />
      </div>

      {/* AI + Trades */}
      {showAi && (
        <div className={styles.section}>
          <AnalysisPanel narrative={narrative} isLoading={isLoading} error={aiError} />
        </div>
      )}
      {trades.length > 0 && (
        <div className={styles.section}>
          <TradesTable trades={trades} onApply={handleApplyTrades} />
        </div>
      )}

      {/* MCP Log */}
      <div className={styles.section}>
        <McpLog subscribeLogs={subscribeLogs} />
      </div>
    </div>
  )
}
