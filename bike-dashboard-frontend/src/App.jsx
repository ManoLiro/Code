import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import BikeGrid from './components/BikeGrid'
import Pagination from './components/Pagination'
import useWebSocket from './hooks/useWebSocket'

// URL do backend - ajuste se necessário
const WS_URL = 'ws://localhost:8000/ws'

// Número de bikes por página
const BIKES_PER_PAGE = 10

function App() {
  const [bikes, setBikes] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const { isConnected, lastMessage } = useWebSocket(WS_URL)

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage)
        
        if (data.type === 'initial') {
          // Dados iniciais de todas as bikes
          setBikes(data.bikes || {})
        } else if (data.type === 'update') {
          // Atualização de uma bike específica
          setBikes(prev => ({
            ...prev,
            [data.device]: data.data
          }))
        }
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error)
      }
    }
  }, [lastMessage])

  const activeBikesCount = Object.values(bikes).filter(bike => {
    if (!bike.last_update) return false
    const lastUpdate = new Date(bike.last_update)
    const now = new Date()
    return (now - lastUpdate) < 10000 // Ativa se atualizou nos últimos 10s
  }).length

  // Calcular paginação
  const bikeArray = Object.values(bikes)
  const totalPages = Math.ceil(bikeArray.length / BIKES_PER_PAGE)
  const startIndex = (currentPage - 1) * BIKES_PER_PAGE
  const endIndex = startIndex + BIKES_PER_PAGE
  const currentBikes = bikeArray.slice(startIndex, endIndex)

  // Converter de volta para objeto para manter compatibilidade
  const paginatedBikes = {}
  currentBikes.forEach(bike => {
    paginatedBikes[bike.device] = bike
  })

  // Resetar para página 1 se a página atual ficar vazia
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  return (
    <div className="min-h-screen">
      <Header 
        totalBikes={Object.keys(bikes).length}
        activeBikes={activeBikesCount}
        isConnected={isConnected}
      />
      <main className="container mx-auto px-4 py-8">
        <BikeGrid bikes={paginatedBikes} />
        
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalBikes={bikeArray.length}
            startIndex={startIndex + 1}
            endIndex={Math.min(endIndex, bikeArray.length)}
          />
        )}
      </main>
    </div>
  )
}

export default App
