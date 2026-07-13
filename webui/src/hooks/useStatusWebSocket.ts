import { useEffect, useRef } from 'react'
import { useCrawlerStore } from '@/store/crawlerStore'

let globalStatusWs: WebSocket | null = null
let globalReconnectTimer: ReturnType<typeof setTimeout> | null = null
let connectionCount = 0

export function useStatusWebSocket() {
  const setStatus = useCrawlerStore((state) => state.setStatus)
  const setRunningInfo = useCrawlerStore((state) => state.setRunningInfo)
  const setStatusRef = useRef(setStatus)
  const setRunningInfoRef = useRef(setRunningInfo)

  useEffect(() => {
    setStatusRef.current = setStatus
  }, [setStatus])

  useEffect(() => {
    setRunningInfoRef.current = setRunningInfo
  }, [setRunningInfo])

  useEffect(() => {
    connectionCount++

    const connect = () => {
      if (globalReconnectTimer) {
        clearTimeout(globalReconnectTimer)
        globalReconnectTimer = null
      }

      if (globalStatusWs && (globalStatusWs.readyState === WebSocket.OPEN || globalStatusWs.readyState === WebSocket.CONNECTING)) {
        return
      }

      const protocol = 'wss:'
      const host = import.meta.env.DEV ? window.location.host : 'insectlike-aleida-unctuousnessly.ngrok-free.dev'
      const wsUrl = import.meta.env.DEV
        ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${host}/api/ws/status`
        : `${protocol}//${host}/api/ws/status`

      const ws = new WebSocket(wsUrl)
      globalStatusWs = ws

      ws.onopen = () => {
        if (globalStatusWs !== ws) return
        console.log('[StatusWS] Connected')
      }

      ws.onmessage = (event) => {
        if (globalStatusWs !== ws) return
        try {
          const status = JSON.parse(event.data)
          if (status && status.status) {
            setStatusRef.current(status.status)
            setRunningInfoRef.current(status.platform, status.crawler_type, status.started_at)
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      ws.onclose = () => {
        if (globalStatusWs !== ws) return
        console.log('[StatusWS] Disconnected')
        globalStatusWs = null
        if (connectionCount > 0) {
          globalReconnectTimer = setTimeout(connect, 3000)
        }
      }

      ws.onerror = () => {
        if (globalStatusWs !== ws) return
        // Will trigger onclose
      }
    }

    connect()

    return () => {
      connectionCount--
      if (connectionCount === 0) {
        if (globalReconnectTimer) {
          clearTimeout(globalReconnectTimer)
          globalReconnectTimer = null
        }
        if (globalStatusWs) {
          const ws = globalStatusWs
          globalStatusWs = null
          ws.close()
        }
      }
    }
  }, [])

  return { ws: globalStatusWs }
}
