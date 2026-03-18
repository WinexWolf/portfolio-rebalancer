import { useEffect, useCallback, useRef } from 'react'
import { MCP_APP_URI } from '../lib/constants'

/**
 * useMcpBridge — implements the MCP Apps Extension postMessage transport.
 *
 * Per the MCP Apps Extension spec (SEP-1865), UI resources communicate
 * with the host via MCP JSON-RPC 2.0 messages over window.postMessage.
 *
 * @param {Function} onHostMessage  - called when host sends a tool call / notification
 * @returns {{ sendToHost, mcpLog, logEntries }}
 */
export function useMcpBridge(onHostMessage) {
  const logRef    = useRef([])
  const listenersRef = useRef([])

  const addLog = useCallback((entry) => {
    logRef.current = [...logRef.current, entry]
    listenersRef.current.forEach(fn => fn(logRef.current))
  }, [])

  const mcpLog = useCallback((direction, method, payload = {}) => {
    const now = new Date()
    const ts  = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map(x => String(x).padStart(2, '0')).join(':')
    addLog({ ts, direction, method, payload: JSON.stringify(payload).slice(0, 120) })
  }, [addLog])

  // Send a JSON-RPC message to the parent host
  const sendToHost = useCallback((method, params = {}, id = null) => {
    const msg = { jsonrpc: '2.0', method, params }
    if (id !== null) msg.id = id
    window.parent.postMessage(JSON.stringify(msg), '*')
    mcpLog('▶ SERVER', method, params)
  }, [mcpLog])

  // Listen for messages from host
  useEffect(() => {
    const handler = (evt) => {
      try {
        const msg = typeof evt.data === 'string' ? JSON.parse(evt.data) : evt.data
        if (!msg || msg.jsonrpc !== '2.0') return
        mcpLog('◀ HOST', msg.method || 'response', msg.params || msg.result || {})
        onHostMessage?.(msg)
      } catch (_) { /* non-MCP message, ignore */ }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onHostMessage, mcpLog])

  // Announce readiness on mount (MCP App initialization handshake)
  useEffect(() => {
    sendToHost('notifications/initialized', {
      appUri:       MCP_APP_URI,
      version:      '1.0.0',
      capabilities: ['tools', 'resources'],
    }, 1)
  }, [sendToHost])

  // Subscribe to log updates
  const subscribeLogs = useCallback((fn) => {
    listenersRef.current.push(fn)
    fn(logRef.current) // emit current state immediately
    return () => { listenersRef.current = listenersRef.current.filter(f => f !== fn) }
  }, [])

  return { sendToHost, mcpLog, subscribeLogs }
}
