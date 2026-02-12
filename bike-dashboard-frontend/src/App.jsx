import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import BikeGrid from './components/BikeGrid'
import Pagination from './components/Pagination'
import StudentRegistrationModal from './components/StudentRegistrationModal'
import StudentSelectModal from './components/StudentSelectModal'
import useWebSocket from './hooks/useWebSocket'

// URL do backend
const WS_URL = 'ws://localhost:8000/ws'
const API_URL = 'http://localhost:8000'

// Número de bikes por página
const BIKES_PER_PAGE = 10

function App() {
  const [bikes, setBikes] = useState({})
  const [assignments, setAssignments] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const { isConnected, lastMessage } = useWebSocket(WS_URL)

  // Modais
  const [studentModalOpen, setStudentModalOpen] = useState(false)
  const [selectModalOpen, setSelectModalOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState(null)

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage)
        
        if (data.type === 'initial') {
          setBikes(data.bikes || {})
          setAssignments(data.assignments || {})
        } else if (data.type === 'update') {
          setBikes(prev => ({
            ...prev,
            [data.device]: data.data
          }))
        } else if (data.type === 'assignments') {
          setAssignments(data.assignments || {})
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
    return (now - lastUpdate) < 10000
  }).length

  // Paginação
  const bikeArray = Object.values(bikes)
  const totalPages = Math.ceil(bikeArray.length / BIKES_PER_PAGE)
  const startIndex = (currentPage - 1) * BIKES_PER_PAGE
  const endIndex = startIndex + BIKES_PER_PAGE
  const currentBikes = bikeArray.slice(startIndex, endIndex)

  const paginatedBikes = {}
  currentBikes.forEach(bike => {
    paginatedBikes[bike.device] = bike
  })

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  // Clique na bike → abrir modal de seleção de aluno
  const handleClickBike = (device) => {
    setSelectedDevice(device)
    setSelectModalOpen(true)
  }

  // Resetar todos os vínculos
  const handleResetAssignments = async () => {
    try {
      await fetch(`${API_URL}/api/assignments/reset`, { method: 'POST' })
      // O WebSocket vai atualizar os assignments automaticamente
    } catch (err) {
      console.error('Erro ao resetar vínculos:', err)
    }
  }

  return (
    <div className="min-h-screen">
      <Header 
        totalBikes={Object.keys(bikes).length}
        activeBikes={activeBikesCount}
        isConnected={isConnected}
        onOpenStudentModal={() => setStudentModalOpen(true)}
        onResetAssignments={handleResetAssignments}
      />
      <main className="container mx-auto px-4 py-8">
        <BikeGrid
          bikes={paginatedBikes}
          assignments={assignments}
          onClickBike={handleClickBike}
        />
        
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

      {/* Modal de Cadastro de Alunos */}
      <StudentRegistrationModal
        isOpen={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
        onStudentsChanged={() => {}}
      />

      {/* Modal de Seleção de Aluno para Bike */}
      <StudentSelectModal
        isOpen={selectModalOpen}
        onClose={() => setSelectModalOpen(false)}
        device={selectedDevice}
        currentAssignment={selectedDevice ? assignments[selectedDevice] : null}
        onOpenRegister={() => setStudentModalOpen(true)}
      />
    </div>
  )
}

export default App
