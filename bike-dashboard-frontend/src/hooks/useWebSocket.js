import { useState, useEffect, useRef, useCallback } from 'react'

const useWebSocket = (url) => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const ws = useRef(null)
  const reconnectTimeout = useRef(null)

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        console.log('WebSocket conectado')
        setIsConnected(true)
      }

      ws.current.onmessage = (event) => {
        setLastMessage(event.data)
      }

      ws.current.onerror = (error) => {
        console.error('Erro no WebSocket:', error)
      }

      ws.current.onclose = () => {
        console.log('WebSocket desconectado')
        setIsConnected(false)
        
        // Tentar reconectar após 3 segundos
        reconnectTimeout.current = setTimeout(() => {
          console.log('Tentando reconectar...')
          connect()
        }, 3000)
      }
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error)
    }
  }, [url])

  useEffect(() => {
    connect()

    // Cleanup
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [connect])

  // Heartbeat para manter conexão viva
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send('ping')
      }
    }, 30000) // Ping a cada 30 segundos

    return () => clearInterval(interval)
  }, [isConnected])

  return { isConnected, lastMessage }
}

export default useWebSocket
